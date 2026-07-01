import type {
  MarineProfile, Promotion, CareerMilestone, DutyStation,
  EducationEvent, Spouse, Child, SchoolPhase, FinancialGoal,
  SavedTimeline, TimelineData,
} from './types';
import { USMC_RANKS } from './rankData';
import { readStoredPayOverviewSettings } from '../pay/payOverviewStorage';
import { marineProfile as defaultProfile, promotions as defaultPromotions } from './mockData';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const PROFILE_KEY          = 'career-path:profile:v1';
const PROMOTIONS_KEY       = 'career-path:promotions:v1';
const MILESTONES_KEY       = 'career-path:milestones:v1';
const DUTY_STATIONS_KEY    = 'career-path:duty-stations:v1';
const EDUCATION_KEY        = 'career-path:education:v1';
const SPOUSE_KEY           = 'career-path:spouse:v1';
const CHILDREN_KEY         = 'career-path:children:v1';
const FINANCIAL_GOALS_KEY  = 'career-path:financial-goals:v1';
const SAVED_TIMELINES_KEY  = 'career-path:saved-timelines:v1';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ok(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function parseDate(s: string, fallback: Date): Date {
  if (!s) return fallback;
  const d = new Date(s);
  return isNaN(d.getTime()) ? fallback : d;
}

function get<T>(key: string, revive: (raw: unknown) => T): T | null {
  if (!ok()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return revive(JSON.parse(raw));
  } catch { return null; }
}

function put(key: string, value: unknown): void {
  if (!ok()) return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// ─── Profile ──────────────────────────────────────────────────────────────────
interface StoredProfile {
  name: string; rankFull: string; rankAbbr: string; payGrade: string;
  mos: string; mosDescription: string;
  dob: string; enlistmentDate: string; promotionDate: string;
  projectedRetirement: string; retirementYears: number;
}

function profileToStored(p: MarineProfile): StoredProfile {
  return {
    name: p.name, rankFull: p.rankFull, rankAbbr: p.rankAbbr, payGrade: p.payGrade,
    mos: p.mos, mosDescription: p.mosDescription,
    dob: p.dob.toISOString(), enlistmentDate: p.enlistmentDate.toISOString(),
    promotionDate: p.promotionDate.toISOString(),
    projectedRetirement: p.projectedRetirement.toISOString(),
    retirementYears: p.retirementYears,
  };
}

function storedToProfile(s: StoredProfile): MarineProfile {
  const enlist = parseDate(s.enlistmentDate, defaultProfile.enlistmentDate);
  const retire = parseDate(s.projectedRetirement, defaultProfile.projectedRetirement);
  return {
    name: s.name, rankFull: s.rankFull, rankAbbr: s.rankAbbr, payGrade: s.payGrade,
    mos: s.mos, mosDescription: s.mosDescription,
    dob: parseDate(s.dob, defaultProfile.dob),
    enlistmentDate: enlist,
    promotionDate: parseDate(s.promotionDate, defaultProfile.promotionDate),
    projectedRetirement: retire,
    retirementYears: Math.round((retire.getFullYear() - enlist.getFullYear()) + (retire.getMonth() - enlist.getMonth()) / 12),
  };
}

export function readCareerProfile(): MarineProfile | null {
  return get(PROFILE_KEY, s => storedToProfile(s as StoredProfile));
}
export function writeCareerProfile(p: MarineProfile): void {
  put(PROFILE_KEY, profileToStored(p));
}

// ─── Promotions ───────────────────────────────────────────────────────────────
interface StoredPromotion { id: string; rank: string; rankAbbr: string; payGrade: string; date: string; isProjected?: boolean; }

export function readCareerPromotions(): Promotion[] | null {
  return get(PROMOTIONS_KEY, (raw) => {
    return (raw as StoredPromotion[]).map(s => ({
      id: s.id, rank: s.rank, rankAbbr: s.rankAbbr, payGrade: s.payGrade,
      date: parseDate(s.date, new Date()), isProjected: s.isProjected,
    }));
  });
}
export function writeCareerPromotions(promotions: Promotion[]): void {
  put(PROMOTIONS_KEY, promotions.map(p => ({
    id: p.id, rank: p.rank, rankAbbr: p.rankAbbr, payGrade: p.payGrade,
    date: p.date.toISOString(), isProjected: p.isProjected,
  })));
}

// ─── Milestones ───────────────────────────────────────────────────────────────
interface StoredMilestone {
  id: string; label: string; shortLabel: string; type: string;
  date: string; endDate?: string; track: 0 | 1;
  customIcon?: string; customColor?: string;
}

export function readCareerMilestones(): CareerMilestone[] | null {
  return get(MILESTONES_KEY, (raw) => {
    return (raw as StoredMilestone[]).map(s => ({
      id: s.id, label: s.label, shortLabel: s.shortLabel,
      type: s.type as CareerMilestone['type'],
      date: parseDate(s.date, new Date()),
      endDate: s.endDate ? parseDate(s.endDate, new Date()) : undefined,
      track: s.track,
      customIcon: s.customIcon,
      customColor: s.customColor,
    }));
  });
}
export function writeCareerMilestones(items: CareerMilestone[]): void {
  put(MILESTONES_KEY, items.map(m => ({
    id: m.id, label: m.label, shortLabel: m.shortLabel, type: m.type,
    date: m.date.toISOString(),
    endDate: m.endDate?.toISOString(),
    track: m.track,
    customIcon: m.customIcon,
    customColor: m.customColor,
  })));
}

// ─── Duty Stations ────────────────────────────────────────────────────────────
interface StoredDutyStation {
  id: string; location: string; unit?: string;
  startDate: string; endDate: string; isPotential?: boolean;
}

export function readCareerDutyStations(): DutyStation[] | null {
  return get(DUTY_STATIONS_KEY, (raw) => {
    return (raw as StoredDutyStation[]).map(s => ({
      id: s.id, location: s.location, unit: s.unit,
      startDate: parseDate(s.startDate, new Date()),
      endDate: parseDate(s.endDate, new Date()),
      isPotential: s.isPotential,
    }));
  });
}
export function writeCareerDutyStations(items: DutyStation[]): void {
  put(DUTY_STATIONS_KEY, items.map(d => ({
    id: d.id, location: d.location, unit: d.unit,
    startDate: d.startDate.toISOString(), endDate: d.endDate.toISOString(),
    isPotential: d.isPotential,
  })));
}

// ─── Education ────────────────────────────────────────────────────────────────
interface StoredEducation {
  id: string; label: string; startDate: string; endDate: string; isProjected?: boolean;
}

export function readCareerEducation(): EducationEvent[] | null {
  return get(EDUCATION_KEY, (raw) => {
    return (raw as StoredEducation[]).map(s => ({
      id: s.id, label: s.label,
      startDate: parseDate(s.startDate, new Date()),
      endDate: parseDate(s.endDate, new Date()),
      isProjected: s.isProjected,
    }));
  });
}
export function writeCareerEducation(items: EducationEvent[]): void {
  put(EDUCATION_KEY, items.map(e => ({
    id: e.id, label: e.label,
    startDate: e.startDate.toISOString(), endDate: e.endDate.toISOString(),
    isProjected: e.isProjected,
  })));
}

// ─── Spouse ───────────────────────────────────────────────────────────────────
interface StoredSpouse { name: string; dob: string; marriageDate: string; color?: string; }

export function readCareerSpouse(): Spouse | null {
  return get(SPOUSE_KEY, (raw) => {
    const s = raw as StoredSpouse;
    return {
      name: s.name,
      dob: parseDate(s.dob, new Date()),
      marriageDate: parseDate(s.marriageDate, new Date()),
      color: s.color,
    };
  });
}
export function writeCareerSpouse(spouse: Spouse | null): void {
  if (spouse === null) { if (ok()) window.localStorage.removeItem(SPOUSE_KEY); return; }
  put(SPOUSE_KEY, { name: spouse.name, dob: spouse.dob.toISOString(), marriageDate: spouse.marriageDate.toISOString(), color: spouse.color });
}

// ─── Children ─────────────────────────────────────────────────────────────────
interface StoredSchoolPhase { phase: string; label: string; startDate: string; endDate: string; }
interface StoredChild {
  id: string; name: string; dob: string; color: string;
  schoolPhases: StoredSchoolPhase[]; isPlanned?: boolean; plannedYear?: number;
}

function reviveSchoolPhase(s: StoredSchoolPhase): SchoolPhase {
  return {
    phase: s.phase as SchoolPhase['phase'], label: s.label,
    startDate: parseDate(s.startDate, new Date()),
    endDate: parseDate(s.endDate, new Date()),
  };
}

export function readCareerChildren(): Child[] | null {
  return get(CHILDREN_KEY, (raw) => {
    return (raw as StoredChild[]).map(s => ({
      id: s.id, name: s.name,
      dob: parseDate(s.dob, new Date()),
      color: s.color,
      schoolPhases: (s.schoolPhases ?? []).map(reviveSchoolPhase),
      isPlanned: s.isPlanned, plannedYear: s.plannedYear,
    }));
  });
}
export function writeCareerChildren(items: Child[]): void {
  put(CHILDREN_KEY, items.map(c => ({
    id: c.id, name: c.name, dob: c.dob.toISOString(), color: c.color,
    schoolPhases: c.schoolPhases.map(sp => ({
      phase: sp.phase, label: sp.label,
      startDate: sp.startDate.toISOString(), endDate: sp.endDate.toISOString(),
    })),
    isPlanned: c.isPlanned, plannedYear: c.plannedYear,
  })));
}

// ─── Financial Goals ──────────────────────────────────────────────────────────
interface StoredFinancialGoal {
  id: string; label: string; amount: number; targetDate: string; iconName: string;
  customIconName?: string; customColor?: string;
}

export function readCareerFinancialGoals(): FinancialGoal[] | null {
  return get(FINANCIAL_GOALS_KEY, (raw) => {
    return (raw as StoredFinancialGoal[]).map(s => ({
      id: s.id, label: s.label, amount: s.amount,
      targetDate: parseDate(s.targetDate, new Date()),
      iconName: s.iconName as FinancialGoal['iconName'],
      customIconName: s.customIconName,
      customColor: s.customColor,
    }));
  });
}
export function writeCareerFinancialGoals(items: FinancialGoal[]): void {
  put(FINANCIAL_GOALS_KEY, items.map(g => ({
    id: g.id, label: g.label, amount: g.amount,
    targetDate: g.targetDate.toISOString(), iconName: g.iconName,
    customIconName: g.customIconName,
    customColor: g.customColor,
  })));
}

// ─── Saved timelines ─────────────────────────────────────────────────────────
type StoredTimelineData = {
  profile: ReturnType<typeof profileToStored>;
  promotions: StoredPromotion[];
  milestones: StoredMilestone[];
  dutyStations: StoredDutyStation[];
  education: StoredEducation[];
  spouse: StoredSpouse | null;
  children: StoredChild[];
  financialGoals: StoredFinancialGoal[];
};

interface StoredSavedTimeline {
  id: string;
  name: string;
  savedAt: string;
  data: StoredTimelineData;
}

function timelineDataToStored(data: TimelineData): StoredTimelineData {
  return {
    profile: profileToStored(data.profile),
    promotions: data.promotions.map(p => ({
      id: p.id,
      rank: p.rank,
      rankAbbr: p.rankAbbr,
      payGrade: p.payGrade,
      date: p.date.toISOString(),
      isProjected: p.isProjected,
    })),
    milestones: data.milestones.map(m => ({
      id: m.id,
      label: m.label,
      shortLabel: m.shortLabel,
      date: m.date.toISOString(),
      endDate: m.endDate?.toISOString(),
      type: m.type,
      track: m.track,
      iconSize: m.iconSize,
      customIcon: m.customIcon,
      customColor: m.customColor,
    })),
    dutyStations: data.dutyStations.map(d => ({
      id: d.id,
      location: d.location,
      unit: d.unit,
      startDate: d.startDate.toISOString(),
      endDate: d.endDate.toISOString(),
      isPotential: d.isPotential,
    })),
    education: data.education.map(e => ({
      id: e.id,
      label: e.label,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      isProjected: e.isProjected,
    })),
    spouse: data.spouse
      ? {
        name: data.spouse.name,
        dob: data.spouse.dob.toISOString(),
        marriageDate: data.spouse.marriageDate.toISOString(),
        color: data.spouse.color,
      } as StoredSpouse
      : null,
    children: data.children.map(c => ({
      id: c.id,
      name: c.name,
      dob: c.dob.toISOString(),
      color: c.color,
      schoolPhases: c.schoolPhases.map(sp => ({
        phase: sp.phase,
        label: sp.label,
        startDate: sp.startDate.toISOString(),
        endDate: sp.endDate.toISOString(),
      })),
      schoolYearEndMonth: c.schoolYearEndMonth,
      schoolYearEndDay: c.schoolYearEndDay,
      isPlanned: c.isPlanned,
      plannedYear: c.plannedYear,
    })),
    financialGoals: data.financialGoals.map(g => ({
      id: g.id,
      label: g.label,
      amount: g.amount,
      targetDate: g.targetDate.toISOString(),
      iconName: g.iconName,
      customIconName: g.customIconName,
      customColor: g.customColor,
    })),
  };
}

function storedToTimelineData(data: StoredTimelineData): TimelineData {
  return {
    profile: storedToProfile(data.profile),
    promotions: data.promotions.map(s => ({
      id: s.id,
      rank: s.rank,
      rankAbbr: s.rankAbbr,
      payGrade: s.payGrade,
      date: parseDate(s.date, new Date()),
      isProjected: s.isProjected,
    })),
    milestones: data.milestones.map(s => ({
      id: s.id,
      label: s.label,
      shortLabel: s.shortLabel,
      date: parseDate(s.date, new Date()),
      endDate: s.endDate ? parseDate(s.endDate, new Date()) : undefined,
      type: s.type as CareerMilestone['type'],
      track: s.track === 1 ? 1 : 0,
      iconSize: s.iconSize,
      customIcon: s.customIcon,
      customColor: s.customColor,
    })),
    dutyStations: data.dutyStations.map(s => ({
      id: s.id,
      location: s.location,
      unit: s.unit,
      startDate: parseDate(s.startDate, new Date()),
      endDate: parseDate(s.endDate, new Date()),
      isPotential: s.isPotential,
    })),
    education: data.education.map(s => ({
      id: s.id,
      label: s.label,
      startDate: parseDate(s.startDate, new Date()),
      endDate: parseDate(s.endDate, new Date()),
      isProjected: s.isProjected,
    })),
    spouse: data.spouse
      ? {
        name: data.spouse.name,
        dob: parseDate(data.spouse.dob, new Date()),
        marriageDate: parseDate(data.spouse.marriageDate, new Date()),
        color: data.spouse.color,
      }
      : null,
    children: data.children.map(s => ({
      id: s.id,
      name: s.name,
      dob: parseDate(s.dob, new Date()),
      color: s.color,
      schoolPhases: s.schoolPhases.map(sp => ({
        phase: sp.phase,
        label: sp.label,
        startDate: parseDate(sp.startDate, new Date()),
        endDate: parseDate(sp.endDate, new Date()),
      })),
      schoolYearEndMonth: s.schoolYearEndMonth,
      schoolYearEndDay: s.schoolYearEndDay,
      isPlanned: s.isPlanned,
      plannedYear: s.plannedYear,
    })),
    financialGoals: data.financialGoals.map(s => ({
      id: s.id,
      label: s.label,
      amount: s.amount,
      targetDate: parseDate(s.targetDate, new Date()),
      iconName: s.iconName as FinancialGoal['iconName'],
      customIconName: s.customIconName,
      customColor: s.customColor,
    })),
  };
}

export function readSavedTimelines(): SavedTimeline[] {
  return get(SAVED_TIMELINES_KEY, (raw) => {
    return (raw as StoredSavedTimeline[])
      .map(s => ({
        id: s.id,
        name: s.name,
        savedAt: parseDate(s.savedAt, new Date()),
        data: storedToTimelineData(s.data),
      }))
      .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  }) ?? [];
}

export function writeSavedTimelines(items: SavedTimeline[]): void {
  put(SAVED_TIMELINES_KEY, items.map(t => ({
    id: t.id,
    name: t.name,
    savedAt: t.savedAt.toISOString(),
    data: timelineDataToStored(t.data),
  } satisfies StoredSavedTimeline)));
}

export function saveTimelineSnapshot(name: string, data: TimelineData): SavedTimeline {
  const trimmed = name.trim() || 'Untitled Timeline';
  const item: SavedTimeline = {
    id: `timeline-${Date.now()}`,
    name: trimmed,
    savedAt: new Date(),
    data,
  };
  writeSavedTimelines([item, ...readSavedTimelines()]);
  return item;
}

export function deleteSavedTimeline(id: string): void {
  writeSavedTimelines(readSavedTimelines().filter(t => t.id !== id));
}

// ─── Bootstrap from Pay & Benefits settings ───────────────────────────────────
export function buildProfileFromPaySettings(): MarineProfile {
  const base = defaultProfile;
  if (!ok()) return base;
  try {
    const pay = readStoredPayOverviewSettings();
    const rankDef = USMC_RANKS.find(r => r.payGrade === pay.payRank);
    const enlistDate = pay.afadbd ? parseDate(pay.afadbd, base.enlistmentDate) : base.enlistmentDate;
    const TODAY = new Date(2026, 5, 6);
    return {
      ...base,
      ...(rankDef ? { rankFull: rankDef.full, rankAbbr: rankDef.abbr, payGrade: rankDef.payGrade } : {}),
      enlistmentDate: enlistDate,
      promotionDate: TODAY,
    };
  } catch { return base; }
}

export { defaultPromotions };
