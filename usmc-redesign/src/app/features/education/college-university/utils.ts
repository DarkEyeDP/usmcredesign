import { TA_CAP_PER_CREDIT, CREDITS_PER_YEAR, SCHOOL_BADGE_CONFIG } from './constants';
import type { SchoolResult, SchoolProgram, SchoolProgramsResult, SortOption, TuitionMode, SearchParams } from './types';

export function activeTuition(school: SchoolResult, mode: TuitionMode): number | null {
  return mode === 'out-of-state'
    ? (school.tuitionOutOfState ?? school.tuitionInState)
    : school.tuitionInState;
}

export function calcCostPerCredit(tuition: number | null): number | null {
  if (!tuition) return null;
  return Math.round(tuition / CREDITS_PER_YEAR);
}

export function calcTACoverage(tuition: number | null): number | null {
  const cpc = calcCostPerCredit(tuition);
  if (!cpc) return null;
  return Math.min(100, Math.round((TA_CAP_PER_CREDIT / cpc) * 100));
}

export function ownershipLabel(ownership: number): string {
  return ownership === 1 ? 'Public' : ownership === 2 ? 'Private' : 'For-Profit';
}

export function schoolBadge(name: string): { bg: string; fg: string; abbr: string } {
  const lower = name.toLowerCase();
  const match = Object.entries(SCHOOL_BADGE_CONFIG).find(([key]) => lower.includes(key));
  if (match) return match[1];
  const abbr = name
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the', 'and', 'of', 'at', 'in', 'for'].includes(w.toLowerCase()))
    .slice(0, 4)
    .map(w => w[0].toUpperCase())
    .join('')
    .slice(0, 4);
  return { bg: '#1a1a2e', fg: '#e63946', abbr };
}

export function coverageTextClass(pct: number, isDesert: boolean): string {
  if (pct >= 90) return isDesert ? 'text-green-700' : 'text-green-400';
  if (pct >= 60) return isDesert ? 'text-amber-700' : 'text-amber-400';
  return isDesert ? 'text-red-700' : 'text-red-400';
}

export function coverageBgClass(pct: number, isDesert: boolean): string {
  if (pct >= 90) return isDesert ? 'bg-green-600' : 'bg-green-500';
  if (pct >= 60) return isDesert ? 'bg-amber-600' : 'bg-amber-500';
  return isDesert ? 'bg-red-700' : 'bg-red-500';
}

export function sortSchools(schools: SchoolResult[], sort: SortOption): SchoolResult[] {
  const arr = [...schools];
  switch (sort) {
    case 'tuition-asc':
      return arr.sort((a, b) => {
        if (a.tuitionInState == null) return 1;
        if (b.tuitionInState == null) return -1;
        return a.tuitionInState - b.tuitionInState;
      });
    case 'tuition-desc':
      return arr.sort((a, b) => {
        if (a.tuitionInState == null) return 1;
        if (b.tuitionInState == null) return -1;
        return b.tuitionInState - a.tuitionInState;
      });
    case 'name-az':
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return arr;
  }
}

export function filterSchools(schools: SchoolResult[], stateFilter: string, distanceOnly: boolean): SchoolResult[] {
  return schools.filter(s => {
    if (stateFilter && s.state !== stateFilter) return false;
    if (distanceOnly && !s.distanceOnly) return false;
    return true;
  });
}

export async function fetchSchools(
  workerUrl: string,
  params: SearchParams,
): Promise<{ results: SchoolResult[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.state) qs.set('state', params.state);
  if (params.ownership) qs.set('ownership', params.ownership);
  if (params.distanceOnly) qs.set('distanceOnly', '1');
  if (params.fieldOfStudy) qs.set('fieldOfStudy', params.fieldOfStudy);
  if (params.page !== undefined && params.page > 0) qs.set('page', String(params.page));
  const res = await fetch(`${workerUrl}?${qs}`);
  if (!res.ok) return { results: [], total: 0 };
  const data: { results?: SchoolResult[]; total?: number } = await res.json();
  return { results: data.results ?? [], total: data.total ?? 0 };
}

export async function fetchSchoolPrograms(
  workerUrl: string,
  schoolId: number,
): Promise<SchoolProgramsResult> {
  const qs = new URLSearchParams({ schoolId: String(schoolId) });
  const res = await fetch(`${workerUrl}?${qs}`);
  if (!res.ok) return { programs: [], source: 'flags' };
  const data: SchoolProgramsResult = await res.json();
  return { programs: data.programs ?? [], source: data.source ?? 'flags' };
}

// Used by PopularSchoolsRow to find the best match by name from search results
export async function fetchSchoolsByQuery(workerUrl: string, query: string): Promise<SchoolResult[]> {
  const { results } = await fetchSchools(workerUrl, { q: query });
  return results;
}

export function bestMatchFromResults(results: SchoolResult[], targetName: string): SchoolResult | null {
  if (!results.length) return null;
  const lower = targetName.toLowerCase();
  return (
    results.find(r => r.name.toLowerCase() === lower) ??
    results.find(r => r.name.toLowerCase().startsWith(lower.split(' ').slice(0, 3).join(' '))) ??
    results[0]
  );
}
