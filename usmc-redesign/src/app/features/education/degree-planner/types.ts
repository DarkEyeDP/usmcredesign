// ── Types ───────────────────────────────────────────────────────────────────────
export type DegreeLevel = '' | 'associates' | 'bachelors' | 'masters';
export type Season = 'Spring' | 'Summer' | 'Fall';
export type FundingSource = 'ta' | 'gi-bill' | 'fafsa' | 'scholarship' | 'oop';
export type CourseStatus = 'planned' | 'in-progress' | 'complete';
export type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'F' | 'W' | 'IP';

export interface Course {
  id: string;
  name: string;
  credits: number;
  costPerCredit: number;
  funding: FundingSource;
  grade: LetterGrade | '';
  status: CourseStatus;
}

export interface Term {
  id: string;
  season: Season;
  year: number;
  courses: Course[];
}

export interface SchoolDetails {
  ownership: number;
  distanceOnly: boolean;
  tuitionInState: number | null;
  tuitionOutOfState: number | null;
  city: string;
  state: string;
}

export interface SavedState {
  degreeLevel: DegreeLevel;
  school: string;
  schoolDetails: SchoolDetails | null;
  fieldOfStudy: string;
  customCredits: number | null;
  jstCredits: number;
  transferCredits: number;
  clepCredits: number;
  terms: Term[];
  expandedTermIds: string[];
}

export type SchoolSuggestion = SchoolDetails & { name: string; city: string; state: string };
