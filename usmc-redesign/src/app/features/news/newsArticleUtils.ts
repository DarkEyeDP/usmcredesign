import type { NewsItem } from './types';

const ARTICLE_ID_RE = /\/Article\/(\d+)(?:\/|$)/i;
const MAX_TITLE_SLUG_LENGTH = 96;

export function extractNewsArticleId(url: string): string | null {
  return url.match(ARTICLE_ID_RE)?.[1] ?? null;
}

export function slugifyNewsText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_TITLE_SLUG_LENGTH)
    .replace(/-+$/g, '');
}

export function getNewsArticleSlug(item: NewsItem): string {
  const articleId = extractNewsArticleId(item.link) ?? slugifyNewsText(item.id);
  const titleSlug = slugifyNewsText(item.title);
  return titleSlug ? `${articleId}-${titleSlug}` : articleId;
}

export function getNewsArticlePath(item: NewsItem): string {
  return `/news/${getNewsArticleSlug(item)}`;
}

export function matchesNewsArticleSlug(item: NewsItem, slug: string | undefined): boolean {
  if (!slug) return false;
  const normalized = slug.toLowerCase();
  const articleId = extractNewsArticleId(item.link);

  return (
    normalized === getNewsArticleSlug(item) ||
    normalized === item.id.toLowerCase() ||
    (!!articleId && (normalized === articleId || normalized.startsWith(`${articleId}-`)))
  );
}
