export type PayCategory = 'enlisted' | 'warrant' | 'officer';

export type PaySelection = {
  category: PayCategory;
  rank: string;
  yearsOfService: number;
};

type PayBracket = {
  label: string;
  minExclusive?: number;
  maxInclusive?: number;
};

type PayCategoryTable = {
  title: string;
  ranks: string[];
  payByRank: Record<string, Array<number | null>>;
};

export const PAY_BRACKETS_2026: PayBracket[] = [
  { label: '2 or less', maxInclusive: 2 },
  { label: 'Over 2', minExclusive: 2 },
  { label: 'Over 3', minExclusive: 3 },
  { label: 'Over 4', minExclusive: 4 },
  { label: 'Over 6', minExclusive: 6 },
  { label: 'Over 8', minExclusive: 8 },
  { label: 'Over 10', minExclusive: 10 },
  { label: 'Over 12', minExclusive: 12 },
  { label: 'Over 14', minExclusive: 14 },
  { label: 'Over 16', minExclusive: 16 },
  { label: 'Over 18', minExclusive: 18 },
  { label: 'Over 20', minExclusive: 20 },
  { label: 'Over 22', minExclusive: 22 },
  { label: 'Over 24', minExclusive: 24 },
  { label: 'Over 26', minExclusive: 26 },
  { label: 'Over 28', minExclusive: 28 },
  { label: 'Over 30', minExclusive: 30 },
  { label: 'Over 32', minExclusive: 32 },
  { label: 'Over 34', minExclusive: 34 },
  { label: 'Over 36', minExclusive: 36 },
  { label: 'Over 38', minExclusive: 38 },
  { label: 'Over 40', minExclusive: 40 },
];

export const PAY_TABLES_2026: Record<PayCategory, PayCategoryTable> = {
  enlisted: {
    title: 'Enlisted',
    ranks: ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'],
    payByRank: {
      'E-1': [
        2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2,
        2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2, 2407.2,
      ],
      'E-2': [
        2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9,
        2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9, 2697.9,
      ],
      'E-3': [
        2836.8, 3015, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198,
        3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198, 3198,
      ],
      'E-4': [
        3142.2, 3303, 3482.4, 3658.5, 3815.4, 3815.4, 3815.4, 3815.4, 3815.4, 3815.4, 3815.4,
        3815.4, 3815.4, 3815.4, 3815.4, 3815.4, 3815.4, 3815.4, 3815.4, 3815.4, 3815.4, 3815.4,
      ],
      'E-5': [
        3342.9, 3598.2, 3775.8, 3946.8, 4110, 4299.9, 4395.3, 4421.7, 4421.7, 4421.7, 4421.7,
        4421.7, 4421.7, 4421.7, 4421.7, 4421.7, 4421.7, 4421.7, 4421.7, 4421.7, 4421.7, 4421.7,
      ],
      'E-6': [
        3401.1, 3743.1, 3908.1, 4068.9, 4235.7, 4612.8, 4759.5, 5043.3, 5130.3, 5193.6, 5267.7,
        5267.7, 5267.7, 5267.7, 5267.7, 5267.7, 5267.7, 5267.7, 5267.7, 5267.7, 5267.7, 5267.7,
      ],
      'E-7': [
        3932.1, 4291.5, 4456.2, 4673.1, 4843.8, 5135.7, 5300.4, 5591.7, 5835, 6000.9, 6177.3,
        6245.7, 6475.2, 6598.2, 7067.4, 7067.4, 7067.4, 7067.4, 7067.4, 7067.4, 7067.4, 7067.4,
      ],
      'E-8': [
        null, null, null, null, null, 5656.5, 5907, 6061.8, 6247.2, 6448.2, 6811.2,
        6995.4, 7308.3, 7481.7, 7908.9, 7908.9, 8067.3, 8067.3, 8067.3, 8067.3, 8067.3, 8067.3,
      ],
      'E-9': [
        null, null, null, null, null, null, 6910.2, 7066.5, 7263.6, 7496.1, 7730.7,
        8105.1, 8423.1, 8756.7, 9267.9, 9267.9, 9730.2, 9730.2, 10217.4, 10217.4, 10729.2, 10729.2,
      ],
    },
  },
  warrant: {
    title: 'Warrant Officer',
    ranks: ['W-1', 'W-2', 'W-3', 'W-4', 'W-5'],
    payByRank: {
      'W-1': [
        4056.6, 4493.7, 4611, 4859.1, 5152.2, 5584.2, 5786.1, 6069.3, 6346.5, 6564.9, 6766.2,
        7010.1, 7010.1, 7010.1, 7010.1, 7010.1, 7010.1, 7010.1, 7010.1, 7010.1, 7010.1, 7010.1,
      ],
      'W-2': [
        4621.8, 5058.9, 5193.3, 5286, 5585.4, 6051, 6282.6, 6509.4, 6787.5, 7005, 7201.5,
        7437, 7591.5, 7714.2, 7714.2, 7714.2, 7714.2, 7714.2, 7714.2, 7714.2, 7714.2, 7714.2,
      ],
      'W-3': [
        5223.3, 5440.5, 5664.3, 5736.9, 5970.9, 6431.1, 6910.5, 7136.4, 7397.7, 7665.9, 8150.4,
        8476.5, 8671.8, 8879.7, 9162.6, 9162.6, 9162.6, 9162.6, 9162.6, 9162.6, 9162.6, 9162.6,
      ],
      'W-4': [
        5719.8, 6152.1, 6328.5, 6502.2, 6801.9, 7098, 7398, 7848.3, 8243.7, 8619.9, 8928.6,
        9228.9, 9669.6, 10032, 10445.4, 10445.4, 10653.6, 10653.6, 10653.6, 10653.6, 10653.6, 10653.6,
      ],
      'W-5': [
        null, null, null, null, null, null, null, null, null, null, null,
        10169.7, 10685.7, 11070.3, 11495.1, 11495.1, 12070.8, 12070.8, 12673.5, 12673.5, 13308.3, 13308.3,
      ],
    },
  },
  officer: {
    title: 'Officer',
    ranks: ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10'],
    payByRank: {
      'O-1': [
        4150.2, 4320, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4,
        5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4, 5222.4,
      ],
      'O-2': [
        4782, 5446.2, 6272.4, 6484.5, 6617.7, 6617.7, 6617.7, 6617.7, 6617.7, 6617.7, 6617.7,
        6617.7, 6617.7, 6617.7, 6617.7, 6617.7, 6617.7, 6617.7, 6617.7, 6617.7, 6617.7, 6617.7,
      ],
      'O-3': [
        5534.1, 6273.9, 6770.4, 7382.7, 7737, 8125.5, 8375.7, 8788.2, 9004.2, 9004.2, 9004.2,
        9004.2, 9004.2, 9004.2, 9004.2, 9004.2, 9004.2, 9004.2, 9004.2, 9004.2, 9004.2, 9004.2,
      ],
      'O-4': [
        6294.6, 7286.4, 7773.6, 7881, 8332.2, 8816.4, 9420, 9888.3, 10214.4, 10401.6, 10509.9,
        10509.9, 10509.9, 10509.9, 10509.9, 10509.9, 10509.9, 10509.9, 10509.9, 10509.9, 10509.9, 10509.9,
      ],
      'O-5': [
        7295.4, 8218.2, 8787, 8894.1, 9249.6, 9461.4, 9928.5, 10271.7, 10715.1, 11391.3, 11713.8,
        12032.7, 12394.8, 12394.8, 12394.8, 12394.8, 12394.8, 12394.8, 12394.8, 12394.8, 12394.8, 12394.8,
      ],
      'O-6': [
        8751.3, 9613.8, 10245, 10245, 10284.3, 10725, 10783.5, 10783.5, 11396.4, 12479.7, 13115.4,
        13751.1, 14112.9, 14479.2, 15188.7, 15188.7, 15408.3, 15408.3, 15408.3, 15408.3, 15408.3, 15408.3,
      ],
      'O-7': [
        11540.1, 12076.2, 12324.3, 12522, 12878.7, 13231.8, 13639.2, 14045.7, 14454.3, 15735.3, 16817.7,
        16817.7, 16817.7, 16817.7, 16904.4, 16904.4, 17242.2, 17242.2, 17242.2, 17242.2, 17242.2, 17242.2,
      ],
      'O-8': [
        13888.5, 14343.9, 14645.4, 14729.4, 15106.5, 15735.3, 15882, 16479.6, 16651.8, 17166.6, 17911.8,
        18598.2, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9,
      ],
      'O-9': [
        null, null, null, null, null, null, null, null, null, null, null,
        18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9,
      ],
      'O-10': [
        null, null, null, null, null, null, null, null, null, null, null,
        18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9, 18999.9,
      ],
    },
  },
};

export function clampYearsOfService(years: number) {
  if (Number.isNaN(years)) {
    return 0;
  }

  return Math.max(0, Math.min(40, Math.round(years)));
}

export function getPayBracketIndex(yearsOfService: number) {
  const years = clampYearsOfService(yearsOfService);
  const firstBracket = PAY_BRACKETS_2026[0];

  if (firstBracket.maxInclusive !== undefined && years <= firstBracket.maxInclusive) {
    return 0;
  }

  let selectedIndex = 0;

  for (let index = 1; index < PAY_BRACKETS_2026.length; index += 1) {
    const bracket = PAY_BRACKETS_2026[index];
    // The UI treats an exact year value as belonging to that labeled bracket:
    // 4 years -> "Over 4", 18 years -> "Over 18", etc.
    if (bracket.minExclusive !== undefined && years >= bracket.minExclusive) {
      selectedIndex = index;
    }
  }

  return selectedIndex;
}

export function getPayRate(selection: PaySelection) {
  const categoryTable = PAY_TABLES_2026[selection.category];
  const bracketIndex = getPayBracketIndex(selection.yearsOfService);
  const monthlyBasicPay = categoryTable.payByRank[selection.rank]?.[bracketIndex] ?? null;

  return {
    bracket: PAY_BRACKETS_2026[bracketIndex],
    bracketIndex,
    monthlyBasicPay,
  };
}

export function getNextAvailableBracket(selection: PaySelection) {
  const categoryTable = PAY_TABLES_2026[selection.category];
  const rankValues = categoryTable.payByRank[selection.rank] ?? [];
  const currentIndex = getPayBracketIndex(selection.yearsOfService);

  for (let index = currentIndex + 1; index < rankValues.length; index += 1) {
    if (rankValues[index] !== null) {
      return PAY_BRACKETS_2026[index];
    }
  }

  return null;
}

export function parseStoredDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatStoredDate(value: string | null | undefined) {
  const date = parseStoredDate(value);

  if (!date) {
    return null;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function toStoredDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getYearsOfServiceFromAfadbd(afadbd: string, asOf = new Date()) {
  const startDate = parseStoredDate(afadbd);

  if (!startDate) {
    return null;
  }

  const today = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate(), 12, 0, 0, 0);
  let years = today.getFullYear() - startDate.getFullYear();

  if (
    today.getMonth() < startDate.getMonth() ||
    (today.getMonth() === startDate.getMonth() && today.getDate() < startDate.getDate())
  ) {
    years -= 1;
  }

  return clampYearsOfService(Math.max(0, years));
}

export function getEffectiveYearsOfService(yearsOfService: number, afadbd?: string | null) {
  const derivedYears = afadbd ? getYearsOfServiceFromAfadbd(afadbd) : null;
  return derivedYears ?? clampYearsOfService(yearsOfService);
}

export function getNextPayIncrease(selection: PaySelection, afadbd?: string | null) {
  const effectiveYears = getEffectiveYearsOfService(selection.yearsOfService, afadbd);
  const categoryTable = PAY_TABLES_2026[selection.category];
  const rankValues = categoryTable.payByRank[selection.rank] ?? [];
  const currentIndex = getPayBracketIndex(effectiveYears);
  const currentPay = rankValues[currentIndex] ?? null;

  if (currentPay === null) {
    return null;
  }

  for (let index = currentIndex + 1; index < rankValues.length; index += 1) {
    const nextPay = rankValues[index];
    const thresholdYears = PAY_BRACKETS_2026[index].minExclusive;

    if (nextPay === null || thresholdYears === undefined || nextPay <= currentPay) {
      continue;
    }

    const startDate = parseStoredDate(afadbd);
    const effectiveDate = startDate
      ? new Date(startDate.getFullYear() + thresholdYears, startDate.getMonth(), startDate.getDate(), 12, 0, 0, 0)
      : null;

    let daysUntil = null;

    if (effectiveDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
      daysUntil = Math.max(0, Math.ceil((effectiveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      bracket: PAY_BRACKETS_2026[index],
      monthlyIncrease: Number((nextPay - currentPay).toFixed(2)),
      currentMonthlyPay: currentPay,
      nextMonthlyPay: nextPay,
      effectiveDate,
      daysUntil,
    };
  }

  return null;
}
