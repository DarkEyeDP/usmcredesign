type DailyHistoryHeroMode = 'replace' | 'prepend';

const viteEnv = import.meta.env ?? {};

function envBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') return fallback;
  return !['0', 'false', 'off', 'no'].includes(value.trim().toLowerCase());
}

function envMode(value: string | undefined): DailyHistoryHeroMode {
  return value === 'prepend' ? 'prepend' : 'replace';
}

export const DAILY_HISTORY_HERO_CONFIG = {
  enabled: envBoolean(viteEnv.VITE_DAILY_HISTORY_HERO_ENABLED, true),
  mode: envMode(viteEnv.VITE_DAILY_HISTORY_HERO_MODE),
  timezone: viteEnv.VITE_DAILY_HISTORY_TIMEZONE || 'America/New_York',
  /**
   * Optional preview key for local work, e.g. VITE_DAILY_HISTORY_PREVIEW_DATE=11-10.
   * Leave empty in production to use the user's real page-load date.
   */
  previewDateKey: viteEnv.VITE_DAILY_HISTORY_PREVIEW_DATE || '',
} as const;
