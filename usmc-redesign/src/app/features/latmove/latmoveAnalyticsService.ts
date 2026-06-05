const METRICS_URL = import.meta.env.VITE_NEWS_METRICS_URL as string | undefined;

export interface LatmoveTopResult {
  id: string;
  title: string;
  field: string;
  match: number;
}

export interface LatmoveSearchParams {
  gt: string;
  mm: string;
  el: string;
  cl: string;
  rank: string;
  clearance: string;
  pmos: string;
  hasCerts: boolean;
  hasDegrees: boolean;
  resultCount: number;
  topResults: LatmoveTopResult[];
}

export interface LatmoveMosClickParams {
  mosId: string;
  mosTitle: string;
  mosField: string;
  rank: string;
  pmos: string;
}

function scoreBucket(raw: string): string | null {
  const n = parseInt(raw, 10);
  if (!raw.trim() || isNaN(n) || n <= 0) return null;
  if (n < 80) return '<80';
  if (n < 90) return '80-89';
  if (n < 100) return '90-99';
  if (n < 110) return '100-109';
  if (n < 120) return '110-119';
  return '120+';
}

export function recordLatmoveSearch(params: LatmoveSearchParams): void {
  if (!METRICS_URL) return;

  const top10 = params.topResults.slice(0, 10).map((r, i) => ({
    mos_id: r.id,
    mos_title: r.title,
    mos_field: r.field,
    position: i + 1,
    match_score: Math.round(r.match),
  }));

  fetch(`${METRICS_URL}/latmove/search`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      gt_bucket: scoreBucket(params.gt),
      mm_bucket: scoreBucket(params.mm),
      el_bucket: scoreBucket(params.el),
      cl_bucket: scoreBucket(params.cl),
      rank: params.rank || null,
      clearance: params.clearance || null,
      pmos: params.pmos || null,
      result_count: params.resultCount,
      has_certs: params.hasCerts,
      has_degrees: params.hasDegrees,
      top_results: top10,
    }),
  }).catch(() => {});
}

export function recordLatmoveMosClick(params: LatmoveMosClickParams): void {
  if (!METRICS_URL) return;

  fetch(`${METRICS_URL}/latmove/click`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      mos_id: params.mosId,
      mos_title: params.mosTitle,
      mos_field: params.mosField,
      rank: params.rank || null,
      pmos: params.pmos || null,
    }),
  }).catch(() => {});
}
