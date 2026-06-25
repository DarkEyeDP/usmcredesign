const SCORECARD_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://stay-marine.com',
  'https://www.stay-marine.com',
];

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const configured = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const allowed = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);

  const headers = {
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    vary: 'Origin',
  };

  if (origin && allowed.has(origin)) {
    headers['access-control-allow-origin'] = origin;
  }

  return headers;
}

function json(data, cors, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...cors },
  });
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, cors, 405);
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') ?? '').trim();

    if (q.length < 2) {
      return json({ results: [] }, cors);
    }

    if (!env.SCORECARD_API_KEY) {
      return json({ error: 'API key not configured' }, cors, 500);
    }

    const params = new URLSearchParams({
      'school.name': q,
      'school.operating': '1',
      fields: 'school.name,school.city,school.state,school.ownership,school.distance_only,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state',
      per_page: '10',
      api_key: env.SCORECARD_API_KEY,
    });

    const upstream = await fetch(`${SCORECARD_URL}?${params}`, {
      headers: { 'User-Agent': 'StayMarine/1.0' },
    });

    if (!upstream.ok) {
      return json({ error: 'Upstream error', status: upstream.status }, cors, 502);
    }

    const data = await upstream.json();

    const results = (data.results ?? []).map(r => ({
      name: r['school.name'],
      city: r['school.city'],
      state: r['school.state'],
      ownership: r['school.ownership'],   // 1=Public, 2=Private non-profit, 3=Private for-profit
      distanceOnly: r['school.distance_only'] === 1,
      tuitionInState: r['latest.cost.tuition.in_state'] ?? null,
      tuitionOutOfState: r['latest.cost.tuition.out_of_state'] ?? null,
    }));

    return json({ results }, cors);
  },
};
