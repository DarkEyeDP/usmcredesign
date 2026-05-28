import assert from 'node:assert/strict';
import {
  extractNewsArticleId,
  getNewsArticlePath,
  getNewsArticleSlug,
  matchesNewsArticleSlug,
  slugifyNewsText,
} from '../src/app/features/news/newsArticleUtils';
import { parseNewsArticleDetailHtml, parseNewsArticleDetailMarkdown } from '../src/app/features/news/rssService';
import type { NewsItem } from '../src/app/features/news/types';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

const item: NewsItem = {
  id: 'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4483464/department-of-the-navy-releases-fiscal-year-2027-shipbuilding-plan/',
  title: 'Department of the Navy Releases Fiscal Year 2027 Shipbuilding Plan',
  link: 'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4483464/department-of-the-navy-releases-fiscal-year-2027-shipbuilding-plan/',
  description: 'Summary',
  pubDate: new Date('2026-05-11T00:00:00Z'),
  imageUrl: null,
  author: null,
  category: null,
  source: 'press-release',
  attachments: [],
};

test('extracts Marines.mil article ids from article URLs', () => {
  assert.equal(extractNewsArticleId(item.link), '4483464');
});

test('slugifies article titles for stable news routes', () => {
  assert.equal(slugifyNewsText("Marine Corps revises body composition standards"), 'marine-corps-revises-body-composition-standards');
});

test('builds an internal news article path', () => {
  assert.equal(
    getNewsArticlePath(item),
    '/news/4483464-department-of-the-navy-releases-fiscal-year-2027-shipbuilding-plan',
  );
});

test('matches article routes by full slug or article id prefix', () => {
  assert.equal(matchesNewsArticleSlug(item, getNewsArticleSlug(item)), true);
  assert.equal(matchesNewsArticleSlug(item, '4483464-updated-title'), true);
  assert.equal(matchesNewsArticleSlug(item, '1234567-updated-title'), false);
});

test('parses reader markdown into full article blocks', () => {
  const detail = parseNewsArticleDetailMarkdown(`Title: Test Article

URL Source: https://example.test/article

Markdown Content:
USS Comstock, At Sea --

First full paragraph with enough detail to be useful.

> A quoted paragraph from a Marine.

Second full paragraph with more detail.
`, item);

  assert.equal(detail.title, 'Test Article');
  assert.deepEqual(detail.body, [
    { type: 'paragraph', text: 'First full paragraph with enough detail to be useful.' },
    { type: 'quote', text: 'A quoted paragraph from a Marine.' },
    { type: 'paragraph', text: 'Second full paragraph with more detail.' },
  ]);
});

test('rejects access denied pages before attempting generic HTML extraction', () => {
  assert.throws(
    () => parseNewsArticleDetailHtml("<HTML><HEAD><TITLE>Access Denied</TITLE></HEAD><BODY>You don't have permission to access this server.</BODY></HTML>", item.link, item),
    /access denied/i,
  );
});

markTestFilePass();
