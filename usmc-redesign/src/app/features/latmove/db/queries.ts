/**
 * Data access layer — all MOS reads go through here.
 *
 * Today: returns in-memory data from mos-data.ts.
 * Future migration path: replace the body of each function with a
 * Supabase (or fetch) call. The rest of the app stays unchanged.
 *
 *   // Example Supabase swap:
 *   export async function getMOSList(): Promise<MOS[]> {
 *     const { data } = await supabase.from('mos').select('*, requirements(*), rank_eligibility(*), qualifications(*)');
 *     return data ?? [];
 *   }
 */

import { RAW_MOS } from './mos-data';
import type { ClearanceLevel, MOS } from './schema';
import { MOS_SKILLS } from './mos-skills';
import { MOS_DESCRIPTIONS } from './mos-descriptions';
import { getMOSTitleById as getMOSTitleFromRegistry } from './mos-titles';

const NONE = new Set(['No additional requirements', 'No additional requirements needed']);
const QUALIFICATION_STARTERS = [
  'u.s.',
  'us ',
  'cannot',
  'must',
  'no ',
  'normal',
  'valid',
  'favorable',
  'secret',
  'top secret',
  'sci',
  'current',
  'completed',
  'pass',
  'have',
  'height',
  'cpl',
  'sgts',
  'marines',
  'lance corporals',
  'gunnery sergeants',
  '21 years',
  'ws-',
];

function deriveClearanceRequirement(quals: string): ClearanceLevel {
  const text = quals.toLowerCase();

  if (text.includes('ts/sci') || text.includes('ts sci') || text.includes('sci eligible') || text.includes('sci eligibility')) {
    return 'ts_sci';
  }

  if (text.includes('top secret') || text.includes('ts required') || text.includes('ts clearance') || text.includes('ts eligible')) {
    return 'top_secret';
  }

  if (
    text.includes('secret clearance') ||
    text.includes('minimum interim secret') ||
    text.includes('secret security eligible') ||
    text.includes('possess secret clearance')
  ) {
    return 'secret';
  }

  if (text.includes('confidential clearance')) {
    return 'confidential';
  }

  return 'none';
}

function requiresNormalColorVision(quals: string): boolean {
  const text = quals.toLowerCase();

  return (
    text.includes('normal color vision') ||
    text.includes('normal color perception') ||
    text.includes('normal color acuity') ||
    text.includes('normal color') ||
    text.includes('color perception test') ||
    text.includes('color acuity') ||
    text.includes('color and field of vision') ||
    text.includes('vision to include color') ||
    text.includes('farnsworth lantern') ||
    text.includes('falant') ||
    text.includes('w/pip')
  );
}

function capitalizeQualification(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  return trimmed.replace(/^[a-z]/, char => char.toUpperCase());
}

function isQualificationStart(segment: string): boolean {
  const normalized = segment.trim().toLowerCase();
  return QUALIFICATION_STARTERS.some(starter => normalized.startsWith(starter));
}

function splitQualifications(quals: string): string[] {
  const segments = quals.split(', ').map(segment => segment.trim()).filter(Boolean);
  const merged: string[] = [];

  for (const segment of segments) {
    if (merged.length === 0 || isQualificationStart(segment)) {
      merged.push(segment);
      continue;
    }

    merged[merged.length - 1] = `${merged[merged.length - 1]}, ${segment}`;
  }

  return merged.map(capitalizeQualification);
}

function toMOS(raw: typeof RAW_MOS[0]): MOS {
  return {
    id: raw.id,
    title: raw.title,
    field: raw.field,
    requirements: raw.requirements,
    rank_eligibility: raw.rank_eligibility,
    clearance: deriveClearanceRequirement(raw.quals),
    requiresNormalColorVision: requiresNormalColorVision(raw.quals),
    qualifications: NONE.has(raw.quals.trim())
      ? []
      : splitQualifications(raw.quals),
    skills: MOS_SKILLS[raw.id] ?? [],
    description: MOS_DESCRIPTIONS[raw.id] ?? '',
  };
}

// Single parse — data is static so we cache after first call.
let _cache: MOS[] | null = null;
function all(): MOS[] {
  if (!_cache) _cache = RAW_MOS.map(toMOS);
  return _cache;
}

export function getMOSList(): MOS[] {
  return all();
}

export function getMOSById(id: string): MOS | undefined {
  return all().find(m => m.id === id);
}

export function getMOSTitleById(id: string): string | undefined {
  return getMOSById(id)?.title ?? getMOSTitleFromRegistry(id);
}

export function getMOSByField(field: string): MOS[] {
  return all().filter(m => m.field === field);
}

/** Sorted, deduplicated list of all occupational field names. */
export function getMOSFields(): string[] {
  return [...new Set(all().map(m => m.field))].sort();
}
