import type { MouseEvent } from 'react';
import type {
  DutyStation, Promotion, EducationEvent, CareerMilestone,
  FinancialGoal, Child, SchoolPhaseType,
} from '../../types';

// ─── Constants ───────────────────────────────────────────────────────────────
export const LABEL_W       = 168;
export const GUTTER_W      = 14;
export const TIMELINE_START = 2018;
export const TIMELINE_END   = 2045;
export const TODAY          = new Date(2026, 5, 6);
export const MONTH_W        = 90;
export const MONTHS         = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
export const years = Array.from(
  { length: TIMELINE_END - TIMELINE_START + 1 },
  (_, i) => TIMELINE_START + i,
);

// ─── Types ───────────────────────────────────────────────────────────────────
export interface TooltipState {
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  lines: string[];
}

export interface TooltipCallbacks {
  showTT: (e: MouseEvent<HTMLElement>, content: Omit<TooltipState, 'x'|'y'>) => void;
  moveTT: (e: MouseEvent<HTMLElement>) => void;
  hideTT: () => void;
}

export type VerticalScrollTarget = HTMLElement | null;

export function getVerticalScrollTarget(from: HTMLElement | null): VerticalScrollTarget {
  let el = from?.parentElement ?? null;
  while (el) {
    const style = window.getComputedStyle(el);
    const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);
    if (canScrollY && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return null;
}

export function getVerticalScrollTop(target: VerticalScrollTarget): number {
  return target ? target.scrollTop : window.scrollY;
}

export function setVerticalScrollTop(target: VerticalScrollTarget, top: number) {
  if (target) target.scrollTop = top;
  else window.scrollTo(0, top);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function dateToX(date: Date, yw: number): number {
  const f = date.getFullYear() + date.getMonth() / 12;
  return (f - TIMELINE_START) * yw;
}

export function dateToMonthX(date: Date, year: number, mw: number): number {
  const yearStart = new Date(year, 0, 1).getTime();
  const yearEnd   = new Date(year + 1, 0, 1).getTime();
  const t = Math.max(yearStart, Math.min(yearEnd, date.getTime()));
  return ((t - yearStart) / (yearEnd - yearStart)) * 12 * mw;
}

export function overlapsYear(start: Date, end: Date, year: number): boolean {
  return start.getFullYear() <= year && end.getFullYear() >= year;
}

export function getAgeAtMonth(dob: Date, year: number, month: number): number {
  const age = year - dob.getFullYear();
  return month < dob.getMonth() ? age - 1 : age;
}

export function getTISLabel(enlist: Date, year: number, month: number): string {
  const total = (year - enlist.getFullYear()) * 12 + (month - enlist.getMonth());
  if (total < 0) return '—';
  return `${Math.floor(total / 12)}Y ${total % 12}M`;
}

export function fmtDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
}

export function durationLabel(start: Date, end: Date): string {
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} yr${y > 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} mo${m > 1 ? 's' : ''}`);
  return parts.join(' ') || '< 1 mo';
}

// ─── Tooltip builders ─────────────────────────────────────────────────────────
export function ttDutyStation(ds: DutyStation): Omit<TooltipState, 'x'|'y'> {
  return {
    title: ds.location,
    subtitle: ds.unit,
    lines: [
      `${fmtDate(ds.startDate)} – ${fmtDate(ds.endDate)}`,
      `Duration: ${durationLabel(ds.startDate, ds.endDate)}`,
      ds.isPotential ? '⬡  POTENTIAL ASSIGNMENT' : '✓  CONFIRMED STATION',
    ],
  };
}

export function ttPromotion(p: Promotion): Omit<TooltipState, 'x'|'y'> {
  return {
    title: p.rank.toUpperCase(),
    subtitle: `${p.payGrade} · ${p.rankAbbr}`,
    lines: [fmtDate(p.date), p.isProjected ? 'PROJECTED' : 'CONFIRMED'],
  };
}

export function ttEducation(e: EducationEvent): Omit<TooltipState, 'x'|'y'> {
  return {
    title: e.label,
    lines: [
      `${fmtDate(e.startDate)} – ${fmtDate(e.endDate)}`,
      `Duration: ${durationLabel(e.startDate, e.endDate)}`,
      e.isProjected ? 'PROJECTED' : 'CONFIRMED',
    ],
  };
}

export function ttMilestone(m: CareerMilestone): Omit<TooltipState, 'x'|'y'> {
  return {
    title: m.label,
    lines: m.endDate
      ? [`${fmtDate(m.date)} – ${fmtDate(m.endDate)}`]
      : [fmtDate(m.date)],
  };
}

export function ttGoal(g: FinancialGoal): Omit<TooltipState, 'x'|'y'> {
  return {
    title: g.label,
    lines: [
      g.amount > 0 ? `Goal: $${g.amount.toLocaleString()}` : 'Debt-free target',
      `Target: ${fmtDate(g.targetDate)}`,
    ],
  };
}

export function ttChild(child: Child, year: number): Omit<TooltipState, 'x'|'y'> {
  const age = year - child.dob.getFullYear();
  return {
    title: child.name.toUpperCase(),
    lines: [`Born: ${fmtDate(child.dob)}`, `Age in ${year}: ${age}`],
  };
}

export function ttSchool(label: string, child: Child, start: Date, end: Date): Omit<TooltipState, 'x'|'y'> {
  return {
    title: label,
    subtitle: child.name,
    lines: [
      `${fmtDate(start)} – ${fmtDate(end)}`,
      `Duration: ${durationLabel(start, end)}`,
    ],
  };
}

// ─── Grade labels & helpers ──────────────────────────────────────────────────
export const GRADE_LABELS: Record<SchoolPhaseType, readonly string[]> = {
  prek:       ['PK', 'PK'],
  elementary: ['K', '1', '2', '3', '4', '5'],
  middle:     ['6', '7', '8'],
  high:       ['9', '10', '11', '12'],
  college:    ['Fr', 'So', 'Jr', 'Sr', '5th'],
};

export interface GradeBlock { label: string; x: number; w: number; }

export function getSchoolGradeBlocks(
  sp: { phase: SchoolPhaseType; startDate: Date; endDate: Date },
  yw: number,
  yearEndMonth = 5, // 0-11; default June (5)
  yearEndDay = 15,  // last day of school within the end month
): GradeBlock[] {
  const blocks: GradeBlock[] = [];
  const labels = GRADE_LABELS[sp.phase] ?? [];
  const firstCalYear = sp.startDate.getMonth() > 8
    ? sp.startDate.getFullYear() + 1
    : sp.startDate.getFullYear();
  for (let i = 0; i < 10; i++) {
    const calYear = firstCalYear + i;
    const sepDate = new Date(calYear, 8, 1);
    // Use the exact end day for precise block sizing; clamp to valid days in month
    const lastDayOfMonth = new Date(calYear + 1, yearEndMonth + 1, 0).getDate();
    const clampedDay = Math.min(yearEndDay, lastDayOfMonth);
    const yearEndDate = new Date(calYear + 1, yearEndMonth, clampedDay + 1); // +1 = exclusive
    if (sepDate >= sp.endDate) break;
    const x  = dateToX(sepDate, yw);
    const x2 = Math.min(dateToX(yearEndDate, yw), dateToX(sp.endDate, yw));
    if (x2 - x < 2) continue;
    blocks.push({ label: labels[i] ?? labels[labels.length - 1] ?? `${i + 1}`, x, w: x2 - x });
  }
  return blocks;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
export const SCHOOL_STYLE: Record<SchoolPhaseType, { bg: string; border: string; text: string }> = {
  prek:       { bg: 'rgba(245,158,11,0.20)', border: 'rgba(245,158,11,0.50)', text: '#fbbf24' },
  elementary: { bg: 'rgba(59,130,246,0.20)', border: 'rgba(59,130,246,0.50)', text: '#60a5fa' },
  middle:     { bg: 'rgba(139,92,246,0.20)', border: 'rgba(139,92,246,0.50)', text: '#a78bfa' },
  high:       { bg: 'rgba(20,184,166,0.20)', border: 'rgba(20,184,166,0.50)', text: '#2dd4bf' },
  college:    { bg: 'rgba(234,179,8,0.20)',  border: 'rgba(234,179,8,0.50)',  text: '#eab308' },
};

export const SCHOOL_STYLE_DESERT: Record<SchoolPhaseType, { bg: string; border: string; text: string }> = {
  prek:       { bg: 'rgba(217,119,6,0.18)',   border: 'rgba(180,83,9,0.45)',   text: '#92400e' },
  elementary: { bg: 'rgba(37,99,235,0.15)',   border: 'rgba(29,78,216,0.40)',  text: '#1e40af' },
  middle:     { bg: 'rgba(109,40,217,0.14)',  border: 'rgba(91,33,182,0.38)',  text: '#5b21b6' },
  high:       { bg: 'rgba(15,118,110,0.15)',  border: 'rgba(13,94,88,0.40)',   text: '#0f766e' },
  college:    { bg: 'rgba(161,98,7,0.14)',    border: 'rgba(133,77,14,0.42)',  text: '#78350f' },
};

export const MILESTONE_COLOR: Record<string, string> = {
  enlistment:   '#22c55e',
  eas:          '#fbbf24',
  reenlistment: '#f97316',
  letter:       '#fbbf24',
  retirement:   '#22c55e',
};

export const MILESTONE_COLOR_DESERT: Record<string, string> = {
  enlistment:   '#15803d',
  eas:          '#b45309',
  reenlistment: '#c2410c',
  letter:       '#b45309',
  retirement:   '#15803d',
};
