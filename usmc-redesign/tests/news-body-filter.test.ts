/**
 * Tests for article body parsing and filtering.
 *
 * Covers three surfaces that share the same logic:
 *   1. rssService.ts  — parseNewsArticleDetailMarkdown (browser, live fallback)
 *   2. article-fetcher.mjs — parseMarkdown (Node, pre-fetch script)
 *
 * Both must filter the same garbage and produce the same structure.
 * If they drift, pre-fetched bodies will look different from live-fetched ones.
 */

import assert from 'node:assert/strict';
import { parseNewsArticleDetailMarkdown } from '../src/app/features/news/rssService';
import { parseMarkdown } from '../scripts/fetch-news/article-fetcher.mjs';
import type { NewsItem } from '../src/app/features/news/types';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

const ITEM: Pick<NewsItem, 'title' | 'description' | 'pubDate' | 'imageUrl'> = {
  title: 'Test Article',
  description: 'A test description.',
  pubDate: new Date('2026-06-01T00:00:00Z'),
  imageUrl: null,
};

// ── Helper to build Jina-style markdown ───────────────────────────────────────

function jinaDoc(title: string, content: string): string {
  return `Title: ${title}\n\nURL Source: https://example.mil/article/\n\nMarkdown Content:\n${content}`;
}

// ── Title breadcrumb stripping ────────────────────────────────────────────────

test('strips defense.gov breadcrumb from title (> separator)', () => {
  const md = jinaDoc('Real Title > Section > Site Name', 'Body paragraph with enough text to pass.');
  const { title } = parseNewsArticleDetailMarkdown(md, ITEM);
  assert.equal(title, 'Real Title');
});

test('strips site name after | separator from title', () => {
  const md = jinaDoc('Real Title | U.S. Department of War', 'Body paragraph with enough text to pass.');
  const { title } = parseNewsArticleDetailMarkdown(md, ITEM);
  assert.equal(title, 'Real Title');
});

// ── Heading detection ─────────────────────────────────────────────────────────

test('detects ## markdown headings as heading blocks', () => {
  const md = jinaDoc('Article', `Opening paragraph with enough content to be useful here.

## Heroism Knows No Rank

Another paragraph with meaningful content about the subject matter.`);
  const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
  const heading = body.find(b => b.type === 'heading');
  assert.ok(heading, 'expected a heading block');
  assert.equal(heading.text, 'Heroism Knows No Rank');
});

// ── Government site chrome filtering ─────────────────────────────────────────

test('filters .gov banner lines', () => {
  const bannerLines = [
    'Skip to main content (Press Enter).',
    'An official website of the United States Government',
    "Here's how you know",
    'Official websites use .gov',
    'A.gov website belongs to an official government organization in the United States.',
    'Secure .gov websites use HTTPS',
    'A lock () or https:// means you\'ve safely connected to the .gov website.',
  ];
  for (const line of bannerLines) {
    const md = jinaDoc('Test', `${line}\n\nReal article content paragraph that is long enough to pass validation.`);
    const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
    const texts = body.map(b => b.text);
    assert.ok(!texts.some(t => t.includes(line.slice(0, 20))), `banner line should be filtered: "${line.slice(0, 40)}"`);
  }
});

test('filters image and media labels', () => {
  const noiseLines = ['Image 10', 'Image 3: A soldier stands guard.', 'Download:Full Size (890 KB)', 'Credit: Sgt. Jane Smith', 'VIRIN:260521-A-YG272-3985'];
  for (const line of noiseLines) {
    const md = jinaDoc('Test', `Real article content paragraph long enough to pass validation here.\n\n${line}`);
    const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
    assert.ok(!body.some(b => b.text.includes(line.split(':')[0])), `should filter: "${line}"`);
  }
});

test('filters slideshow UI artifacts', () => {
  const artifacts = [
    '{{slideNumber}}/{{numSlides}} - {{slideCaption}}',
    'Previous',
    'Next',
    '1 2 3',
    '1 of 3',
  ];
  for (const artifact of artifacts) {
    const md = jinaDoc('Test', `Real article content paragraph long enough to pass.\n\n${artifact}\n\nMore real article content here.`);
    const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
    assert.ok(!body.some(b => b.text === artifact), `should filter artifact: "${artifact}"`);
  }
});

test('filters Training Time and Spotlight: labels', () => {
  const md = jinaDoc('Test', `Real paragraph one with enough content to be useful here.

Training Time

Image caption describing a soldier doing something.

Spotlight:Focus on Indo-Pacific

Real paragraph two with enough content here.`);
  const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
  assert.ok(!body.some(b => b.text === 'Training Time'), 'Training Time should be filtered');
  assert.ok(!body.some(b => b.text.startsWith('Spotlight:')), 'Spotlight: should be filtered');
});

test('filters social share chrome', () => {
  const md = jinaDoc('Test', `Real article paragraph with meaningful content right here.

EmailFacebookXLinkedInWhatsApp

Copy Link)

More real content here.`);
  const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
  assert.ok(!body.some(b => b.text.startsWith('EmailFacebook')), 'EmailFacebook should be filtered');
  assert.ok(!body.some(b => b.text === 'Copy Link)'), 'Copy Link) should be filtered');
});

// ── Footer sentinel ───────────────────────────────────────────────────────────

test('stops at Related Stories sentinel — nothing after it appears in body', () => {
  const md = jinaDoc('Test', `First real paragraph with meaningful content here.

Second real paragraph with more meaningful content.

Related Stories

NewsMay 27, 2026 ### Sword 26: Cyber Defenders Train in Estonia

Department of War

Home News Spotlights About`);
  const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
  assert.ok(!body.some(b => b.text.includes('Sword 26')), 'Related Stories content should not appear');
  assert.ok(!body.some(b => b.text.includes('Department of War')), 'Footer nav should not appear');
  assert.ok(body.length >= 1, 'real content before sentinel should remain');
});

test('stops at Subscribe to sentinel', () => {
  const md = jinaDoc('Test', `Real article content here with enough text.

Subscribe to War.gov Products

Choose which War.gov products you want delivered to your inbox.`);
  const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
  assert.ok(!body.some(b => b.text.includes('Subscribe')), 'Subscribe section should not appear');
  assert.ok(!body.some(b => b.text.includes('inbox')), 'Subscription copy should not appear');
});

// ── Defense.gov nav menus ─────────────────────────────────────────────────────

test('filters defense.gov navigation menu lines', () => {
  const navLines = [
    'Press Products Today in DOW Live Events Releases Advisories Transcripts Speeches Publications Contracts',
    'Newsroom News Stories Feature Stories Stories from the Services',
    'Multimedia Photos Photo Collections Week In Photos Videos',
    'Interactive Experiences Visual Stories Quizzes All Interactive',
    'Leadership Secretary of War Deputy Secretary of War Chairman of the Joint Chiefs of Staff',
    'Components Army Marine Corps Navy Air Force Space Force Coast Guard National Guard Combatant Commands',
    'Back Home Place Holder',
    'Enter Your Search Terms',
  ];
  for (const line of navLines) {
    const md = jinaDoc('Test', `Real content paragraph.\n\n${line}\n\nMore real content here.`);
    const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
    assert.ok(!body.some(b => b.text.startsWith(line.slice(0, 30))), `nav line should be filtered: "${line.slice(0, 40)}..."`);
  }
});

// ── Real content is preserved ─────────────────────────────────────────────────

test('does not filter real article paragraph text', () => {
  const realParagraphs = [
    'The Texas Military Department participated in the 2026 Search and Rescue Exercise in San Antonio.',
    '"The biggest dilemma I\'ve ever had as an officer was this concept of mission or people first," he said.',
    'There were 22 aircraft from 13 different agencies, including the Air Force 41st Rescue Squadron.',
    'The Department of Defense announced new cybersecurity standards for all contractors.',
  ];
  const md = jinaDoc('Test', realParagraphs.join('\n\n'));
  const { body } = parseNewsArticleDetailMarkdown(md, ITEM);
  for (const para of realParagraphs) {
    assert.ok(body.some(b => b.text.includes(para.slice(0, 40))), `real paragraph should survive: "${para.slice(0, 50)}..."`);
  }
});

// ── Script-side parseMarkdown matches rssService ──────────────────────────────

test('script parseMarkdown and rssService produce equivalent body for clean markdown', () => {
  const content = `Opening paragraph with enough content to be meaningful here.

## Section Heading

Second paragraph with more detail about the topic at hand.

> A direct quote from a senior officer about the mission.`;

  const jinaInput = jinaDoc('Test Article', content);

  const fromRss = parseNewsArticleDetailMarkdown(jinaInput, ITEM);
  const fromScript = parseMarkdown(jinaInput, 'Test Article');

  assert.equal(fromScript.body.length, fromRss.body.length, 'body block count should match');
  fromRss.body.forEach((block, i) => {
    assert.equal(fromScript.body[i].type, block.type, `block ${i} type should match`);
    assert.equal(fromScript.body[i].text, block.text, `block ${i} text should match`);
  });
});

test('script parseMarkdown strips breadcrumb from title', () => {
  const md = jinaDoc('Real Title > Section | Site', 'Body content paragraph with enough text here.');
  const { title } = parseMarkdown(md, 'Real Title');
  assert.equal(title, 'Real Title');
});

test('script parseMarkdown footer sentinel stops at Related Stories', () => {
  const md = jinaDoc('Test', `Real paragraph with content.

Related Stories

NewsMay 27, 2026 ### Sword 26 Exercise`);
  const { body } = parseMarkdown(md, 'Test');
  assert.ok(!body.some(b => b.text.includes('Sword 26')), 'footer content should be cut off');
});

markTestFilePass();
