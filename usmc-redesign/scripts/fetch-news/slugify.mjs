/**
 * Slug utilities — mirrors newsArticleUtils.ts exactly so the script and
 * the app produce identical slugs for the same article.
 *
 * IMPORTANT: if the slug logic ever changes in newsArticleUtils.ts, update
 * this file to match so static body files remain findable.
 */

const ARTICLE_ID_RE = /\/Article\/(\d+)(?:\/|$)/i;
const MAX_TITLE_SLUG_LENGTH = 96;

/** @param {string} url */
export function extractArticleId(url) {
  return url.match(ARTICLE_ID_RE)?.[1] ?? null;
}

/** @param {string} text */
export function slugifyText(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_TITLE_SLUG_LENGTH)
    .replace(/-+$/g, '');
}

/**
 * @param {{ id: string, link: string, title: string }} item
 * @returns {string}
 */
export function getArticleSlug(item) {
  const articleId = extractArticleId(item.link) ?? slugifyText(item.id);
  const titleSlug = slugifyText(item.title);
  return titleSlug ? `${articleId}-${titleSlug}` : articleId;
}
