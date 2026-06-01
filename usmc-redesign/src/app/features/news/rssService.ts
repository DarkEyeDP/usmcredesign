import type { NewsArticleBlock, NewsArticleDetail, NewsArticleLink, NewsItem, NewsAttachment } from './types';

// Manually curated attachments keyed by article GUID/URL.
// Add entries here whenever a document link is provided.
const MANUAL_ATTACHMENTS: Record<string, NewsAttachment[]> = {
  'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4483464/department-of-the-navy-releases-fiscal-year-2027-shipbuilding-plan/': [
    {
      label: 'FY2027 Navy Shipbuilding Plan',
      url: 'https://media.defense.gov/2026/May/11/2003928909/-1/-1/1/NAVY%20SHIPBUILDING%20PLAN%20MAY%202026.PDF',
      type: 'pdf',
    },
  ],
  'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4402473/2026-marine-corps-aviation-plan/': [
    {
      label: '2026 Marine Corps Aviation Plan',
      url: 'https://media.defense.gov/2026/Feb/10/2003873872/-1/-1/0/260210-USMC-2026-AVIATION-PLAN.PDF',
      type: 'pdf',
    },
  ],
  'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4402085/marine-corps-passes-fy25-financial-audit/': [
    {
      label: 'FY2025 USMC Annual Financial Report',
      url: 'https://media.defense.gov/2026/Feb/09/2003873501/-1/-1/0/260209_FY2025_USMC_AFR.PDF',
      type: 'pdf',
    },
  ],
  'https://www.marines.mil/News/Press-Releases/Press-Release-Display/Article/4358866/navair-releases-v-22-comprehensive-review-findings/': [
    {
      label: 'V-22 Comprehensive Review',
      url: 'https://www.secnav.navy.mil/foia/readingroom/HotTopics/V-22%20Review/V-22%20Comprehensive%20Review%20(Distro%20A).pdf',
      type: 'pdf',
    },
  ],
};
const NEWS_RSS = 'https://www.marines.mil/DesktopModules/ArticleCS/RSS.ashx?max=50&ContentType=1&Site=481';
const PRESS_RELEASE_RSS = 'https://www.marines.mil/DesktopModules/ArticleCS/RSS.ashx?max=50&ContentType=2&Site=481';
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

function parseXmlText(xml: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror') || doc.querySelectorAll('item').length === 0) {
    throw new Error('XML parse error');
  }
  return doc;
}

function isUsableRssXml(xml: string): boolean {
  try {
    parseXmlText(xml);
    return true;
  } catch {
    return false;
  }
}

async function fetchXml(rssUrl: string): Promise<Document> {
  const xml = await fetchViaProxy(rssUrl, { validate: isUsableRssXml });
  return parseXmlText(xml);
}

function decodeHtml(html: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value.replace(/\xa0/g, ' ');
}

function getEnclosureImage(item: Element): string | null {
  const enc = item.querySelector('enclosure');
  if (enc) {
    const type = enc.getAttribute('type') ?? '';
    if (type.startsWith('image/')) return enc.getAttribute('url');
  }
  return null;
}

function stripHtml(html: string): string {
  return decodeHtml(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractCategory(title: string, rawCategory: string | null): string | null {
  if (rawCategory) return rawCategory.toUpperCase();
  // "Balikatan 2026: Joint Forces..." → "BALIKATAN 2026"
  const colonIdx = title.indexOf(':');
  if (colonIdx > 0 && colonIdx < 45) return title.substring(0, colonIdx).toUpperCase();
  return null;
}

function parseItems(doc: Document, source: 'news' | 'press-release'): NewsItem[] {
  return Array.from(doc.querySelectorAll('item')).map((item, i) => {
    const getText = (tag: string) => item.querySelector(tag)?.textContent?.trim() ?? '';

    const title = stripHtml(getText('title'));
    const link = getText('link') || getText('guid');
    const description = stripHtml(getText('description'));
    const pubDateStr = getText('pubDate');
    const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();
    const rawCategory = getText('category') || null;
    const author = (item.getElementsByTagName('dc:creator')[0]?.textContent?.trim()) || null;
    const imageUrl = getEnclosureImage(item);
    const id = getText('guid') || `${source}-${i}`;
    const category = extractCategory(title, rawCategory);
    const attachments = MANUAL_ATTACHMENTS[id] ?? MANUAL_ATTACHMENTS[link] ?? [];

    return { id, title, link, description, pubDate, imageUrl, author, category, source, attachments };
  });
}

export async function fetchNewsFeed(): Promise<NewsItem[]> {
  const doc = await fetchXml(NEWS_RSS);
  return parseItems(doc, 'news');
}

export async function fetchPressReleaseFeed(): Promise<NewsItem[]> {
  const doc = await fetchXml(PRESS_RELEASE_RSS);
  return parseItems(doc, 'press-release');
}

function getMeta(doc: Document, selector: string): string | null {
  return doc.querySelector<HTMLMetaElement>(selector)?.content?.trim() || null;
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

function shouldSkipReaderLine(line: string): boolean {
  return (
    !line ||
    /^Title:\s/i.test(line) ||
    /^URL Source:\s/i.test(line) ||
    /^Markdown Content:\s*$/i.test(line) ||
    /^Download$/i.test(line) ||
    /^Details$/i.test(line) ||
    /^Share$/i.test(line) ||
    /^Tags$/i.test(line) ||
    /^Photo by\b/i.test(line) ||
    /\bPhoto by\s+[^.]+$/i.test(line)
  );
}

export function parseNewsArticleDetailMarkdown(
  markdown: string,
  fallback?: Pick<NewsItem, 'title' | 'description' | 'pubDate' | 'imageUrl'>,
): NewsArticleDetail {
  const title = markdown.match(/^Title:\s*(.+)$/im)?.[1]?.trim() || fallback?.title || 'Marine Corps News';
  const content = markdown.includes('Markdown Content:')
    ? markdown.split('Markdown Content:').slice(1).join('Markdown Content:')
    : markdown;

  const body = content
    .split(/\n{2,}/)
    .flatMap(rawBlock => {
      const trimmed = rawBlock.trim();
      if (shouldSkipReaderLine(trimmed)) return [];

      const isQuote = trimmed.startsWith('>');
      const text = cleanReaderLine(trimmed.replace(/^>\s*/, ''));
      if (shouldSkipReaderLine(text)) return [];

      return [{
        type: isQuote ? 'quote' as const : 'paragraph' as const,
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
