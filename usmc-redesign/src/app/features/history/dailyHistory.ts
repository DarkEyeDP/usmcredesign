import type { HeroSlide } from '@/app/features/hero/types';
import { DAILY_HISTORY_HERO_CONFIG } from './dailyHistoryConfig';
import { DAILY_HISTORY_EVENTS } from './dailyHistoryEvents';
import type { DailyHistoryDateKey, DailyHistoryEvent } from './dailyHistoryTypes';

const dailyHistoryColorGrade = 'radial-gradient(ellipse at 68% 48%, rgba(125,25,18,0.34) 0%, transparent 64%)';
const dailyHistorySweep = 'linear-gradient(125deg, transparent 30%, rgba(130,18,12,0.24) 60%, transparent 80%)';
const dailyHistoryNodeColors = [
  'rgba(220,38,38,0.92)',
  'rgba(244,180,65,0.88)',
  'rgba(245,245,245,0.84)',
] as const;

function isDailyHistoryDateKey(value: string): value is DailyHistoryDateKey {
  return /^\d{2}-\d{2}$/.test(value);
}

export function getDailyHistoryDateKey(date: Date, timezone = DAILY_HISTORY_HERO_CONFIG.timezone): DailyHistoryDateKey {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  });
  const key = formatter.format(date).replace('/', '-');

  if (!isDailyHistoryDateKey(key)) {
    throw new Error(`Unable to create daily history date key from "${key}"`);
  }

  return key;
}

export function getDailyHistoryEvent(
  date: Date,
  events: readonly DailyHistoryEvent[] = DAILY_HISTORY_EVENTS,
  options: { timezone?: string; previewDateKey?: string } = {},
): DailyHistoryEvent | null {
  const configuredPreviewKey = options.previewDateKey ?? DAILY_HISTORY_HERO_CONFIG.previewDateKey;
  const dateKey = isDailyHistoryDateKey(configuredPreviewKey)
    ? configuredPreviewKey
    : getDailyHistoryDateKey(date, options.timezone);

  return events.find(event => event.dateKey === dateKey) ?? null;
}

export function dailyHistoryEventToHeroSlide(event: DailyHistoryEvent, fallbackImage = ''): HeroSlide {
  return {
    image: event.image || fallbackImage,
    label: `${event.label} | ${event.year}`,
    heading: event.heading,
    sub: event.sub,
    colorGrade: dailyHistoryColorGrade,
    sweep: dailyHistorySweep,
    nodeColors: dailyHistoryNodeColors,
    videoId: event.videoId,
  };
}

export function getDailyHistoryHeroSlide(date = new Date(), fallbackImage = ''): HeroSlide | null {
  if (!DAILY_HISTORY_HERO_CONFIG.enabled) return null;

  const event = getDailyHistoryEvent(date);
  return event ? dailyHistoryEventToHeroSlide(event, fallbackImage) : null;
}
