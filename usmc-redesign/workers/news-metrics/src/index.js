const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://stay-marine.com',
  'https://www.stay-marine.com',
];

const VALID_SCORE_BUCKETS = new Set(['<80', '80-89', '90-99', '100-109', '110-119', '120+']);
const VALID_RANKS = new Set(['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8']);
const VALID_CLEARANCES = new Set(['none', 'confidential', 'secret', 'top_secret', 'ts_sci']);

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

// ── Article counter routes ────────────────────────────────────────────────────

function parseArticleRoute(request) {
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

// ── Latmove analytics routes ──────────────────────────────────────────────────

function parseLatmoveRoute(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'latmove' || parts.length !== 2) return null;
  if (parts[1] !== 'search' && parts[1] !== 'click') return null;
  return { action: parts[1] };
}

function sanitizeText(value, maxLen) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLen ? trimmed : null;
}

async function handleLatmoveSearch(env, body) {
  const gt_bucket = VALID_SCORE_BUCKETS.has(body.gt_bucket) ? body.gt_bucket : null;
  const mm_bucket = VALID_SCORE_BUCKETS.has(body.mm_bucket) ? body.mm_bucket : null;
  const el_bucket = VALID_SCORE_BUCKETS.has(body.el_bucket) ? body.el_bucket : null;
  const cl_bucket = VALID_SCORE_BUCKETS.has(body.cl_bucket) ? body.cl_bucket : null;
  const rank = VALID_RANKS.has(body.rank) ? body.rank : null;
  const clearance = VALID_CLEARANCES.has(body.clearance) ? body.clearance : null;
  const pmos = sanitizeText(body.pmos, 10);
  const result_count = Number.isInteger(body.result_count) ? Math.max(0, Math.min(500, body.result_count)) : 0;
  const has_certs = body.has_certs ? 1 : 0;
  const has_degrees = body.has_degrees ? 1 : 0;

  const searchResult = await env.DB.prepare(
    `INSERT INTO latmove_searches
       (gt_bucket, mm_bucket, el_bucket, cl_bucket, rank, clearance, pmos, result_count, has_certs, has_degrees)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
  ).bind(gt_bucket, mm_bucket, el_bucket, cl_bucket, rank, clearance, pmos, result_count, has_certs, has_degrees).run();

  const searchId = searchResult.meta.last_row_id;

  const rawResults = Array.isArray(body.top_results) ? body.top_results.slice(0, 10) : [];
  const validResults = rawResults.filter(r =>
    sanitizeText(r.mos_id, 10) &&
    sanitizeText(r.mos_title, 120) &&
    sanitizeText(r.mos_field, 120) &&
    Number.isInteger(r.position) &&
    Number.isInteger(r.match_score),
  );

  if (validResults.length > 0) {
    await env.DB.batch(
      validResults.map(r =>
        env.DB.prepare(
          `INSERT INTO latmove_mos_impressions (search_id, mos_id, mos_title, mos_field, position, match_score)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
        ).bind(
          searchId,
          sanitizeText(r.mos_id, 10),
          sanitizeText(r.mos_title, 120),
          sanitizeText(r.mos_field, 120),
          Math.max(1, Math.min(10, r.position)),
          Math.max(0, Math.min(100, r.match_score)),
        ),
      ),
    );
  }

  return { ok: true };
}

async function handleLatmoveClick(env, body) {
  const mos_id = sanitizeText(body.mos_id, 10);
  if (!mos_id) return { ok: false };

  const mos_title = sanitizeText(body.mos_title, 120);
  const mos_field = sanitizeText(body.mos_field, 120);
  const rank = VALID_RANKS.has(body.rank) ? body.rank : null;
  const pmos = sanitizeText(body.pmos, 10);

  await env.DB.prepare(
    `INSERT INTO latmove_mos_clicks (mos_id, mos_title, mos_field, rank, pmos)
     VALUES (?1, ?2, ?3, ?4, ?5)`,
  ).bind(mos_id, mos_title, mos_field, rank, pmos).run();

  return { ok: true };
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // Article counter routes
      const articleRoute = parseArticleRoute(request);
      if (articleRoute) {
        if (request.method === 'GET' && articleRoute.action === null) {
          return json(await getCounts(env, articleRoute.slug), {}, corsHeaders);
        }
        if (request.method === 'POST' && articleRoute.action === 'view') {
          return json(await increment(env, articleRoute.slug, 'views'), {}, corsHeaders);
        }
        if (request.method === 'POST' && articleRoute.action === 'read') {
          return json(await increment(env, articleRoute.slug, 'reads'), {}, corsHeaders);
        }
        return json({ error: 'Method not allowed' }, { status: 405 }, corsHeaders);
      }

      // Latmove analytics routes
      const latmoveRoute = parseLatmoveRoute(request);
      if (latmoveRoute) {
        if (request.method !== 'POST') {
          return json({ error: 'Method not allowed' }, { status: 405 }, corsHeaders);
        }
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: 'Invalid JSON' }, { status: 400 }, corsHeaders);
        }
        if (latmoveRoute.action === 'search') {
          return json(await handleLatmoveSearch(env, body), {}, corsHeaders);
        }
        if (latmoveRoute.action === 'click') {
          return json(await handleLatmoveClick(env, body), {}, corsHeaders);
        }
      }

      return json({ error: 'Not found' }, { status: 404 }, corsHeaders);
    } catch (error) {
      return json({ error: 'Unavailable' }, { status: 500 }, corsHeaders);
    }
  },
};
