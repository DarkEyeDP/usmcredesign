/**
 * Converts a raw parsed RSS item into the app's NewsItem shape.
 *
 * The output is JSON-serializable (pubDate as ISO string).
 * The consumer (useNewsItems.ts) revives pubDate back to a Date on load.
 */

/**
 * Extract a category label from the title or the raw RSS category field.
 * Mirrors the logic in the original rssService.ts.
 *
 * @param {string} title
 * @param {string | null} rawCategory
 * @returns {string | null}
 */
function extractCategory(title, rawCategory) {
  if (rawCategory) {
    const category = rawCategory.replace(/^[/\s]+/, '').trim();
    return category ? category.toUpperCase() : null;
  }
  // "Balikatan 2026: Joint Forces..." → "BALIKATAN 2026"
  const colonIdx = title.indexOf(':');
  if (colonIdx > 0 && colonIdx < 45) return title.substring(0, colonIdx).toUpperCase();
  return null;
}

/**
 * @typedef {Object} RawItem
 * @property {string}      title
 * @property {string}      link
 * @property {string}      guid
 * @property {string}      description
 * @property {string|null} pubDate
 * @property {string|null} category
 * @property {string|null} author
 * @property {string|null} imageUrl
 */

/**
 * @typedef {Object} FeedConfig
 * @property {string} id
 * @property {'news'|'press-release'} source
 */

/**
 * Normalize a raw RSS item into the app's NewsItem shape (with pubDate as ISO string).
 *
 * @param {RawItem} raw
 * @param {FeedConfig} feed
 * @param {number} index  — fallback index used when guid is missing
 * @returns {object}      — NewsItem with pubDate as ISO string
 */
export function normalizeItem(raw, feed, index) {
  const id = raw.guid || raw.link || `${feed.id}-${index}`;
  const pubDate = raw.pubDate ? new Date(raw.pubDate) : new Date();
  const safeDate = Number.isNaN(pubDate.getTime()) ? new Date() : pubDate;

  return {
    id,
    title: raw.title || '(No title)',
    link: raw.link || id,
    description: raw.description || '',
    pubDate: safeDate.toISOString(),
    imageUrl: raw.imageUrl ?? null,
    author: raw.author ?? null,
    category: extractCategory(raw.title, raw.category),
    source: feed.source,
    feedId: feed.id,
    attachments: [],
  };
}
