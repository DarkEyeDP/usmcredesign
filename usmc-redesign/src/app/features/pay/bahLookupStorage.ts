import { BAH_PAY_GRADES } from './bahData.generated';

export const BAH_LOOKUP_STORAGE_KEY = 'pay-benefits:bah-lookup:v1';

type BahPayGrade = (typeof BAH_PAY_GRADES)[number];
type DependencyStatus = 'with' | 'without';

export type StoredBahLookup = {
  query: string;
  selectedMha: string;
  payGrade: BahPayGrade;
  dependencyStatus: DependencyStatus;
  compareMhas: string[];
  locationHistory: string[];
  currentMha: string | null;
  currentSearch: string;
};

const DEFAULT_COMPARE_MHAS = ['NC178', 'VA298', 'CA038', 'CA024', 'NC177'];

export function getDefaultBahLookup(): StoredBahLookup {
  return {
    query: '',
    selectedMha: 'NC178',
    payGrade: 'E-5',
    dependencyStatus: 'with',
    compareMhas: DEFAULT_COMPARE_MHAS,
    locationHistory: [],
    currentMha: null,
    currentSearch: '',
  };
}

export function readStoredBahLookup(): StoredBahLookup {
  const defaults = getDefaultBahLookup();
  if (typeof window === 'undefined' || !window.localStorage) return defaults;

  try {
    const raw = window.localStorage.getItem(BAH_LOOKUP_STORAGE_KEY);
    if (!raw) return defaults;

    const p = JSON.parse(raw) as Partial<StoredBahLookup>;

    const selectedMha = typeof p.selectedMha === 'string' ? p.selectedMha : defaults.selectedMha;
    const storedQuery = typeof p.query === 'string' ? p.query : defaults.query;
    const isLegacyDefaultFuture = storedQuery === '28547' && selectedMha === 'NC178';

    return {
      query: isLegacyDefaultFuture ? defaults.query : storedQuery,
      selectedMha,
      payGrade: (BAH_PAY_GRADES as readonly string[]).includes(p.payGrade as string)
        ? (p.payGrade as BahPayGrade)
        : defaults.payGrade,
      dependencyStatus: p.dependencyStatus === 'with' || p.dependencyStatus === 'without'
        ? p.dependencyStatus
        : defaults.dependencyStatus,
      compareMhas: Array.isArray(p.compareMhas) && p.compareMhas.every((v) => typeof v === 'string')
        ? p.compareMhas
        : defaults.compareMhas,
      locationHistory: Array.isArray(p.locationHistory) && p.locationHistory.every((v) => typeof v === 'string')
        ? p.locationHistory
        : defaults.locationHistory,
      currentMha: typeof p.currentMha === 'string' ? p.currentMha : null,
      currentSearch: typeof p.currentSearch === 'string' ? p.currentSearch : '',
    };
  } catch {
    return defaults;
  }
}

export function writeStoredBahLookup(s: StoredBahLookup) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(BAH_LOOKUP_STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Ignore storage failures.
  }
}
