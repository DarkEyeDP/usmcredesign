import type { SchoolResult } from './types';

const KEY = 'usmc-college-recent-v1';
const MAX = 8;

export function loadRecentSchools(): SchoolResult[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch { return []; }
}

export function addRecentSchool(school: SchoolResult, current: SchoolResult[]): SchoolResult[] {
  const updated = [school, ...current.filter(s => s.name !== school.name)].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}
