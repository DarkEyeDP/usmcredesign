import type { NewsArticleBlock, NewsArticleDetail, NewsArticleLink, NewsItem } from './types';

const JINA_READER_URL = 'https://r.jina.ai/';

// Each entry is [proxyUrl, isJsonWrapper] — json wrappers return { contents: "..." }
const PROXIES: [string, boolean][] = [
  ['https://api.allorigins.win/get?url=', true],
  ['https://api.allorigins.win/raw?url=', false],
  ['https://corsproxy.io/?url=', false],
  ['https://api.codetabs.com/v1/proxy?quest=', false],
];

interface ProxyFetchOptions {
  timeoutMs?: number;
  validate?: (text: string) => boolean;
}

async function tryProxy(proxyUrl: string, isJson: boolean, url: string, timeoutMs = 8000): Promise<string> {
  const res = await fetch(`${proxyUrl}${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!isJson) return res.text();

  const payload = await res.json() as { contents?: unknown };
  if (typeof payload.contents !== 'string') throw new Error('Proxy returned malformed JSON');
  return payload.contents;
}

function raceProxies(url: string, options: ProxyFetchOptions): Promise<string> {
  const errors: string[] = [];

  return new Promise((resolve, reject) => {
    let settled = false;
    let pending = PROXIES.length;

    PROXIES.forEach(([proxy, isJson]) => {
      tryProxy(proxy, isJson, url, options.timeoutMs)
        .then(text => {
          if (settled) return;
          if (options.validate && !options.validate(text)) {
            throw new Error('Proxy returned an unusable response');
          }

          settled = true;
          resolve(text);
        })
        .catch(err => {
          if (settled) return;

          errors.push(err instanceof Error ? err.message : String(err));
          pending -= 1;

          if (pending === 0) {
            reject(new Error(`All proxies failed: ${errors.join('; ')}`));
          }
        });
    });
  });
}

async function fetchViaProxy(url: string, options: ProxyFetchOptions = {}): Promise<string> {
  try {
    return await raceProxies(url, options);
  } catch {
    // All proxies failed — wait briefly and retry once (handles transient rate-limiting)
    await new Promise(resolve => setTimeout(resolve, 2500));
    return raceProxies(url, options);
  }
}

function decodeHtml(html: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value.replace(/\xa0/g, ' ');
}

function normalizeArticleLine(line: string): string {
  return line.replace(/\s+/g, ' ').trim();
}

function normalizeForCompare(text: string): string {
  return normalizeArticleLine(text).toLowerCase();
}

function isArticleDateLine(line: string): boolean {
  return (
    /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$/.test(line) ||
    /^[A-Za-z]{3,9}\s+\d{1,2},\s*\d{4}$/.test(line) ||
    /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(line)
  );
}

function isFooterStart(line: string): boolean {
  return /^(Marine Corps|About|Connect|Links)$/i.test(line) || /^(Hosted by|Veterans Crisis Line)/i.test(line);
}

function isArticleChrome(line: string): boolean {
  return /^(Print|Share|Download|Details|Photo Information|Image Details|More Media|Tags)$/i.test(line);
}

function textFromElement(el: Element): string {
  let html = el.innerHTML;
  html = html.replace(/<br\s*\/?>/gi, '\n');
  html = html.replace(/<h[1-6][^>]*>/gi, '\n<<HEADING>>');
  html = html.replace(/<\/h[1-6]>/gi, '\n');
  html = html.replace(/<blockquote[^>]*>/gi, '\n<<QUOTE>>');
  html = html.replace(/<\/blockquote>/gi, '\n');
  html = html.replace(/<li[^>]*>/gi, '\n');
  html = html.replace(/<\/(p|div|section|article|li|figcaption|tr)>/gi, '\n');
  html = html.replace(/<[^>]+>/g, ' ');
  return decodeHtml(html)
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(normalizeArticleLine)
    .filter(Boolean)
    .join('\n');
}

function cloneArticleBody(doc: Document): Element | null {
  const source =
    doc.querySelector('[itemprop="articleBody"] .body-text') ??
    doc.querySelector('[itemprop="articleBody"]') ??
    doc.querySelector('.body-text');

  if (!source) return null;

  const clone = source.cloneNode(true) as Element;
  clone
    .querySelectorAll(
      [
        'script',
        'style',
        '.task-bar',
        '.tags-section',
        '.ast-parallax',
        '.aparallax',
        '.pimage',
        '.pinfo',
        '.plinks',
        '.download-link',
        '.details-link',
        '.share-link',
      ].join(','),
    )
    .forEach(el => el.remove());

  return clone;
}

function parseDedicatedArticleBody(doc: Document): { el: Element; lines: string[] } | null {
  const body = cloneArticleBody(doc);
  if (!body) return null;

  const lines = textFromElement(body)
    .split('\n')
    .map(line => line.replace(/^[A-Za-z0-9 .,'()/-]+ --\s*/, '').trim())
    .filter(line => line && !isArticleChrome(line));

  return lines.length > 0 ? { el: body, lines } : null;
}

function trimToArticleLines(lines: string[], fallbackTitle: string | null): string[] {
  const titleNeedle = fallbackTitle ? normalizeForCompare(fallbackTitle) : '';
  const titleIdx = titleNeedle
    ? lines.findIndex(line => normalizeForCompare(line) === titleNeedle)
    : -1;
  const searchStart = titleIdx >= 0 ? titleIdx : 0;
  const shareIdx = lines.findIndex((line, index) => index >= searchStart && /^share$/i.test(line));
  const dateIdx = lines.findIndex((line, index) => index >= searchStart && isArticleDateLine(line));

  let start = 0;
  if (shareIdx >= 0) start = shareIdx + 1;
  else if (dateIdx >= 0) start = dateIdx + 1;
  else if (titleIdx >= 0) start = titleIdx + 1;

  while (start < lines.length && isArticleChrome(lines[start])) start += 1;

  let end = lines.length;
  for (let i = Math.max(start + 2, 0); i < lines.length; i += 1) {
    if (isFooterStart(lines[i])) {
      end = i;
      break;
    }
  }

  return lines.slice(start, end).filter(line => !isArticleChrome(line));
}

function lineToBlock(line: string): NewsArticleBlock | null {
  const text = line.replace(/^<<(HEADING|QUOTE)>>/, '').trim();
  if (!text) return null;
  if (line.startsWith('<<HEADING>>')) return { type: 'heading', text };
  if (line.startsWith('<<QUOTE>>')) return { type: 'quote', text };
  return { type: 'paragraph', text };
}

function absoluteUrl(url: string, sourceUrl: string): string {
  try {
    return new URL(url, sourceUrl).toString();
  } catch {
    return url;
  }
}

function collectArticleLinks(candidate: Element, sourceUrl: string, bodyLines: string[]): NewsArticleLink[] {
  const bodyText = bodyLines.join(' ').toLowerCase();
  const seen = new Set<string>();
  const skipLabels = /^(home|news|press releases|press release display|news display|print|share|about|connect|links|privacy policy|site map|foia|usa\.gov|accessibility|rss feeds)$/i;

  return Array.from(candidate.querySelectorAll<HTMLAnchorElement>('a[href]')).flatMap(anchor => {
    const label = normalizeArticleLine(anchor.textContent ?? '');
    const href = absoluteUrl(anchor.getAttribute('href') ?? '', sourceUrl);
    if (!label || label.length > 80 || skipLabels.test(label) || seen.has(href)) return [];
    if (!bodyText.includes(label.toLowerCase())) return [];
    if (href === sourceUrl || href.startsWith('javascript:') || href.startsWith('mailto:')) return [];

    const looksDocument = /\.(pdf|docx?|xlsx?|pptx?)(?:$|\?)/i.test(href) || href.includes('media.defense.gov');
    if (!looksDocument && label.length < 4) return [];

    seen.add(href);
    return [{ label, url: href }];
  });
}

function htmlLooksBlocked(html: string): boolean {
  return (
    /<title>\s*Access Denied\s*<\/title>/i.test(html) ||
    /\bAccess Denied\b/i.test(html) && /You don't have permission to access/i.test(html) ||
    /errors\.edgesuite\.net/i.test(html)
  );
}

function detailLooksUsable(detail: NewsArticleDetail, fallback?: Pick<NewsItem, 'description'>): boolean {
  const bodyText = detail.body.map(block => block.text).join(' ').trim();
  if (bodyText.length < 240) return false;
  if (/Access Denied|permission to access|errors\.edgesuite\.net/i.test(bodyText)) return false;

  const summary = fallback?.description?.replace(/\s+/g, ' ').trim() ?? '';
  return !summary || bodyText.length > summary.length + 120;
}

function getMeta(doc: Document, selector: string): string | null {
  return doc.querySelector<HTMLMetaElement>(selector)?.content?.trim() || null;
}

function chooseArticleCandidate(doc: Document, fallbackTitle: string | null): { el: Element; lines: string[] } {
  const dedicatedBody = parseDedicatedArticleBody(doc);
  if (dedicatedBody && dedicatedBody.lines.join(' ').length > 180) {
    return dedicatedBody;
  }

  const candidates = [
    ...Array.from(doc.querySelectorAll('article,[class*="article"],[class*="Article"],[id*="article"],[id*="Article"],[class*="body"],[id*="body"],[class*="content"],[id*="content"]')),
    doc.querySelector('main'),
    doc.body,
  ].filter((el): el is Element => Boolean(el));

  let best = { el: doc.body, lines: trimToArticleLines(textFromElement(doc.body).split('\n'), fallbackTitle) };
  let bestScore = best.lines.join(' ').length;

  for (const el of candidates) {
    const lines = trimToArticleLines(textFromElement(el).split('\n'), fallbackTitle);
    const bodyLength = lines.join(' ').length;
    const hasTitle = fallbackTitle && textFromElement(el).toLowerCase().includes(fallbackTitle.toLowerCase());
    const score = bodyLength + (hasTitle ? 500 : 0);
    if (lines.length >= 1 && score > bestScore) {
      best = { el, lines };
      bestScore = score;
    }
  }

  return best;
}

function stripMarkdownLinks(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_]+/g, '')
    .trim();
}

function cleanReaderLine(line: string): string {
  return stripMarkdownLinks(line)
    .replace(/^#{1,6}\s+/, '')
    .replace(/^[-*]\s+/, '')
    .replace(/^[A-Za-z0-9 .,'()/-]+ --\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMarkdownImageBlock(line: string): boolean {
  return /^!\[[^\]]*\]\([^)]+\)/.test(line.trim());
}

function isLikelyImageCaption(text: string): boolean {
  return (
    text.length < 240 &&
    /\([^)]*(?:\/|Photo|AP|Getty|Marine Corps|Army|Navy|Air Force|Coast Guard|Defense Department|DoD|Reuters|U\.S\.)[^)]*\)\.?$/i.test(text)
  );
}

function shouldSkipReaderLine(line: string): boolean {
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
    // US government site banner
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
    // Lines that are only markdown links with no visible text
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

export function parseNewsArticleDetailMarkdown(
  markdown: string,
  fallback?: Pick<NewsItem, 'title' | 'description' | 'pubDate' | 'imageUrl'>,
): NewsArticleDetail {
  // Strip breadcrumb suffixes added by sites like defense.gov:
  // "Article Title > Section > Site Name | Site" → "Article Title"
  const rawTitle = markdown.match(/^Title:\s*(.+)$/im)?.[1]?.trim() ?? '';
  const title = rawTitle.split(/\s*[>|]\s*/)[0].trim() || fallback?.title || 'Marine Corps News';

  const content = markdown.includes('Markdown Content:')
    ? markdown.split('Markdown Content:').slice(1).join('Markdown Content:')
    : markdown;

  const rawBlocks = content.split(/\n{2,}/);

  // Anchor to the article title to skip pre-article chrome (nav, banners, menus).
  // Pages like defense.gov repeat the title twice — pick the one with a byline after it.
  let startIdx = 0;
  const itemTitle = fallback?.title ?? title;
  const searchTitle = itemTitle.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 50);
  if (searchTitle.length > 20) {
    const occurrences = rawBlocks.reduce<number[]>((acc, b, i) => {
      const cleaned = cleanReaderLine(b).toLowerCase().replace(/[^a-z0-9 ]/g, '');
      if (cleaned.slice(0, 70).includes(searchTitle.slice(0, 40))) acc.push(i);
      return acc;
    }, []);

    let titleIdx = -1;
    for (const idx of occurrences) {
      for (let j = idx + 1; j <= idx + 3 && j < rawBlocks.length; j++) {
        const next = cleanReaderLine(rawBlocks[j].trim().replace(/^>\s*/, ''));
        if (/\|\s*By\s+/i.test(next) || /^By\s+/i.test(next) || /\d{1,2}\s+[A-Za-z]{3}.*\|/i.test(next)) {
          titleIdx = idx;
          break;
        }
      }
      if (titleIdx >= 0) break;
    }
    if (titleIdx < 0 && occurrences.length > 0) titleIdx = occurrences[0];

    if (titleIdx >= 0) {
      startIdx = titleIdx + 1;
      while (startIdx < rawBlocks.length) {
        const text = cleanReaderLine(rawBlocks[startIdx].trim().replace(/^>\s*/, ''));
        const isDateOrByline =
          /^\d{1,2}\s+[A-Za-z]{3}/.test(text) ||
          /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d/i.test(text) ||
          /\|\s*By\s+/i.test(text);
        if (shouldSkipReaderLine(text) || isDateOrByline) {
          startIdx++;
        } else {
          break;
        }
      }
    }
  }

  const FOOTER_SENTINEL = /^(Related Stories|Subscribe to|Department of (War|Defense)|Home News Spotlights|Privacy & Security|Legal & Administrative|Hosted by|Veterans Crisis Line|Share:?|In Other News|About\s+(?:the\b|[A-Z]))/i;
  let hitFooter = false;
  let previousSkippedImage = startIdx > 0 && isMarkdownImageBlock(rawBlocks[startIdx - 1].trim());
  const body = rawBlocks.slice(startIdx).flatMap(rawBlock => {
    if (hitFooter) return [];
    const trimmed = rawBlock.trim();

    const isQuote = trimmed.startsWith('>');
    const isHeading = /^#{1,6}\s+/.test(trimmed);
    const text = cleanReaderLine(trimmed.replace(/^>\s*/, ''));
    if (FOOTER_SENTINEL.test(trimmed) || FOOTER_SENTINEL.test(text)) { hitFooter = true; return []; }
    if (previousSkippedImage && isLikelyImageCaption(text)) {
      previousSkippedImage = false;
      return [];
    }
    const skipLine = shouldSkipReaderLine(trimmed) || shouldSkipReaderLine(text) || text.length < 10;
    previousSkippedImage = skipLine && isMarkdownImageBlock(trimmed);
    if (skipLine) return [];
    previousSkippedImage = false;

    return [{
      type: isQuote ? 'quote' as const : isHeading ? 'heading' as const : 'paragraph' as const,
      text,
    }];
  });

  return {
    title,
    pubDate: fallback?.pubDate ?? null,
    body,
    links: [],
    imageUrl: fallback?.imageUrl ?? null,
    description: fallback?.description ?? null,
  };
}

export function parseNewsArticleDetailHtml(
  html: string,
  sourceUrl: string,
  fallback?: Pick<NewsItem, 'title' | 'description' | 'pubDate' | 'imageUrl'>,
): NewsArticleDetail {
  if (htmlLooksBlocked(html)) {
    throw new Error('Article source returned an access denied page');
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,svg,noscript,header,footer,nav,form').forEach(el => el.remove());

  const metaTitle = getMeta(doc, 'meta[property="og:title"]') ?? doc.querySelector('title')?.textContent?.trim() ?? null;
  const title = fallback?.title ?? metaTitle?.replace(/\s+>\s+.*$/, '').trim() ?? 'Marine Corps News';
  const metaDescription = getMeta(doc, 'meta[property="og:description"]') ?? getMeta(doc, 'meta[name="description"]');
  const metaImage = getMeta(doc, 'meta[property="og:image"]');
  const candidate = chooseArticleCandidate(doc, title);
  const body = candidate.lines.flatMap(line => {
    const block = lineToBlock(line);
    return block ? [block] : [];
  });
  const pubDateLine = candidate.lines.find(isArticleDateLine);
  const pubDate = fallback?.pubDate ?? (pubDateLine ? new Date(pubDateLine) : null);

  return {
    title,
    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : null,
    body,
    links: collectArticleLinks(candidate.el, sourceUrl, candidate.lines),
    imageUrl: fallback?.imageUrl ?? (metaImage ? absoluteUrl(metaImage, sourceUrl) : null),
    description: fallback?.description ?? metaDescription,
  };
}

export async function fetchNewsArticleDetail(item: NewsItem): Promise<NewsArticleDetail> {
  try {
    const res = await fetch(`${JINA_READER_URL}${item.link}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const markdown = await res.text();
    const detail = parseNewsArticleDetailMarkdown(markdown, item);
    if (detailLooksUsable(detail, item)) return detail;
  } catch {
    // Fall through to the HTML proxy path.
  }

  const html = await fetchViaProxy(item.link, {
    timeoutMs: 10000,
    validate: text => text.trim().length > 0 && !htmlLooksBlocked(text),
  });
  const detail = parseNewsArticleDetailHtml(html, item.link, item);
  if (!detailLooksUsable(detail, item)) {
    throw new Error('Article source did not include a usable full body');
  }
  return detail;
}
