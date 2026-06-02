/**
 * Slug parity tests.
 *
 * The slug logic lives in two places:
 *   - src/app/features/news/newsArticleUtils.ts  (app, routes articles)
 *   - scripts/fetch-news/slugify.mjs             (script, names body files)
 *
 * If these drift, the app will request /data/articles/{slug}.json
 * and get a 404 because the file was saved under a different name.
 * These tests catch that silently before it ships.
 */

import assert from 'node:assert/strict';
import {
  getNewsArticleSlug,
  getSourceLabel,
  slugifyNewsText,
} from '../src/app/features/news/newsArticleUtils';
import {
  getArticleSlug,
  slugifyText,
} from '../scripts/fetch-news/slugify.mjs';
import type { NewsItem } from '../src/app/features/news/types';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

// ── Shared test items ─────────────────────────────────────────────────────────

function makeItem(overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    id: 'https://www.marines.mil/News/Article/123/test-article/',
    title: 'Test Article Title',
    link: 'https://www.marines.mil/News/Article/123/test-article/',
    description: '',
    pubDate: new Date('2026-06-01'),
    imageUrl: null,
    author: null,
    category: null,
    source: 'news',
    attachments: [],
    ...overrides,
  };
}

// ── slugifyText / slugifyNewsText parity ──────────────────────────────────────

const SLUG_CASES = [
  ['Simple title', 'simple-title'],
  ['Marine Corps revises body composition standards', 'marine-corps-revises-body-composition-standards'],
  ['U.S. Forces Deploy to Indo-Pacific', 'us-forces-deploy-to-indo-pacific'],
  ["Marine's sacrifice honored", 'marines-sacrifice-honored'], // smart quote
  ['‘Smart’ quotes and “double” too', 'smart-quotes-and-double-too'],
  ['Multiple   spaces   between   words', 'multiple-spaces-between-words'],
  ['Leading - and trailing -', 'leading-and-trailing'],
  ['!@#$% Special chars between words &*()', 'special-chars-between-words'],
] as const;

for (const [input, expected] of SLUG_CASES) {
  test(`slugifyText: "${input}"`, () => {
    assert.equal(slugifyText(input), expected, 'script version');
    assert.equal(slugifyNewsText(input), expected, 'app version');
  });
}

test('slugifyText truncates to 96 characters', () => {
  const longTitle = 'a'.repeat(120);
  assert.equal(slugifyText(longTitle).length, 96);
  assert.equal(slugifyNewsText(longTitle).length, 96);
  assert.equal(slugifyText(longTitle), slugifyNewsText(longTitle));
});

// ── getArticleSlug / getNewsArticleSlug parity ────────────────────────────────

test('both produce identical slug for marines.mil article URL', () => {
  const item = makeItem({
    link: 'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4483464/department-of-the-navy-releases-fiscal-year-2027-shipbuilding-plan/',
    title: 'Department of the Navy Releases Fiscal Year 2027 Shipbuilding Plan',
  });
  assert.equal(getArticleSlug(item), getNewsArticleSlug(item));
});

test('both produce identical slug for defense.gov article URL', () => {
  const item = makeItem({
    link: 'https://www.war.gov/News/News-Stories/Article/Article/4504346/texas-military-department-partners-with-civilian-agencies-for-2026-sarex/',
    title: 'Texas Military Department Partners With Civilian Agencies for 2026 SAREX',
  });
  assert.equal(getArticleSlug(item), getNewsArticleSlug(item));
});

test('both produce identical slug when no Article ID in URL', () => {
  const item = makeItem({
    id: 'https://taskandpurpose.com/news/marines-new-equipment-2026/',
    link: 'https://taskandpurpose.com/news/marines-new-equipment-2026/',
    title: 'Marines Getting New Equipment in 2026',
  });
  assert.equal(getArticleSlug(item), getNewsArticleSlug(item));
});

test('both extract article ID from URL path', () => {
  const item = makeItem({
    link: 'https://www.marines.mil/News/Article/9999/some-title-here/',
    title: 'Some Title Here',
  });
  const slug = getArticleSlug(item);
  assert.ok(slug.startsWith('9999-'), `slug should start with article id: ${slug}`);
  assert.equal(slug, getNewsArticleSlug(item));
});

test('both handle smart quotes in title identically', () => {
  const item = makeItem({ title: 'Marine’s Story: A Legacy of Service' });
  assert.equal(getArticleSlug(item), getNewsArticleSlug(item));
});

// ── getSourceLabel ────────────────────────────────────────────────────────────

test('getSourceLabel returns MARINES.MIL for marines-news feedId', () => {
  const item = makeItem({ feedId: 'marines-news', link: 'https://www.marines.mil/News/Article/1/' });
  assert.equal(getSourceLabel(item), 'MARINES.MIL');
});

test('getSourceLabel returns MARINES.MIL for marines-press feedId', () => {
  const item = makeItem({ feedId: 'marines-press', link: 'https://www.marines.mil/News/Article/1/' });
  assert.equal(getSourceLabel(item), 'MARINES.MIL');
});

test('getSourceLabel returns MARFORRES for marforres-news feedId', () => {
  const item = makeItem({ feedId: 'marforres-news', link: 'https://www.marforres.marines.mil/Media-Room/Stories/Article/Article/1/' });
  assert.equal(getSourceLabel(item), 'MARFORRES');
});

test('getSourceLabel returns DEFENSE.GOV for defense-gov feedId', () => {
  const item = makeItem({ feedId: 'defense-gov', link: 'https://www.defense.gov/News/Article/1/' });
  assert.equal(getSourceLabel(item), 'DEFENSE.GOV');
});

test('getSourceLabel falls back to hostname when feedId is unknown', () => {
  const item = makeItem({ feedId: 'unknown-feed', link: 'https://www.marinecorpstimes.com/news/article/' });
  assert.equal(getSourceLabel(item), 'MARINECORPSTIMES.COM');
});

test('getSourceLabel strips www. prefix from hostname fallback', () => {
  const item = makeItem({ feedId: undefined, link: 'https://www.stripes.com/news/story-123/' });
  assert.equal(getSourceLabel(item), 'STRIPES.COM');
});

markTestFilePass();
