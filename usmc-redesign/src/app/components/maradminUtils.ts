import { parseRecognizedTableFamily } from './maradminTableParsers';

export interface RSSMessage {
  id: string;
  number: string;
  subject: string;
  date: string;
  displayDate: string;
  month: string;
  source: string;
  link: string;
  unread: boolean;
  isNew: boolean;
  saved: boolean;
  archived: boolean;
  tags: string[];
}

export interface DetectedTable {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface ContentSubSection {
  label: string;
  body: string;
  tables?: DetectedTable[];
  children?: ContentSubSection[];
}

export interface ContentSection {
  heading: string;
  body: string;
  bullets?: ContentSubSection[];
  tables?: DetectedTable[];
}

export type FetchMethod = 'direct' | 'proxy' | null;

const RSS_URL =
  'https://www.marines.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=6&Site=481&max=50&category=14336';
const ARCHIVE_URL = 'https://www.marines.mil/News/Messages/MARADMINS/';
const PROXY_URL = 'https://api.allorigins.win/get?url=';
const RSS_FETCH_TIMEOUT_MS = 15000;
const ARCHIVE_PAGE_SIZE = 25;

const SHORT_MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const LONG_MON  = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

// ── RSS Feed ────────────────────────────────────────────────────────────────

export async function fetchRSSFeed(): Promise<RSSMessage[]> {
  const res = await fetchTextWithTimeout(`${RSS_URL}&_=${Date.now()}`);
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  return Array.from(doc.getElementsByTagName('item')).map((item, i) => {
    const title   = xmlText(item, 'title');
    const link    = xmlText(item, 'link') || xmlText(item, 'guid');
    const pubDate = xmlText(item, 'pubDate');
    const desc    = xmlText(item, 'description');

    const number = (desc.match(/MARADMIN\s+(\d+\/\d+)/) ?? [])[1] ?? '';

    const d   = new Date(pubDate);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const displayDate = `${day} ${SHORT_MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    const month       = `${LONG_MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

    return {
      id: String(i),
      number,
      subject: title,
      date: displayDate,
      displayDate,
      month,
      source: 'HQMC',
      link,
      unread: true,
      isNew: false,
      saved: false,
      archived: false,
      tags: tagsFrom(title),
    };
  });
}

export interface ArchivePageResult {
  messages: RSSMessage[];
  nextPage: number;
  hasMore: boolean;
}

export async function fetchMARADMINArchivePage(page: number): Promise<ArchivePageResult> {
  const url = buildArchivePageURL(page);

  try {
    const res = await fetchTextWithTimeout(url);
    if (res.ok) {
      const html = await res.text();
      const parsed = parseArchivePageHTML(html, page);
      return {
        ...parsed,
        nextPage: page + 1,
      };
    }
  } catch {
    // Fall through to the proxy request.
  }

  const proxyRes = await fetchTextWithTimeout(`${PROXY_URL}${encodeURIComponent(url)}`);
  if (!proxyRes.ok) throw new Error(`Archive fetch failed: ${proxyRes.status}`);

  const { contents } = (await proxyRes.json()) as { contents?: string };
  const parsed = parseArchivePageHTML(contents ?? '', page);
  return {
    ...parsed,
    nextPage: page + 1,
  };
}

export function parseArchivePageHTML(html: string, page: number): { messages: RSSMessage[]; hasMore: boolean } {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const messageAnchors = Array.from(
    doc.querySelectorAll<HTMLAnchorElement>('a[href*="/News/Messages/Messages-Display/Article/"]'),
  );
  const hrefByText = new Map<string, string>();
  messageAnchors.forEach(anchor => {
    const href = anchor.getAttribute('href');
    const text = flatLine(anchor.textContent ?? '');
    if (!href || !text) return;
    hrefByText.set(text, new URL(href, ARCHIVE_URL).toString());
  });

  const lines = (doc.body?.textContent ?? '')
    .split('\n')
    .map(line => flatLine(line))
    .filter(Boolean);

  const startIndex = lines.findIndex(line => line === 'Status');
  const endIndex = lines.findIndex((line, index) => index > startIndex && line === 'Load More');
  const sectionLines = lines.slice(startIndex >= 0 ? startIndex + 1 : 0, endIndex >= 0 ? endIndex : lines.length);
  const messages = parseArchivePageRows(sectionLines, hrefByText, page);

  const nextPagePattern = new RegExp(`(?:\\?|&)Page=${page + 1}(?:&|$)`, 'i');
  const hasMore = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href]')).some(anchor => {
    const href = anchor.getAttribute('href') ?? '';
    return nextPagePattern.test(href);
  }) || messages.length >= ARCHIVE_PAGE_SIZE;

  return { messages, hasMore };
}

export function parseArchivePageRows(
  sectionLines: string[],
  hrefByText: Map<string, string>,
  page: number,
): RSSMessage[] {
  const messages: RSSMessage[] = [];
  let i = 0;

  while (i < sectionLines.length) {
    const number = sectionLines[i];
    if (!/^\d+\/\d+$/.test(number)) {
      i += 1;
      continue;
    }

    let j = i + 1;
    const titleParts: string[] = [];
    while (j < sectionLines.length && !isArchiveDateLine(sectionLines[j])) {
      if (/^\d+\/\d+$/.test(sectionLines[j])) break;
      titleParts.push(sectionLines[j]);
      j += 1;
    }

    const dateLine = sectionLines[j];
    const statusLine = sectionLines[j + 1];
    if (!dateLine || !isArchiveDateLine(dateLine) || !statusLine || !isArchiveStatusLine(statusLine)) {
      i += 1;
      continue;
    }

    const subject = titleParts.join(' ').trim();
    const dateInfo = extractArchiveDate(dateLine);
    const displayDate = dateInfo ? formatDisplayDate(dateInfo) : '';
    const month = dateInfo ? `${LONG_MON[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}` : '';
    const link = hrefByText.get(number) ?? hrefByText.get(subject) ?? '';

    messages.push({
      id: `archive-${page}-${messages.length}`,
      number,
      subject,
      date: displayDate,
      displayDate,
      month,
      source: 'HQMC',
      link,
      unread: true,
      isNew: false,
      saved: false,
      archived: false,
      tags: tagsFrom(subject),
    });

    i = j + 2;
  }

  return messages;
}

function xmlText(el: Element, tag: string): string {
  return el.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
}

// ── Article Content Fetch (direct → CORS proxy → null) ─────────────────────

export async function fetchArticleContent(
  url: string,
): Promise<{ text: string; method: FetchMethod }> {
  // Attempt 1: direct browser fetch (works if server allows CORS)
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const text = extractTextFromHTML(await res.text());
      if (text) return { text, method: 'direct' };
    }
  } catch { /* CORS or network error — fall through */ }

  // Attempt 2: allorigins.win CORS proxy
  try {
    const res = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);
    if (res.ok) {
      const { contents } = (await res.json()) as { contents?: string };
      const text = extractTextFromHTML(contents ?? '');
      if (text) return { text, method: 'proxy' };
    }
  } catch { /* proxy failed — fall through */ }

  return { text: '', method: null };
}

function buildArchivePageURL(page: number): string {
  const url = new URL(ARCHIVE_URL);
  url.searchParams.set('Page', String(page));
  return url.toString();
}

async function fetchTextWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), RSS_FETCH_TIMEOUT_MS);

  return fetch(url, {
    cache: 'no-store',
    signal: controller.signal,
  }).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function extractArchiveDate(text: string): Date | null {
  const numeric = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (numeric) {
    const month = Number(numeric[1]) - 1;
    const day = Number(numeric[2]);
    const year = Number(numeric[3]);
    return new Date(Date.UTC(year, month, day));
  }

  const named = text.match(/\b([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\b/);
  if (named) {
    const month = new Date(`${named[1]} 1, 2000`).getMonth();
    if (!Number.isNaN(month)) {
      return new Date(Date.UTC(Number(named[3]), month, Number(named[2])));
    }
  }

  return null;
}

function isArchiveDateLine(text: string): boolean {
  return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text) || /^[A-Za-z]+\s+\d{1,2},\s*\d{4}$/.test(text);
}

function isArchiveStatusLine(text: string): boolean {
  return /^(Active|Cancelled|Cancellation Notice)$/i.test(text);
}

function formatDisplayDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day} ${SHORT_MON[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function extractMARADMINSource(raw: string): string | null {
  const releaseMatch = flatLine(raw).match(/release authorized by\s+(.+?)(?:\/\/|$)/i);
  if (!releaseMatch) return null;

  const releaseText = releaseMatch[1].replace(/[./\s]+$/, '').trim();
  if (!releaseText) return null;

  const parts = releaseText.split(',').map(part => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 1];
  }

  return releaseText;
}

// DTG pattern: "R 291826Z APR 26" — the first line of every MARADMIN.
// Starting from the DTG skips DNN page wrappers that label the message
// field with their own index numbers (e.g. "1. Message. RMKS/1. Purpose...").
const DTG_RE = /\bR \d{6}Z\b/;

function extractTextFromHTML(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,nav,header,footer').forEach(el => el.remove());

  const MARADMIN_RE = /MARADMIN\s+\d+\/\d+/;

  // Try progressively broader container selectors
  const candidates: (Element | null)[] = [
    ...Array.from(
      doc.querySelectorAll('[class*="article"],[class*="Article"],[class*="content"],[class*="body"],[class*="message"],[class*="text"]'),
    ),
    doc.querySelector('main'),
    doc.querySelector('#main'),
    doc.body,
  ];

  for (const el of candidates) {
    if (!el) continue;
    const raw = htmlToPlainText(el);
    const marked = detectAndMarkTables(raw);
    const text = normalizeWhitespace(marked);
    if (!MARADMIN_RE.test(text)) continue;

    // Trim to the DTG line so page-level wrapper labels are excluded
    const dtgIdx = text.search(DTG_RE);
    return dtgIdx >= 0 ? text.slice(dtgIdx) : text;
  }

  return '';
}

// Convert an element's HTML to plain text, preserving block/br structure as newlines.
// Using textContent alone loses <br> line breaks which the MARADMIN parser depends on.
function htmlToPlainText(el: Element): string {
  let html = el.innerHTML;
  // Block-level closers and <br> → newline
  html = html.replace(/<br\s*\/?>/gi, '\n');
  // Table cells get a tab separator so column detection works on HTML tables too
  html = html.replace(/<\/(td|th)>/gi, '\t');
  html = html.replace(/<\/(p|div|li|tr|h[1-6]|pre|blockquote)>/gi, '\n');
  // Strip remaining tags
  html = html.replace(/<[^>]+>/g, '');
  // Decode HTML entities via a throwaway element.
  // Replace &nbsp; (\xa0) with regular space — marines.mil uses &nbsp; between
  // paragraphs, and \xa0 is not matched by [ \t]+ in normalizeWhitespace or
  // by the paragraph regex, causing all paragraph detection to silently fail.
  const tmp = document.createElement('textarea');
  tmp.innerHTML = html;
  return tmp.value.replace(/\xa0/g, ' ');
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Table detection ─────────────────────────────────────────────────────────
// Plain ASCII delimiters — no control chars so nothing can strip them.
const T_START  = '<<TBLSTART>>';
const T_COL    = '<<C>>';
const T_ROW    = '<<R>>';
const T_END    = '<<TBLEND>>';
const T_HEADER = '<<H>>';

function splitColumnar(line: string): string[] {
  // Split on 2+ spaces OR tabs (HTML table cell separators)
  return line.trim().split(/\t+|\s{2,}/).map(s => s.trim()).filter(Boolean);
}

function looksTabular(line: string): boolean {
  const cols = splitColumnar(line);
  return cols.length >= 2 && cols.every(c => c.length < 50);
}

function detectAndMarkTables(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    if (looksTabular(lines[i])) {
      const tableLines: string[] = [lines[i]];
      let j = i + 1;
      while (j < lines.length && looksTabular(lines[j])) {
        tableLines.push(lines[j]);
        j++;
      }

      if (tableLines.length >= 2) {
        const rows = tableLines.map(splitColumnar);
        const colCounts = rows.map(r => r.length);
        const maxCols = Math.max(...colCounts);
        const minCols = Math.min(...colCounts);

        if (maxCols >= 2 && maxCols - minCols <= 1) {
          const hasHeader =
            !rows[0].some(c => /^\d/.test(c)) &&
            rows.slice(1).some(r => r.some(c => /^\d/.test(c)));

          const headerPart = hasHeader ? T_HEADER + rows[0].join(T_COL) + T_ROW : '';
          const dataRows   = hasHeader ? rows.slice(1) : rows;
          const dataPart   = dataRows.map(r => r.join(T_COL)).join(T_ROW);

          result.push(T_START + headerPart + dataPart + T_END);
          i = j;
          continue;
        }
      }
    }
    result.push(lines[i]);
    i++;
  }

  return result.join('\n');
}

function extractTablesFromBody(text: string): { clean: string; tables: DetectedTable[] } {
  const tables: DetectedTable[] = [];
  // normalizeWhitespace collapses spaces but our markers have no spaces so they survive intact.
  const clean = text.replace(/<<TBLSTART>>([\s\S]*?)<<TBLEND>>/g, (_, inner) => {
    const hasHeader = inner.startsWith(T_HEADER);
    const body      = hasHeader ? inner.slice(T_HEADER.length) : inner;
    const rowStrings = body.split(T_ROW).filter(Boolean);

    const parseRow = (s: string) => s.split(T_COL).map(c => c.trim()).filter(Boolean);

    if (hasHeader) {
      const [headerStr, ...dataStrs] = rowStrings;
      tables.push({ headers: parseRow(headerStr), rows: dataStrs.map(parseRow) });
    } else {
      tables.push({ headers: [], rows: rowStrings.map(parseRow) });
    }
    return '';
  });
  return { clean: clean.trim(), tables };
}

function detectTablesInLines(lines: string[]): { bodyLines: string[]; tables: DetectedTable[] } {
  const bodyLines: string[] = [];
  const tables: DetectedTable[] = [];
  let i = 0;

  while (i < lines.length) {
    if (looksTabular(lines[i])) {
      const tableLines: string[] = [lines[i]];
      let j = i + 1;

      while (j < lines.length && looksTabular(lines[j])) {
        tableLines.push(lines[j]);
        j++;
      }

      if (tableLines.length >= 2) {
        const rows = tableLines.map(splitColumnar);
        const colCounts = rows.map(r => r.length);
        const maxCols = Math.max(...colCounts);
        const minCols = Math.min(...colCounts);

        if (maxCols >= 2 && maxCols - minCols <= 1) {
          const hasHeader =
            !rows[0].some(c => /^\d/.test(c)) &&
            rows.slice(1).some(r => r.some(c => /^\d/.test(c)));

          tables.push({
            headers: hasHeader ? rows[0] : [],
            rows: hasHeader ? rows.slice(1) : rows,
          });

          i = j;
          continue;
        }
      }
    }

    bodyLines.push(lines[i]);
    i++;
  }

  return { bodyLines, tables };
}

function parseBodyChunk(lines: string[]): { body: string; tables?: DetectedTable[] } {
  const { bodyLines, tables: directTables } = detectTablesInLines(lines);
  const flattened = flatLine(bodyLines.join(' '));
  const recognizedTableFamily = parseRecognizedTableFamily(flattened);
  if (recognizedTableFamily) return recognizedTableFamily;

  const { clean, tables: markedTables } = extractTablesFromBody(flattened);
  const tables = [...directTables, ...markedTables];

  return {
    body: clean,
    ...(tables.length > 0 && { tables }),
  };
}

const SUB_SECTION_PATTERNS: Array<{
  regex: RegExp;
  getLabel: (match: RegExpMatchArray) => string;
  getBody: (match: RegExpMatchArray) => string;
}> = [
  {
    regex: /^(?:\d+\.)?([a-z])\. {1,4}(.*)$/i,
    getLabel: match => `${match[1].toLowerCase()}.`,
    getBody: match => match[2],
  },
  {
    regex: /^(?:\d+\.)?[a-z]\.(\d+)\. {1,4}(.*)$/i,
    getLabel: match => `${match[1]}.`,
    getBody: match => match[2],
  },
  {
    regex: /^\((\d+)\) {0,4}(.*)$/,
    getLabel: match => `(${match[1]})`,
    getBody: match => match[2],
  },
];

function parseSubSections(lines: string[]): ContentSubSection[] {
  const subSections: ContentSubSection[] = [];
  const pattern = SUB_SECTION_PATTERNS.find(candidate => lines.some(line => candidate.regex.test(line)));

  if (!pattern) return [];

  let currentLabel = '';
  let currentLines: string[] = [];

  const flush = () => {
    if (!currentLabel) return;

    const firstChildIdx = currentLines.findIndex(line =>
      SUB_SECTION_PATTERNS.some(candidate => candidate.regex.test(line)),
    );
    const bodyLines = firstChildIdx >= 0 ? currentLines.slice(0, firstChildIdx) : currentLines;
    const childLines = firstChildIdx >= 0 ? currentLines.slice(firstChildIdx) : [];
    const parsed = parseBodyChunk(bodyLines);
    const children = parseSubSections(childLines);

    subSections.push({
      label: currentLabel,
      body: parsed.body,
      ...(parsed.tables && { tables: parsed.tables }),
      ...(children.length > 0 && { children }),
    });
  };

  for (const line of lines) {
    const match = line.match(pattern.regex);
    if (match) {
      flush();
      currentLabel = pattern.getLabel(match);
      currentLines = [pattern.getBody(match)];
      continue;
    }

    if (currentLabel) currentLines.push(line);
  }

  flush();
  return subSections.filter(item => item.body || item.tables?.length || item.children?.length);
}

// ── MARADMIN Text Parser ────────────────────────────────────────────────────

export function parseMARADMINText(raw: string): ContentSection[] {
  const upper = raw.toUpperCase();

  // Locate the message body — try common MARADMIN section markers in order
  let bodyStart = -1;
  for (const marker of ['GENTEXT/REMARKS/', 'GENTEXT/', 'RMKS/']) {
    const idx = upper.indexOf(marker);
    if (idx >= 0) { bodyStart = idx + marker.length; break; }
  }
  const body = bodyStart >= 0 ? raw.slice(bodyStart).trim() : raw;

  // Match numbered top-level paragraphs.
  // Real MARADMINs use TWO spaces after the period: "1.  Purpose." or "1.  This MARADMIN..."
  // Regex handles 1–4 spaces to be robust.
  const lineRe = /^\s*\d+\. {1,4}(?=[A-Za-z])/gm;
  let starts = [...body.matchAll(lineRe)].map(m => m.index ?? 0);

  // Fallback: all paragraphs on one long line — match "N.  Heading." preceded by
  // end-of-sentence punctuation or 2+ spaces. Limit to numbers 1-30 to avoid
  // matching things like section references ("IAW MCO 1020.34G. 3.a.").
  if (starts.length === 0) {
    const inlineRe = /(?:^|[.!?] {1,4}|[ ]{2,})([1-9]|[12]\d|30)\. {1,4}(?=[A-Z])/g;
    starts = [...body.matchAll(inlineRe)].map(m => {
      // Advance past any leading punctuation/spaces to land on the digit
      const leadingNonDigit = m[0].search(/\d/);
      return (m.index ?? 0) + leadingNonDigit;
    });
  }

  if (starts.length === 0) {
    console.warn('[MARADMIN parser] No numbered paragraphs found. Body preview:', body.slice(0, 300));
    return [{ heading: 'Message', body: flatLine(body.slice(0, 1000)) }];
  }

  const sections: ContentSection[] = [];

  for (let i = 0; i < starts.length; i++) {
    const slice      = body.slice(starts[i], starts[i + 1]).trim();
    // Strip the leading "N.  " (1–4 spaces)
    const withoutNum = slice.replace(/^\d+\. {1,4}/, '');

    const { heading, remainder } = extractHeading(withoutNum);

    // Skip boilerplate closers
    if (/^(release authority|unclassified|bt$|nnnn|n\/a)/i.test(heading || remainder)) continue;

    // Preserve sub-section continuity so table rows that belong to "a." / "b." stay attached.
    const lines = remainder.split('\n').map(l => l.trim()).filter(Boolean);
    const firstSubSectionIdx = lines.findIndex(line =>
      SUB_SECTION_PATTERNS.some(pattern => pattern.regex.test(line)),
    );
    const bodyLines = firstSubSectionIdx >= 0 ? lines.slice(0, firstSubSectionIdx) : lines;
    const subSectionLines = firstSubSectionIdx >= 0 ? lines.slice(firstSubSectionIdx) : [];

    const parsedBody = parseBodyChunk(bodyLines);
    const bullets = parseSubSections(subSectionLines);

    sections.push({
      heading,
      body: parsedBody.body,
      ...(parsedBody.tables && { tables: parsedBody.tables }),
      ...(bullets.length > 0 && { bullets }),
    });
  }

  return sections.filter(s => s.body || s.tables?.length || s.bullets?.length);
}

// Words that signal the paragraph starts directly with body text, not a heading.
const BODY_STARTERS = new Set([
  'this', 'the', 'a', 'an', 'when', 'as', 'in', 'on', 'to', 'for', 'of',
  'all', 'marines', 'per', 'effective', 'it', 'each', 'any',
]);

function extractHeading(text: string): { heading: string; remainder: string } {
  // Match either "Title Case Heading.  Body" or "ALL CAPS HEADING. Body"
  // Heading ends at ". " + 1–4 spaces, followed by next sentence starting uppercase.
  const m = text.match(/^([A-Za-z][A-Za-z\s\-,()&\/]{1,60}?)\. {1,4}([A-Z][\s\S]+)/);

  if (m) {
    const candidate = m[1].trim();
    const words     = candidate.split(/\s+/);
    const first     = words[0].toLowerCase();

    // Accept as heading only if it's short (≤ 5 words) and doesn't start with a body-starter
    if (words.length <= 5 && !BODY_STARTERS.has(first)) {
      return { heading: titleCase(candidate), remainder: m[2].trim() };
    }
  }

  // No heading detected — return the full text as body with an empty heading
  return { heading: '', remainder: text.trim() };
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());
}

function flatLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

// ── Tag Extraction ──────────────────────────────────────────────────────────

const TAG_PATTERNS: [RegExp, string[]][] = [
  [/UNIFORM/i,                  ['UNIFORMS', 'POLICY']],
  [/PROMOT/i,                   ['PROMOTIONS', 'PERSONNEL']],
  [/EDUCAT|PME/i,               ['EDUCATION', 'PME']],
  [/PAY|ENTITLEMENT/i,          ['FINANCE', 'PAY']],
  [/FINANCE|FISCAL/i,           ['FINANCE', 'ADMIN']],
  [/RESERVE|SMCR|IRR/i,        ['RESERVE', 'ADMIN']],
  [/COMMAND SCREEN/i,           ['LEADERSHIP', 'BOARDS']],
  [/COMMAND/i,                  ['LEADERSHIP', 'COMMAND']],
  [/TRAINING/i,                 ['TRAINING']],
  [/BONUS|RETENTION/i,          ['FINANCE', 'RETENTION']],
  [/SAFETY/i,                   ['SAFETY']],
  [/BOARD|SCREEN/i,             ['ADMIN', 'BOARDS']],
  [/OFFICER/i,                  ['OFFICERS', 'PERSONNEL']],
  [/ENLISTED|SNCO|NCO/i,       ['ENLISTED', 'PERSONNEL']],
  [/HEALTH|MEDICAL/i,           ['HEALTH', 'MEDICAL']],
  [/AWARD/i,                    ['AWARDS']],
  [/RECRUIT/i,                  ['RECRUITING']],
  [/SECURITY/i,                 ['SECURITY']],
  [/HORNET|AVIATION|F\/A-18/i, ['AVIATION']],
  [/DEFERMENT|TRANSIT/i,        ['ADMIN', 'RESERVE']],
  [/ACADEM/i,                   ['EDUCATION', 'PERSONNEL']],
  [/CIVILIAN|HR/i,              ['ADMIN', 'CIVILIAN']],
  [/FITNESS REPORT|FITREP/i,    ['PERSONNEL', 'ADMIN']],
  [/POLICY/i,                   ['POLICY']],
  [/PERSONNEL/i,                ['PERSONNEL']],
];

function tagsFrom(subject: string): string[] {
  const seen = new Set<string>();
  for (const [re, tags] of TAG_PATTERNS) {
    if (re.test(subject)) tags.forEach(t => seen.add(t));
    if (seen.size >= 4) break;
  }
  return [...seen].slice(0, 4);
}
