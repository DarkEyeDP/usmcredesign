import { RAW_MOS } from './mos-data';

// Central MOS title registry.
// Primary lat-move targets come from mos-data.ts, while additional/background
// MOSs that support skill-transfer matching can be added here as needed.
const EXTRA_MOS_TITLES: Record<string, string> = {
  '0363': 'Light Armored Reconnaissance Unit Leader',
  '0365': 'Infantry Squad Leader',
  '0369': 'Infantry Unit Leader',
  '0393': 'Light Armored Reconnaissance Operations Chief',
  '0399': 'Operations Chief',
  '0491': 'Logistics/Mobility Chief',
  '0629': 'Transmissions Chief',
  '0639': 'Network Chief',
  '0679': 'Data Systems Chief',
  '0699': 'Communications Chief',
  '0848': 'Field Artillery Operations Chief',
  '0869': 'Artillery Unit Leader',
  '0871': 'Joint Fires and Effects Integrator',
  '0911': 'Drill Instructor',
  '0913': 'Marine Combat Instructor',
  '0918': 'Water Safety/Survival Instructor',
  '0916': 'Martial Arts Instructor',
  '0931': 'Marksmanship Instructor',
  '0933': 'Marksmanship Coach',
  '1169': 'Utilities Chief',
  '1349': 'Engineer Equipment Chief',
  '1869': 'Senior Armor SNCO',
  '2181': 'Ground Ordnance Weapons Chief',
  '2629': 'Signals Intelligence/Electromagnetic Warfare Technician',
  '2691': 'Signals Intelligence/Electromagnetic Warfare Chief',
  '3047': 'Supply Chain Manager',
  '5769': 'Chemical, Biological, Radiological and Nuclear (CBRN) Defense Chief',
  '5812': 'Military Working Dog Handler',
  '5813': 'Traffic Management and Collision Investigator (TMCI)',
  '5819': 'Military Police Investigator (MPI)',
  '8152': 'Marine Corps Security Force (MCSF) Guard',
  '8154': 'Marine Corps Security Force (MCSF) Close Quarters Battle (CQB) Team Member',
  '8156': 'Marine Security Guard (MSG)',
  '8411': 'Recruiter',
  '8412': 'Career Recruiter',
  '8421': 'Production Recruiter',
  '8422': 'Career Prior Service Recruiter',
};

export const MOS_TITLES: Record<string, string> = {
  ...Object.fromEntries(RAW_MOS.map(mos => [mos.id, mos.title])),
  ...EXTRA_MOS_TITLES,
};

export function getMOSTitleById(id: string): string | undefined {
  return MOS_TITLES[id.trim()];
}
