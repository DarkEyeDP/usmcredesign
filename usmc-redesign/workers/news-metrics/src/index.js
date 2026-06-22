// ── Constants ─────────────────────────────────────────────────────────────────

const RSS_URL =
  'https://www.marines.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=6&Site=481&max=500&category=14336';
const READER_URL_PREFIX = 'https://r.jina.ai/http://';
const USER_AGENT = 'Mozilla/5.0 (compatible; StayMarine/1.0)';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://stay-marine.com',
  'https://www.stay-marine.com',
];

const VALID_SCORE_BUCKETS = new Set(['<80', '80-89', '90-99', '100-109', '110-119', '120+']);
const VALID_RANKS = new Set(['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8']);
const VALID_CLEARANCES = new Set(['none', 'confidential', 'secret', 'top_secret', 'ts_sci']);

// ── Tag rules (ported from maradminUtils.ts) ──────────────────────────────────

const TAG_RULES = [
  { tag: 'PROMOTIONS',   re: /\bpromot(ions?|ed|ing)?\b|\badvancement\b/i },
  { tag: 'BOARDS',       re: /\b((selection|screening|promotion|command|reserve)\s+)?board\b|\bslating\s+panel\b/i },
  { tag: 'EDUCATION',    re: /\b(pme|professional military education|command and staff college|expeditionary warfare school|college of distance|academic year|curriculum|distance education|marinenet|mcele|elearning)\b/i },
  { tag: 'TRAINING',     re: /\b(training|course|instructor|instruction)\b/i },
  { tag: 'RESERVE',      re: /\b(reserve component|smcr|irr|individual ready reserve|active reserve|selected marine corps reserve)\b/i },
  { tag: 'FINANCE',      re: /\bpay\b|\b(bonus|entitlement|allowance|compensation|fiscal year|stipend|budget)\b/i },
  { tag: 'RETENTION',    re: /\b(retention bonus|selective retention|broken service|career designation|retention incentive)\b/i },
  { tag: 'UNIFORMS',     re: /\b(uniform|grooming|dress blue|dress green)\b/i },
  { tag: 'MOS',          re: /\b(military occupational specialty|pmos|fmos|amos|lateral move)\b|\bmos\b/i },
  { tag: 'SAFETY',       re: /\b(safety message|critical days|mishap|hazard|ground safety)\b/i },
  { tag: 'AVIATION',     re: /\b(aviation|f\/a-18|hornet|aircraft|aircrew|aeronautic|airlift|blue angels|helicopter|osprey|aerial)\b/i },
  { tag: 'TECHNOLOGY',   re: /\b(artificial intelligence|information technology|it procurement|cyber|gps|saasm|encryption|software|information system|elearning|mcele|genai|digital university)\b/i },
  { tag: 'AWARDS',       re: /\b(award|winner|viec|excellence in communication|recognition award)\b/i },
  { tag: 'LEADERSHIP',   re: /\b(command screening|commandant|sergeant major of the marine corps|command billet)\b/i },
  { tag: 'MEDICAL',      re: /\b(medical condition|health|healthcare|behavioral health|physical fitness test|pft|cft|body composition)\b/i },
  { tag: 'OFFICERS',     re: /\b(officer promot|officer select|officer candidate|officer billet|officer professional|commissioned officer|warrant officer|ocs)\b/i },
  { tag: 'ENLISTED',     re: /\b(enlisted|snco|staff noncommissioned|corporal|gunnery sergeant|master sergeant|first sergeant|master gunnery|lance corporal)\b/i },
  { tag: 'LANGUAGE',     re: /\b(language professional|dlpt|dlab|linguist|foreign language|command language program)\b/i },
  { tag: 'FAMILY',       re: /\b(maternity leave|parental leave|family|dependent|spouse|childcare)\b/i },
  { tag: 'POLICY',       re: /\b(implementing guidance|clarifying guidance|update to maradmin|change \d+ to maradmin|amplifying guidance)\b/i },
  { tag: 'READINESS',    re: /\b(readiness|mission ready|combat ready|operational readiness|military excellence and readiness)\b/i },
  { tag: 'INTELLIGENCE', re: /\b(intelligence|special technical operations|counterintelligence|marsoc)\b|\bsto\b/i },
  { tag: 'RECRUITING',   re: /\b(recruit|accession|affiliation incentive|applications being accepted|enlistment)\b/i },
  { tag: 'SEPARATION',   re: /\b(involuntary separation|absent from duty|misconduct|administrative separation|voluntary.*absence)\b/i },
  { tag: 'OPERATIONS',   re: /\b(operational support|expeditionary|deployment|capstone operating concept|warfighting|force employment)\b/i },
  { tag: 'ADMIN',        re: /\b(human resources|hr information|information system|access management|user access management|it procurement)\b/i },
  { tag: 'CIVILIAN',     re: /\b(civilian human resources|dod civilian|civilian personnel|civilian employees)\b/i },
  { tag: 'SPECIAL DUTY', re: /\b(special duty assignment|hqmc special duty|drill instructor|recruiter duty|embassy duty)\b/i },
  { tag: 'PERSONNEL',    re: /\b(fitness report|fitrep|performance evaluation|billet|assigned to|personnel action)\b/i },
];

function tagsFrom(subject) {
  const scores = new Map();
  for (const { tag, re } of TAG_RULES) {
    if (re.test(subject)) scores.set(tag, (scores.get(tag) ?? 0) + 3);
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const SHORT_MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const LONG_MON  = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

function flatLine(s) {
  return s.replace(/\s+/g, ' ').trim();
}

// Returns "YYYY-MM-DD" from various date string formats.
function parseToISO(dateStr) {
  // MM/DD/YYYY (archive format)
  const m1 = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateStr.trim());
  if (m1) {
    const [, mo, dy, yr] = m1;
    return `${yr}-${mo.padStart(2, '0')}-${dy.padStart(2, '0')}`;
  }
  // RFC 2822 / standard — relies on V8's Date parser (works in Workers)
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function formatDateFields(isoDate) {
  const [yr, mo, dy] = isoDate.split('-');
  const idx = parseInt(mo, 10) - 1;
  return {
    displayDate: `${dy} ${SHORT_MON[idx]} ${yr}`,
    month: `${LONG_MON[idx]} ${yr}`,
  };
}

function computeSortKey(number) {
  const m = /^(\d+)\/(\d+)$/.exec(number);
  if (!m) return 0;
  const seq = parseInt(m[1], 10);
  const yr2 = parseInt(m[2], 10);
  const yr = yr2 <= 30 ? 2000 + yr2 : 1900 + yr2;
  return yr * 10000 + seq;
}

function isCancellation(subject) {
  return /^cancellation of maradmin\b/i.test(subject.trim());
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function decodeEntities(html) {
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

// Strips HTML and converts block elements to newlines — used for article text.
// Closing </td>/<th> become tabs so columnar spacing survives for client-side table detection.
function extractArticleText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<\/(td|th)>/gi, '\t')
      .replace(/<\/?(br|p|div|h[1-6]|li|tr)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\t\n/g, '\t')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    // Strip marines.mil site-wide navigation footer that trails every page
    .replace(/\s*(?:\/+\s*)?Marine Corps\s+About The Corps\b[\s\S]*$/, '')
    .replace(/\s*Hosted by WEB\.mil[\s\S]*$/, '')
    .replace(/\s*\/{2,}\s*$/, '')
    .trim();
}

function extractReaderArticleText(markdown) {
  const content = markdown.replace(/\r/g, '').split(/\nMarkdown Content:\n/i).pop() ?? '';
  const text = content
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!/\bMARADMIN\s+\d+\/\d+\b/i.test(text)) return null;
  return text;
}

// ── RSS parsing ───────────────────────────────────────────────────────────────

function extractRSSTag(itemXml, tag) {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const mc = cdataRe.exec(itemXml);
  if (mc) return mc[1].trim();
  const mp = plainRe.exec(itemXml);
  return mp ? mp[1].trim() : '';
}

function parseRSSXML(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const item = m[1];
    items.push({
      title: extractRSSTag(item, 'title'),
      link: extractRSSTag(item, 'link') || extractRSSTag(item, 'guid'),
      pubDate: extractRSSTag(item, 'pubDate'),
      description: extractRSSTag(item, 'description'),
    });
  }
  return items;
}

function rssItemToMessage(item) {
  if (!item.title || isCancellation(item.title)) return null;
  const isoDate = parseToISO(item.pubDate);
  const { displayDate, month } = formatDateFields(isoDate);
  const number = (item.description.match(/MARADMIN\s+(\d+\/\d+)/i) ?? [])[1] ?? '';
  if (!/^\d+\/\d+$/.test(number)) return null;
  return {
    number,
    subject: item.title,
    date: displayDate,
    displayDate,
    month,
    source: 'HQMC',
    link: item.link,
    tags: tagsFrom(item.title),
    publishedAt: isoDate,
    sortKey: computeSortKey(number),
  };
}

// ── Article source extraction ─────────────────────────────────────────────────

function extractSource(text) {
  const m = flatLine(text).match(/release authorized by\s+(.+?)(?:\/\/|$)/i);
  if (!m) return null;
  const raw = m[1].replace(/[./\s]+$/, '').trim();
  if (!raw) return null;
  const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
  const title = parts.slice(1).join(', ');
  if (/^(?:assistant\s+)?deputy commandant\b/i.test(title)) return title;
  return parts.length >= 2 ? parts[parts.length - 1] : raw;
}

// ── D1 helpers ────────────────────────────────────────────────────────────────

async function upsertMARADMINs(env, messages) {
  if (!messages.length) return;
  const CHUNK = 100;
  for (let i = 0; i < messages.length; i += CHUNK) {
    await env.DB.batch(
      messages.slice(i, i + CHUNK).map(m =>
        env.DB.prepare(`
          INSERT INTO maradmins (number, subject, date, display_date, month, source, link, tags, sort_key, published_at)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
          ON CONFLICT(number) DO UPDATE SET
            subject      = excluded.subject,
            date         = excluded.date,
            display_date = excluded.display_date,
            month        = excluded.month,
            source       = CASE WHEN maradmins.source NOT IN ('', 'HQMC') THEN maradmins.source ELSE excluded.source END,
            link         = CASE WHEN excluded.link != '' THEN excluded.link ELSE maradmins.link END,
            tags         = excluded.tags,
            sort_key     = excluded.sort_key,
            published_at = excluded.published_at,
            fetched_at   = CURRENT_TIMESTAMP
        `).bind(
          m.number, m.subject, m.date, m.displayDate, m.month,
          m.source, m.link, JSON.stringify(m.tags), m.sortKey, m.publishedAt,
        ),
      ),
    );
  }
}

function tryParseJSON(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

// ── Sync functions (run from Cron) ────────────────────────────────────────────

async function syncRSSFeed(env) {
  const res = await fetch(`${RSS_URL}&_=${Date.now()}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) return;

  const xml = await res.text();
  const messages = parseRSSXML(xml).map(rssItemToMessage).filter(Boolean);
  if (messages.length) await upsertMARADMINs(env, messages);
}

// ── Article content fetch & cache ─────────────────────────────────────────────

async function fetchAndCacheArticle(env, number, link) {
  if (!link) return null;

  let method = 'direct';
  let text = null;

  const directRes = await fetch(link, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
  });
  if (directRes.ok) {
    text = extractArticleText(await directRes.text());
  }

  if (!text) {
    const readerRes = await fetch(`${READER_URL_PREFIX}${link}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/plain' },
    });
    if (!readerRes.ok) return null;
    text = extractReaderArticleText(await readerRes.text());
    method = 'reader';
  }

  if (!text) return null;

  const source = extractSource(text) ?? 'HQMC';
  const cachedAt = Date.now();

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO maradmin_articles (number, text, source, method, cached_at)
      VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)
      ON CONFLICT(number) DO UPDATE SET
        text = excluded.text, source = excluded.source,
        method = excluded.method, cached_at = CURRENT_TIMESTAMP
    `).bind(number, text, source, method),
    // Update enriched source on the metadata row.
    env.DB.prepare(`
      UPDATE maradmins SET source = ?1 WHERE number = ?2 AND source IN ('', 'HQMC')
    `).bind(source, number),
  ]);

  return { text, source, method, cachedAt };
}

// ── CORS & JSON helpers ───────────────────────────────────────────────────────

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
    .map(v => v.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);

  const headers = {
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };

  if (!origin) return headers;
  if (allowedOrigins.has(origin)) return { ...headers, 'access-control-allow-origin': origin };
  return headers;
}

// ── Route parsers ─────────────────────────────────────────────────────────────

function parseArticleRoute(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'articles' || !parts[1] || parts.length > 3) return null;
  let slug;
  try { slug = decodeURIComponent(parts[1]); } catch { return null; }
  if (!/^[a-z0-9][a-z0-9:._~-]{0,220}$/i.test(slug)) return null;
  return { slug, action: parts[2] ?? null };
}

function parseLatmoveRoute(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'latmove' || parts.length !== 2) return null;
  if (parts[1] !== 'search' && parts[1] !== 'click') return null;
  return { action: parts[1] };
}

// Returns { action: 'feed' } or { action: 'content', number: '123/26' }
function parseMARADMINRoute(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'maradmins') return null;

  if (parts.length === 1) return { action: 'feed' };
  if (parts.length === 2 && parts[1] === 'sync') return { action: 'sync' };

  let raw;
  try { raw = decodeURIComponent(parts[1]); } catch { return null; }

  // Accept both "123-26" (URL-safe) and "123/26"
  const number = raw.replace(/-/g, '/');
  if (!/^\d+\/\d+$/.test(number)) return null;

  if (parts.length === 3 && parts[2] === 'content') return { action: 'content', number };
  return null;
}

// ── MARADMIN route handlers ───────────────────────────────────────────────────

async function handlePostSync(env, corsHeaders) {
  const before = (await env.DB.prepare('SELECT COUNT(*) as n FROM maradmins').first())?.n ?? 0;
  await syncRSSFeed(env);
  const after  = (await env.DB.prepare('SELECT COUNT(*) as n FROM maradmins').first())?.n ?? 0;
  return json({ synced: true, added: Math.max(0, after - before) }, {}, corsHeaders);
}

async function handleGetFeed(request, env, corsHeaders) {
  const url = new URL(request.url);
  const limit  = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit')  ?? '50',  10) || 50));
  const offset = Math.max(0,               parseInt(url.searchParams.get('offset') ?? '0',   10) || 0);

  const [countRow, { results }] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as total FROM maradmins').first(),
    env.DB.prepare(`
      SELECT number, subject, date, display_date, month, source, link, tags
      FROM maradmins
      ORDER BY published_at DESC, sort_key DESC
      LIMIT ?1 OFFSET ?2
    `).bind(limit, offset).all(),
  ]);

  const total = countRow?.total ?? 0;
  const messages = (results ?? []).map(row => ({
    id:          row.number,
    number:      row.number,
    subject:     row.subject,
    date:        row.date,
    displayDate: row.display_date,
    month:       row.month,
    source:      row.source,
    link:        row.link,
    tags:        tryParseJSON(row.tags, []),
    unread:      true,
    isNew:       false,
    saved:       false,
    archived:    false,
  }));

  return json({ messages, total }, {}, corsHeaders);
}

async function handleGetArticleContent(request, env, corsHeaders, number) {
  // Serve from cache if available.
  const cached = await env.DB.prepare(
    'SELECT text, source, method, cached_at FROM maradmin_articles WHERE number = ?1',
  ).bind(number).first();

  if (cached?.text) {
    return json({
      text:     cached.text,
      source:   cached.source,
      method:   cached.method,
      cachedAt: new Date(cached.cached_at).getTime(),
    }, {}, corsHeaders);
  }

  // Look up the article URL.
  const meta = await env.DB.prepare('SELECT link FROM maradmins WHERE number = ?1')
    .bind(number).first();

  if (!meta?.link) {
    return json({ error: 'Not found' }, { status: 404 }, corsHeaders);
  }

  const result = await fetchAndCacheArticle(env, number, meta.link);
  if (!result) {
    return json({ error: 'Fetch failed' }, { status: 502 }, corsHeaders);
  }

  return json(result, {}, corsHeaders);
}

// ── Article counter handlers (unchanged) ──────────────────────────────────────

async function getCounts(env, slug) {
  const row = await env.DB.prepare(
    'SELECT slug, views, reads, updated_at FROM article_counters WHERE slug = ?1',
  ).bind(slug).first();
  return { slug, views: row?.views ?? 0, reads: row?.reads ?? 0, updatedAt: row?.updated_at ?? null };
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

// ── Latmove analytics handlers (unchanged) ────────────────────────────────────

function sanitizeText(value, maxLen) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLen ? trimmed : null;
}

async function handleLatmoveSearch(env, body) {
  const gt_bucket  = VALID_SCORE_BUCKETS.has(body.gt_bucket)  ? body.gt_bucket  : null;
  const mm_bucket  = VALID_SCORE_BUCKETS.has(body.mm_bucket)  ? body.mm_bucket  : null;
  const el_bucket  = VALID_SCORE_BUCKETS.has(body.el_bucket)  ? body.el_bucket  : null;
  const cl_bucket  = VALID_SCORE_BUCKETS.has(body.cl_bucket)  ? body.cl_bucket  : null;
  const rank       = VALID_RANKS.has(body.rank)                ? body.rank       : null;
  const clearance  = VALID_CLEARANCES.has(body.clearance)      ? body.clearance  : null;
  const pmos       = sanitizeText(body.pmos, 10);
  const result_count = Number.isInteger(body.result_count) ? Math.max(0, Math.min(500, body.result_count)) : 0;
  const has_certs    = body.has_certs    ? 1 : 0;
  const has_degrees  = body.has_degrees  ? 1 : 0;

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

  await env.DB.prepare(
    `INSERT INTO latmove_mos_clicks (mos_id, mos_title, mos_field, rank, pmos)
     VALUES (?1, ?2, ?3, ?4, ?5)`,
  ).bind(
    mos_id,
    sanitizeText(body.mos_title, 120),
    sanitizeText(body.mos_field, 120),
    VALID_RANKS.has(body.rank) ? body.rank : null,
    sanitizeText(body.pmos, 10),
  ).run();

  return { ok: true };
}

// ── Main export ───────────────────────────────────────────────────────────────

export default {
  // Runs every 15 minutes via Cron Trigger.
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(syncRSSFeed(env));
  },

  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // MARADMIN feed & article content routes
      const maradminRoute = parseMARADMINRoute(request);
      if (maradminRoute) {
        if (maradminRoute.action === 'sync') {
          if (request.method !== 'POST') {
            return json({ error: 'Method not allowed' }, { status: 405 }, corsHeaders);
          }
          return handlePostSync(env, corsHeaders);
        }
        if (request.method !== 'GET') {
          return json({ error: 'Method not allowed' }, { status: 405 }, corsHeaders);
        }
        if (maradminRoute.action === 'feed') {
          return handleGetFeed(request, env, corsHeaders);
        }
        if (maradminRoute.action === 'content') {
          return handleGetArticleContent(request, env, corsHeaders, maradminRoute.number);
        }
      }

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
        try { body = await request.json(); } catch {
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
    } catch {
      return json({ error: 'Unavailable' }, { status: 500 }, corsHeaders);
    }
  },
};
