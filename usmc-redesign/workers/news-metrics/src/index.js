const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://stay-marine.com',
  'https://www.stay-marine.com',
];

function json(data, init = {}, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const configured = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);

  const headers = {
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };

  if (!origin) return headers;
  if (allowedOrigins.has(origin)) {
    return { ...headers, 'access-control-allow-origin': origin };
  }

  return headers;
}

function parseRoute(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'articles' || !parts[1] || parts.length > 3) return null;

  let slug;
  try {
    slug = decodeURIComponent(parts[1]);
  } catch {
    return null;
  }

  if (!/^[a-z0-9][a-z0-9:._~-]{0,220}$/i.test(slug)) return null;

  return {
    slug,
    action: parts[2] ?? null,
  };
}

async function getCounts(env, slug) {
  const row = await env.DB.prepare(
    'SELECT slug, views, reads, updated_at FROM article_counters WHERE slug = ?1',
  ).bind(slug).first();

  return {
    slug,
    views: row?.views ?? 0,
    reads: row?.reads ?? 0,
    updatedAt: row?.updated_at ?? null,
  };
}

async function increment(env, slug, column) {
  await env.DB.prepare(
    `INSERT INTO article_counters (slug, ${column}, updated_at)
     VALUES (?1, 1, CURRENT_TIMESTAMP)
     ON CONFLICT(slug) DO UPDATE SET
       ${column} = ${column} + 1,
       updated_at = CURRENT_TIMESTAMP`,
  ).bind(slug).run();

  return getCounts(env, slug);
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const route = parseRoute(request);
    if (!route) {
      return json({ error: 'Not found' }, { status: 404 }, corsHeaders);
    }

    try {
      if (request.method === 'GET' && route.action === null) {
        return json(await getCounts(env, route.slug), {}, corsHeaders);
      }

      if (request.method === 'POST' && route.action === 'view') {
        return json(await increment(env, route.slug, 'views'), {}, corsHeaders);
      }

      if (request.method === 'POST' && route.action === 'read') {
        return json(await increment(env, route.slug, 'reads'), {}, corsHeaders);
      }

      return json({ error: 'Method not allowed' }, { status: 405 }, corsHeaders);
    } catch (error) {
      return json(
        { error: 'Metrics unavailable' },
        { status: 500 },
        corsHeaders,
      );
    }
  },
};
