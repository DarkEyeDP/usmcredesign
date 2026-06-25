import type { Season, Course, FundingSource, CourseStatus } from './types';
import { SEASONS, TA_PER_CREDIT_MAX } from './constants';

// ── Helpers ─────────────────────────────────────────────────────────────────────
export function genId() {
  return Math.random().toString(36).slice(2, 9);
}

export function fiscalYear(season: Season, year: number): number {
  return season === 'Fall' ? year : year - 1;
}

export function courseTACost(course: Course): number {
  if (course.funding !== 'ta') return 0;
  const ratePerCredit = Math.min(course.costPerCredit, TA_PER_CREDIT_MAX);
  return course.credits * ratePerCredit;
}

export function estimateFinalTerm(season: Season, year: number, additionalTerms: number): string {
  if (additionalTerms <= 0) return '';
  let idx = SEASONS.indexOf(season);
  let y = year;
  for (let i = 0; i < additionalTerms; i++) {
    idx = (idx + 1) % 3;
    if (idx === 0) y++;
  }
  return `${SEASONS[idx]} ${y}`;
}

export function nextCycle<T>(cycle: T[], current: T): T {
  return cycle[(cycle.indexOf(current) + 1) % cycle.length];
}

export function fundingClass(funding: FundingSource, isDesert: boolean): string {
  switch (funding) {
    case 'ta':
      return isDesert
        ? 'border-green-700/50 bg-green-50/50 text-green-800'
        : 'border-green-500/30 bg-green-950/30 text-green-400';
    case 'gi-bill':
      return isDesert
        ? 'border-amber-700/50 bg-amber-50/50 text-amber-800'
        : 'border-amber-500/30 bg-amber-950/20 text-amber-400';
    case 'fafsa':
      return isDesert
        ? 'border-sky-700/50 bg-sky-50/50 text-sky-800'
        : 'border-sky-500/30 bg-sky-950/20 text-sky-400';
    case 'scholarship':
      return isDesert
        ? 'border-violet-700/50 bg-violet-50/50 text-violet-800'
        : 'border-violet-500/30 bg-violet-950/20 text-violet-400';
    case 'oop':
      return isDesert
        ? 'border-stone-400/50 bg-stone-100/50 text-stone-600'
        : 'border-white/12 bg-black text-gray-500';
  }
}

export function fundingTextClass(funding: FundingSource, isDesert: boolean): string {
  switch (funding) {
    case 'ta':          return isDesert ? 'text-green-700' : 'text-green-400';
    case 'gi-bill':     return isDesert ? 'text-amber-700' : 'text-amber-400';
    case 'fafsa':       return isDesert ? 'text-sky-700' : 'text-sky-400';
    case 'scholarship': return isDesert ? 'text-violet-700' : 'text-violet-400';
    case 'oop':         return isDesert ? 'text-stone-600' : 'text-white';
  }
}

export function courseStatusClass(status: CourseStatus, isDesert: boolean): string {
  switch (status) {
    case 'planned':
      return 'border-white/16 bg-black text-gray-500';
    case 'in-progress':
      return isDesert
        ? 'border-amber-700/70 bg-amber-900/20 text-amber-900'
        : 'border-amber-500/30 bg-amber-950/20 text-amber-400';
    case 'complete':
      return isDesert
        ? 'border-green-700/50 bg-green-50/50 text-green-800'
        : 'border-green-500/30 bg-green-950/30 text-green-400';
  }
}
