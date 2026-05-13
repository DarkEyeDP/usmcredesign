import type { NewsItem, NewsAttachment } from './types';

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

// Each entry is [proxyUrl, isJsonWrapper] — json wrappers return { contents: "..." }
const PROXIES: [string, boolean][] = [
  ['https://api.allorigins.win/get?url=', true],
  ['https://corsproxy.io/?url=', false],
  ['https://api.codetabs.com/v1/proxy?quest=', false],
];

async function tryProxy(proxyUrl: string, isJson: boolean, rssUrl: string): Promise<Document> {
  const res = await fetch(`${proxyUrl}${encodeURIComponent(rssUrl)}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = isJson ? (await res.json() as { contents: string }).contents : await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror')) throw new Error('XML parse error');
  return doc;
}

async function fetchXml(rssUrl: string): Promise<Document> {
  let lastErr: unknown;
  for (const [proxy, isJson] of PROXIES) {
    try {
      return await tryProxy(proxy, isJson, rssUrl);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
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
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
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
