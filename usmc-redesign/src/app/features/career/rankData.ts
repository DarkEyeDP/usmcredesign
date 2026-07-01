export interface RankDef {
  payGrade: string;
  abbr: string;
  full: string;
}

export const USMC_RANKS: RankDef[] = [
  // Enlisted
  { payGrade: 'E-1',  abbr: 'Pvt',      full: 'Private' },
  { payGrade: 'E-2',  abbr: 'PFC',       full: 'Private First Class' },
  { payGrade: 'E-3',  abbr: 'LCpl',      full: 'Lance Corporal' },
  { payGrade: 'E-4',  abbr: 'Cpl',       full: 'Corporal' },
  { payGrade: 'E-5',  abbr: 'Sgt',       full: 'Sergeant' },
  { payGrade: 'E-6',  abbr: 'SSgt',      full: 'Staff Sergeant' },
  { payGrade: 'E-7',  abbr: 'GySgt',     full: 'Gunnery Sergeant' },
  { payGrade: 'E-8',  abbr: 'MSgt',      full: 'Master Sergeant' },
  { payGrade: 'E-8',  abbr: '1stSgt',    full: 'First Sergeant' },
  { payGrade: 'E-9',  abbr: 'MGySgt',    full: 'Master Gunnery Sergeant' },
  { payGrade: 'E-9',  abbr: 'SgtMaj',    full: 'Sergeant Major' },
  { payGrade: 'E-9',  abbr: 'SgtMajMC',  full: 'Sergeant Major of the Marine Corps' },
  // Warrant
  { payGrade: 'W-1',  abbr: 'WO1',       full: 'Warrant Officer 1' },
  { payGrade: 'W-2',  abbr: 'CWO2',      full: 'Chief Warrant Officer 2' },
  { payGrade: 'W-3',  abbr: 'CWO3',      full: 'Chief Warrant Officer 3' },
  { payGrade: 'W-4',  abbr: 'CWO4',      full: 'Chief Warrant Officer 4' },
  { payGrade: 'W-5',  abbr: 'CWO5',      full: 'Chief Warrant Officer 5' },
  // Officer
  { payGrade: 'O-1',  abbr: '2ndLt',     full: 'Second Lieutenant' },
  { payGrade: 'O-2',  abbr: '1stLt',     full: 'First Lieutenant' },
  { payGrade: 'O-3',  abbr: 'Capt',      full: 'Captain' },
  { payGrade: 'O-4',  abbr: 'Maj',       full: 'Major' },
  { payGrade: 'O-5',  abbr: 'LtCol',     full: 'Lieutenant Colonel' },
  { payGrade: 'O-6',  abbr: 'Col',       full: 'Colonel' },
  { payGrade: 'O-7',  abbr: 'BGen',      full: 'Brigadier General' },
  { payGrade: 'O-8',  abbr: 'MajGen',    full: 'Major General' },
  { payGrade: 'O-9',  abbr: 'LtGen',     full: 'Lieutenant General' },
  { payGrade: 'O-10', abbr: 'Gen',       full: 'General' },
];

// ─── Pay grade ordering for filtering ────────────────────────────────────────
const GRADE_ORDER: Record<string, number> = {};
let idx = 0;
for (const r of USMC_RANKS) {
  if (!(r.payGrade in GRADE_ORDER)) GRADE_ORDER[r.payGrade] = idx++;
}

export function isHigherGrade(candidate: string, current: string): boolean {
  return (GRADE_ORDER[candidate] ?? 999) > (GRADE_ORDER[current] ?? 0);
}
