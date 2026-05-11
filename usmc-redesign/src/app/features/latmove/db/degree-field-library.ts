import type { SkillTag } from './mos-skills';

export type DegreeFieldCategory =
  | 'STEM / Cyber'
  | 'Engineering / Trades'
  | 'Business / Logistics'
  | 'Intel / Public Service'
  | 'Medical / Health'
  | 'Design / Creative'
  | 'Communications / Humanities';

export interface DegreeFieldEntry {
  id: string;
  label: string;
  category: DegreeFieldCategory;
  skills: SkillTag[];
  searchTerms?: string[];
}

export const DEGREE_FIELD_LIBRARY: DegreeFieldEntry[] = [
  { id: 'computer_science', label: 'Computer Science', category: 'STEM / Cyber', skills: ['data_systems_it', 'cyber_info_ops'], searchTerms: ['software', 'programming', 'coding'] },
  { id: 'cyber_security', label: 'Cybersecurity', category: 'STEM / Cyber', skills: ['cyber_info_ops', 'data_systems_it'], searchTerms: ['information assurance', 'cyber'] },
  { id: 'information_systems', label: 'Information Systems', category: 'STEM / Cyber', skills: ['data_systems_it', 'communications', 'planning_staff'], searchTerms: ['mis', 'management information systems'] },
  { id: 'network_admin', label: 'Network Administration', category: 'STEM / Cyber', skills: ['communications', 'data_systems_it'], searchTerms: ['networking', 'telecommunications'] },
  { id: 'data_analytics', label: 'Data Analytics', category: 'STEM / Cyber', skills: ['data_systems_it', 'intelligence_analysis', 'planning_staff'], searchTerms: ['analytics', 'statistics', 'business intelligence'] },
  { id: 'mathematics', label: 'Mathematics', category: 'STEM / Cyber', skills: ['data_systems_it', 'fire_support', 'planning_staff'], searchTerms: ['math', 'applied math'] },
  { id: 'electrical_engineering', label: 'Electrical Engineering', category: 'Engineering / Trades', skills: ['electronics_repair', 'communications', 'engineering'], searchTerms: ['electronics engineering'] },
  { id: 'mechanical_engineering', label: 'Mechanical Engineering', category: 'Engineering / Trades', skills: ['vehicle_maintenance', 'engineering', 'aviation_maint'], searchTerms: ['mechanical systems'] },
  { id: 'civil_engineering', label: 'Civil Engineering', category: 'Engineering / Trades', skills: ['engineering', 'planning_staff'], searchTerms: ['construction engineering'] },
  { id: 'aerospace_engineering', label: 'Aerospace Engineering', category: 'Engineering / Trades', skills: ['aviation_maint', 'aviation_ops', 'engineering'], searchTerms: ['aeronautical engineering', 'aviation engineering'] },
  { id: 'construction_management', label: 'Construction Management', category: 'Engineering / Trades', skills: ['engineering', 'planning_staff', 'logistics_supply'], searchTerms: ['construction', 'project controls'] },
  { id: 'automotive_technology', label: 'Automotive Technology', category: 'Engineering / Trades', skills: ['vehicle_maintenance', 'vehicles_wheeled'], searchTerms: ['automotive', 'auto tech', 'diesel'] },
  { id: 'diesel_technology', label: 'Diesel Technology', category: 'Engineering / Trades', skills: ['vehicle_maintenance', 'vehicles_wheeled', 'engineering'], searchTerms: ['diesel mechanics', 'heavy equipment'] },
  { id: 'business_admin', label: 'Business Administration', category: 'Business / Logistics', skills: ['planning_staff', 'admin_hr', 'logistics_supply'], searchTerms: ['business management', 'management'] },
  { id: 'supply_chain', label: 'Supply Chain / Logistics', category: 'Business / Logistics', skills: ['logistics_supply', 'planning_staff'], searchTerms: ['supply chain', 'logistics management', 'distribution'] },
  { id: 'finance_accounting', label: 'Finance / Accounting', category: 'Business / Logistics', skills: ['finance_accounting', 'admin_hr', 'planning_staff'], searchTerms: ['accounting', 'finance'] },
  { id: 'human_resources', label: 'Human Resources', category: 'Business / Logistics', skills: ['admin_hr', 'planning_staff'], searchTerms: ['personnel management', 'hr'] },
  { id: 'project_management', label: 'Project Management', category: 'Business / Logistics', skills: ['planning_staff', 'admin_hr', 'logistics_supply'], searchTerms: ['program management'] },
  { id: 'criminal_justice', label: 'Criminal Justice', category: 'Intel / Public Service', skills: ['law_enforcement', 'intelligence_analysis'], searchTerms: ['criminology', 'law enforcement'] },
  { id: 'homeland_security', label: 'Homeland Security', category: 'Intel / Public Service', skills: ['law_enforcement', 'intelligence_analysis', 'planning_staff'], searchTerms: ['security studies', 'protective services'] },
  { id: 'intelligence_studies', label: 'Intelligence Studies', category: 'Intel / Public Service', skills: ['intelligence_analysis', 'recon_surveillance', 'planning_staff'], searchTerms: ['intel studies', 'security intelligence'] },
  { id: 'international_relations', label: 'International Relations', category: 'Intel / Public Service', skills: ['intelligence_analysis', 'planning_staff', 'communications'], searchTerms: ['foreign affairs', 'global studies'] },
  { id: 'nursing', label: 'Nursing', category: 'Medical / Health', skills: ['medical'], searchTerms: ['rn', 'bsn'] },
  { id: 'public_health', label: 'Public Health', category: 'Medical / Health', skills: ['medical', 'planning_staff'], searchTerms: ['community health', 'health science'] },
  { id: 'emergency_management', label: 'Emergency Management', category: 'Medical / Health', skills: ['medical', 'planning_staff', 'cbrn'], searchTerms: ['disaster management', 'em management'] },
  { id: 'paramedicine', label: 'Paramedicine / EMS', category: 'Medical / Health', skills: ['medical'], searchTerms: ['ems', 'emt', 'paramedic'] },
  { id: 'graphic_design', label: 'Graphic Design', category: 'Design / Creative', skills: ['media_pa', 'communications'], searchTerms: ['visual design', 'graphic arts', 'design'] },
  { id: 'ui_ux_design', label: 'UI / UX Design', category: 'Design / Creative', skills: ['media_pa', 'communications', 'data_systems_it'], searchTerms: ['user experience', 'user interface', 'product design', 'ux', 'ui'] },
  { id: 'digital_media_design', label: 'Digital Media Design', category: 'Design / Creative', skills: ['media_pa', 'communications', 'data_systems_it'], searchTerms: ['digital design', 'multimedia design', 'interactive media'] },
  { id: 'industrial_design', label: 'Industrial Design', category: 'Design / Creative', skills: ['engineering', 'planning_staff'], searchTerms: ['product design', 'manufacturing design'] },
  { id: 'instructional_design', label: 'Instructional Design', category: 'Design / Creative', skills: ['communications', 'planning_staff', 'admin_hr'], searchTerms: ['learning design', 'training design', 'curriculum design'] },
  { id: 'animation_motion', label: 'Animation / Motion Design', category: 'Design / Creative', skills: ['media_pa', 'communications'], searchTerms: ['motion graphics', 'animation', '3d design'] },
  { id: 'communications_media', label: 'Communications / Media Studies', category: 'Communications / Humanities', skills: ['media_pa', 'communications'], searchTerms: ['mass communication', 'public affairs', 'journalism'] },
  { id: 'foreign_language', label: 'Foreign Language / Linguistics', category: 'Communications / Humanities', skills: ['communications', 'intelligence_analysis'], searchTerms: ['linguistics', 'language studies'] },
  { id: 'political_science', label: 'Political Science', category: 'Communications / Humanities', skills: ['planning_staff', 'communications', 'intelligence_analysis'], searchTerms: ['government', 'public policy'] },
];

export const DEGREE_FIELD_BY_ID: Record<string, DegreeFieldEntry> = Object.fromEntries(
  DEGREE_FIELD_LIBRARY.map(entry => [entry.id, entry])
);

export const DEGREE_FIELD_CATEGORIES: DegreeFieldCategory[] = [
  'STEM / Cyber',
  'Engineering / Trades',
  'Business / Logistics',
  'Intel / Public Service',
  'Medical / Health',
  'Design / Creative',
  'Communications / Humanities',
];
