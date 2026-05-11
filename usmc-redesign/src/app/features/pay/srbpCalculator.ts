import {
  aircraftMaintNMOS,
  aircraftReadinessNMOS,
  atcNMOS,
  bonusTable,
  fmfInfantry24MCCs,
  fmfInfantry36MCCs,
  lateralMoveEligible,
  readinessMCCs,
} from './srbpData';

export const SRBP_RANK_OPTIONS = ['E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9'] as const;
export type SrbpRank = typeof SRBP_RANK_OPTIONS[number];

export const SRBP_ZONE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type SrbpZone = typeof SRBP_ZONE_ORDER[number];

export const SRBP_NMOS_OPTIONS = [
  { code: '6012', label: 'SFF Controller' },
  { code: '6016', label: 'CDI' },
  { code: '6017', label: 'CDQAR' },
  { code: '6018', label: 'QAR' },
  { code: '6033', label: 'Aircraft NDI Tech' },
  { code: '6171', label: 'Night Systems Instructor' },
  { code: '6177', label: 'W&T Crew Chief Instructor' },
  { code: '6242', label: 'Flight Engineer' },
  { code: '6516', label: 'QA/Safety Observer' },
  { code: '7252', label: 'ATC Tower' },
  { code: '7253', label: 'ATC Radar Arr/Dep' },
  { code: '7254', label: 'ATC Radar Approach' },
] as const;

export const SRBP_MONTH_OPTIONS = [36, 48, 60, 72, 84, 96] as const;

export const SRBP_MARADMIN_LINK =
  'https://www.marines.mil/News/Messages/Messages-Display/Article/4385746/fiscal-year-2027-selective-retention-bonus-program-and-fiscal-year-2027-broken/';

export interface SrbpFormValues {
  pebd: string;
  rank: SrbpRank | '';
  mos: string;
  ecc: string;
  reenlistDate: string;
  months: string;
  lateralMove: string;
  mcc: string;
  taxFreeZone: boolean;
  nmosSelections: string[];
}

export interface SrbpTaxEstimate {
  lowTax: number;
  highTax: number;
  lowNet: number;
  highNet: number;
  note: string;
}

export interface SrbpKicker {
  type: string;
  amount: number;
  name: string;
  description: string;
  total: number;
}

export interface SrbpCalculationResult {
  zone: SrbpZone;
  yearsOfServiceAtReenlistment: number;
  effectiveMos: string;
  isLateralMove: boolean;
  baseBonus: number;
  proratedBonus: number;
  months: number;
  obligatedMonths: number;
  availableKickers: SrbpKicker[];
  bestKicker: SrbpKicker | null;
  amountForTax: number;
  prorationNote: string;
  rank: SrbpRank;
  taxFreeZone: boolean;
  taxEstimate: SrbpTaxEstimate;
}

export interface LateralMoveBonusRange {
  min: number;
  max: number;
  zones: SrbpZone[];
}

export type SrbpCalculationState =
  | { status: 'idle' }
  | { status: 'error' | 'warning'; message: string }
  | { status: 'success'; result: SrbpCalculationResult };

const lm84MOSs = ['0211', '0321', '0372', '1721', '1751', '2336', '3044', '5821', '5974', '5979', '6214', '6314', '7212', '7257'];
const lmMidCareerMOSs = ['0211', '0372', '1751', '2336', '5821'];
const fmfInfantryMOSs = ['0311', '0313', '0321', '0331', '0341', '0352'];

export const SRBP_MOS_OPTIONS = Array.from(
  new Set(
    Object.values(bonusTable).flatMap((zoneTable) => Object.keys(zoneTable)),
  ),
).sort();

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function parseDateInput(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function rankNum(rank: SrbpRank) {
  return Number(rank.replace('E', ''));
}

function getZone(yearsOfService: number): SrbpZone | null {
  if (yearsOfService >= 1.42 && yearsOfService < 6) return 'A';
  if (yearsOfService >= 6 && yearsOfService < 10) return 'B';
  if (yearsOfService >= 10 && yearsOfService < 14) return 'C';
  if (yearsOfService >= 14 && yearsOfService < 18) return 'D';
  if (yearsOfService >= 18 && yearsOfService < 20) return 'E';
  if (yearsOfService >= 20 && yearsOfService < 24) return 'F';
  return null;
}

function countSelectedNMOS(selectedCodes: string[], eligibleCodes: readonly string[]) {
  const selected = new Set(selectedCodes.map(normalizeCode));
  return eligibleCodes.filter((code) => selected.has(code)).length;
}

function aircraftMaintAmount(nmosCount: number) {
  if (nmosCount >= 3) return 15000;
  if (nmosCount === 2) return 10000;
  if (nmosCount === 1) return 5000;
  return 0;
}

function aircraftReadinessAmount(nmosCount: number) {
  if (nmosCount >= 3) return 24000;
  if (nmosCount === 2) return 16000;
  if (nmosCount === 1) return 8000;
  return 0;
}

function isAircraftMaintMOS(mos: string) {
  if (mos === '6062' || mos === '6092' || mos === '6531') return true;
  const prefix = mos.slice(0, 2);
  return prefix === '61' || prefix === '62' || prefix === '63';
}

function isAircraftReadinessMOS(mos: string) {
  if (mos === '6531') return true;
  const prefix = mos.slice(0, 2);
  return prefix === '61' || prefix === '62' || prefix === '63';
}

function calculateTaxEstimate(bonusAmount: number, isTaxFree: boolean): SrbpTaxEstimate {
  if (isTaxFree || bonusAmount === 0) {
    return {
      lowTax: 0,
      highTax: 0,
      lowNet: bonusAmount,
      highNet: bonusAmount,
      note: isTaxFree ? 'Tax-free combat zone estimate.' : 'No bonus amount to tax.',
    };
  }

  const lowTax = Math.round(bonusAmount * 0.22);
  const highTax = Math.round(bonusAmount * 0.24);

  return {
    lowTax,
    highTax,
    lowNet: bonusAmount - lowTax,
    highNet: bonusAmount - highTax,
    note: 'Federal supplemental income estimate only. State taxes, FICA, and other deductions are not included.',
  };
}

export function previewZone(pebd: string, reenlistDate: string) {
  const pebdDate = parseDateInput(pebd);
  const reenlist = parseDateInput(reenlistDate);

  if (!pebdDate || !reenlist) {
    return null;
  }

  const yearsOfService = (reenlist.getTime() - pebdDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const zone = getZone(yearsOfService);

  if (!zone) {
    return null;
  }

  return {
    yearsOfService,
    zone,
  };
}

export function getLateralMoveBonusRange(mos: string): LateralMoveBonusRange | null {
  const normalizedMos = normalizeCode(mos);
  const zones = SRBP_ZONE_ORDER.filter((zone) => lateralMoveEligible[zone]?.includes(normalizedMos as never));

  if (zones.length === 0) {
    return null;
  }

  const amounts = zones.flatMap((zone) => {
    const rankTable = bonusTable[zone]?.[normalizedMos as keyof (typeof bonusTable)[typeof zone]];
    if (!rankTable) {
      return [];
    }

    return Object.values(rankTable).filter((value): value is number => typeof value === 'number' && value > 0);
  });

  if (amounts.length === 0) {
    return null;
  }

  return {
    min: Math.min(...amounts),
    max: Math.max(...amounts),
    zones,
  };
}

export function calculateSrbp(values: SrbpFormValues): SrbpCalculationState {
  const pebd = parseDateInput(values.pebd);
  const ecc = parseDateInput(values.ecc);
  const reenlistDate = parseDateInput(values.reenlistDate);
  const mos = normalizeCode(values.mos);
  const lateralMove = normalizeCode(values.lateralMove);
  const mcc = normalizeCode(values.mcc);
  const months = Number(values.months);
  const selectedRank = values.rank;
  const selectedNMOS = values.nmosSelections.map(normalizeCode);

  if (!pebd || !ecc || !reenlistDate || !mos || !selectedRank || !months) {
    return {
      status: 'error',
      message: 'Fill in all required fields before estimating your bonus.',
    };
  }

  const minECC = new Date(2026, 9, 1);
  const maxECC = new Date(2027, 8, 30);
  if (ecc < minECC || ecc > maxECC) {
    return {
      status: 'warning',
      message: 'ECC must fall between October 1, 2026 and September 30, 2027 for FY27 SRBP eligibility.',
    };
  }

  const minReenlistDate = new Date(2026, 0, 22);
  if (reenlistDate < minReenlistDate) {
    return {
      status: 'warning',
      message: 'Planned reenlistment must be on or after January 22, 2026.',
    };
  }

  const yearsOfServiceAtReenlistment =
    (reenlistDate.getTime() - pebd.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const zone = getZone(yearsOfServiceAtReenlistment);

  if (!zone) {
    return {
      status: 'error',
      message: 'SRBP requires between 17 months and 24 years of service at reenlistment.',
    };
  }

  const effectiveMos = lateralMove || mos;
  const isLateralMove = Boolean(lateralMove && lateralMove !== mos);

  if (
    isLateralMove &&
    (!lateralMoveEligible[zone] || !lateralMoveEligible[zone].includes(effectiveMos as never))
  ) {
    return {
      status: 'warning',
      message: `MOS ${effectiveMos} is not listed for lateral move bonuses in Zone ${zone}.`,
    };
  }

  const baseBonus =
    bonusTable[zone]?.[effectiveMos as keyof (typeof bonusTable)[typeof zone]]?.[selectedRank as never] ?? 0;

  const kickers: Omit<SrbpKicker, 'total'>[] = [];

  if (['A', 'B', 'C'].includes(zone) && rankNum(selectedRank) <= 7 && isAircraftMaintMOS(effectiveMos) && months >= 60) {
    const eligibleNMOS = aircraftMaintNMOS[zone as 'A' | 'B' | 'C'] ?? [];
    const count = countSelectedNMOS(selectedNMOS, eligibleNMOS);
    if (count > 0) {
      const amount = aircraftMaintAmount(count);
      kickers.push({
        type: 'aircraftMaintenance',
        amount,
        name: 'Aircraft Maintenance Kicker',
        description: `+$${amount.toLocaleString()} for a 60-month contract with ${count} qualifying NMOS.`,
      });
    }
  }

  if (
    ['A', 'B', 'C'].includes(zone) &&
    rankNum(selectedRank) <= 7 &&
    isAircraftReadinessMOS(effectiveMos) &&
    months >= 60 &&
    readinessMCCs.includes(mcc as never)
  ) {
    const eligibleNMOS = aircraftReadinessNMOS[zone as 'A' | 'B' | 'C'] ?? [];
    const count = countSelectedNMOS(selectedNMOS, eligibleNMOS);
    if (count > 0) {
      const amount = aircraftReadinessAmount(count);
      kickers.push({
        type: 'aircraftReadiness',
        amount,
        name: 'Aircraft Readiness Kicker',
        description: `+$${amount.toLocaleString()} for a 60-month contract with an eligible MCC and ${count} qualifying NMOS.`,
      });
    }
  }

  if (zone === 'A' && rankNum(selectedRank) <= 5 && isLateralMove && lm84MOSs.includes(effectiveMos) && months >= 84) {
    kickers.push({
      type: 'lateralMove84',
      amount: 50000,
      name: '84-Month Lateral Move Kicker',
      description: '+$50,000 for an 84-month lateral move contract.',
    });
  }

  if (zone === 'B' && rankNum(selectedRank) <= 7 && isLateralMove && lmMidCareerMOSs.includes(effectiveMos) && months >= 72) {
    kickers.push({
      type: 'lateralMoveCareer72',
      amount: 35000,
      name: '72-Month Mid-Career LM Kicker',
      description: '+$35,000 for a 72-month mid-career lateral move contract.',
    });
  }

  if (zone === 'A' && rankNum(selectedRank) <= 5 && fmfInfantryMOSs.includes(effectiveMos) && months >= 60) {
    if (fmfInfantry24MCCs.includes(mcc as never)) {
      kickers.push({
        type: 'fmfInfantry24',
        amount: 7000,
        name: '24-Month FMF Infantry Kicker',
        description: '+$7,000 for a 60-month contract with a 24-month FMF infantry MCC commitment.',
      });
    }

    if (fmfInfantry36MCCs.includes(mcc as never)) {
      kickers.push({
        type: 'fmfInfantry36',
        amount: 30000,
        name: '36-Month FMF Infantry Kicker',
        description: '+$30,000 for a 60-month contract with a 36-month FMF infantry MCC commitment.',
      });
    }
  }

  if (zone === 'A' && rankNum(selectedRank) <= 5 && effectiveMos === '7257' && months >= 60) {
    const hasAtcNmos = atcNMOS.some((code) => selectedNMOS.includes(code));
    if (hasAtcNmos) {
      kickers.push({
        type: 'airTrafficControl',
        amount: 40000,
        name: 'Air Traffic Control Kicker',
        description: '+$40,000 for a 60-month contract with a qualifying ATC NMOS.',
      });
    }
  }

  let proratedBonus = baseBonus;
  let prorationNote = '';

  if (months < 36) {
    proratedBonus = 0;
    prorationNote = 'Minimum 36 months required for any SRBP payment.';
  } else if (months < 48 && baseBonus > 0) {
    proratedBonus = Math.round((months / 48) * baseBonus);
    prorationNote = `${months}/48 proration applied to the base PMOS amount.`;
  }

  const availableKickers = kickers.map((kicker) => ({
    ...kicker,
    total: proratedBonus + kicker.amount,
  }));

  const bestKicker = availableKickers.reduce<SrbpKicker | null>((best, kicker) => {
    if (!best || kicker.total > best.total) {
      return kicker;
    }
    return best;
  }, null);

  const amountForTax = bestKicker ? bestKicker.total : proratedBonus;
  const taxEstimate = calculateTaxEstimate(amountForTax, values.taxFreeZone);

  return {
    status: 'success',
    result: {
      zone,
      yearsOfServiceAtReenlistment,
      effectiveMos,
      isLateralMove,
      baseBonus,
      proratedBonus,
      months,
      obligatedMonths: months,
      availableKickers,
      bestKicker,
      amountForTax,
      prorationNote,
      rank: selectedRank,
      taxFreeZone: values.taxFreeZone,
      taxEstimate,
    },
  };
}
