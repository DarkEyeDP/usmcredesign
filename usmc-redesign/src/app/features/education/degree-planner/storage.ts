import type { Course, SavedState } from './types';

// ── Persistence ─────────────────────────────────────────────────────────────────
export const STORAGE_KEY = 'usmc-degree-planner-v2';

export function loadSaved(): Partial<SavedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Migrate courses that may have old taFunded boolean field
    if (Array.isArray(parsed.terms)) {
      parsed.terms = parsed.terms.map((t: any) => ({
        ...t,
        courses: (t.courses ?? []).map((c: any): Course => ({
          id: c.id,
          name: c.name ?? '',
          credits: c.credits ?? 3,
          costPerCredit: c.costPerCredit ?? 250,
          funding: c.funding ?? (c.taFunded ? 'ta' : 'oop'),
          grade: c.grade ?? '',
          status: c.status ?? 'planned',
        })),
      }));
    }
    return parsed;
  } catch {
    return {};
  }
}
