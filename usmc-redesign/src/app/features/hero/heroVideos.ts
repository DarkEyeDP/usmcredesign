import type { HeroVideo } from './types';

/**
 * The video used when a slide has no explicit `videoId`.
 * Must match an `id` in VIDEOS below.
 */
export const DEFAULT_VIDEO_ID = 'semper-fidelis-250';

/**
 * All videos available for the hero WATCH button.
 *
 * To add a new video:
 *  1. Append a new entry to this array with a unique `id`
 *  2. Optionally set `videoId` on any SLIDES entry in heroSlides.ts to point to it
 *
 * To make a specific slide trigger a different video, set `videoId` on that slide
 * to the `id` of the desired entry here.
 */
export const VIDEOS: HeroVideo[] = [
  {
    id: 'semper-fidelis-250',
    youtubeId: 'tYq6HGNGZq4',
    title: 'SEMPER FIDELIS',
    subtitle: '250 YEARS OF EXCELLENCE',
    headerLabel: 'OFFICIAL USMC FOOTAGE',
    headerMeta: 'MARINES · 250TH ANNIVERSARY',
    year: '1775',
  },
];

export function getVideoById(id: string): HeroVideo | undefined {
  return VIDEOS.find(v => v.id === id);
}

export function getDefaultVideo(): HeroVideo {
  const v = getVideoById(DEFAULT_VIDEO_ID);
  if (!v) throw new Error(`Default video "${DEFAULT_VIDEO_ID}" not found in VIDEOS`);
  return v;
}
