/**
 * DB schema interfaces — mirror the PostgreSQL table structure exactly.
 * When migrating to Supabase, these types map directly to table rows
 * and Supabase-generated response types will be compatible.
 */

/** One OR-group of ASVAB minimums. Multiple groups = OR logic; keys within one group = AND. */
export interface RequirementGroup {
  gt?: number;
  el?: number;
  mm?: number;
  cl?: number;
}

export type ClearanceLevel = 'none' | 'confidential' | 'secret' | 'top_secret' | 'ts_sci';

export type { SkillTag } from './mos-skills';
import type { SkillTag } from './mos-skills';

/** Maps to: mos table (id, title, field) + related tables joined. */
export interface MOS {
  id: string;               // '0311'   — future PK
  title: string;            // 'Rifleman'
  field: string;            // 'Infantry / Recon' — future FK to mos_fields table
  requirements: RequirementGroup[];   // future: mos_requirements table (JSONB or normalized rows)
  rank_eligibility: string[];         // future: mos_rank_eligibility join table
  clearance: ClearanceLevel;          // future: mos_clearance_requirement FK/enum
  requiresNormalColorVision: boolean; // future: mos_medical_requirements table
  qualifications: string[];           // future: mos_qualifications table
  skills: SkillTag[];                 // future: mos_skills join table
  description: string;                // future: mos_descriptions table
}

/** User's current scores — not persisted yet, future: user_profiles table. */
export interface UserScores {
  GT: number;
  EL: number;
  MM: number;
  CL: number;
}
