import type { RequirementGroup } from './schema';

// ── Rank shorthand arrays ────────────────────────────────────────────────────
// Future DB: these become rows in mos_rank_eligibility.
const r18 = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8'];
const r17 = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7'];
const r16 = ['E-1','E-2','E-3','E-4','E-5','E-6'];
const r15 = ['E-1','E-2','E-3','E-4','E-5'];
const r14 = ['E-1','E-2','E-3','E-4'];

// ── Field name constants ─────────────────────────────────────────────────────
// Future DB: mos_fields lookup table.
const ADMIN   = 'Admin / Intelligence';
const INF     = 'Infantry / Recon';
const LOG     = 'Logistics / Maintenance';
const COMMS   = 'Communications';
const ARTY    = 'Field Artillery';
const UTIL    = 'Utilities / Engineer';
const CYBER   = 'Cyber / Information Ops';
const AMPH    = 'Amphibious Vehicles';
const ORD     = 'Ordnance / Weapons Repair';
const SIGINT  = 'SIGINT / EW / Cryptology';
const SUPPLY  = 'Supply / Finance / Distribution';
const MOTOR   = 'Motor Transport / Maintenance';
const COMM    = 'Community / Legal / Media';
const CBRN    = 'CBRN / Law Enforcement';
const AVNE    = 'Aviation Electronics / ATC';
const AVNS    = 'Aviation Support / Maintenance';
const HELO    = 'Aviation - Helicopter';
const FW      = 'Aviation - Fixed Wing';
const AVION   = 'Aviation - Avionics';
const AVNO    = 'Aviation Ordnance / Supply';
const WX      = 'Weather / Airfield / ATC';
const UAS     = 'UAS';
const SRENL   = 'Senior Enlisted';

// ── Raw entry shape (internal to this file) ──────────────────────────────────
// `quals` is a raw comma-separated string; queries.ts parses it to string[].
// TO ADD A NEW MOS: append an entry below following this shape.
//
// requirements logic:
//   Each object is an AND group (all listed scores must be met).
//   Multiple objects = OR (user only needs to satisfy ONE group).
//   Omit a key (or use {}) if no score is required.
//
// rank_eligibility: use the r14–r18 shorthands or a custom string array.
//   Values must match exactly: 'E-1' … 'E-8'.
export interface RawEntry {
  id: string;
  title: string;
  field: string;
  requirements: RequirementGroup[];
  rank_eligibility: string[];
  quals: string;
}

export const RAW_MOS: RawEntry[] = [
  // ── ADMIN / INTEL ──────────────────────────────────────────────────────────
  { id:'0111', title:'Administrative Specialist',                              field:ADMIN,  requirements:[{cl:95}],               rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible' },
  { id:'0161', title:'Postal Clerk',                                           field:ADMIN,  requirements:[{cl:95}],               rank_eligibility:r18, quals:'U.S. citizen, favorable ENTNAC and NAC on file, must have no record of derogatory information or unfavorable conduct that casts doubt on the Marines trustworthiness and honesty, no history of psychiatric disorder, alcoholism, or drug abuse unless a medical evaluation determines the conditions no longer exist, no convictions by court martial, UCMJ punishment for postal related offenses within the last 3 years or civilian convictions other than minor traffic violations' },
  { id:'0211', title:'Counterintelligence/Human Intelligence',                 field:ADMIN,  requirements:[{gt:105},{cl:105}],     rank_eligibility:['E-3','E-4','E-5','E-6','E-7'], quals:"U.S. citizen, cannot be a dual citizen, SCI eligible, 21 years of age prior to grad from CI/HUMINT course, valid U.S. drivers license, must submit to counterintelligence scope polygraph examination, must have a DLAB test score in their OMPF, must be a volunteer Corporal, Sergeant, or Staff Sergeant of any MOS. Lance Corporals and Gunnery Sergeants may apply for lateral move if determined exceptionally qualified by the 0211 MOS specialist, 02XX occupational field manager, and/or MOS sponsor" },
  { id:'0231', title:'Intelligence Specialist',                                field:ADMIN,  requirements:[{gt:110},{cl:110}],     rank_eligibility:r14, quals:'U.S. citizen, SCI eligible, must meet with special security officer SSO to determine TS SCI eligibility, must be Cpl (max 12 months TIG) or below of any MOS (Waiverable by MMEA)' },
  { id:'0241', title:'Imagery Analysis Specialist',                            field:ADMIN,  requirements:[{gt:110}],              rank_eligibility:r15, quals:'U.S. citizen, normal color vision and normal stereoscopic acuity, SCI eligibility, must be Cpl (max 12 months TIG) or below of any MOS (Waiverable by MMEA), Sgts may be considered with less than 1 year TIG at time of application' },
  { id:'0261', title:'Geographic Intelligence Specialist',                     field:ADMIN,  requirements:[{gt:110},{cl:110}],     rank_eligibility:r15, quals:'U.S. citizen, SCI eligible, normal color vision and normal stereoscopic acuity' },

  // ── INFANTRY / RECON ───────────────────────────────────────────────────────
  { id:'0311', title:'Rifleman',                                               field:INF,    requirements:[{gt:90},{cl:90}],       rank_eligibility:r15, quals:'WS-B water survival qualified' },
  { id:'0313', title:'Light Armored Reconnaissance Marine',                    field:INF,    requirements:[{gt:90},{cl:90}],       rank_eligibility:r15, quals:'WS-B water survival qualified, normal color vision, normal depth perception and visual acuity of 20/200 (correctable to 20/20), valid U.S. drivers license, must possess the psychological and physiological qualifications required for licensing as an ordnance vehicle operator, must possess a height of 65 to 75 inches' },
  { id:'0321', title:'Reconnaissance Marine',                                  field:INF,    requirements:[{gt:105},{cl:105}],     rank_eligibility:r18, quals:'U.S. citizen, must have minimum interim secret clearance, WS-I water survival qualified, no derogatory pg11 or NJP within last 12 months, no more than 1 NJP on current contract, no courts martial convictions' },
  { id:'0331', title:'Machine Gunner',                                         field:INF,    requirements:[{gt:90},{el:90},{mm:90}], rank_eligibility:r15, quals:'WS-B water survival qualified' },
  { id:'0341', title:'Mortarman',                                              field:INF,    requirements:[{gt:90},{cl:90}],       rank_eligibility:r15, quals:'WS-B water survival qualified' },
  { id:'0352', title:'Antitank Missile Gunner',                                field:INF,    requirements:[{gt:95},{mm:95}],       rank_eligibility:r15, quals:'Normal color vision and vision of 20/200 correctable to 20/20, WS-B water survival qualified, must possess the psychological and physiological qualifications required for licensing as an ordnance vehicle operator' },
  { id:'0372', title:'Marine Raider',                                          field:INF,    requirements:[{gt:105}],              rank_eligibility:['E-3','E-4','E-5'], quals:'U.S. citizen, current first class PFT, contact MARSOC recruiter for additional information and requirements' },

  // ── LOGISTICS / MAINTENANCE MGMT ──────────────────────────────────────────
  { id:'0411', title:'Maintenance Management Specialist',                      field:LOG,    requirements:[{gt:95},{cl:95}],       rank_eligibility:r18, quals:'Favorable NACLC' },
  { id:'0441', title:'Logistics Specialist',                                   field:LOG,    requirements:[{gt:100}],              rank_eligibility:r16, quals:'U.S. citizen, secret clearance eligible' },
  { id:'0451', title:'Airborne and Air Delivery Specialist',                   field:LOG,    requirements:[{gt:100},{el:95},{cl:95}], rank_eligibility:r14, quals:'U.S. citizen, secret clearance eligible, WS-B water survival qualified, must be Cpl or below, Cpls must have no more than six months TIG to be eligible for latmove, Marines within the active reserve program can latmove into 0451 up to the rank of Sgt' },
  { id:'0471', title:'Personnel Retrieval and Processing Specialist',          field:LOG,    requirements:[{}],                    rank_eligibility:r18, quals:'Secret clearance eligible' },
  { id:'0511', title:'MAGTF Planning Specialist',                              field:LOG,    requirements:[{gt:100},{cl:100}],     rank_eligibility:r14, quals:"U.S. citizen, must possess secret clearance and be eligible for TS clearance, must be Cpl (Max of 12 month TIG) or below of any MOS (Waiverable by MMEA)" },

  // ── COMMUNICATIONS ─────────────────────────────────────────────────────────
  { id:'0621', title:'Transmissions System Operator',                          field:COMMS,  requirements:[{el:100},{cl:100}],     rank_eligibility:r15, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'0627', title:'Satellite Transmissions System Operator',                field:COMMS,  requirements:[{el:100},{cl:100}],     rank_eligibility:r15, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'0631', title:'Network Administrator',                                  field:COMMS,  requirements:[{el:105},{cl:105}],     rank_eligibility:r15, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'0671', title:'Data Systems Administrator',                             field:COMMS,  requirements:[{el:100},{cl:100}],     rank_eligibility:r15, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'0681', title:'Information Security Technician',                        field:COMMS,  requirements:[{gt:100}],              rank_eligibility:['E-6','E-7','E-8'], quals:'U.S. citizen, have attained the rank of SSgt and not have been passed for promotion twice in current MOS' },

  // ── FIELD ARTILLERY ────────────────────────────────────────────────────────
  { id:'0811', title:'Field Artillery Cannoneer',                              field:ARTY,   requirements:[{gt:90},{cl:90}],       rank_eligibility:r16, quals:'No additional requirements' },
  { id:'0842', title:'Field Artillery Radar Operator',                         field:ARTY,   requirements:[{gt:105},{cl:105}],     rank_eligibility:r15, quals:'U.S. citizen, secret clearance eligible' },
  { id:'0844', title:'Field Artillery Fire Control Marine',                    field:ARTY,   requirements:[{gt:105},{cl:105}],     rank_eligibility:r15, quals:'U.S. citizen, secret clearance eligible' },
  { id:'0847', title:'Field Artillery Sensor Support Marine',                  field:ARTY,   requirements:[{gt:100},{mm:100}],     rank_eligibility:r15, quals:'U.S. citizen, secret clearance eligible' },
  { id:'0861', title:'Fire Support Marine',                                    field:ARTY,   requirements:[{gt:100},{cl:100}],     rank_eligibility:r15, quals:'U.S. citizen, secret clearance eligible, normal color vision and correctable to 20/20' },

  // ── UTILITIES / ENGINEER ───────────────────────────────────────────────────
  { id:'1141', title:'Electrician',                                            field:UTIL,   requirements:[{el:90}],               rank_eligibility:r16, quals:'Normal color vision' },
  { id:'1164', title:'Utilities Systems Technician',                           field:UTIL,   requirements:[{el:100},{mm:105}],     rank_eligibility:r16, quals:'Normal color vision' },
  { id:'1171', title:'Water Support Technician',                               field:UTIL,   requirements:[{mm:95},{cl:95}],       rank_eligibility:r16, quals:'Normal color vision' },
  { id:'1316', title:'Metal Worker',                                           field:UTIL,   requirements:[{gt:90},{mm:90}],       rank_eligibility:r16, quals:'Pass normal color perception test w/pip (12 out of 14 correct) or Farnsworth lantern (FALANT)' },
  { id:'1341', title:'Engineer Equipment Mechanic',                            field:UTIL,   requirements:[{el:90},{mm:90}],       rank_eligibility:r16, quals:'Normal color vision' },
  { id:'1345', title:'Engineer Equipment Operator',                            field:UTIL,   requirements:[{mm:95}],               rank_eligibility:r16, quals:'Height requirement of 66 inches, normal color perception, vision correctable to 20/20 and normal depth perception' },
  { id:'1361', title:'Engineer Assistant',                                     field:UTIL,   requirements:[{gt:95},{el:95}],       rank_eligibility:r17, quals:'No additional requirements' },
  { id:'1371', title:'Combat Engineer',                                        field:UTIL,   requirements:[{mm:95}],               rank_eligibility:r18, quals:'Pass normal color perception test w/pip (12 out of 14 correct) or Farnsworth lantern (FALANT)' },
  { id:'1391', title:'Expeditionary Fuels Technician',                         field:UTIL,   requirements:[{gt:95},{mm:95}],       rank_eligibility:r18, quals:'Favorable NACLC' },

  // ── CYBER / INFO OPS ───────────────────────────────────────────────────────
  { id:'1721', title:'Cyberspace Warfare Operator',                            field:CYBER,  requirements:[{gt:110},{cl:110}],     rank_eligibility:r17, quals:'U.S. citizen, SCI eligible, must complete NAVMC 11665, be willing to submit to a counterintelligence scope polygraph examination' },
  { id:'1732', title:'Civil Affairs Specialist',                               field:CYBER,  requirements:[{gt:100}],              rank_eligibility:['E-4','E-5','E-6','E-7','E-8'], quals:'Cpl or above, secret clearance eligible' },
  { id:'1751', title:'Influence Specialist',                                   field:CYBER,  requirements:[{gt:100}],              rank_eligibility:['E-4','E-5'], quals:'U.S. citizen, secret clearance eligible, must have 1st class PFT and CFT, volunteer Cpl or Sgt from any MOS, Sgts must not be in zone for promotion' },

  // ── AMPHIBIOUS VEHICLES ────────────────────────────────────────────────────
  { id:'1833', title:'Assault Amphibious Vehicle (AAV) Crewmember',           field:AMPH,   requirements:[{gt:90},{el:90}],       rank_eligibility:r18, quals:'Normal color vision and correctable to 20/20 in both eyes, WS-B water survival qualified, must possess the psychological and physiological qualifications required for licensing as an ordnance vehicle operator' },
  { id:'1834', title:'Amphibious Combat Vehicle (ACV) Crewmember',            field:AMPH,   requirements:[{gt:90},{el:90}],       rank_eligibility:r18, quals:'Normal color vision and correctable to 20/20 in both eyes, must be secret security eligible, WS-B water survival qualified, must possess the psychological and physiological qualifications required for licensing as an ordnance vehicle operator' },

  // ── ORDNANCE / WEAPONS REPAIR ──────────────────────────────────────────────
  { id:'2111', title:'Small Arms Repairer/Technician',                         field:ORD,    requirements:[{mm:100}],              rank_eligibility:r17, quals:'U.S. citizen, must have NACLC, no convictions by court-martial, civilian court or NJP of any act involving larceny, theft, or drugs' },
  { id:'2131', title:'Artillery Systems Technician',                           field:ORD,    requirements:[{mm:95}],               rank_eligibility:r17, quals:'No additional requirements' },
  { id:'2141', title:'AAV ACV Repairer Technician',                            field:ORD,    requirements:[{mm:105}],              rank_eligibility:r17, quals:'WS-B water survival qualified, normal vision to include color, acuity, field of vision and depth perception' },
  { id:'2143', title:'ACV Technician',                                         field:ORD,    requirements:[{mm:105}],              rank_eligibility:r17, quals:'WS-B water survival qualified, normal vision to include color, acuity, field of vision and depth perception, must have normal color vision' },
  { id:'2147', title:'Light Armored Vehicle (LAV) Repairer/Technician',        field:ORD,    requirements:[{mm:105}],              rank_eligibility:r17, quals:'Valid drivers license, must pass audiogram hearing test, normal color vision to include color, acuity, field of vision and depth perception' },
  { id:'2161', title:'Machinist',                                              field:ORD,    requirements:[{mm:105}],              rank_eligibility:r17, quals:'Normal color vision' },
  { id:'2171', title:'Electro-Optical Ordnance Repairer',                      field:ORD,    requirements:[{el:110},{mm:105}],     rank_eligibility:r17, quals:'U.S. citizen, must have NACLC, normal color vision, secret clearance eligible, no convictions by court-martial, civilian court, or NJP of any act involving larceny, theft, or drugs' },
  { id:'2311', title:'Ammunition Technician',                                  field:ORD,    requirements:[{gt:100}],              rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, normal color vision, no convictions by court-martial, civilian courts, or NJP of any type involving larceny, theft, or trafficking of any controlled substances' },
  { id:'2336', title:'Explosive Ordnance Disposal (EOD) Technician',           field:ORD,    requirements:[{gt:110}],              rank_eligibility:['E-4','E-5'], quals:'U.S. citizen, cannot be a dual citizen, must be TS eligible, must have first class PFT and CFT during EOD screening process, must be Sgt or Cpl in any MOS and must not be selected for promotion to SSgt in their current MOS, normal color vision and no claustrophobic tendencies' },

  // ── SIGINT / EW / CRYPTOLOGY ───────────────────────────────────────────────
  { id:'2621', title:'Communications Intelligence/Electromagnetic Warfare Operator', field:SIGINT, requirements:[{gt:100},{cl:100}], rank_eligibility:r15, quals:'U.S. citizen, no hearing defects, must have current single scope background investigation/T5 and adjudicated for SCI eligibility' },
  { id:'2631', title:'Electronic Intelligence/Electronic Warfare Analyst',     field:SIGINT, requirements:[{gt:110},{el:110}],     rank_eligibility:r15, quals:'U.S. citizen, must have current single scope background investigation/T5 and adjudicated for SCI eligibility' },
  { id:'2641', title:'Cryptologic Language Analyst',                           field:SIGINT, requirements:[{gt:105},{cl:110}],     rank_eligibility:r15, quals:'U.S. citizen, no speech or hearing defects, must have current single scope background investigation/T5 and adjudicated for SCI eligibility' },
  { id:'2651', title:'Intelligence Surveillance Reconnaissance (ISR) Systems Engineer', field:SIGINT, requirements:[{gt:100},{el:110},{cl:110}], rank_eligibility:r17, quals:'U.S. citizen, must have current single scope background investigation/T5 and adjudicated for SCI eligibility' },
  { id:'2831', title:'Digital Wideband Systems Maintainer',                    field:SIGINT, requirements:[{el:110}],              rank_eligibility:r15, quals:'U.S. citizen, normal color vision, completed one year of high school algebra or equivalent course at the minimum, secret clearance eligible' },
  { id:'2841', title:'Ground Electronics Transmission Systems Maintainer',     field:SIGINT, requirements:[{el:110}],              rank_eligibility:r15, quals:'U.S. citizen, normal color vision, completed one year of high school algebra or equivalent course at the minimum, secret clearance eligible' },
  { id:'2847', title:'Electro-Mechanical/Information and Communication Technology Maintainer', field:SIGINT, requirements:[{el:110}], rank_eligibility:r15, quals:'U.S. citizen, normal color vision, completed one year of high school algebra or equivalent course at the minimum, secret clearance eligible' },
  { id:'2871', title:'Calibration Technician',                                 field:SIGINT, requirements:[{el:110}],              rank_eligibility:r15, quals:'U.S. citizen, normal color vision, completed one year of high school algebra or equivalent course at the minimum, secret clearance eligible' },
  { id:'2887', title:'Artillery Electronics Technician',                       field:SIGINT, requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, normal color vision, completed one year of high school algebra or equivalent course at the minimum, secret clearance eligible' },

  // ── SUPPLY / FINANCE / DISTRIBUTION ───────────────────────────────────────
  { id:'3043', title:'Supply Chain Specialist',                                field:SUPPLY, requirements:[{cl:95}],               rank_eligibility:r14, quals:'Favorable NACLC, no convictions by court-martial, civilian courts, or NJP of any act involving larceny or theft' },
  { id:'3044', title:'Operational Contract Support Specialist',                field:SUPPLY, requirements:[{gt:105}],              rank_eligibility:['E-4','E-5'], quals:'Must be Tier 1 or 2, must have secret clearance, Corporals from any PMOS must have a minimum of 36-months time in service, Sergeants from any PMOS must have no more than 12 months time-in-grade' },
  { id:'3051', title:'Inventory Management Specialist',                        field:SUPPLY, requirements:[{cl:95}],               rank_eligibility:r14, quals:'Favorable adjudicated NACLC, valid drivers license, no convictions by court-martial, civilian courts, or NJP of any act involving larceny or theft' },
  { id:'3152', title:'Distribution Specialist',                                field:SUPPLY, requirements:[{gt:85}],               rank_eligibility:r18, quals:'Valid drivers license, secret clearance eligible, must possess favorable NACLC, no convictions by court-martial, civilian courts, or NJP of any act involving larceny or theft' },
  { id:'3381', title:'Food Service Specialist',                                field:SUPPLY, requirements:[{gt:90},{cl:100}],       rank_eligibility:r18, quals:'No additional requirements' },
  { id:'3432', title:'Finance Technician',                                     field:SUPPLY, requirements:[{cl:100}],              rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, favorable NACLC that meets IT-II level requirements, must have no record of derogatory information or unfavorable conduct, no convictions by court-martial, civilian courts or NJP for any disbursing related offense within the last three years' },
  { id:'3451', title:'Financial Management Resource Analyst',                  field:SUPPLY, requirements:[{gt:110},{el:110}],     rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, favorable NACLC that meets IT-II level requirements' },
  { id:'3521', title:'Automotive Maintenance Technician',                      field:MOTOR,  requirements:[{el:100},{mm:100}],     rank_eligibility:r15, quals:'Normal vision to include acuity, color, and field of vision' },
  { id:'3531', title:'Motor Vehicle Operator',                                 field:MOTOR,  requirements:[{el:85},{mm:85}],       rank_eligibility:r15, quals:'Must pass audiogram, must possess valid state drivers license, minimum height of 60 inches and maximum height of 75 inches, past driving record reveals no active state drivers license suspensions or revocations, must have normal vision to include color, acuity, field of vision and depth perception' },

  // ── COMMUNITY / LEGAL / MEDIA ──────────────────────────────────────────────
  { id:'4133', title:'Marine Corps Community Services Marine',                 field:COMM,   requirements:[{gt:110}],              rank_eligibility:r18, quals:'Secret clearance eligible' },
  { id:'4421', title:'Legal Services Specialist',                              field:COMM,   requirements:[{gt:105},{cl:110}],     rank_eligibility:r18, quals:'U.S. citizen, high school graduate or have GED, secret clearance eligible, must have received no NJPs or been convicted by courts-martial or civilian court for any offense involving controlled substances, nor convicted by courts-martial or civilian court for any offense involving moral turpitude' },
  { id:'4512', title:'Combat Graphics Specialist',                             field:COMM,   requirements:[{gt:100},{cl:100}],     rank_eligibility:r15, quals:'Must submit a portfolio of the Marines own graphic products to demonstrate an understanding of layout and design principles, submit a typed 300-500-word essay describing why they want to be a Combat Graphics Specialist, pass the English diagnostic test with a score of 80 or higher' },
  { id:'4541', title:'Combat Photographer',                                    field:COMM,   requirements:[{gt:100},{cl:100}],     rank_eligibility:r15, quals:'Must submit a portfolio of the Marines own photographic products to demonstrate an understanding of photography principles such as composition, depth of field, and lighting, submit a typed 300-500-word essay, pass the English diagnostic test with a score of 80 or higher' },
  { id:'4571', title:'Combat Videographer',                                    field:COMM,   requirements:[{gt:100},{cl:100}],     rank_eligibility:r15, quals:'Submit a portfolio of the Marines own video products to demonstrate an understanding of videography principles, composition and color theory, submit a typed 300-500-word essay, pass the English diagnostic test with a score of 80 or higher' },
  { id:'4821', title:'Career Counselor',                                       field:COMM,   requirements:[{gt:100}],              rank_eligibility:['E-5','E-6','E-7','E-8'], quals:'Secret clearance eligible' },

  // ── CBRN / LAW ENFORCEMENT ─────────────────────────────────────────────────
  { id:'5711', title:'CBRN Defense Specialist',                                field:CBRN,   requirements:[{gt:110}],              rank_eligibility:r15, quals:'U.S. citizen, secret clearance eligible' },
  { id:'5811', title:'Military Police',                                        field:CBRN,   requirements:[{gt:95}],               rank_eligibility:r18, quals:'U.S. citizen, possess clarity of speech, vision correctable to 20/20, valid drivers license, secret clearance eligible, normal color vision (not waiverable), must have no history of mental, nervous, or emotional disorders, must have no convictions by special or general courts-martial, or felony convictions or misdemeanor convictions of domestic violence from civil courts, must be 18 years old prior to completion of Military Police school' },
  { id:'5821', title:'Criminal Investigator CID Agent',                        field:CBRN,   requirements:[{gt:110}],              rank_eligibility:['E-5'], quals:'U.S. citizen, Sgt from any MOS with less than 2 years TIG, 21 years of age, normal color vision (not waiverable), minimum height of 59 inches, valid drivers license, vision correctable to 20/20, clarity of speech, must have no history of mental, nervous, or emotional disorders, no convictions by summary special or general courts-martial or civil courts; non-judicial punishment involving illegal drugs, spouse abuse/domestic violence, or immoral character' },
  { id:'5831', title:'Correction and Detention Specialist',                    field:CBRN,   requirements:[{gt:95}],               rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, have no record of civil court conviction that resulted in confinement, must have no history of mental, nervous, or emotional disorders (not waiverable), must have no convictions by special or general courts-martial, or felony convictions or misdemeanor convictions of domestic violence from civil courts, must be able to lift and lower 67 lbs' },

  // ── AVIATION ELECTRONICS / ATC ─────────────────────────────────────────────
  { id:'5939', title:'Aviation Communication Systems Technician',              field:AVNE,   requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, secret clearance eligible, normal color vision' },
  { id:'5948', title:'Aviation RADAR Technician',                              field:AVNE,   requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, secret clearance eligible, normal color vision' },
  { id:'5951', title:'Aviation Meteorological Equipment Technician',           field:AVNE,   requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'5952', title:'Air Traffic Control Navigational Aids Technician',       field:AVNE,   requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'5953', title:'Air Traffic Control RADAR Technician',                   field:AVNE,   requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'5954', title:'Air Traffic Control Communications Technician',          field:AVNE,   requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'5955', title:'Ground Control Station Technician',                      field:AVNE,   requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'5974', title:'Tactical Data Systems Technician',                       field:AVNE,   requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'5979', title:'Tactical Air Operations/Air Defense Systems Technician', field:AVNE,   requirements:[{el:110}],              rank_eligibility:r17, quals:'U.S. citizen, secret clearance eligible, normal color vision' },

  // ── AVIATION SUPPORT / MAINTENANCE ────────────────────────────────────────
  { id:'6042', title:'Aviation Support Equipment Asset Manager',               field:AVNS,   requirements:[{cl:100}],              rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, normal color perception' },
  { id:'6046', title:'Aviation Maintenance Data Specialist',                   field:AVNS,   requirements:[{el:100}],              rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, normal color perception, basic PC operation/word processing with the capability of 15 words per minute' },
  { id:'6048', title:'Flight Equipment Technician',                            field:AVNS,   requirements:[{mm:105}],              rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6062', title:'Aircraft Intermediate Level Hydraulic/Pneumatic Mechanic', field:AVNS, requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6073', title:'Support Equipment Electrician/Refrigeration and Engine/Gas Turbine Technician', field:AVNS, requirements:[{el:105},{mm:105}], rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6074', title:'Cryogenics Equipment Operator',                          field:AVNS,   requirements:[{mm:95}],               rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6092', title:'Aircraft Intermediate Level Structures Mechanic',        field:AVNS,   requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'Normal color perception' },

  // ── HELICOPTER ─────────────────────────────────────────────────────────────
  { id:'6113', title:'CH-53 Helicopter Mechanic',                              field:HELO,   requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6114', title:'UH/AH-1 Helicopter Mechanic',                           field:HELO,   requirements:[{el:105},{mm:105}],     rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6116', title:'MV-22 Tilt-rotor Mechanic',                             field:HELO,   requirements:[{el:105},{mm:105}],     rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6123', title:'T-64 Helicopter Power Plants Mechanic',                  field:HELO,   requirements:[{mm:105}],              rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6124', title:'T-400/T-700 Helicopter Power Plants Mechanic',           field:HELO,   requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6132', title:'Helicopter/Tilt-rotor Dynamic Components Mechanic',      field:HELO,   requirements:[{mm:95}],               rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6153', title:'CH-53 Helicopter Airframe Mechanic',                     field:HELO,   requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6154', title:'UH/AH-1 Helicopter Airframe Mechanic',                  field:HELO,   requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6156', title:'MV-22 Tilt-rotor Airframe Mechanic',                    field:HELO,   requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6173', title:'CH-53 Helicopter Crew Chief',                            field:HELO,   requirements:[{gt:105},{el:105},{mm:105}], rank_eligibility:r17, quals:'U.S. citizen, secret clearance eligible, normal color perception, vision no worse than 20/70 in one eye and 20/100 in the other with overall vision correctable to 20/20, WS-B(+) water survival qualified' },
  { id:'6174', title:'UH-1 Helicopter Crew Chief',                             field:HELO,   requirements:[{gt:105},{el:105},{mm:105}], rank_eligibility:r17, quals:'U.S. citizen, secret clearance eligible, normal color perception, vision no worse than 20/70 in one eye and 20/100 in the other with overall vision correctable to 20/20, WS-B(+) water survival qualified' },
  { id:'6176', title:'MV-22 Tilt-rotor Crew Chief',                           field:HELO,   requirements:[{gt:105},{el:105},{mm:105}], rank_eligibility:r17, quals:'U.S. citizen, secret clearance eligible, normal color perception, vision no worse than 20/70 in one eye and 20/100 in the other with overall vision correctable to 20/20, WS-B(+) water survival qualified' },

  // ── FIXED-WING ─────────────────────────────────────────────────────────────
  { id:'6212', title:'AV-8/TAV-8 Fixed-Wing Aircraft Mechanic',               field:FW,     requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'6214', title:'MQ-9 Unmanned Aircraft Mechanic',                       field:FW,     requirements:[{mm:105}],              rank_eligibility:r17, quals:'Normal color vision, secret clearance eligible' },
  { id:'6216', title:'KC-130 Fixed-Wing Aircraft Mechanic',                   field:FW,     requirements:[{el:100},{mm:100}],     rank_eligibility:r17, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'6217', title:'F/A-18 Fixed-Wing Aircraft Mechanic',                   field:FW,     requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'6218', title:'F-35 Fixed-Wing Aircraft Mechanic',                     field:FW,     requirements:[{mm:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'6222', title:'F-402 Fixed-Wing Aircraft Power Plants Mechanic',        field:FW,     requirements:[{el:105},{mm:105},{cl:105}], rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6223', title:'J-52 Fixed-Wing Aircraft Power Plants Mechanic',         field:FW,     requirements:[{mm:105}],              rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6227', title:'F-404 Fixed-Wing Aircraft Power Plants Mechanic',        field:FW,     requirements:[{el:105},{mm:105},{cl:105}], rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6252', title:'AV-8/TAV-8 Fixed-Wing Aircraft Airframe Mechanic',      field:FW,     requirements:[{mm:95}],               rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6256', title:'KC-130 Fixed-Wing Aircraft Airframe Mechanic',          field:FW,     requirements:[{mm:95}],               rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6257', title:'F/A-18 Fixed-Wing Aircraft Airframe Mechanic',          field:FW,     requirements:[{mm:95}],               rank_eligibility:r17, quals:'Normal color perception' },
  { id:'6258', title:'F-35 Fixed-Wing Aircraft Airframe Mechanic',            field:FW,     requirements:[{mm:95}],               rank_eligibility:r17, quals:'U.S. citizen, normal color vision, secret clearance eligible' },
  { id:'6276', title:'KC-130 Fixed-Wing Aircraft Loadmaster',                 field:FW,     requirements:[{gt:105},{el:105},{mm:105}], rank_eligibility:r17, quals:'U.S. citizen, normal color perception, WS-B water survival qualified, secret clearance eligible' },
  { id:'6282', title:'AV-8/TAV-8 Fixed-Wing Aircraft Safety Equipment Mechanic', field:FW,  requirements:[{gt:105},{mm:105},{cl:105}], rank_eligibility:r17, quals:'Normal color vision' },
  { id:'6286', title:'KC-130/MV-22 Fixed-Wing Aircraft Safety Equipment Mechanic', field:FW, requirements:[{gt:105},{mm:105},{cl:105}], rank_eligibility:r17, quals:'Normal color vision' },
  { id:'6287', title:'F/A-18 Fixed-Wing Aircraft Safety Equipment Mechanic',  field:FW,     requirements:[{gt:105},{mm:105},{cl:105}], rank_eligibility:r17, quals:'Normal color vision' },
  { id:'6288', title:'F-35 Fixed-Wing Aircraft Safety Equipment Mechanic',    field:FW,     requirements:[{gt:105},{mm:105},{cl:105}], rank_eligibility:r17, quals:'U.S. citizen, normal color vision, secret clearance eligible' },

  // ── AVIONICS ───────────────────────────────────────────────────────────────
  { id:'6314', title:'UAS Avionics/Maintenance Technician',                    field:AVION,  requirements:[{el:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6316', title:'KC-130 Aircraft Communications/Navigation Systems Technician', field:AVION, requirements:[{el:105},{cl:105}], rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6317', title:'F/A-18 Aircraft Communications/Navigation/Radar Systems Technician', field:AVION, requirements:[{el:105},{cl:105}], rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6323', title:'CH-53 Aircraft Avionics Technician',                     field:AVION,  requirements:[{el:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6324', title:'U/AH-1 Aircraft Avionics Technician',                   field:AVION,  requirements:[{el:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6326', title:'MV-22 Aircraft Avionics Technician',                    field:AVION,  requirements:[{el:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6332', title:'AV-8B Aircraft Avionics Technician',                    field:AVION,  requirements:[{el:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6336', title:'KC-130 Aircraft Electrical Systems Technician',          field:AVION,  requirements:[{el:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6337', title:'F/A-18 Aircraft Electrical Systems Technician',         field:AVION,  requirements:[{el:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6338', title:'F-35 Aircraft Avionics Technician',                     field:AVION,  requirements:[{el:105},{cl:105}],     rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6423', title:'Aviation Electronic Micro/Miniature Component and Cable Repair Technician', field:AVION, requirements:[{el:105}], rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6432', title:'Aircraft Electrical/Instrument/Flight Control Systems Technician', field:AVION, requirements:[{el:105}], rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6469', title:'Reconfigurable Transportable Consolidated Automated Support System (RTCASS) Technician', field:AVION, requirements:[{el:105}], rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6483', title:'Communication/Navigation/Cryptographic/Countermeasures Systems Technician', field:AVION, requirements:[{el:105}], rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6492', title:'Aviation Precision Measurement Equipment (PME) Calibration/Repair Technician', field:AVION, requirements:[{el:110}], rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },
  { id:'6499', title:'Mobile Facility Technician',                             field:AVION,  requirements:[{el:105}],              rank_eligibility:r17, quals:'U.S. citizen, normal color perception, secret clearance eligible' },

  // ── AVIATION ORDNANCE / SUPPLY ─────────────────────────────────────────────
  { id:'6531', title:'Aircraft Ordnance Technician',                           field:AVNO,   requirements:[{gt:105},{cl:105}],     rank_eligibility:r16, quals:'U.S. citizen, normal color perception, secret clearance eligible, valid drivers license' },
  { id:'6541', title:'Aviation Ordnance Systems Technician',                   field:AVNO,   requirements:[{gt:105},{cl:105}],     rank_eligibility:r16, quals:'U.S. citizen, normal color perception, secret clearance eligible, valid drivers license' },
  { id:'6672', title:'Aviation Supply Specialist',                             field:AVNO,   requirements:[{cl:95}],               rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, valid drivers license' },
  { id:'6694', title:'Aviation Logistics Information Management System (ALIMS) Specialist', field:AVNO, requirements:[{gt:110},{el:110},{cl:110}], rank_eligibility:r18, quals:'U.S. citizen, normal color perception, secret clearance eligible' },

  // ── WEATHER / AIRFIELD / ATC OPS ──────────────────────────────────────────
  { id:'6842', title:'METOC Analyst Forecaster',                               field:WX,     requirements:[{gt:105},{el:105}],     rank_eligibility:r18, quals:'U.S. citizen, TS/SCI eligible' },
  { id:'7011', title:'Expeditionary Airfield Systems Technician',              field:WX,     requirements:[{el:95},{mm:95}],       rank_eligibility:r18, quals:'Vision correctable to 20/20 and normal color acuity' },
  { id:'7041', title:'Aviation Operations Specialist',                         field:WX,     requirements:[{cl:95}],               rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible' },
  { id:'7051', title:'Aircraft Rescue and Fire Fighting (ARFF) Specialist',    field:WX,     requirements:[{gt:90},{mm:90}],       rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, valid drivers license, minimum height of 59 inches' },
  { id:'7212', title:'Low Altitude Air Defense (LAAD) Gunner',                 field:WX,     requirements:[{gt:90}],               rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, valid drivers license, normal color vision, must have 20/20 vision (may be correctable to 20/20 with eyeglasses or contact lenses), hearing loss no greater than 15 dB between 500 Hz and 2000 Hz, at least 64 inches in height' },
  { id:'7236', title:'Tactical Air Defense Controller',                        field:WX,     requirements:[{gt:100},{cl:100}],     rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, normal color vision' },
  { id:'7240', title:'Tactical Air Control Operator',                          field:WX,     requirements:[{gt:100},{cl:100}],     rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, normal color vision' },
  { id:'7242', title:'Air Support Operations Operator',                        field:WX,     requirements:[{gt:95}],               rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, normal color vision' },
  { id:'7257', title:'Air Traffic Controller',                                 field:WX,     requirements:[{gt:110},{cl:110}],     rank_eligibility:r14, quals:'U.S. citizen, secret clearance eligible, must be a Cpl or below and have less than 5 years TIS if desiring LATMOVE into MOS based on MOS proficiency and qualification timeline requirements' },

  // ── UAS ────────────────────────────────────────────────────────────────────
  { id:'7314', title:'MQ-9 Sensor Operator (SO)',                              field:UAS,    requirements:[{gt:110}],              rank_eligibility:r18, quals:'U.S. citizen, SCI eligible, normal color vision' },
  { id:'7316', title:'Small Unmanned Aircraft System (SUAS) Specialist',       field:UAS,    requirements:[{gt:110}],              rank_eligibility:r18, quals:'U.S. citizen, secret clearance eligible, normal color vision and perception' },

  // ── SENIOR ENLISTED ────────────────────────────────────────────────────────
  { id:'8999', title:'1stSgt or SgtMaj',                                       field:SRENL,  requirements:[{}],                    rank_eligibility:['E-8'], quals:'Secret clearance required for 1stSgt, TS required for SgtMaj' },
];
