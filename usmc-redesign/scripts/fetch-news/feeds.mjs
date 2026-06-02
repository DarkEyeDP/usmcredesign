/**
 * Feed registry — this is the only file you need to edit to add new sources.
 *
 * Each entry:
 *   id       — unique slug; written into every item as `feedId` for filtering
 *   name     — display name used in log output
 *   url      — RSS feed URL (fetched server-side; no CORS proxy required)
 *   source   — drives the news tab UI: 'news' | 'press-release'
 *   maxItems — optional cap (feed provides its own max; use this to trim further)
 */

/** @type {Array<{ id: string, name: string, url: string, source: 'news' | 'press-release', maxItems?: number }>} */
export const FEEDS = [
  // ── Official USMC ────────────────────────────────────────────────────────
  {
    id: 'marines-news',
    name: 'Marines.mil — News',
    url: 'https://www.marines.mil/DesktopModules/ArticleCS/RSS.ashx?max=50&ContentType=1&Site=481',
    source: 'news',
  },
  {
    id: 'marines-press',
    name: 'Marines.mil — Press Releases',
    url: 'https://www.marines.mil/DesktopModules/ArticleCS/RSS.ashx?max=50&ContentType=2&Site=481',
    source: 'press-release',
  },
  {
    id: 'marforres-news',
    name: 'MARFORRES — News',
    url: 'https://www.marforres.marines.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=537&max=20',
    source: 'news',
  },

  // ── Official DoD ─────────────────────────────────────────────────────────
  {
    id: 'defense-gov',
    name: 'Defense.gov — News',
    url: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945&max=50',
    source: 'news',
  },

  // ── Military Trade Press ─────────────────────────────────────────────────
  // Uncomment each after verifying the feed URL loads correctly.

  // {
  //   id: 'marine-corps-times',
  //   name: 'Marine Corps Times',
  //   url: 'https://www.marinecorpstimes.com/rss/news/',
  //   source: 'news',
  // },
  {
    id: 'military-times',
    name: 'Military Times',
    url: 'https://www.militarytimes.com/arc/outboundfeeds/rss/category/news/?outputType=xml',
    source: 'news',
  },
  // {
  //   id: 'stars-and-stripes',
  //   name: 'Stars and Stripes',
  //   url: 'https://www.stripes.com/rss.xml',
  //   source: 'news',
  // },
  // {
  //   id: 'task-and-purpose',
  //   name: 'Task & Purpose',
  //   url: 'https://taskandpurpose.com/feed/',
  //   source: 'news',
  // },
  // {
  //   id: 'dvids-usmc',
  //   name: 'DVIDS — USMC',
  //   url: 'https://www.dvidshub.net/rss/news?group=usmc',
  //   source: 'news',
  // },
];
