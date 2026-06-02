import assert from 'node:assert/strict';
import { parseRssItems } from '../scripts/fetch-news/parser.mjs';
import { normalizeItem } from '../scripts/fetch-news/normalizer.mjs';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

// ── parseRssItems ─────────────────────────────────────────────────────────────

test('parses a plain-text RSS item', () => {
  const xml = `<rss><channel>
    <item>
      <title>Marine Corps Conducts Exercise</title>
      <link>https://www.marines.mil/News/Article/123/marine-corps-conducts-exercise/</link>
      <guid>https://www.marines.mil/News/Article/123/marine-corps-conducts-exercise/</guid>
      <description>Marines conducted a joint exercise.</description>
      <pubDate>Mon, 02 Jun 2026 12:00:00 +0000</pubDate>
    </item>
  </channel></rss>`;

  const items = parseRssItems(xml);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Marine Corps Conducts Exercise');
  assert.equal(items[0].link, 'https://www.marines.mil/News/Article/123/marine-corps-conducts-exercise/');
  assert.equal(items[0].description, 'Marines conducted a joint exercise.');
  assert.equal(items[0].pubDate, 'Mon, 02 Jun 2026 12:00:00 +0000');
});

test('parses CDATA-wrapped title and description, stripping any inner HTML tags', () => {
  const xml = `<rss><channel>
    <item>
      <title><![CDATA[Semper Fi: The <Bold> Marine Way]]></title>
      <link>https://www.marines.mil/News/Article/456/</link>
      <guid>https://www.marines.mil/News/Article/456/</guid>
      <description><![CDATA[Bold <em>action</em> taken today.]]></description>
    </item>
  </channel></rss>`;

  const items = parseRssItems(xml);
  // stripHtml removes inner tags — <Bold> and <em> are stripped
  assert.equal(items[0].title, 'Semper Fi: The Marine Way');
  assert.equal(items[0].description, 'Bold action taken today.');
});

test('decodes HTML entities in plain-text fields', () => {
  const xml = `<rss><channel>
    <item>
      <title>Marines &amp; Sailors Conduct Exercise</title>
      <link>https://www.marines.mil/</link>
      <guid>https://www.marines.mil/</guid>
      <description>Collaboration &lt;between&gt; forces.</description>
    </item>
  </channel></rss>`;

  const items = parseRssItems(xml);
  assert.equal(items[0].title, 'Marines & Sailors Conduct Exercise');
  assert.equal(items[0].description, 'Collaboration <between> forces.');
});

test('extracts image URL from enclosure element', () => {
  const xml = `<rss><channel>
    <item>
      <title>Test</title>
      <link>https://www.marines.mil/</link>
      <guid>https://www.marines.mil/</guid>
      <enclosure url="https://media.defense.gov/photo.jpg" type="image/jpeg" length="123456"/>
    </item>
  </channel></rss>`;

  const items = parseRssItems(xml);
  assert.equal(items[0].imageUrl, 'https://media.defense.gov/photo.jpg');
});

test('ignores non-image enclosure types', () => {
  const xml = `<rss><channel>
    <item>
      <title>Test</title>
      <link>https://www.marines.mil/</link>
      <guid>https://www.marines.mil/</guid>
      <enclosure url="https://example.com/audio.mp3" type="audio/mpeg" length="0"/>
    </item>
  </channel></rss>`;

  const items = parseRssItems(xml);
  assert.equal(items[0].imageUrl, null);
});

test('falls back to media:content when no enclosure', () => {
  const xml = `<rss xmlns:media="http://search.yahoo.com/mrss/"><channel>
    <item>
      <title>Test</title>
      <link>https://www.marines.mil/</link>
      <guid>https://www.marines.mil/</guid>
      <media:content url="https://cdn.example.com/thumb.jpg" medium="image"/>
    </item>
  </channel></rss>`;

  const items = parseRssItems(xml);
  assert.equal(items[0].imageUrl, 'https://cdn.example.com/thumb.jpg');
});

test('extracts dc:creator as author', () => {
  const xml = `<rss xmlns:dc="http://purl.org/dc/elements/1.1/"><channel>
    <item>
      <title>Test</title>
      <link>https://www.marines.mil/</link>
      <guid>https://www.marines.mil/</guid>
      <dc:creator>Sgt. Jane Smith, USMC</dc:creator>
    </item>
  </channel></rss>`;

  const items = parseRssItems(xml);
  assert.equal(items[0].author, 'Sgt. Jane Smith, USMC');
});

test('returns empty array for feed with no items', () => {
  const xml = `<rss><channel><title>Empty Feed</title></channel></rss>`;
  assert.deepEqual(parseRssItems(xml), []);
});

test('uses guid as fallback when link is missing', () => {
  const xml = `<rss><channel>
    <item>
      <title>Test</title>
      <guid>https://www.marines.mil/guid-only/</guid>
    </item>
  </channel></rss>`;

  const items = parseRssItems(xml);
  assert.equal(items[0].link, 'https://www.marines.mil/guid-only/');
});

// ── normalizeItem ─────────────────────────────────────────────────────────────

const FEED = { id: 'marines-news', source: 'news' as const };

test('normalizeItem extracts category from title colon prefix', () => {
  const raw = {
    title: 'Balikatan 2026: Joint Forces Conduct Drills',
    link: 'https://www.marines.mil/News/Article/1/', guid: 'https://www.marines.mil/News/Article/1/',
    description: '', pubDate: 'Mon, 02 Jun 2026 12:00:00 +0000', category: null, author: null, imageUrl: null,
  };
  const item = normalizeItem(raw, FEED, 0);
  assert.equal(item.category, 'BALIKATAN 2026');
});

test('normalizeItem uses explicit category over title extraction', () => {
  const raw = {
    title: 'Some title: with colon',
    link: 'https://www.marines.mil/News/Article/2/', guid: 'https://www.marines.mil/News/Article/2/',
    description: '', pubDate: null, category: 'Operations', author: null, imageUrl: null,
  };
  const item = normalizeItem(raw, FEED, 0);
  assert.equal(item.category, 'OPERATIONS');
});

test('normalizeItem falls back to current date for invalid pubDate', () => {
  const raw = {
    title: 'Test', link: 'https://www.marines.mil/', guid: 'https://www.marines.mil/',
    description: '', pubDate: 'not-a-date', category: null, author: null, imageUrl: null,
  };
  const item = normalizeItem(raw, FEED, 0);
  const diff = Date.now() - new Date(item.pubDate).getTime();
  assert.ok(diff >= 0 && diff < 5000, 'fallback pubDate should be close to now');
});

test('normalizeItem sets feedId from feed config', () => {
  const raw = {
    title: 'Test', link: 'https://www.marines.mil/', guid: 'https://www.marines.mil/',
    description: '', pubDate: null, category: null, author: null, imageUrl: null,
  };
  const item = normalizeItem(raw, FEED, 0);
  assert.equal(item.feedId, 'marines-news');
  assert.equal(item.source, 'news');
});

markTestFilePass();
