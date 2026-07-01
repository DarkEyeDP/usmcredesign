const SCORECARD_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://stay-marine.com',
  'https://www.stay-marine.com',
];

// Common program search terms → College Scorecard CIP field names
// Used for automatic fallback when a name search returns 0 results
const PROGRAM_KEYWORDS = {
  // Visual Arts & Design (CIP 50)
  'graphic design': 'visual_performing',
  'graphic': 'visual_performing',
  'art': 'visual_performing',
  'arts': 'visual_performing',
  'design': 'visual_performing',
  'music': 'visual_performing',
  'theater': 'visual_performing',
  'theatre': 'visual_performing',
  'film': 'visual_performing',
  'photography': 'visual_performing',
  'animation': 'visual_performing',
  'fine arts': 'visual_performing',
  'dance': 'visual_performing',
  'drawing': 'visual_performing',
  'illustration': 'visual_performing',
  // Business (CIP 52)
  'business': 'business_marketing',
  'marketing': 'business_marketing',
  'accounting': 'business_marketing',
  'finance': 'business_marketing',
  'management': 'business_marketing',
  'mba': 'business_marketing',
  'entrepreneurship': 'business_marketing',
  'economics': 'business_marketing',
  'supply chain': 'business_marketing',
  // Computer Science (CIP 11)
  'computer science': 'computer',
  'computer': 'computer',
  'information technology': 'computer',
  'cybersecurity': 'computer',
  'cyber security': 'computer',
  'cyber': 'computer',
  'programming': 'computer',
  'software': 'computer',
  'data science': 'computer',
  'information systems': 'computer',
  'network': 'computer',
  'coding': 'computer',
  // Engineering (CIP 14)
  'engineering': 'engineering',
  'mechanical': 'engineering',
  'electrical': 'engineering',
  'civil engineering': 'engineering',
  'aerospace': 'engineering',
  'chemical engineering': 'engineering',
  // Engineering Technology (CIP 15)
  'engineering technology': 'engineering_technology',
  // Health (CIP 51)
  'nursing': 'health',
  'healthcare': 'health',
  'health care': 'health',
  'medicine': 'health',
  'public health': 'health',
  'physician': 'health',
  'physical therapy': 'health',
  'pharmacy': 'health',
  'dental': 'health',
  'medical': 'health',
  'radiology': 'health',
  // Psychology (CIP 42)
  'psychology': 'psychology',
  'counseling': 'psychology',
  // Criminal Justice / Security (CIP 43)
  'criminal justice': 'security_law_enforcement',
  'criminology': 'security_law_enforcement',
  'law enforcement': 'security_law_enforcement',
  'homeland security': 'security_law_enforcement',
  'corrections': 'security_law_enforcement',
  // Education (CIP 13)
  'education': 'education',
  'teaching': 'education',
  'teacher': 'education',
  // Communication (CIP 09)
  'communication': 'communication',
  'communications': 'communication',
  'journalism': 'communication',
  'public relations': 'communication',
  'broadcasting': 'communication',
  'media': 'communication',
  // Legal (CIP 22)
  'legal': 'legal',
  'law': 'legal',
  'paralegal': 'legal',
  // Biology (CIP 26)
  'biology': 'biological',
  'biochemistry': 'biological',
  'life science': 'biological',
  'neuroscience': 'biological',
  'environmental science': 'biological',
  // Mathematics (CIP 27)
  'mathematics': 'mathematics',
  'math': 'mathematics',
  'statistics': 'mathematics',
  // Social Sciences (CIP 45)
  'sociology': 'social_science',
  'political science': 'social_science',
  'international relations': 'social_science',
  'anthropology': 'social_science',
  'political': 'social_science',
  // History (CIP 54)
  'history': 'history',
  // Liberal Arts (CIP 24)
  'liberal arts': 'liberal_arts',
  'humanities': 'liberal_arts',
  'general studies': 'liberal_arts',
  // Physical Sciences (CIP 40)
  'physics': 'physical_science',
  'chemistry': 'physical_science',
  'geology': 'physical_science',
  'astronomy': 'physical_science',
  // Aviation / Transportation (CIP 49)
  'aviation': 'transportation',
  'transportation': 'transportation',
  'logistics': 'transportation',
  'supply chain management': 'transportation',
  // Military (CIP 29)
  'military science': 'military',
  // Public Administration (CIP 44)
  'social work': 'public_administration_social_service',
  'public administration': 'public_administration_social_service',
  'public policy': 'public_administration_social_service',
  // Construction (CIP 46)
  'construction': 'construction',
  // Parks / Recreation / Fitness (CIP 31)
  'fitness': 'parks_recreation_fitness',
  'kinesiology': 'parks_recreation_fitness',
  'exercise science': 'parks_recreation_fitness',
  'sports management': 'parks_recreation_fitness',
  // Philosophy (CIP 38)
  'philosophy': 'philosophy_religious',
  'religious': 'philosophy_religious',
  'theology': 'philosophy_religious',
  // Architecture (CIP 04)
  'architecture': 'architecture',
  // Language (CIP 16)
  'language': 'language',
  'foreign language': 'language',
  'spanish': 'language',
  'french': 'language',
  'english language': 'language',
};

function detectProgramField(q) {
  const lower = q.toLowerCase().trim();
  // Try exact match first
  if (PROGRAM_KEYWORDS[lower]) return PROGRAM_KEYWORDS[lower];
  // Try substring match — longer keys first to prefer specificity
  const keys = Object.keys(PROGRAM_KEYWORDS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return PROGRAM_KEYWORDS[key];
  }
  return null;
}

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

const BASE_FIELDS = [
  'id',
  'school.name',
  'school.city',
  'school.state',
  'school.ownership',
  'school.distance_only',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
].join(',');

const PROGRAM_FIELDS = [
  'id',
  'latest.programs.cip_4',
].join(',');

// Boolean program-availability fields used as a fallback when cip_4 data is absent.
// Each maps to a FIELD_OF_STUDY_OPTIONS value and a display label.
const ACADEMIC_PROGRAM_FIELDS = [
  { field: 'latest.academics.program.bachelors.business_marketing', label: "Business & Management" },
  { field: 'latest.academics.program.bachelors.computer', label: "Computer Science & IT" },
  { field: 'latest.academics.program.bachelors.security_law_enforcement', label: "Criminal Justice" },
  { field: 'latest.academics.program.bachelors.education', label: "Education" },
  { field: 'latest.academics.program.bachelors.engineering', label: "Engineering" },
  { field: 'latest.academics.program.bachelors.health', label: "Health & Nursing" },
  { field: 'latest.academics.program.bachelors.communication', label: "Communications & Media" },
  { field: 'latest.academics.program.bachelors.psychology', label: "Psychology" },
  { field: 'latest.academics.program.bachelors.visual_performing', label: "Visual Arts & Design" },
  { field: 'latest.academics.program.bachelors.social_science', label: "Social Sciences" },
  { field: 'latest.academics.program.bachelors.biological', label: "Biology & Life Sciences" },
  { field: 'latest.academics.program.bachelors.mathematics', label: "Mathematics & Statistics" },
  { field: 'latest.academics.program.bachelors.liberal_arts', label: "Liberal Arts" },
  { field: 'latest.academics.program.bachelors.history', label: "History" },
  { field: 'latest.academics.program.bachelors.legal', label: "Legal Studies" },
  { field: 'latest.academics.program.bachelors.transportation', label: "Aviation & Transportation" },
  { field: 'latest.academics.program.bachelors.public_administration_social_service', label: "Public Administration" },
  { field: 'latest.academics.program.bachelors.physical_science', label: "Physical Sciences" },
];

// Credential level → human-readable label
const CREDENTIAL_LABELS = {
  1: "Certificate (<1 yr)",
  2: "Certificate (1-2 yr)",
  3: "Associate's",
  4: "Certificate (2-4 yr)",
  5: "Bachelor's",
  6: "Post-Bacc Certificate",
  7: "Master's",
  8: "Post-Master's Certificate",
  9: "Doctoral",
  10: "Doctoral (Professional)",
  11: "Doctoral (Other)",
};

function mapResults(raw) {
  return (raw ?? []).map(r => ({
    id: r['id'],
    name: r['school.name'],
    city: r['school.city'],
    state: r['school.state'],
    ownership: r['school.ownership'],
    distanceOnly: r['school.distance_only'] === 1,
    tuitionInState: r['latest.cost.tuition.in_state'] ?? null,
    tuitionOutOfState: r['latest.cost.tuition.out_of_state'] ?? null,
  }));
}

async function queryScorecard(params, apiKey) {
  params.set('school.operating', '1');
  params.set('fields', BASE_FIELDS);
  params.set('per_page', '25');
  params.set('api_key', apiKey);
  const res = await fetch(`${SCORECARD_URL}?${params}`, {
    headers: { 'User-Agent': 'StayMarine/1.0' },
  });
  if (!res.ok) return { results: [], total: 0, ok: false };
  const data = await res.json();
  return { results: mapResults(data.results), total: data.metadata?.total ?? 0, ok: true };
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

    if (!env.SCORECARD_API_KEY) {
      return json({ error: 'API key not configured' }, cors, 500);
    }

    const { searchParams } = new URL(request.url);

    // --- Programs route: ?schoolId=123 ---
    const schoolId = (searchParams.get('schoolId') ?? '').trim();
    if (schoolId) {
      // Primary: try fetching the cip_4 programs array
      const p = new URLSearchParams({
        id: schoolId,
        fields: PROGRAM_FIELDS,
        per_page: '1',
        api_key: env.SCORECARD_API_KEY,
      });
      const upstream = await fetch(`${SCORECARD_URL}?${p}`, {
        headers: { 'User-Agent': 'StayMarine/1.0' },
      });

      if (upstream.ok) {
        const data = await upstream.json();
        const school = (data.results ?? [])[0];
        const rawPrograms = school?.['latest.programs.cip_4'] ?? [];

        if (rawPrograms.length > 0) {
          const programs = rawPrograms
            .map(prog => ({
              title: prog.title ?? prog['title'],
              credentialLevel: prog.credential?.level ?? prog['credential.level'] ?? 0,
              credentialLabel: CREDENTIAL_LABELS[prog.credential?.level ?? prog['credential.level']] ?? 'Other',
            }))
            .filter(prog => prog.title)
            .sort((a, b) => a.title.localeCompare(b.title));
          return json({ programs, source: 'cip4' }, cors);
        }
      }

      // Fallback: use boolean academic program flags — always works
      const fallbackFields = ['id', ...ACADEMIC_PROGRAM_FIELDS.map(f => f.field)].join(',');
      const p2 = new URLSearchParams({
        id: schoolId,
        fields: fallbackFields,
        per_page: '1',
        api_key: env.SCORECARD_API_KEY,
      });
      const upstream2 = await fetch(`${SCORECARD_URL}?${p2}`, {
        headers: { 'User-Agent': 'StayMarine/1.0' },
      });
      if (!upstream2.ok) return json({ programs: [] }, cors);
      const data2 = await upstream2.json();
      const school2 = (data2.results ?? [])[0];
      if (!school2) return json({ programs: [] }, cors);

      const programs = ACADEMIC_PROGRAM_FIELDS
        .filter(({ field }) => school2[field] === 1)
        .map(({ label }) => ({
          title: label,
          credentialLevel: 5,
          credentialLabel: "Bachelor's",
        }));

      return json({ programs, source: 'flags' }, cors);
    }

    const q = (searchParams.get('q') ?? '').trim();
    const state = (searchParams.get('state') ?? '').trim().toUpperCase();
    const ownership = (searchParams.get('ownership') ?? '').trim();
    const distanceOnly = searchParams.get('distanceOnly') === '1';
    const fieldOfStudy = (searchParams.get('fieldOfStudy') ?? '').trim();
    const page = Math.max(0, parseInt(searchParams.get('page') ?? '0') || 0);

    const hasQuery = q.length >= 2;
    const hasFilter = !!state || !!ownership || distanceOnly || !!fieldOfStudy;

    if (!hasQuery && !hasFilter) {
      return json({ results: [], total: 0 }, cors);
    }

    // Build shared filter params (state, ownership, distance, field-of-study)
    function baseParams() {
      const p = new URLSearchParams({ per_page: '25', page: String(page) });
      if (state) p.set('school.state', state);
      if (ownership) p.set('school.ownership', ownership);
      if (distanceOnly) p.set('school.distance_only', '1');
      if (fieldOfStudy) p.set(`latest.academics.program.bachelors.${fieldOfStudy}`, '1');
      return p;
    }

    // Primary search: by school name
    let results = [], total = 0;
    if (hasQuery) {
      const p = baseParams();
      p.set('school.name', q);
      const resp = await queryScorecard(p, env.SCORECARD_API_KEY);
      if (!resp.ok) return json({ error: 'Upstream error' }, cors, 502);
      results = resp.results;
      total = resp.total;
    } else {
      // Browse mode: filters only, no name query
      const resp = await queryScorecard(baseParams(), env.SCORECARD_API_KEY);
      if (!resp.ok) return json({ error: 'Upstream error' }, cors, 502);
      results = resp.results;
      total = resp.total;
    }

    // Fallback: if name search returned 0 results and no explicit fieldOfStudy was set,
    // try to detect whether the query looks like a program/major and re-search by program
    if (hasQuery && total === 0 && !fieldOfStudy) {
      const detected = detectProgramField(q);
      if (detected) {
        const p = baseParams();
        p.set(`latest.academics.program.bachelors.${detected}`, '1');
        // Don't add school.name — we're searching by program, not name
        const resp = await queryScorecard(p, env.SCORECARD_API_KEY);
        if (resp.ok && resp.total > 0) {
          return json({ results: resp.results, total: resp.total, programFallback: detected }, cors);
        }
      }
    }

    return json({ results, total }, cors);
  },
};
