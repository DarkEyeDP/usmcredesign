import { getMOSList } from './db/queries';
import { getSkillMatch } from './db/mos-skills';
import { CERT_BY_ID } from './db/cert-library';
import { DEGREE_FIELD_BY_ID } from './db/degree-field-library';
import type { SkillTag } from './db/mos-skills';
import type { RequirementGroup, UserScores } from './db/schema';
import type {
  ClearanceLevel,
  QualificationCheck,
  QualificationCheckStatus,
  ResultItem,
  SortMode,
} from './types';

const CLEARANCE_ORDER: Record<ClearanceLevel | 'ts_sci_poly', number> = {
  none: 0,
  confidential: 1,
  secret: 2,
  top_secret: 3,
  ts_sci: 4,
  ts_sci_poly: 5,
};

const CLEARANCE_LABELS: Record<ClearanceLevel | 'ts_sci_poly', string> = {
  none: 'None',
  confidential: 'Confidential',
  secret: 'Secret',
  top_secret: 'Top Secret',
  ts_sci: 'TS/SCI',
  ts_sci_poly: 'TS/SCI w/ Poly',
};

interface MatchContext {
  rank: string;
  promotionDate?: string;
  clearance?: string;
  hasNormalColorVision?: boolean;
  education?: string;
  degreeFields?: string[];
}

const EDUCATION_ORDER: Record<string, number> = {
  none: 0,
  hs_ged: 1,
  some_college: 2,
  associates: 3,
  bachelors: 4,
  masters: 5,
  doctorate: 6,
  professional: 6,
};

/** Returns true if the user meets ALL score conditions in at least ONE requirement group. */
export function meetsReqs(scores: UserScores, reqs: RequirementGroup[]): boolean {
  return reqs.some(g =>
    (!g.gt || scores.GT >= g.gt) &&
    (!g.el || scores.EL >= g.el) &&
    (!g.mm || scores.MM >= g.mm) &&
    (!g.cl || scores.CL >= g.cl)
  );
}

/**
 * Computes a match percentage (85–100) for a qualifying MOS.
 * Baseline 85% for passing; up to +15% based on how much scores
 * exceed the minimum in the best-matching requirement group.
 */
export function computeMatch(scores: UserScores, reqs: RequirementGroup[], qualificationChecks: QualificationCheck[] = []): number {
  let best = 0;
  for (const g of reqs) {
    if (!meetsReqs(scores, [g])) continue;
    const parts = [
      g.gt ? { s: scores.GT, r: g.gt } : null,
      g.el ? { s: scores.EL, r: g.el } : null,
      g.mm ? { s: scores.MM, r: g.mm } : null,
      g.cl ? { s: scores.CL, r: g.cl } : null,
    ].filter(Boolean) as { s: number; r: number }[];
    if (parts.length === 0) { best = Math.max(best, 88); continue; }
    const avg = parts.reduce((sum, p) => sum + Math.min(1, (p.s - p.r) / 30), 0) / parts.length;
    best = Math.max(best, Math.min(100, Math.round(85 + avg * 15)));
  }

  const unmetCount = qualificationChecks.filter(check => check.status === 'unmet').length;
  const penalized = Math.max(55, (best || 85) - unmetCount * 25);

  return penalized;
}

/** Formats ASVAB requirement groups into a human-readable string. */
export function reqLabel(reqs: RequirementGroup[]): string {
  return reqs
    .map(g => {
      const parts: string[] = [];
      if (g.gt) parts.push(`GT ${g.gt}`);
      if (g.el) parts.push(`EL ${g.el}`);
      if (g.mm) parts.push(`MM ${g.mm}`);
      if (g.cl) parts.push(`CL ${g.cl}`);
      return parts.join('+') || 'Open';
    })
    .join(' OR ');
}

function meetsClearance(userClearance: string, required: ClearanceLevel): boolean {
  const userLevel = CLEARANCE_ORDER[userClearance as ClearanceLevel | 'ts_sci_poly'];
  const requiredLevel = CLEARANCE_ORDER[required];

  return userLevel >= requiredLevel;
}

function canUpgradeClearanceForLatMove(userClearance: string, required: ClearanceLevel): boolean {
  const userLevel = CLEARANCE_ORDER[userClearance as ClearanceLevel | 'ts_sci_poly'];
  const requiredLevel = CLEARANCE_ORDER[required];

  if (userLevel == null) return false;
  if (userLevel >= requiredLevel) return true;

  return userLevel >= CLEARANCE_ORDER.secret && requiredLevel > CLEARANCE_ORDER.secret;
}

function getClearanceUpgradeCheck(userClearance: string, required: ClearanceLevel): QualificationCheck | null {
  if (meetsClearance(userClearance, required)) return null;
  if (!canUpgradeClearanceForLatMove(userClearance, required)) return null;

  const currentLabel = CLEARANCE_LABELS[userClearance as ClearanceLevel | 'ts_sci_poly'] ?? userClearance;
  const requiredLabel = CLEARANCE_LABELS[required];

  return {
    text: `Current clearance is ${currentLabel}. This MOS requires ${requiredLabel}; you would likely need to complete the higher-clearance screening/adjudication process after lat move approval.`,
    status: 'unknown',
  };
}

function monthsSincePromotion(promotionDate?: string): number | null {
  if (!promotionDate) return null;

  const parsed = new Date(`${promotionDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  let months = (today.getFullYear() - parsed.getFullYear()) * 12 + (today.getMonth() - parsed.getMonth());

  if (today.getDate() < parsed.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
}

function qualificationStatus(text: string, context: MatchContext): QualificationCheckStatus {
  const normalized = text.toLowerCase();
  const tigMonths = monthsSincePromotion(context.promotionDate);
  const userClearance = context.clearance ?? 'none';
  const hasNormalColorVision = context.hasNormalColorVision ?? true;
  const educationLevel = context.education ?? 'none';
  const educationRank = EDUCATION_ORDER[educationLevel] ?? 0;

  if (normalized.includes('sgts may be considered with less than 1 year tig')) {
    if (context.rank !== 'E-5') return 'met';
    if (tigMonths == null) return 'unknown';
    return tigMonths < 12 ? 'met' : 'unmet';
  }

  if (
    normalized.includes('must be a volunteer corporal') &&
    normalized.includes('sergeant') &&
    normalized.includes('staff sergeant')
  ) {
    return ['E-4', 'E-5', 'E-6'].includes(context.rank) ? 'met' : 'unmet';
  }

  if (normalized.includes('high school graduate') || normalized.includes('have ged')) {
    return educationRank >= EDUCATION_ORDER.hs_ged ? 'met' : 'unmet';
  }

  if (normalized.includes('associate') && normalized.includes('degree')) {
    return educationRank >= EDUCATION_ORDER.associates ? 'met' : 'unmet';
  }

  if (normalized.includes("bachelor") && normalized.includes('degree')) {
    return educationRank >= EDUCATION_ORDER.bachelors ? 'met' : 'unmet';
  }

  if (normalized.includes("master") && normalized.includes('degree')) {
    return educationRank >= EDUCATION_ORDER.masters ? 'met' : 'unmet';
  }

  if (
    (normalized.includes('doctorate') || normalized.includes('doctoral')) &&
    normalized.includes('degree')
  ) {
    return educationRank >= EDUCATION_ORDER.doctorate ? 'met' : 'unmet';
  }

  if (normalized.includes('professional degree')) {
    return educationRank >= EDUCATION_ORDER.professional ? 'met' : 'unmet';
  }

  if (
    normalized.includes('normal color vision') ||
    normalized.includes('normal color perception') ||
    normalized.includes('normal color acuity') ||
    normalized.includes('normal color vision/perception') ||
    normalized.includes('vision correctable to 20/20') ||
    normalized.includes('vision no worse than') ||
    normalized.includes('visual acuity') ||
    normalized.includes('stereoscopic acuity') ||
    normalized.includes('depth perception') ||
    normalized.includes('20/20') ||
    normalized.includes('20/70') ||
    normalized.includes('20/100') ||
    normalized.includes('20/200') ||
    normalized.includes('correctable to 20/20')
  ) {
    return hasNormalColorVision ? 'met' : 'unknown';
  }

  if (
    normalized.includes('minimum interim secret clearance') ||
    normalized.includes('possess secret clearance') ||
    normalized.includes('must have secret clearance') ||
    normalized.includes('secret clearance eligible') ||
    normalized.includes('secret security eligible')
  ) {
    return meetsClearance(userClearance, 'secret') ? 'met' : 'unmet';
  }

  if (
    normalized.includes('top secret clearance') ||
    normalized.includes('top secret eligible') ||
    normalized.includes('ts required') ||
    normalized.includes('ts clearance') ||
    normalized.includes('ts eligible')
  ) {
    return meetsClearance(userClearance, 'top_secret') ? 'met' : 'unknown';
  }

  if (
    normalized.includes('sci eligible') ||
    normalized.includes('sci eligibility') ||
    normalized.includes('ts/sci') ||
    normalized.includes('ts sci')
  ) {
    return meetsClearance(userClearance, 'ts_sci') ? 'met' : 'unknown';
  }

  if (normalized.includes('one year of high school algebra') || normalized.includes('algebra')) {
    return educationRank >= EDUCATION_ORDER.hs_ged ? 'unknown' : 'unmet';
  }

  return 'unknown';
}

function evaluateQualifications(qualifications: string[], context: MatchContext): QualificationCheck[] {
  return qualifications.map(text => ({
    text,
    status: qualificationStatus(text, context),
  }));
}

/** Filters and scores all MOS entries against provided inputs. */
export function buildResults(
  gt: string,
  mm: string,
  el: string,
  cl: string,
  rank: string,
  clearance: string = 'secret',
  hasNormalColorVision = true,
  sortBy: SortMode = 'match',
  pmos = '',
  amos: string[] = [],
  certifications: string[] = [],
  education = 'none',
  degreeFields: string[] = []
): ResultItem[] {
  const scores: UserScores = {
    GT: parseInt(gt) || 0,
    EL: parseInt(el) || 0,
    MM: parseInt(mm) || 0,
    CL: parseInt(cl) || 0,
  };

  // Build unified MOS ID list: PMOS first, then AMOS entries — deduped, non-empty.
  const mosIds = [...new Set([pmos, ...amos].map(s => s.trim()).filter(Boolean))];

  // Resolve cert IDs → skill tags, deduped.
  const certSkills = [...new Set<SkillTag>(
    certifications.flatMap(id => CERT_BY_ID[id]?.skills ?? [])
  )];
  const degreeSkills = [...new Set<SkillTag>(
    degreeFields.flatMap(id => DEGREE_FIELD_BY_ID[id]?.skills ?? [])
  )];
  const supportSkills = [...new Set<SkillTag>([...certSkills, ...degreeSkills])];

  const hasSkillProfile = mosIds.length > 0 || supportSkills.length > 0;

  const qualified = getMOSList()
    .filter(m =>
      m.rank_eligibility.includes(rank) &&
      meetsReqs(scores, m.requirements) &&
      canUpgradeClearanceForLatMove(clearance, m.clearance)
    )
    .map(m => {
      const qualificationChecks = evaluateQualifications(m.qualifications, {
        rank,
        clearance,
        hasNormalColorVision,
        education,
        degreeFields,
      });
      const clearanceUpgradeCheck = getClearanceUpgradeCheck(clearance, m.clearance);
      const skillMatch = hasSkillProfile
        ? (getSkillMatch(mosIds, m.id, supportSkills) ?? undefined)
        : undefined;

      const targetSkillSet = new Set(m.skills);
      const matchingCertIds = certifications.filter(id =>
        (CERT_BY_ID[id]?.skills ?? []).some(s => targetSkillSet.has(s))
      );
      const matchingDegreeFieldIds = degreeFields.filter(id =>
        (DEGREE_FIELD_BY_ID[id]?.skills ?? []).some(s => targetSkillSet.has(s))
      );

      const baseMatch = computeMatch(scores, m.requirements, qualificationChecks);
      const supportBonus = Math.min(5, matchingCertIds.length + matchingDegreeFieldIds.length);
      const match = Math.min(100, baseMatch + supportBonus);

      return {
        ...m,
        match,
        reqStr: reqLabel(m.requirements),
        qualificationChecks: clearanceUpgradeCheck
          ? [clearanceUpgradeCheck, ...qualificationChecks]
          : qualificationChecks,
        skillMatch,
        matchingCertIds: matchingCertIds.length > 0 ? matchingCertIds : undefined,
        matchingDegreeFieldIds: matchingDegreeFieldIds.length > 0 ? matchingDegreeFieldIds : undefined,
      };
    });

  return sortResults(qualified, sortBy);
}

export function sortResults(results: ResultItem[], sortBy: SortMode): ResultItem[] {
  return [...results].sort((a, b) => {
    if (sortBy === 'match') {
      // Keep qualification as the primary driver, while still letting skill
      // transfer meaningfully influence the ranking.
      const aSortScore = a.match * 10 + (a.skillMatch?.pct ?? 0);
      const bSortScore = b.match * 10 + (b.skillMatch?.pct ?? 0);

      if (bSortScore !== aSortScore) return bSortScore - aSortScore;
      if (b.match !== a.match) return b.match - a.match;
      if ((b.skillMatch?.pct ?? 0) !== (a.skillMatch?.pct ?? 0)) {
        return (b.skillMatch?.pct ?? 0) - (a.skillMatch?.pct ?? 0);
      }
      return a.id.localeCompare(b.id);
    }
    if (sortBy === 'skill') {
      const aSkill = a.skillMatch?.pct ?? -1;
      const bSkill = b.skillMatch?.pct ?? -1;

      if (bSkill !== aSkill) return bSkill - aSkill;
      if ((b.skillMatch?.shared.length ?? 0) !== (a.skillMatch?.shared.length ?? 0)) {
        return (b.skillMatch?.shared.length ?? 0) - (a.skillMatch?.shared.length ?? 0);
      }
      if (b.match !== a.match) return b.match - a.match;
      return a.id.localeCompare(b.id);
    }
    if (sortBy === 'field') {
      const fieldCompare = a.field.localeCompare(b.field);
      if (fieldCompare !== 0) return fieldCompare;
      const titleCompare = a.title.localeCompare(b.title);
      if (titleCompare !== 0) return titleCompare;
      return a.id.localeCompare(b.id);
    }
    if (sortBy === 'mos')   return a.id.localeCompare(b.id);
    return a.title.localeCompare(b.title);
  });
}
