/**
 * Fetches and parses full article bodies from Jina Reader.
 *
 * Mirrors the markdown parsing logic in rssService.ts (browser version).
 * No DOM APIs — pure string manipulation, safe to run in Node.
 *
 * IMPORTANT: if the parser logic in rssService.ts changes, update this
 * file to match so pre-fetched and live-fetched bodies stay consistent.
 */

const JINA_URL = 'https://r.jina.ai/';
const TIMEOUT_MS = 15_000;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/plain, text/markdown, */*',
  ...(process.env.JINA_API_KEY ? { 'Authorization': `Bearer ${process.env.JINA_API_KEY}` } : {}),
};

// ── Markdown parsing (matches rssService.ts) ─────────────────────────────────

/** @param {string} line */
function shouldSkipLine(line) {
  if (!line || line.length < 3) return true;
  return (
    // Jina metadata
    /^Title:\s/i.test(line) ||
    /^URL Source:\s/i.test(line) ||
    /^Markdown Content:\s*$/i.test(line) ||
    // Generic article chrome
    /^(Print|Download|Details|Share[:\s]?|Tags|More…?)$/i.test(line) ||
    /^Photo by\b/i.test(line) ||
    /\bPhoto by\s+[^.]+$/i.test(line) ||
    // US government site banner (defense.gov, war.gov, etc.)
    /^Skip to main content/i.test(line) ||
    /^An official website of/i.test(line) ||
    /^Here'?s how you know/i.test(line) ||
    /^Official websites use/i.test(line) ||
    /^A\.gov website/i.test(line) ||
    /^Secure \.gov websites/i.test(line) ||
    /^A lock/i.test(line) ||
    // Image / media labels
    /^Image \d+/i.test(line) ||
    /^Download:Full Size/i.test(line) ||
    /^Credit:/i.test(line) ||
    /^VIRIN:/i.test(line) ||
    // Social share chrome
    /^Copy Link\)?$/i.test(line) ||
    /^EmailFacebook/i.test(line) ||
    /^(Email|LinkedIn|WhatsApp|AddToAny)$/i.test(line) ||
    /^(Previous Next Slideshow|Thanks for sharing|Hosted by)/i.test(line) ||
    // Lines that are only markdown links with no visible text: [](url) [](url)
    /^(\[([^\]]*)\]\([^)]+\)\s*)+$/.test(line) ||
    // Unrendered template strings ({{variable}})
    /\{\{[^}]+\}\}/.test(line) ||
    // Slideshow / pagination UI
    /^(Previous|Next)$/i.test(line) ||
    /^\d+(\s+\d+)*$/.test(line) ||
    /^\d+\s+of\s+\d+$/i.test(line) ||
    // DoD interactive / image caption / topic labels
    /^Spotlight:/i.test(line) ||
    /^Experience:/i.test(line) ||
    /^Training Time$/i.test(line) ||
    // Footer section markers (no $ anchor — match prefix, not exact string)
    /^Subscribe to\b/i.test(line) ||
    /^(Related Stories|Load More|Helpful Links|Popular|Legal & Administrative)$/i.test(line) ||
    /^Choose which .+ products you want/i.test(line) ||
    // defense.gov / war.gov navigation menus (appear mid-page in Jina Reader output)
    /^Press Products\b.+\b(Releases|Advisories)/i.test(line) ||
    /^Newsroom\b.+\bNews Stories\b/i.test(line) ||
    /^Multimedia\b.+\bPhoto Collections/i.test(line) ||
    /^Interactive Experiences\b.*Visual Stories/i.test(line) ||
    /^Topics\b.+\bDrone Dominance/i.test(line) ||
    /^Leadership\b.+\bSecretary of (War|Defense)/i.test(line) ||
    /^Components\b.+\b(Army|Marine Corps)\b.+\bNavy\b/i.test(line) ||
    /^Resources\b.+\bExecutive Orders/i.test(line) ||
    /^(Back )?Home\s+Place\s+Holder/i.test(line) ||
    /^(Search\s+){1,2}Search$/i.test(line) ||
    /^Enter Your Search Terms$/i.test(line) ||
    /^Live Events\s+Today in DOW/i.test(line) ||
    /^Resources\s+Careers\s+Help\s+Center/i.test(line)
  );
}

/** @param {string} text */
function stripMarkdownLinks(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_]+/g, '')
    .trim();
}

/** @param {string} line */
function cleanLine(line) {
  return stripMarkdownLinks(line)
    .replace(/^#{1,6}\s+/, '')
    .replace(/^[-*]\s+/, '')
    .replace(/^[A-Za-z0-9 .,'()/-]+ --\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @param {string} line */
function isMarkdownImageBlock(line) {
  return /^!\[[^\]]*\]\([^)]+\)/.test(line.trim());
}

/** @param {string} text */
function isLikelyImageCaption(text) {
  return (
    text.length < 240 &&
    /\([^)]*(?:\/|Photo|AP|Getty|Marine Corps|Army|Navy|Air Force|Coast Guard|Defense Department|DoD|Reuters|U\.S\.)[^)]*\)\.?$/i.test(text)
  );
}

/** @param {string} text */
function isFooterBlock(text) {
  return (
    /^(Related Stories|Subscribe to|Load More|Helpful Links|Popular)$/i.test(text) ||
    /^(Department of (War|Defense)|Hosted by|Veterans Crisis Line)/i.test(text) ||
    /^(Privacy & Security|Legal & Administrative)/i.test(text)
  );
}

/** @param {string} text */
function isDateOrByline(text) {
  return (
    /^\d{1,2}\s+[A-Za-z]{3}/.test(text) ||
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d/i.test(text) ||
    /\|\s*By\s+/i.test(text) ||
    /^By\s+[A-Z]/i.test(text)
  );
}

/**
 * @param {string} markdown
 * @param {string} [itemTitle]  — RSS title used to anchor the article body start
 * @returns {{ title: string, body: Array<{type: string, text: string}>, wordCount: number }}
 */
export function parseMarkdown(markdown, itemTitle) {
  // Extract title, stripping breadcrumb suffixes (defense.gov adds "Title > Section | Site")
  const rawTitle = markdown.match(/^Title:\s*(.+)$/im)?.[1]?.trim() ?? '';
  const title = rawTitle.split(/\s*[>|]\s*/)[0].trim() || itemTitle || '';

  const content = markdown.includes('Markdown Content:')
    ? markdown.split('Markdown Content:').slice(1).join('Markdown Content:')
    : markdown;

  const rawBlocks = content.split(/\n{2,}/);

  // Anchor to the article title to skip pre-article chrome (nav, banners, menus).
  // Pages like defense.gov repeat the title twice — once in a teaser, once in the
  // real article section. We pick the occurrence immediately followed by a byline.
  let startIdx = 0;
  const searchTitle = (itemTitle ?? title).toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 50);
  if (searchTitle.length > 20) {
    const occurrences = rawBlocks.reduce((acc, b, i) => {
      const cleaned = cleanLine(b).toLowerCase().replace(/[^a-z0-9 ]/g, '');
      if (cleaned.slice(0, 70).includes(searchTitle.slice(0, 40))) acc.push(i);
      return acc;
    }, []);

    let titleIdx = -1;
    // Prefer the occurrence followed by a byline within the next 3 blocks
    for (const idx of occurrences) {
      for (let j = idx + 1; j <= idx + 3 && j < rawBlocks.length; j++) {
        const next = cleanLine(rawBlocks[j].trim().replace(/^>\s*/, ''));
        if (/\|\s*By\s+/i.test(next) || /^By\s+/i.test(next) || /\d{1,2}\s+[A-Za-z]{3}.*\|/i.test(next)) {
          titleIdx = idx;
          break;
        }
      }
      if (titleIdx >= 0) break;
    }
    // Fall back to the last occurrence if no byline found
    // Fall back to the first occurrence (original behavior) — safer than last,
    // since the title can appear near the bottom in Related Stories / footer sections.
    if (titleIdx < 0 && occurrences.length > 0) titleIdx = occurrences[0];

    if (titleIdx >= 0) {
      startIdx = titleIdx + 1;
      // Skip the byline/date/social block(s) immediately after the title.
      // Only skip blocks that explicitly match known patterns — don't skip by length alone.
      while (startIdx < rawBlocks.length) {
        const text = cleanLine(rawBlocks[startIdx].trim().replace(/^>\s*/, ''));
        if (shouldSkipLine(text) || isDateOrByline(text)) {
          startIdx++;
        } else {
          break;
        }
      }
    }
  }

  // Once a footer sentinel is hit, cut off all further content.
  const FOOTER_SENTINEL = /^(Related Stories|Subscribe to|Department of (War|Defense)|Home News Spotlights|Privacy & Security|Legal & Administrative|Hosted by|Veterans Crisis Line|Share:?|In Other News|About\s+(?:the\b|[A-Z]))/i;

  let hitFooter = false;
  let previousSkippedImage = startIdx > 0 && isMarkdownImageBlock(rawBlocks[startIdx - 1].trim());
  const body = rawBlocks.slice(startIdx).flatMap(rawBlock => {
    if (hitFooter) return [];
    const trimmed = rawBlock.trim();

    const isQuote = trimmed.startsWith('>');
    const isHeading = /^#{1,6}\s+/.test(trimmed);
    const text = cleanLine(trimmed.replace(/^>\s*/, ''));
    if (FOOTER_SENTINEL.test(trimmed) || FOOTER_SENTINEL.test(text)) { hitFooter = true; return []; }
    if (previousSkippedImage && isLikelyImageCaption(text)) {
      previousSkippedImage = false;
      return [];
    }
    const skipLine = shouldSkipLine(trimmed) || shouldSkipLine(text) || text.length < 4;
    previousSkippedImage = skipLine && isMarkdownImageBlock(trimmed);
    if (skipLine) return [];
    previousSkippedImage = false;

    return [{
      type: isQuote ? 'quote' : isHeading ? 'heading' : 'paragraph',
      text,
    }];
  });

  const wordCount = body.reduce((acc, block) => acc + block.text.split(/\s+/).length, 0);
  return { title, body, wordCount };
}

// ── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Fetch and parse a single article body via Jina Reader.
 *
 * @param {{ id: string, link: string, title?: string, pubDate?: string, imageUrl?: string, description?: string }} item
 * @returns {Promise<{
 *   fetchedAt: string,
 *   title: string | null,
 *   pubDate: string | null,
 *   imageUrl: string | null,
 *   description: string | null,
 *   wordCount: number,
 *   body: Array<{type: string, text: string}>,
 *   links: Array<{label: string, url: string}>,
 * } | null>}   null means the fetch/parse failed
 */
export async function fetchArticleBody(item) {
  try {
    const res = await fetch(`${JINA_URL}${item.link}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const markdown = await res.text();
    const { title, body, wordCount } = parseMarkdown(markdown, item.title);

    const bodyText = body.map(b => b.text).join(' ');
    if (bodyText.length < 240) return null;
    if (/Access Denied|permission to access/i.test(bodyText)) return null;

    return {
      fetchedAt: new Date().toISOString(),
      title: title || item.title || null,
      pubDate: item.pubDate ?? null,
      imageUrl: item.imageUrl ?? null,
      description: item.description ?? null,
      wordCount,
      body,
      links: [],
    };
  } catch {
    return null;
  }
}

const DELAY_MS = 800;

/** @param {number} ms */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Fetch article bodies sequentially with a small delay to avoid rate-limiting.
 * Skips articles whose slug file already exists.
 *
 * @param {Array<object>} items
 * @param {(slug: string) => boolean} exists
 * @param {(slug: string, body: object) => Promise<void>} save
 * @param {{ delayMs?: number }} opts
 */
export async function fetchArticleBodies(items, exists, save, opts = {}) {
  const delayMs = opts.delayMs ?? DELAY_MS;
  const toFetch = items.filter(item => !exists(item._slug));
  const skipped = items.length - toFetch.length;

  if (skipped > 0) process.stdout.write(`  → ${skipped} already cached, fetching ${toFetch.length} new\n`);
  else process.stdout.write(`  → fetching ${toFetch.length} articles\n`);

  let done = 0;
  let failed = 0;

  for (const item of toFetch) {
    const body = await fetchArticleBody(item);
    if (body) {
      await save(item._slug, body);
      done += 1;
    } else {
      failed += 1;
    }
    process.stdout.write(`\r  articles: ${done} saved, ${failed} failed, ${toFetch.length - done - failed} remaining   `);
    if (toFetch.indexOf(item) < toFetch.length - 1) await sleep(delayMs);
  }

  process.stdout.write('\n');
  return { done, failed, skipped };
}
