export type DailyHistoryDateKey =
  `${'01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'}-${string}`;

export interface DailyHistorySource {
  title: string;
  url: string;
}

export interface DailyHistoryEvent {
  /** Calendar date in MM-DD format. Use one entry per day you want to override the hero. */
  dateKey: DailyHistoryDateKey;
  year: number;
  campaign: string;
  label: string;
  heading: readonly [string, string, ...string[]];
  sub: readonly [string, string];
  summary: string;
  /**
   * Optional public asset URL, for example: /history/images/iwo-jima.webp
   * Leave blank until you have approved imagery; the app will use the heritage fallback image.
   */
  image?: string;
  /**
   * Short guidance for the image or footage you may want to collect for this date.
   * This does not render in the UI.
   */
  assetBrief?: string;
  /** Optional id from features/hero/heroVideos.ts. */
  videoId?: string;
  source: DailyHistorySource;
}
