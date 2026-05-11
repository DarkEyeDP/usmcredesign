// Skill taxonomy derived from NAVMC 1200.1L MOS summaries.
// Each tag represents a discrete skill domain that can transfer between MOSs.

export type SkillTag =
  | 'small_arms'
  | 'crew_served_weapons'
  | 'land_nav'
  | 'infantry_tactics'
  | 'leadership'
  | 'recon_surveillance'
  | 'communications'
  | 'vehicles_wheeled'
  | 'vehicles_armored'
  | 'vehicles_amphibious'
  | 'aviation_maint'
  | 'aviation_ops'
  | 'fire_support'
  | 'electronics_repair'
  | 'intelligence_analysis'
  | 'cyber_info_ops'
  | 'logistics_supply'
  | 'admin_hr'
  | 'engineering'
  | 'cbrn'
  | 'law_enforcement'
  | 'demolitions'
  | 'parachute_airborne'
  | 'combat_diving'
  | 'special_ops'
  | 'weather_met'
  | 'uas_drone'
  | 'data_systems_it'
  | 'finance_accounting'
  | 'legal'
  | 'media_pa'
  | 'food_service'
  | 'ordnance_ammo'
  | 'vehicle_maintenance'
  | 'weapons_repair'
  | 'utilities'
  | 'planning_staff'
  | 'air_defense'
  | 'medical';

export const SKILL_LABELS: Record<SkillTag, string> = {
  small_arms:            'Small Arms',
  crew_served_weapons:   'Crew-Served Weapons',
  land_nav:              'Land Navigation',
  infantry_tactics:      'Infantry Tactics',
  leadership:            'Small Unit Leadership',
  recon_surveillance:    'Recon & Surveillance',
  communications:        'Radio / Comms',
  vehicles_wheeled:      'Wheeled Vehicles',
  vehicles_armored:      'Armored Vehicles',
  vehicles_amphibious:   'Amphibious Vehicles',
  aviation_maint:        'Aircraft Maintenance',
  aviation_ops:          'Aviation Operations',
  fire_support:          'Fire Support / Fires',
  electronics_repair:    'Electronics Maintenance',
  intelligence_analysis: 'Intelligence Analysis',
  cyber_info_ops:        'Cyber / Info Ops',
  logistics_supply:      'Logistics & Supply',
  admin_hr:              'Admin / Personnel',
  engineering:           'Combat Engineering',
  cbrn:                  'CBRN Defense',
  law_enforcement:       'Law Enforcement',
  demolitions:           'Demolitions / EOD',
  parachute_airborne:    'Airborne / Parachute',
  combat_diving:         'Combatant Diving',
  special_ops:           'Special Operations',
  weather_met:           'Weather / METOC',
  uas_drone:             'UAS / Drone Systems',
  data_systems_it:       'Data Systems / IT',
  finance_accounting:    'Finance & Accounting',
  legal:                 'Legal Services',
  media_pa:              'Media / Public Affairs',
  food_service:          'Food Service',
  ordnance_ammo:         'Ordnance & Ammunition',
  vehicle_maintenance:   'Vehicle Maintenance',
  weapons_repair:        'Weapons Repair',
  utilities:             'Utilities Systems',
  planning_staff:        'Operational Planning',
  air_defense:           'Air Defense',
  medical:               'Medical / Trauma Care',
};

// Skill tags per MOS — sourced from NAVMC 1200.1L enlisted MOS summaries.
// Tags represent skills a Marine develops IN that MOS, not just prerequisites.
export const MOS_SKILLS: Record<string, SkillTag[]> = {
  // ── ADMIN / INTEL ──────────────────────────────────────────────────────────
  '0111': ['admin_hr', 'data_systems_it'],
  '0161': ['admin_hr', 'logistics_supply'],
  '0211': ['intelligence_analysis', 'recon_surveillance', 'planning_staff'],
  '0231': ['intelligence_analysis', 'planning_staff', 'data_systems_it'],
  '0241': ['intelligence_analysis', 'recon_surveillance', 'data_systems_it'],
  '0261': ['intelligence_analysis', 'planning_staff', 'data_systems_it'],

  // ── INFANTRY / RECON ───────────────────────────────────────────────────────
  '0311': ['small_arms', 'infantry_tactics', 'land_nav', 'leadership', 'medical'],
  '0313': ['small_arms', 'infantry_tactics', 'land_nav', 'vehicles_armored', 'recon_surveillance', 'leadership', 'medical'],
  '0321': ['small_arms', 'infantry_tactics', 'land_nav', 'recon_surveillance', 'communications', 'parachute_airborne', 'combat_diving', 'leadership', 'special_ops', 'medical'],
  '0331': ['crew_served_weapons', 'small_arms', 'infantry_tactics', 'land_nav', 'leadership', 'medical'],
  '0341': ['crew_served_weapons', 'infantry_tactics', 'land_nav', 'fire_support', 'leadership', 'medical'],
  '0352': ['crew_served_weapons', 'infantry_tactics', 'land_nav', 'vehicles_wheeled', 'leadership', 'medical'],
  '0372': ['small_arms', 'infantry_tactics', 'land_nav', 'recon_surveillance', 'special_ops', 'parachute_airborne', 'combat_diving', 'leadership', 'medical'],

  // ── LOGISTICS / MAINTENANCE MGMT ──────────────────────────────────────────
  '0411': ['logistics_supply', 'vehicle_maintenance', 'admin_hr', 'planning_staff'],
  '0441': ['logistics_supply', 'planning_staff'],
  '0451': ['logistics_supply', 'parachute_airborne'],
  '0471': ['admin_hr', 'logistics_supply'],
  '0511': ['planning_staff', 'logistics_supply', 'admin_hr'],

  // ── COMMUNICATIONS ─────────────────────────────────────────────────────────
  '0621': ['communications', 'electronics_repair'],
  '0627': ['communications', 'electronics_repair'],
  '0631': ['communications', 'data_systems_it'],
  '0671': ['data_systems_it', 'communications'],
  '0681': ['data_systems_it', 'communications'],

  // ── FIELD ARTILLERY ────────────────────────────────────────────────────────
  '0811': ['crew_served_weapons', 'fire_support', 'infantry_tactics'],
  '0842': ['electronics_repair', 'fire_support', 'communications'],
  '0844': ['fire_support', 'electronics_repair'],
  '0847': ['fire_support', 'weather_met', 'electronics_repair'],
  '0861': ['fire_support', 'communications', 'planning_staff', 'infantry_tactics'],

  // ── UTILITIES / ENGINEER ───────────────────────────────────────────────────
  '1141': ['utilities', 'electronics_repair'],
  '1164': ['utilities', 'electronics_repair'],
  '1171': ['utilities'],
  '1316': ['vehicle_maintenance', 'engineering'],
  '1341': ['vehicle_maintenance'],
  '1345': ['vehicles_wheeled', 'engineering'],
  '1361': ['engineering', 'planning_staff'],
  '1371': ['engineering', 'demolitions', 'ordnance_ammo', 'cbrn', 'infantry_tactics', 'medical'],
  '1391': ['logistics_supply', 'utilities'],

  // ── CYBER / INFO OPS ───────────────────────────────────────────────────────
  '1721': ['cyber_info_ops', 'data_systems_it'],
  '1732': ['cyber_info_ops', 'planning_staff', 'intelligence_analysis'],
  '1751': ['cyber_info_ops', 'planning_staff'],

  // ── AMPHIBIOUS VEHICLES ────────────────────────────────────────────────────
  '1833': ['vehicles_amphibious', 'crew_served_weapons', 'communications', 'infantry_tactics', 'medical'],
  '1834': ['vehicles_amphibious', 'crew_served_weapons', 'communications', 'infantry_tactics', 'medical'],

  // ── ORDNANCE / WEAPONS REPAIR ──────────────────────────────────────────────
  '2111': ['weapons_repair', 'small_arms'],
  '2131': ['weapons_repair', 'crew_served_weapons'],
  '2141': ['vehicle_maintenance', 'vehicles_amphibious'],
  '2143': ['vehicle_maintenance', 'vehicles_amphibious'],
  '2147': ['vehicle_maintenance', 'vehicles_armored'],
  '2161': ['vehicle_maintenance', 'weapons_repair'],
  '2171': ['weapons_repair', 'electronics_repair'],
  '2311': ['ordnance_ammo', 'logistics_supply'],
  '2336': ['demolitions', 'ordnance_ammo', 'engineering', 'special_ops'],

  // ── SIGINT / EW / CRYPTOLOGY ───────────────────────────────────────────────
  '2621': ['intelligence_analysis', 'communications', 'cyber_info_ops'],
  '2631': ['intelligence_analysis', 'electronics_repair', 'cyber_info_ops'],
  '2641': ['intelligence_analysis', 'communications'],
  '2651': ['intelligence_analysis', 'data_systems_it', 'recon_surveillance'],
  '2831': ['electronics_repair', 'communications'],
  '2841': ['electronics_repair', 'communications'],
  '2847': ['electronics_repair', 'data_systems_it'],
  '2871': ['electronics_repair'],
  '2887': ['electronics_repair', 'fire_support'],

  // ── SUPPLY / FINANCE / DISTRIBUTION ───────────────────────────────────────
  '3043': ['logistics_supply'],
  '3044': ['logistics_supply', 'planning_staff'],
  '3051': ['logistics_supply'],
  '3152': ['logistics_supply', 'vehicles_wheeled'],
  '3381': ['food_service'],
  '3432': ['finance_accounting'],
  '3451': ['finance_accounting', 'planning_staff'],
  '3521': ['vehicle_maintenance'],
  '3531': ['vehicles_wheeled', 'logistics_supply'],

  // ── COMMUNITY / LEGAL / MEDIA ──────────────────────────────────────────────
  '4133': ['admin_hr', 'logistics_supply'],
  '4421': ['legal', 'admin_hr'],
  '4512': ['media_pa'],
  '4541': ['media_pa', 'recon_surveillance'],
  '4571': ['media_pa'],
  '4821': ['admin_hr', 'leadership', 'planning_staff'],

  // ── CBRN / LAW ENFORCEMENT ─────────────────────────────────────────────────
  '5711': ['cbrn', 'planning_staff'],
  '5811': ['law_enforcement', 'vehicles_wheeled', 'medical'],
  '5821': ['law_enforcement', 'intelligence_analysis'],
  '5831': ['law_enforcement'],

  // ── AVIATION ELECTRONICS / ATC ─────────────────────────────────────────────
  '5939': ['electronics_repair', 'aviation_ops', 'communications'],
  '5948': ['electronics_repair', 'aviation_ops'],
  '5951': ['electronics_repair', 'weather_met'],
  '5952': ['electronics_repair', 'aviation_ops'],
  '5953': ['electronics_repair', 'aviation_ops'],
  '5954': ['electronics_repair', 'aviation_ops', 'communications'],
  '5955': ['electronics_repair', 'uas_drone'],
  '5974': ['electronics_repair', 'data_systems_it', 'aviation_ops'],
  '5979': ['electronics_repair', 'air_defense'],

  // ── AVIATION SUPPORT / MAINTENANCE ────────────────────────────────────────
  '6042': ['logistics_supply', 'aviation_maint'],
  '6046': ['admin_hr', 'aviation_maint', 'data_systems_it'],
  '6048': ['aviation_maint', 'parachute_airborne'],
  '6062': ['aviation_maint'],
  '6073': ['aviation_maint', 'electronics_repair'],
  '6074': ['aviation_maint', 'utilities'],
  '6092': ['aviation_maint'],

  // ── HELICOPTER ─────────────────────────────────────────────────────────────
  '6113': ['aviation_maint'],
  '6114': ['aviation_maint'],
  '6116': ['aviation_maint'],
  '6123': ['aviation_maint'],
  '6124': ['aviation_maint'],
  '6132': ['aviation_maint'],
  '6153': ['aviation_maint'],
  '6154': ['aviation_maint'],
  '6156': ['aviation_maint'],
  '6173': ['aviation_maint', 'aviation_ops', 'communications'],
  '6174': ['aviation_maint', 'aviation_ops', 'communications'],
  '6176': ['aviation_maint', 'aviation_ops', 'communications'],

  // ── FIXED-WING ─────────────────────────────────────────────────────────────
  '6212': ['aviation_maint'],
  '6214': ['aviation_maint', 'uas_drone'],
  '6216': ['aviation_maint'],
  '6217': ['aviation_maint'],
  '6218': ['aviation_maint'],
  '6222': ['aviation_maint'],
  '6223': ['aviation_maint'],
  '6227': ['aviation_maint'],
  '6252': ['aviation_maint'],
  '6256': ['aviation_maint'],
  '6257': ['aviation_maint'],
  '6258': ['aviation_maint'],
  '6276': ['aviation_maint', 'aviation_ops', 'logistics_supply'],
  '6282': ['aviation_maint'],
  '6286': ['aviation_maint'],
  '6287': ['aviation_maint'],
  '6288': ['aviation_maint'],

  // ── AVIONICS ───────────────────────────────────────────────────────────────
  '6314': ['aviation_maint', 'electronics_repair', 'uas_drone'],
  '6316': ['aviation_maint', 'electronics_repair', 'communications'],
  '6317': ['aviation_maint', 'electronics_repair', 'communications'],
  '6323': ['aviation_maint', 'electronics_repair'],
  '6324': ['aviation_maint', 'electronics_repair'],
  '6326': ['aviation_maint', 'electronics_repair'],
  '6332': ['aviation_maint', 'electronics_repair'],
  '6336': ['aviation_maint', 'electronics_repair'],
  '6337': ['aviation_maint', 'electronics_repair'],
  '6338': ['aviation_maint', 'electronics_repair'],
  '6423': ['aviation_maint', 'electronics_repair'],
  '6432': ['aviation_maint', 'electronics_repair'],
  '6469': ['aviation_maint', 'electronics_repair'],
  '6483': ['aviation_maint', 'electronics_repair', 'communications'],
  '6492': ['aviation_maint', 'electronics_repair'],
  '6499': ['aviation_maint'],

  // ── AVIATION ORDNANCE / SUPPLY ─────────────────────────────────────────────
  '6531': ['ordnance_ammo', 'aviation_maint'],
  '6541': ['ordnance_ammo', 'aviation_maint'],
  '6672': ['logistics_supply', 'aviation_maint'],
  '6694': ['data_systems_it', 'aviation_maint'],

  // ── WEATHER / AIRFIELD / ATC OPS ──────────────────────────────────────────
  '6842': ['weather_met', 'planning_staff', 'data_systems_it'],
  '7011': ['engineering', 'aviation_ops'],
  '7041': ['aviation_ops', 'admin_hr'],
  '7051': ['aviation_ops'],
  '7212': ['air_defense', 'crew_served_weapons'],
  '7236': ['air_defense', 'communications', 'aviation_ops'],
  '7240': ['aviation_ops', 'communications', 'fire_support'],
  '7242': ['aviation_ops', 'communications', 'fire_support'],
  '7257': ['aviation_ops', 'communications'],

  // ── UAS ────────────────────────────────────────────────────────────────────
  '7314': ['uas_drone', 'intelligence_analysis', 'recon_surveillance'],
  '7316': ['uas_drone', 'recon_surveillance'],

  // ── SENIOR ENLISTED ────────────────────────────────────────────────────────
  '8999': ['leadership', 'planning_staff', 'admin_hr'],

  // ════════════════════════════════════════════════════════════════════════════
  // BACKGROUND / ADDITIONAL MOSs
  // These are NOT lat move targets — they appear here so that Marines who hold
  // them as PMOS or AMOS get proper skill-transfer matching against target MOSs.
  //
  // PostgreSQL migration note: when moving to a database, add an
  // `is_lat_move_target` boolean column to the MOS table. Entries below map to
  // is_lat_move_target = false. Everything above maps to true.
  // ════════════════════════════════════════════════════════════════════════════

  // ── 09XX — TRAINING & INSTRUCTION ─────────────────────────────────────────
  // Drill Instructors, Marksmanship Instructors, and related training billets.
  '0911': ['small_arms', 'infantry_tactics', 'leadership', 'communications'],
  '0913': ['small_arms', 'crew_served_weapons', 'land_nav', 'infantry_tactics', 'leadership', 'communications'],
  '0916': ['infantry_tactics', 'leadership'],
  '0931': ['small_arms', 'leadership'],
  '0933': ['small_arms', 'leadership'],

  // ── SENIOR INFANTRY DESIGNATORS ───────────────────────────────────────────
  // GySgt–MGySgt progression MOSs within the infantry and LAR fields.
  '0363': ['vehicles_armored', 'infantry_tactics', 'recon_surveillance', 'land_nav', 'communications', 'leadership', 'planning_staff'],
  '0365': ['small_arms', 'crew_served_weapons', 'infantry_tactics', 'land_nav', 'recon_surveillance', 'communications', 'leadership'],
  '0369': ['small_arms', 'crew_served_weapons', 'infantry_tactics', 'land_nav', 'recon_surveillance', 'communications', 'leadership', 'planning_staff'],
  '0393': ['vehicles_armored', 'infantry_tactics', 'recon_surveillance', 'land_nav', 'communications', 'leadership', 'planning_staff', 'data_systems_it'],
  '0399': ['small_arms', 'crew_served_weapons', 'infantry_tactics', 'land_nav', 'recon_surveillance', 'communications', 'leadership', 'planning_staff'],

  // ── SENIOR LOGISTICS ──────────────────────────────────────────────────────
  '0491': ['logistics_supply', 'planning_staff', 'communications', 'vehicles_amphibious', 'data_systems_it'],

  // ── SENIOR COMMUNICATIONS ─────────────────────────────────────────────────
  '0629': ['communications', 'electronics_repair', 'leadership', 'planning_staff'],
  '0639': ['communications', 'data_systems_it', 'leadership', 'planning_staff'],
  '0679': ['data_systems_it', 'communications', 'cyber_info_ops', 'leadership', 'planning_staff'],
  '0699': ['communications', 'data_systems_it', 'electronics_repair', 'cyber_info_ops', 'leadership', 'planning_staff'],

  // ── SENIOR FIELD ARTILLERY ────────────────────────────────────────────────
  '0848': ['fire_support', 'electronics_repair', 'weather_met', 'communications', 'leadership', 'planning_staff'],
  '0869': ['fire_support', 'crew_served_weapons', 'communications', 'leadership', 'planning_staff', 'land_nav'],
  '0871': ['fire_support', 'crew_served_weapons', 'communications', 'leadership', 'planning_staff', 'air_defense'],

  // ── TRAINING / SURVIVAL ADDITIONAL ────────────────────────────────────────
  '0918': ['medical', 'leadership', 'planning_staff'],
  '1169': ['utilities', 'electronics_repair', 'leadership', 'planning_staff'],
  '1349': ['engineering', 'vehicle_maintenance', 'leadership', 'planning_staff'],
  '1869': ['vehicles_armored', 'infantry_tactics', 'leadership', 'planning_staff'],

  // ── SENIOR ORDNANCE / WEAPONS ─────────────────────────────────────────────
  '2181': ['weapons_repair', 'ordnance_ammo', 'vehicle_maintenance', 'small_arms', 'crew_served_weapons', 'leadership', 'planning_staff'],

  // ── SIGINT / EW SENIOR ────────────────────────────────────────────────────
  '2629': ['intelligence_analysis', 'communications', 'cyber_info_ops', 'leadership', 'planning_staff'],
  '2691': ['intelligence_analysis', 'communications', 'cyber_info_ops', 'leadership', 'planning_staff'],

  // ── SENIOR SUPPLY ─────────────────────────────────────────────────────────
  '3047': ['logistics_supply', 'finance_accounting', 'data_systems_it', 'planning_staff', 'admin_hr'],

  // ── CBRN SENIOR ───────────────────────────────────────────────────────────
  '5769': ['cbrn', 'planning_staff', 'communications', 'leadership'],

  // ── MP / LAW ENFORCEMENT ADDITIONAL ──────────────────────────────────────
  '5812': ['law_enforcement', 'recon_surveillance', 'communications'],
  '5813': ['law_enforcement', 'vehicles_wheeled', 'communications', 'data_systems_it'],
  '5819': ['law_enforcement', 'intelligence_analysis', 'communications'],

  // ── SECURITY FORCES / GUARD ───────────────────────────────────────────────
  '8152': ['small_arms', 'infantry_tactics', 'land_nav', 'law_enforcement', 'communications', 'leadership'],
  '8154': ['small_arms', 'infantry_tactics', 'special_ops', 'law_enforcement', 'communications', 'leadership'],
  '8156': ['small_arms', 'law_enforcement', 'communications', 'leadership'],

  // ── RECRUITING ────────────────────────────────────────────────────────────
  '8411': ['admin_hr', 'communications', 'planning_staff', 'leadership'],
  '8412': ['admin_hr', 'communications', 'planning_staff', 'leadership'],
  '8421': ['admin_hr', 'communications', 'planning_staff', 'leadership'],
  '8422': ['admin_hr', 'communications', 'planning_staff', 'leadership'],
};

export interface SkillMatch {
  pct: number;
  shared: SkillTag[];
}

/**
 * Computes how much of a target MOS's skill domains are covered by the user's full profile.
 * mosIds: PMOS + AMOS entries — their skill tags are unioned together.
 * extraSkills: additional tags contributed by certifications.
 * Returns null if no MOS IDs resolve in the map AND no extraSkills provided, or target has no skills.
 * Percentage = shared skills / target skills — "how much of what this job needs do you already have."
 */
export function getSkillMatch(mosIds: string[], targetMosId: string, extraSkills: SkillTag[] = []): SkillMatch | null {
  const targetSkills = MOS_SKILLS[targetMosId];
  if (!targetSkills || targetSkills.length === 0) return null;

  const knownIds = mosIds.filter(id => id.trim() && MOS_SKILLS[id.trim()]);
  if (knownIds.length === 0 && extraSkills.length === 0) return null;

  const userSkillSet = new Set<SkillTag>([
    ...knownIds.flatMap(id => MOS_SKILLS[id.trim()]),
    ...extraSkills,
  ]);

  const shared = targetSkills.filter(s => userSkillSet.has(s));
  const pct = Math.round((shared.length / targetSkills.length) * 100);

  return { pct, shared };
}
