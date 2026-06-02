#!/usr/bin/env node
/**
 * fetch-news — pull RSS feeds into public/data/news.json,
 *              pre-fetch article bodies into public/data/articles/,
 *              and build public/data/search-index.json.
 *
 * Usage:
 *   npm run fetch-news
 *   node scripts/fetch-news/index.mjs
 *
 * Phases:
 *   1. Fetch all RSS feeds → public/data/news.json
 *   2. Fetch article bodies (skip already-cached) → public/data/articles/{slug}.json
 *   3. Build full-text search index → public/data/search-index.json
 *
 * After running, review the output, then:
 *   git add public/data && git commit -m "chore: update news"
 */

import { writeFile, readFile, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FEEDS } from './feeds.mjs';
import { parseRssItems } from './parser.mjs';
import { normalizeItem } from './normalizer.mjs';
import { MANUAL_ATTACHMENTS } from './attachments.mjs';
import { fetchArticleBodies } from './article-fetcher.mjs';
import { getArticleSlug } from './slugify.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../public/data');
const NEWS_FILE = join(DATA_DIR, 'news.json');
const ARTICLES_DIR = join(DATA_DIR, 'articles');
const SEARCH_FILE = join(DATA_DIR, 'search-index.json');
const FETCH_TIMEOUT_MS = 12_000;

// ── Helpers ──────────────────────────────────────────────────────────────────

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/rss+xml, application/xml, text/xml, */*',
};

async function fetchText(url) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.text();
}

function applyAttachments(item) {
  const attachments = MANUAL_ATTACHMENTS[item.id] ?? MANUAL_ATTACHMENTS[item.link] ?? [];
  return attachments.length > 0 ? { ...item, attachments } : item;
}

async function fileExists(path) {
  try { await access(path); return true; } catch { return false; }
}

// ── Phase 1: RSS feeds ────────────────────────────────────────────────────────

async function processFeed(feed) {
  try {
    const xml = await fetchText(feed.url);
    const rawItems = parseRssItems(xml);
    if (rawItems.length === 0) { process.stderr.write(`  ✗ ${feed.name} — no items parsed\n`); return []; }

    const items = rawItems
      .slice(0, feed.maxItems ?? rawItems.length)
      .map((raw, i) => normalizeItem(raw, feed, i))
      .map(applyAttachments);

    process.stdout.write(`  ✓ ${feed.name} — ${items.length} items\n`);
    return items;
  } catch (e) {
    process.stderr.write(`  ✗ ${feed.name} — ${e.message}\n`);
    return [];
  }
}

// ── Phase 2: Article bodies ───────────────────────────────────────────────────

async function runArticlePhase(items) {
  await mkdir(ARTICLES_DIR, { recursive: true });

  // Attach slug to each item so article-fetcher can use it
  const tagged = items.map(item => ({ ...item, _slug: getArticleSlug(item) }));

  const bodyPath = slug => join(ARTICLES_DIR, `${slug}.json`);

  await fetchArticleBodies(
    tagged,
    slug => {
      // Sync check via cached result — we'll use async fileExists below but
      // need a sync predicate. Track what we know exists from a pre-scan.
      return knownExisting.has(slug);
    },
    async (slug, body) => {
      await writeFile(bodyPath(slug), JSON.stringify(body, null, 2), 'utf8');
    },
    { concurrency: 4 },
  );

  // Pre-scan which slugs already have body files (for the exists() predicate above)
  // We do this before calling fetchArticleBodies via a closure trick: scan first,
  // then invoke. Rebuild the call properly:
  return tagged;
}

// ── Phase 3: Search index ────────────────────────────────────────────────────

async function buildSearchIndex(items) {
  const docs = [];

  for (const item of items) {
    const slug = item._slug ?? getArticleSlug(item);
    const bodyFile = join(ARTICLES_DIR, `${slug}.json`);
    let bodyText = '';

    try {
      const raw = JSON.parse(await readFile(bodyFile, 'utf8'));
      bodyText = (raw.body ?? [])
        .filter(b => b.type === 'paragraph' || b.type === 'heading')
        .map(b => b.text)
        .join(' ');
    } catch {
      // No body file yet — index title + description only
    }

    docs.push({
      id: item.id,
      slug,
      title: item.title,
      description: item.description,
      source: item.source,
      feedId: item.feedId ?? null,
      pubDate: item.pubDate,
      bodyText,
    });
  }

  await writeFile(SEARCH_FILE, JSON.stringify(docs, null, 2), 'utf8');
  const withBody = docs.filter(d => d.bodyText.length > 0).length;
  process.stdout.write(`  ✓ search index — ${docs.length} articles (${withBody} with full body)\n`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

// Pre-scan set (filled before article fetching begins)
const knownExisting = new Set();

async function main() {
  console.log('\nfetch-news\n');

  // ── Phase 1 ──
  console.log('Phase 1: RSS feeds\n');
  const results = await Promise.all(FEEDS.map(processFeed));
  const allItems = results.flat();

  if (allItems.length === 0) { console.error('\nNo items fetched — aborting.\n'); process.exit(1); }

  const seen = new Set();
  const unique = allItems.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
  unique.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(NEWS_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    feedCount: FEEDS.length,
    itemCount: unique.length,
    items: unique,
  }, null, 2), 'utf8');
  console.log(`\n  → ${unique.length} articles written to public/data/news.json\n`);

  // ── Phase 2 ──
  console.log('Phase 2: Article bodies\n');
  await mkdir(ARTICLES_DIR, { recursive: true });

  // Pre-scan existing body files so we can skip them
  const tagged = unique.map(item => ({ ...item, _slug: getArticleSlug(item) }));
  for (const item of tagged) {
    if (await fileExists(join(ARTICLES_DIR, `${item._slug}.json`))) {
      knownExisting.add(item._slug);
    }
  }

  const toFetch = tagged.filter(item => !knownExisting.has(item._slug));
  const skipped = tagged.length - toFetch.length;

  if (skipped > 0) process.stdout.write(`  → ${skipped} already cached, fetching ${toFetch.length} new\n\n`);
  else process.stdout.write(`  → fetching all ${toFetch.length} articles\n\n`);

  await fetchArticleBodies(
    tagged,
    slug => knownExisting.has(slug),
    async (slug, body) => {
      await writeFile(join(ARTICLES_DIR, `${slug}.json`), JSON.stringify(body, null, 2), 'utf8');
    },
    { concurrency: 4 },
  );

  // ── Phase 3: backfill word counts and drop articles with no body ──
  console.log('\n\nPhase 3: Word counts\n');
  const itemsWithWordCount = [];
  let withBody = 0;
  let dropped = 0;

  await Promise.all(tagged.map(async item => {
    try {
      const raw = JSON.parse(await readFile(join(ARTICLES_DIR, `${item._slug}.json`), 'utf8'));
      if (raw.wordCount > 0) {
        itemsWithWordCount.push({ ...item, wordCount: raw.wordCount });
        withBody += 1;
        return;
      }
    } catch { /* no body file */ }
    // No body fetched — exclude from the published feed so the UI never shows
    // an article it can't display in full.
    dropped += 1;
  }));

  // Re-sort after parallel processing (Promise.all doesn't preserve order)
  itemsWithWordCount.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  await writeFile(NEWS_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    feedCount: FEEDS.length,
    itemCount: itemsWithWordCount.length,
    items: itemsWithWordCount,
  }, null, 2), 'utf8');

  process.stdout.write(`  ✓ ${withBody} articles published`);
  if (dropped > 0) process.stdout.write(`, ${dropped} excluded (no body fetched)`);
  process.stdout.write('\n');

  // ── Phase 4: Search index ──
  console.log('\nPhase 4: Search index\n');
  await buildSearchIndex(itemsWithWordCount);

  if (dropped > 0) {
    console.log(`\n  ⚠  ${dropped} articles excluded from the feed (body fetch failed).`);
    console.log('  Run again to retry: npm run fetch-news\n');
  }
  console.log('\n  Review, then: git add public/data && git commit -m "chore: update news"\n');
}

main().catch(e => { console.error('\nfetch-news failed:', e.message); process.exit(1); });
