import type { SchoolResult } from './types';

const KEY = 'usmc-college-saved-v1';

export function loadSavedSchools(): SchoolResult[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch { return []; }
}

export function toggleSavedSchool(school: SchoolResult, current: SchoolResult[]): SchoolResult[] {
  const exists = current.some(s => s.name === school.name);
  const updated = exists
    ? current.filter(s => s.name !== school.name)
    : [school, ...current];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}
