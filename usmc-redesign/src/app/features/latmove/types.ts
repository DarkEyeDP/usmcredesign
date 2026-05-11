import type { ClearanceLevel, MOS, UserScores } from './db/schema';
import type { SkillMatch } from './db/mos-skills';
import type { LateralMoveBonusRange } from '../srbpCalculator';

export type { UserScores };
export type { ClearanceLevel };
export type { SkillMatch };

export type QualificationCheckStatus = 'met' | 'unmet' | 'unknown';

export interface QualificationCheck {
  text: string;
  status: QualificationCheckStatus;
}

/** A qualifying MOS with computed match score and formatted requirement string. */
export interface ResultItem extends MOS {
  match: number;
  reqStr: string;
  qualificationChecks: QualificationCheck[];
  skillMatch?: SkillMatch;
  matchingCertIds?: string[];
  matchingDegreeFieldIds?: string[];
  lateralMoveBonusRange?: LateralMoveBonusRange;
  isHighDemandLatMove?: boolean;
}

export type SortMode = 'match' | 'skill' | 'bonus' | 'field' | 'mos' | 'title';
export type ResultViewMode = 'list' | 'cards';

export type RequirementFilterTag =
  | 'citizenship'
  | 'drivers_license'
  | 'water_survival'
  | 'pft_cft'
  | 'legal_conduct'
  | 'medical_mental'
  | 'height'
  | 'polygraph'
  | 'education';

export interface ResultFilters {
  searchQuery: string;
  excludedMos: string;
  excludedFields: string[];
  excludedClearances: ClearanceLevel[];
  hideColorVisionRequired: boolean;
  excludedRequirementTags: RequirementFilterTag[];
  onlyLmBonusEligible: boolean;
}

export const EMPTY_RESULT_FILTERS: ResultFilters = {
  searchQuery: '',
  excludedMos: '',
  excludedFields: [],
  excludedClearances: [],
  hideColorVisionRequired: false,
  excludedRequirementTags: [],
  onlyLmBonusEligible: false,
};

export const REQUIREMENT_FILTER_OPTIONS: { value: RequirementFilterTag; label: string; keywords: string[] }[] = [
  { value: 'citizenship', label: 'U.S. Citizen', keywords: ['u.s. citizen', 'us citizen', 'dual citizen'] },
  { value: 'drivers_license', label: 'Driver License', keywords: ['driver', 'drivers license', "driver's license"] },
  { value: 'water_survival', label: 'Water Survival', keywords: ['water survival', 'ws-b', 'ws-i'] },
  { value: 'pft_cft', label: 'PFT / CFT', keywords: ['pft', 'cft'] },
  { value: 'legal_conduct', label: 'Legal / Conduct', keywords: ['conviction', 'court', 'njp', 'derogatory', 'unfavorable conduct', 'moral turpitude'] },
  { value: 'medical_mental', label: 'Medical / Mental', keywords: ['medical', 'mental', 'psychiatric', 'emotional disorder', 'vision correctable', 'hearing loss'] },
  { value: 'height', label: 'Height', keywords: ['height', 'inches'] },
  { value: 'polygraph', label: 'Polygraph', keywords: ['polygraph'] },
  { value: 'education', label: 'Education / DLAB', keywords: ['high school', 'ged', 'algebra', 'dlab', 'degree'] },
];

export const CLEARANCE_LABELS: Record<ClearanceLevel, string> = {
  none: 'None required',
  confidential: 'Confidential',
  secret: 'Secret',
  top_secret: 'Top Secret',
  ts_sci: 'TS/SCI',
};

export function colorVisionLabel(required: boolean): string {
  return required ? 'Normal color vision/perception' : 'No color vision requirement';
}

export function clearanceRequirementAbbreviation(mos: Pick<MOS, 'clearance' | 'qualifications'>): string {
  const text = mos.qualifications.join(' ').toLowerCase();

  if (mos.clearance === 'none') return 'N/A';
  if (mos.clearance === 'confidential') return 'C';
  if (mos.clearance === 'ts_sci') return text.includes('eligible') ? 'TSCI E' : 'TSCI';
  if (mos.clearance === 'top_secret') return text.includes('eligible') ? 'TS E' : 'TS';
  if (text.includes('interim secret')) return 'I S';
  if (text.includes('secret clearance eligible') || text.includes('secret security eligible')) return 'S E';

  return 'S';
}

export function colorVisionAbbreviation(required: boolean): string {
  return required ? 'NORMAL' : 'N/A';
}

export const RANK_OPTIONS = [
  { label: 'Private (E-1)',                  value: 'E-1' },
  { label: 'Private First Class (E-2)',      value: 'E-2' },
  { label: 'Lance Corporal (E-3)',           value: 'E-3' },
  { label: 'Corporal (E-4)',                 value: 'E-4' },
  { label: 'Sergeant (E-5)',                 value: 'E-5' },
  { label: 'Staff Sergeant (E-6)',           value: 'E-6' },
  { label: 'Gunnery Sergeant (E-7)',         value: 'E-7' },
  { label: 'Master Sergeant / 1stSgt (E-8)', value: 'E-8' },
] as const;

export const YEARS_OPTIONS = ['2', '4', '6', '8', '10', '12+'] as const;

export const CLEARANCE_OPTIONS = [
  { label: 'None',           value: 'none' },
  { label: 'Secret',         value: 'secret' },
  { label: 'Top Secret',     value: 'top_secret' },
  { label: 'TS/SCI',         value: 'ts_sci' },
  { label: 'TS/SCI w/ Poly', value: 'ts_sci_poly' },
] as const;

export const EDUCATION_OPTIONS = [
  { label: 'None / In Progress',          value: 'none' },
  { label: 'High School / GED',           value: 'hs_ged' },
  { label: 'Some College',                value: 'some_college' },
  { label: "Associate's Degree",          value: 'associates' },
  { label: "Bachelor's Degree",           value: 'bachelors' },
  { label: "Master's Degree",             value: 'masters' },
  { label: 'Doctorate',                   value: 'doctorate' },
  { label: 'Professional Degree (JD/MD)', value: 'professional' },
] as const;

export const EDUCATION_HAS_DEGREE = new Set([
  'associates', 'bachelors', 'masters', 'doctorate', 'professional',
]);

export interface LanguageEntry {
  language: string;
  listening: string;
  reading: string;
}

export const DLPT_LEVELS = ['0', '0+', '1', '1+', '2', '2+', '3', '3+', '4'] as const;

export const DLPT_LANGUAGE_OPTIONS = [
  'Albanian',
  'Amharic',
  'Arabic (Algerian)',
  'Arabic (Egyptian)',
  'Arabic (Gulf/Iraqi)',
  'Arabic (Levantine)',
  'Arabic (Modern Standard)',
  'Arabic (Moroccan)',
  'Arabic (Sudanese)',
  'Armenian',
  'Azerbaijani',
  'Balochi',
  'Bambara',
  'Bengali',
  'Bosnian',
  'Bulgarian',
  'Burmese',
  'Cantonese',
  'Cebuano',
  'Chechen',
  'Croatian',
  'Dari',
  'Dutch',
  'English',
  'French',
  'German',
  'Greek',
  'Haitian Creole',
  'Hausa',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Igbo',
  'Indonesian',
  'Italian',
  'Japanese',
  'Javanese',
  'Kazakh',
  'Khmer',
  'Korean',
  'Kurdish (Kurmanji)',
  'Kurdish (Sorani)',
  'Lao',
  'Malay',
  'Malayalam',
  'Mandarin Chinese',
  'Marathi',
  'Nepali',
  'Pashto',
  'Persian Farsi',
  'Polish',
  'Portuguese',
  'Punjabi',
  'Romanian',
  'Russian',
  'Serbian',
  'Shanghainese',
  'Sindhi',
  'Sinhalese',
  'Somali',
  'Spanish',
  'Swahili',
  'Tagalog',
  'Tamil',
  'Telugu',
  'Thai',
  'Tigrinya',
  'Turkish',
  'Turkmen',
  'Ukrainian',
  'Urdu',
  'Uyghur',
  'Uzbek',
  'Vietnamese',
  'Wolof',
  'Yoruba',
  'Zulu',
] as const;
