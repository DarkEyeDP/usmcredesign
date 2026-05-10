import type { SkillTag } from './mos-skills';

export type CertCategory =
  | 'Medical'
  | 'Operations'
  | 'IT / Cyber'
  | 'Transportation'
  | 'Engineering & Hazmat'
  | 'Leadership & Management';

export interface CertEntry {
  id: string;
  label: string;
  category: CertCategory;
  skills: SkillTag[];
}

export const CERT_LIBRARY: CertEntry[] = [
  // ── Medical ────────────────────────────────────────────────────────────────
  { id: 'tccc',        label: 'TCCC (Tactical Combat Casualty Care)', category: 'Medical', skills: ['medical'] },
  { id: 'cls',         label: 'Combat Lifesaver (CLS)',               category: 'Medical', skills: ['medical'] },
  { id: 'emtb',        label: 'EMT-Basic (EMT-B)',                    category: 'Medical', skills: ['medical'] },
  { id: 'aemt',        label: 'Advanced EMT (AEMT)',                  category: 'Medical', skills: ['medical'] },
  { id: 'paramedic',   label: 'Paramedic',                            category: 'Medical', skills: ['medical'] },
  { id: 'bls',         label: 'CPR / BLS Certification',              category: 'Medical', skills: ['medical'] },

  // ── Operations ─────────────────────────────────────────────────────────────
  { id: 'jtac',              label: 'JTAC / Joint Terminal Attack Controller', category: 'Operations', skills: ['fire_support', 'aviation_ops', 'communications'] },
  { id: 'air_assault',       label: 'Air Assault',                             category: 'Operations', skills: ['aviation_ops', 'infantry_tactics'] },
  { id: 'airborne',          label: 'Airborne (Static Line Parachutist)',       category: 'Operations', skills: ['parachute_airborne', 'infantry_tactics'] },
  { id: 'mff',               label: 'Military Freefall / HALO-HAHO',           category: 'Operations', skills: ['parachute_airborne', 'special_ops'] },
  { id: 'combatant_diver',   label: 'Combatant Diver',                         category: 'Operations', skills: ['combat_diving', 'special_ops'] },
  { id: 'sere_c',            label: 'SERE Level C',                            category: 'Operations', skills: ['special_ops', 'recon_surveillance'] },
  { id: 'mountain_warfare',  label: 'Mountain Warfare (MWTC)',                 category: 'Operations', skills: ['land_nav', 'infantry_tactics'] },
  { id: 'rappel_master',     label: 'Rappel Master',                           category: 'Operations', skills: ['infantry_tactics'] },
  { id: 'scout_sniper',      label: 'Scout Sniper',                            category: 'Operations', skills: ['small_arms', 'recon_surveillance', 'land_nav'] },
  { id: 'breacher',          label: 'Breacher (Urban / Explosive)',            category: 'Operations', skills: ['demolitions', 'engineering', 'infantry_tactics'] },
  { id: 'combatives_l3',     label: 'Combatives Level 3 / Instructor',         category: 'Operations', skills: ['infantry_tactics'] },
  { id: 'fao_part107',       label: 'FAA Part 107 (sUAS Remote Pilot)',        category: 'Operations', skills: ['uas_drone'] },
  { id: 'fires_observer',    label: 'Fires Observer / FO Certified',           category: 'Operations', skills: ['fire_support', 'communications'] },
  { id: 'cbrn_defense',      label: 'CBRN Defense Specialist Cert',            category: 'Operations', skills: ['cbrn'] },

  // ── IT / Cyber ─────────────────────────────────────────────────────────────
  { id: 'comptia_aplus',       label: 'CompTIA A+',                      category: 'IT / Cyber', skills: ['data_systems_it'] },
  { id: 'comptia_network',     label: 'CompTIA Network+',                category: 'IT / Cyber', skills: ['data_systems_it', 'communications'] },
  { id: 'comptia_security',    label: 'CompTIA Security+',               category: 'IT / Cyber', skills: ['data_systems_it', 'cyber_info_ops'] },
  { id: 'comptia_cysa',        label: 'CompTIA CySA+',                   category: 'IT / Cyber', skills: ['cyber_info_ops', 'data_systems_it'] },
  { id: 'comptia_pentest',     label: 'CompTIA PenTest+',                category: 'IT / Cyber', skills: ['cyber_info_ops'] },
  { id: 'ceh',                 label: 'Certified Ethical Hacker (CEH)',  category: 'IT / Cyber', skills: ['cyber_info_ops'] },
  { id: 'cissp',               label: 'CISSP',                           category: 'IT / Cyber', skills: ['cyber_info_ops', 'data_systems_it'] },
  { id: 'ccna',                label: 'Cisco CCNA',                      category: 'IT / Cyber', skills: ['communications', 'data_systems_it'] },
  { id: 'aws_cloud',           label: 'AWS Cloud Practitioner',          category: 'IT / Cyber', skills: ['data_systems_it'] },
  { id: 'azure_fundamentals',  label: 'Microsoft Azure Fundamentals',    category: 'IT / Cyber', skills: ['data_systems_it'] },
  { id: 'linux_plus',          label: 'CompTIA Linux+',                  category: 'IT / Cyber', skills: ['data_systems_it'] },

  // ── Transportation ─────────────────────────────────────────────────────────
  { id: 'cdl_a',     label: 'CDL Class A',      category: 'Transportation', skills: ['vehicles_wheeled'] },
  { id: 'cdl_b',     label: 'CDL Class B',      category: 'Transportation', skills: ['vehicles_wheeled'] },
  { id: 'forklift',  label: 'Forklift Operator', category: 'Transportation', skills: ['logistics_supply'] },
  { id: 'crane',     label: 'Crane Operator',    category: 'Transportation', skills: ['engineering', 'logistics_supply'] },
  { id: 'hazmat_trans', label: 'HazMat Transportation (DOT)', category: 'Transportation', skills: ['cbrn', 'logistics_supply'] },

  // ── Engineering & Hazmat ───────────────────────────────────────────────────
  { id: 'osha_10',          label: 'OSHA 10-Hour',                   category: 'Engineering & Hazmat', skills: ['engineering'] },
  { id: 'osha_30',          label: 'OSHA 30-Hour',                   category: 'Engineering & Hazmat', skills: ['engineering', 'planning_staff'] },
  { id: 'hazmat_tech',      label: 'HazMat Technician (NFPA 472)',   category: 'Engineering & Hazmat', skills: ['cbrn'] },
  { id: 'aws_welding',      label: 'AWS Welding Certification',       category: 'Engineering & Hazmat', skills: ['vehicle_maintenance', 'engineering'] },
  { id: 'electrician_lic',  label: 'Licensed Electrician',           category: 'Engineering & Hazmat', skills: ['utilities'] },
  { id: 'eod_basic',        label: 'EOD Basic (Joint School)',        category: 'Engineering & Hazmat', skills: ['demolitions', 'ordnance_ammo', 'engineering'] },

  // ── Leadership & Management ────────────────────────────────────────────────
  { id: 'pmp',                  label: 'PMP (Project Management Professional)', category: 'Leadership & Management', skills: ['planning_staff', 'admin_hr'] },
  { id: 'lss_green',            label: 'Lean Six Sigma Green Belt',             category: 'Leadership & Management', skills: ['planning_staff'] },
  { id: 'lss_black',            label: 'Lean Six Sigma Black Belt',             category: 'Leadership & Management', skills: ['planning_staff'] },
  { id: 'dau_acq1',             label: 'DAU Acquisition — Level I',             category: 'Leadership & Management', skills: ['logistics_supply', 'planning_staff'] },
  { id: 'dau_acq2',             label: 'DAU Acquisition — Level II',            category: 'Leadership & Management', skills: ['logistics_supply', 'planning_staff'] },
  { id: 'dau_log',              label: 'DAU Logistics — Foundational',          category: 'Leadership & Management', skills: ['logistics_supply'] },
  { id: 'shrm_cp',              label: 'SHRM-CP (HR Professional)',             category: 'Leadership & Management', skills: ['admin_hr'] },
  { id: 'notary',               label: 'Notary Public',                         category: 'Leadership & Management', skills: ['legal', 'admin_hr'] },
];

// Lookup by id
export const CERT_BY_ID: Record<string, CertEntry> = Object.fromEntries(
  CERT_LIBRARY.map(c => [c.id, c])
);

// Grouped by category for display
export const CERT_BY_CATEGORY: Record<CertCategory, CertEntry[]> = CERT_LIBRARY.reduce(
  (acc, cert) => {
    if (!acc[cert.category]) acc[cert.category] = [];
    acc[cert.category].push(cert);
    return acc;
  },
  {} as Record<CertCategory, CertEntry[]>
);

export const CERT_CATEGORIES: CertCategory[] = [
  'Medical',
  'Operations',
  'IT / Cyber',
  'Transportation',
  'Engineering & Hazmat',
  'Leadership & Management',
];
