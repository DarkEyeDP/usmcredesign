import type { DegreeLevel, Season, FundingSource, CourseStatus, LetterGrade } from './types';

// ── Constants ───────────────────────────────────────────────────────────────────
export const DEGREE_CREDITS: Record<Exclude<DegreeLevel, ''>, number> = {
  associates: 60,
  bachelors: 120,
  masters: 36,
};

export const SEASONS: Season[] = ['Spring', 'Summer', 'Fall'];

export const FIELDS_OF_STUDY = [
  // Business & Management
  'Business Administration',
  'Entrepreneurship & Small Business',
  'Finance & Accounting',
  'Human Resources Management',
  'Marketing & Digital Media',
  'Operations Management',
  'Project Management',
  'Supply Chain & Logistics',

  // Technology & Engineering
  'Aerospace & Aviation Technology',
  'Computer Science',
  'Construction Management',
  'Cybersecurity & Information Technology',
  'Data Science & Analytics',
  'Electrical & Electronics Engineering',
  'Engineering Technology',
  'Environmental Science & Technology',
  'Mechanical Engineering',
  'Network Administration',
  'Nuclear Technology',
  'Software Development',

  // Public Safety & Government
  'Criminal Justice',
  'Emergency Management & Homeland Security',
  'Fire Science & Administration',
  'Intelligence Studies',
  'International Relations',
  'Law Enforcement & Corrections',
  'Paralegal & Legal Studies',
  'Political Science & Government',
  'Public Administration',
  'Public Policy',

  // Health & Science
  'Biology & Life Sciences',
  'Chemistry',
  'Health Science',
  'Healthcare Administration',
  'Kinesiology & Exercise Science',
  'Mathematics',
  'Nursing',
  'Nutrition & Dietetics',
  'Occupational Health & Safety',
  'Pre-Medicine',
  'Psychology & Behavioral Science',
  'Social Work',
  'Statistics & Applied Mathematics',

  // Education & Social Sciences
  'Communications & Journalism',
  'Counseling',
  'Education & Training',
  'English & Professional Writing',
  'History',
  'Interdisciplinary Studies',
  'Philosophy & Ethics',
  'Sociology & Anthropology',

  // Skilled Trades & Applied
  'Architecture',
  'Culinary Arts & Hospitality',
  'Graphic Design & Visual Communication',
  'Recreation & Sports Management',
  'Welding & Industrial Technology',
].sort();

export const TA_PER_CREDIT_MAX = 250;
export const TA_ANNUAL_MAX = 4500;

export const FUNDING_CYCLE: FundingSource[] = ['ta', 'gi-bill', 'fafsa', 'scholarship', 'oop'];
export const FUNDING_META: Record<FundingSource, { label: string; full: string }> = {
  ta:          { label: 'TA',      full: 'Tuition Assistance' },
  'gi-bill':   { label: 'GI BILL', full: 'GI Bill®' },
  fafsa:       { label: 'FAFSA',   full: 'FAFSA' },
  scholarship: { label: 'SCH',     full: 'Scholarship' },
  oop:         { label: 'OOP',     full: 'Out of Pocket' },
};

export const COURSE_STATUS_CYCLE: CourseStatus[] = ['planned', 'in-progress', 'complete'];
export const COURSE_STATUS_META: Record<CourseStatus, string> = {
  planned:      'PLANNED',
  'in-progress':'IN PROGRESS',
  complete:     'COMPLETE',
};

export const GRADE_CYCLE: (LetterGrade | '')[] = ['', 'A', 'B', 'C', 'D', 'F', 'W', 'IP'];
export const GRADE_POINTS: Partial<Record<LetterGrade, number>> = {
  A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0,
};

// ── Shared grid overlay style ───────────────────────────────────────────────────
export const gridStyle = {
  backgroundImage: 'linear-gradient(var(--usmc-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--usmc-grid-color) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
} as const;
