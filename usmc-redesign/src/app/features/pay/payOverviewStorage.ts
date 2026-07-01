import { clampYearsOfService, PAY_TABLES_2026, type PayCategory } from './payTables2026';

export const PAY_SETTINGS_STORAGE_KEY = 'pay-benefits:overview-settings:v1';

export type StoredPayOverviewSettings = {
  payCategory: PayCategory;
  payRank: string;
  payRankAbbr?: string;
  yearsOfService: number;
  includeBas: boolean;
  afadbd: string | null;
};

const payCategories: PayCategory[] = ['enlisted', 'warrant', 'officer'];

export function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getDefaultPayOverviewSettings(): StoredPayOverviewSettings {
  return {
    payCategory: 'enlisted',
    payRank: 'E-5',
    yearsOfService: 4,
    includeBas: false,
    afadbd: null,
  };
}

export function readStoredPayOverviewSettings(): StoredPayOverviewSettings {
  const defaults = getDefaultPayOverviewSettings();

  if (!canUseStorage()) {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(PAY_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as Partial<StoredPayOverviewSettings>;
    const payCategory = payCategories.includes(parsed.payCategory as PayCategory)
      ? parsed.payCategory as PayCategory
      : defaults.payCategory;
    const validRanks = PAY_TABLES_2026[payCategory].ranks;
    const payRank = typeof parsed.payRank === 'string' && validRanks.includes(parsed.payRank)
      ? parsed.payRank
      : validRanks.includes(defaults.payRank) ? defaults.payRank : validRanks[0];

    return {
      payCategory,
      payRank,
      payRankAbbr: typeof parsed.payRankAbbr === 'string' ? parsed.payRankAbbr : undefined,
      yearsOfService: clampYearsOfService(Number(parsed.yearsOfService ?? defaults.yearsOfService)),
      includeBas: Boolean(parsed.includeBas),
      afadbd: typeof parsed.afadbd === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.afadbd) ? parsed.afadbd : null,
    };
  } catch {
    return defaults;
  }
}

export function writeStoredPayOverviewSettings(settings: StoredPayOverviewSettings) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(PAY_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures so the UI still works.
  }
}
