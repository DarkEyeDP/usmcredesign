export interface HeroSlide {
  image: string;
  label: string;
  heading: readonly [string, string, ...string[]];
  sub: readonly [string, string];
  colorGrade: string;
  sweep: string;
  nodeColors: readonly [string, string, string];
  /** ID of the video to show in the WATCH button for this slide. Falls back to DEFAULT_VIDEO_ID. */
  videoId?: string;
}

export interface HeroVideo {
  id: string;
  youtubeId: string;
  /** Optional YouTube start time in seconds. */
  startSeconds?: number;
  /** Bold title shown in the WATCH button and modal header */
  title: string;
  /** Subtitle shown below title */
  subtitle: string;
  /** Short label in the player header bar (e.g. "OFFICIAL USMC FOOTAGE") */
  headerLabel: string;
  /** Secondary metadata in the player header bar */
  headerMeta?: string;
  /** Optional year/number shown in the modal footer (large display) */
  year?: string;
}
