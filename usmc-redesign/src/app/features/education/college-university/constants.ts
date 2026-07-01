export const TA_CAP_PER_CREDIT = 250;
export const CREDITS_PER_YEAR = 30;

export const POPULAR_SCHOOL_NAMES = [
  'University of Maryland Global Campus',
  'American Military University',
  'Embry-Riddle Aeronautical University-Worldwide',
  'Western Governors University',
  'Southern New Hampshire University',
  'Troy University',
  'Liberty University',
];

export const SCHOOL_BADGE_CONFIG: Record<string, { bg: string; fg: string; abbr: string }> = {
  'university of maryland global campus': { bg: '#c8102e', fg: '#ffffff', abbr: 'UMGC' },
  'american military university': { bg: '#162a4b', fg: '#f0a500', abbr: 'AMU' },
  'embry-riddle aeronautical university': { bg: '#003087', fg: '#c8a415', abbr: 'ERAU' },
  'western governors university': { bg: '#1c3557', fg: '#e63946', abbr: 'WGU' },
  'southern new hampshire university': { bg: '#1e3a5f', fg: '#f0a500', abbr: 'SNHU' },
  'troy university': { bg: '#7b0d28', fg: '#ffffff', abbr: 'TROY' },
  'arizona state university': { bg: '#8c1d40', fg: '#ffc627', abbr: 'ASU' },
  'liberty university': { bg: '#002868', fg: '#bf0a30', abbr: 'LU' },
};

export const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DC', name: 'D.C.' },
  { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

// Maps to College Scorecard `latest.academics.program.bachelors.[value]`
export const FIELD_OF_STUDY_OPTIONS = [
  { label: 'Business & Management', value: 'business_marketing' },
  { label: 'Computer Science & IT', value: 'computer' },
  { label: 'Criminal Justice', value: 'security_law_enforcement' },
  { label: 'Education', value: 'education' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Health & Nursing', value: 'health' },
  { label: 'Communications & Media', value: 'communication' },
  { label: 'Psychology', value: 'psychology' },
  { label: 'Visual Arts & Design', value: 'visual_performing' },
  { label: 'Social Sciences', value: 'social_science' },
  { label: 'Biology & Life Sciences', value: 'biological' },
  { label: 'Mathematics & Statistics', value: 'mathematics' },
  { label: 'Liberal Arts', value: 'liberal_arts' },
  { label: 'History', value: 'history' },
  { label: 'Legal Studies', value: 'legal' },
  { label: 'Aviation & Transportation', value: 'transportation' },
  { label: 'Public Administration', value: 'public_administration_social_service' },
  { label: 'Physical Sciences', value: 'physical_science' },
] as const;

export const EDUCATION_TABS = [
  'OVERVIEW', 'TA EDUCATION', 'DEGREE PLANNER', 'COLLEGE & UNIVERSITY',
  'CERTIFICATIONS', 'SKILLS & CAREER', 'RESOURCES',
] as const;

export const INACTIVE_EDUCATION_TABS = new Set(['CERTIFICATIONS', 'SKILLS & CAREER', 'RESOURCES']);
