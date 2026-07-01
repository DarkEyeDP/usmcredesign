export interface SchoolResult {
  id?: number;
  name: string;
  city: string;
  state: string;
  ownership: number;
  distanceOnly: boolean;
  tuitionInState: number | null;
  tuitionOutOfState: number | null;
}

export interface SchoolProgram {
  title: string;
  credentialLevel: number;
  credentialLabel: string;
}

export interface SchoolProgramsResult {
  programs: SchoolProgram[];
  source: 'cip4' | 'flags';
}

export type SortOption = 'best-match' | 'tuition-asc' | 'tuition-desc' | 'name-az';
export type TuitionMode = 'in-state' | 'out-of-state';

export interface SearchParams {
  q?: string;
  state?: string;
  ownership?: string;
  distanceOnly?: boolean;
  fieldOfStudy?: string;
  page?: number;
}
