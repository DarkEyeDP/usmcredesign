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

const WORKER_BASE = (import.meta.env.VITE_NEWS_METRICS_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export const ALL_MARADMIN_TAGS = [
  'ADMIN', 'AVIATION', 'AWARDS', 'BOARDS', 'CIVILIAN', 'EDUCATION', 'ENLISTED',
  'FAMILY', 'FINANCE', 'INTELLIGENCE', 'LANGUAGE', 'LEADERSHIP', 'MEDICAL', 'MOS',
  'OFFICERS', 'OPERATIONS', 'PERSONNEL', 'POLICY', 'PROMOTIONS', 'READINESS',
  'RECRUITING', 'RESERVE', 'RETENTION', 'SAFETY', 'SEPARATION', 'SPECIAL DUTY',
  'TECHNOLOGY', 'TRAINING', 'UNIFORMS',
] as const;

// ── Worker API ──────────────────────────────────────────────────────────────

export async function syncMARADMINFeed(): Promise<{ added: number }> {
  if (!WORKER_BASE) return { added: 0 };
  const res = await fetch(`${WORKER_BASE}/maradmins/sync`, { method: 'POST' });
  if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
  const data = await res.json() as { added?: number };
  return { added: data.added ?? 0 };
}

export async function fetchMARADMINFeed(
  offset: number,
  limit = 50,
): Promise<{ messages: RSSMessage[]; total: number }> {
  if (!WORKER_BASE) return { messages: [], total: 0 };
  const res = await fetch(`${WORKER_BASE}/maradmins?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
  const data = await res.json() as { messages: RSSMessage[]; total?: number };
  return { messages: data.messages ?? [], total: data.total ?? 0 };
}

export async function fetchMARADMINArticle(
  number: string,
): Promise<{ text: string; method: FetchMethod; source: string | null; cachedAt: number } | null> {
  if (!WORKER_BASE || !number) return null;
  const slug = encodeURIComponent(number.replace(/\//g, '-'));
  const res = await fetch(`${WORKER_BASE}/maradmins/${slug}/content`);
  if (!res.ok) return null;
  const data = await res.json() as { text?: string; method?: string; source?: string | null; cachedAt?: number };
  if (!data.text) return null;
  // Strip marines.mil site footer before any further processing or caching.
  const stripped = data.text
    .replace(/\s*(?:\/+\s*)?Marine Corps\s+About The Corps\b[\s\S]*$/, '')
    .replace(/\s*Hosted by WEB\.mil[\s\S]*$/, '')
    .replace(/\s*\/{2,}\s*$/, '')
    .trim();
  // Run client-side table detection so parseMARADMINText receives marked-up text.
  const marked = detectAndMarkTables(stripped);
  const text = normalizeWhitespace(marked);
  return {
    text,
    method: (data.method as FetchMethod) ?? 'direct',
    source: data.source ?? null,
    cachedAt: data.cachedAt ?? Date.now(),
  };
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

export function extractMARADMINNumber(raw: string): string | null {
  const match = flatLine(raw).match(/\bMARADMIN\s+(\d+\/\d+)\b/i);
  return match?.[1] ?? null;
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

// ── "Read in N columns" hint detection ──────────────────────────────────────
const COLUMN_WORD_MAP: Record<string, number> = {
  two: 2, three: 3, four: 4, five: 5, six: 6,
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
};
const READ_IN_COLUMNS_RE = /\(read in (\w+) columns?\)/i;

/**
 * Detects "(read in N columns)" directives and builds a table from the lines
 * that follow. Works when data is one-cell-per-line or multi-space-separated.
 * Returns null if the hint is absent or there isn't enough data to form a table.
 */
function parseReadInColumnsHint(lines: string[]): { preBody: string; table: DetectedTable } | null {
  const hintIdx = lines.findIndex(l => READ_IN_COLUMNS_RE.test(l));
  if (hintIdx < 0) return null;

  const hintLine  = lines[hintIdx];
  const hintMatch = hintLine.match(READ_IN_COLUMNS_RE)!;
  const nCols     = COLUMN_WORD_MAP[hintMatch[1].toLowerCase()];
  if (!nCols) return null;

  // Text before (and around) the hint becomes the body title for this chunk.
  const preBody = flatLine(
    [
      ...lines.slice(0, hintIdx),
      hintLine.replace(READ_IN_COLUMNS_RE, '').replace(/[:\s]+$/, '').trim(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  const afterLines = lines.slice(hintIdx + 1).map(l => l.trim()).filter(Boolean);
  let tokens: string[];

  if (afterLines.length >= nCols * 2) {
    // Each subsequent line is one cell — but if they're already columnar (2-space
    // separated), let detectTablesInLines handle them; we just strip the hint text.
    if (afterLines.slice(0, 2).every(l => looksTabular(l))) return null;
    tokens = afterLines;
  } else {
    // Data follows the hint inline on the same line, separated by 2+ spaces.
    const afterHint = hintLine.replace(/^.*?\(read in \w+ columns?\)[:\s]*/i, '').trim();
    const cols      = splitColumnar(afterHint);
    if (cols.length < nCols * 2) return null;
    tokens = cols;
  }

  // Group tokens nCols at a time into rows.
  const rows: string[][] = [];
  for (let i = 0; i + nCols <= tokens.length; i += nCols) {
    rows.push(tokens.slice(i, i + nCols));
  }
  if (rows.length < 2) return null;

  return { preBody, table: { headers: rows[0], rows: rows.slice(1) } };
}

function parseBodyChunk(lines: string[]): { body: string; tables?: DetectedTable[] } {
  const flattenedAll = flatLine(lines.join(' ')).replace(READ_IN_COLUMNS_RE, '').replace(/\s{2,}/g, ' ').trim();
  const recognizedFromAll = parseRecognizedTableFamily(flattenedAll);
  if (recognizedFromAll) return recognizedFromAll;

  // Explicit "read in N columns" hint — build table before any flattening.
  const columnarHint = parseReadInColumnsHint(lines);
  if (columnarHint) {
    return { body: columnarHint.preBody, tables: [columnarHint.table] };
  }

  const { bodyLines, tables: directTables } = detectTablesInLines(lines);

  // Strip residual "(read in N columns)" markers from body text.  When the data
  // lines were already columnar, detectTablesInLines captured them as a table and
  // the hint text ends up here; remove it so it doesn't appear in the paragraph.
  const flattened = flatLine(bodyLines.join(' ')).replace(READ_IN_COLUMNS_RE, '').replace(/\s{2,}/g, ' ').trim();

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
    regex: /^(?:\d+\.)?([a-z])\. {1,4}(.*)$/,
    getLabel: match => `${match[1].toLowerCase()}.`,
    getBody: match => match[2],
  },
  {
    regex: /^(?:\d+\.)?[a-z]\.(\d+)\. {1,4}(.*)$/,
    getLabel: match => `${match[1]}.`,
    getBody: match => match[2],
  },
  {
    regex: /^\(([a-z])\) {0,4}(.*)$/,
    getLabel: match => `(${match[1].toLowerCase()})`,
    getBody: match => match[2],
  },
  {
    regex: /^\((\d+)\) {0,4}(.*)$/,
    getLabel: match => `(${match[1]})`,
    getBody: match => match[2],
  },
];

function splitInlineSubSectionMarkers(lines: string[]): string[] {
  return lines.flatMap(line => {
    const splitLine = line
      .replace(/\s+(\([a-z]\)|\(\d+\))\s+(?=[A-Z0-9])/g, '\n$1 ')
      .split('\n')
      .map(part => part.trim())
      .filter(Boolean);

    return splitLine.length > 0 ? splitLine : [line];
  });
}

function parseSubSections(lines: string[]): ContentSubSection[] {
  lines = splitInlineSubSectionMarkers(lines);
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

export function parseMARADMINText(rawInput: string): ContentSection[] {
  // Strip marines.mil site-wide footer nav that trails every scraped page
  const raw = rawInput
    .replace(/\s*(?:\/+\s*)?Marine Corps\s+About The Corps\b[\s\S]*$/, '')
    .replace(/\s*Hosted by WEB\.mil[\s\S]*$/, '')
    .replace(/\s*\/{2,}\s*$/, '')
    .trim();
  const upper = raw.toUpperCase();

  // Locate the message body — try common MARADMIN section markers in order
  let bodyStart = -1;
  for (const marker of ['GENTEXT/REMARKS/', 'GENTEXT/', 'RMKS/']) {
    const idx = upper.indexOf(marker);
    if (idx >= 0) { bodyStart = idx + marker.length; break; }
  }
  const rawBody = bodyStart >= 0 ? raw.slice(bodyStart).trim() : raw;
  // Strip from the final "//" — the end-of-message marker — and any website footer that follows.
  const lastSlash = rawBody.lastIndexOf('//');
  const body = lastSlash >= 0 ? rawBody.slice(0, lastSlash).trim() : rawBody;

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

    const extracted = extractHeading(withoutNum);
    const heading = extracted.heading.replace(READ_IN_COLUMNS_RE, '').replace(/\s{2,}/g, ' ').trim();
    const remainder = extracted.remainder;

    // Skip boilerplate closers
    if (/^(release authority|unclassified|bt$|nnnn|n\/a)/i.test(heading || remainder)) continue;

    // Preserve sub-section continuity so table rows that belong to "a." / "b." stay attached.
    const lines = remainder.split('\n').map(l => l.trim()).filter(Boolean);
    const firstSubSectionIdx = lines.findIndex(line =>
      SUB_SECTION_PATTERNS.some(pattern => pattern.regex.test(line)),
    );
    if (firstSubSectionIdx < 0) {
      const parsedFullBody = parseBodyChunk(lines);
      if (parsedFullBody.tables?.length) {
        sections.push({
          heading,
          body: parsedFullBody.body,
          tables: parsedFullBody.tables,
        });
        continue;
      }
    }

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
  // Primary: inline heading "Title.  Body starts here" (period + spaces on same line)
  const m = text.match(/^([A-Za-z][A-Za-z\s\-,()&/]{1,60}?)\. {1,4}([A-Z][\s\S]+)/);

  if (m) {
    const candidate = m[1].trim();
    const words     = candidate.split(/\s+/);
    const first     = words[0].toLowerCase();

    // Accept as heading only if it's short (≤ 5 words) and doesn't start with a body-starter
    if (words.length <= 5 && !BODY_STARTERS.has(first)) {
      return { heading: titleCase(candidate), remainder: m[2].trim() };
    }
  }

  // Secondary: standalone title on its own line, followed by sub-sections or nothing.
  // Handles numbered paragraphs like "4. Application and Selection Overview.\n  a. ..."
  const nl       = text.indexOf('\n');
  const firstLine = (nl >= 0 ? text.slice(0, nl) : text).trim();
  const rest      = nl >= 0 ? text.slice(nl + 1).trim() : '';
  const titleMatch = firstLine.match(/^([A-Za-z][A-Za-z\s\-,()&/]{0,80}?)[.:]?\s*$/);

  if (titleMatch) {
    const candidate = titleMatch[1].trim();
    const words     = candidate.split(/\s+/);
    const first     = words[0].toLowerCase();

    if (words.length <= 8 && !BODY_STARTERS.has(first)) {
      // Only treat as heading when what follows is sub-sections or empty, not flowing body text
      const nextNonEmpty = rest.split('\n').find(l => l.trim())?.trim();
      const nextIsSubSection = !nextNonEmpty || SUB_SECTION_PATTERNS.some(p => p.regex.test(nextNonEmpty));
      if (nextIsSubSection) {
        return { heading: titleCase(candidate), remainder: rest };
      }
    }
  }

  // No heading detected — return full text as body with empty heading
  return { heading: '', remainder: text.trim() };
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());
}

function flatLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

// ── Tag Extraction ──────────────────────────────────────────────────────────

const TAG_RULES: Array<{ tag: string; re: RegExp }> = [
  { tag: 'PROMOTIONS',   re: /\bpromot(ions?|ed|ing)?\b|\badvancement\b/i },
  { tag: 'BOARDS',       re: /\b((selection|screening|promotion|command|reserve)\s+)?board\b|\bslating\s+panel\b/i },
  { tag: 'EDUCATION',    re: /\b(pme|professional military education|command and staff college|expeditionary warfare school|college of distance|academic year|curriculum|distance education|marinenet|mcele|elearning)\b/i },
  { tag: 'TRAINING',     re: /\b(training|course|instructor|instruction)\b/i },
  { tag: 'RESERVE',      re: /\b(reserve component|smcr|irr|individual ready reserve|active reserve|selected marine corps reserve)\b/i },
  { tag: 'FINANCE',      re: /\bpay\b|\b(bonus|entitlement|allowance|compensation|fiscal year|stipend|budget)\b/i },
  { tag: 'RETENTION',    re: /\b(retention bonus|selective retention|broken service|career designation|retention incentive)\b/i },
  { tag: 'UNIFORMS',     re: /\b(uniform|grooming|dress blue|dress green)\b/i },
  { tag: 'MOS',          re: /\b(military occupational specialty|pmos|fmos|amos|lateral move)\b|\bmos\b/i },
  { tag: 'SAFETY',       re: /\b(safety message|critical days|mishap|hazard|ground safety)\b/i },
  { tag: 'AVIATION',     re: /\b(aviation|f\/a-18|hornet|aircraft|aircrew|aeronautic|airlift|blue angels|helicopter|osprey|aerial)\b/i },
  { tag: 'TECHNOLOGY',   re: /\b(artificial intelligence|information technology|it procurement|cyber|gps|saasm|encryption|software|information system|elearning|mcele|genai|digital university)\b/i },
  { tag: 'AWARDS',       re: /\b(award|winner|viec|excellence in communication|recognition award)\b/i },
  { tag: 'LEADERSHIP',   re: /\b(command screening|commandant|sergeant major of the marine corps|command billet)\b/i },
  { tag: 'MEDICAL',      re: /\b(medical condition|health|healthcare|behavioral health|physical fitness test|pft|cft|body composition)\b/i },
  { tag: 'OFFICERS',     re: /\b(officer promot|officer select|officer candidate|officer billet|officer professional|commissioned officer|warrant officer|ocs)\b/i },
  { tag: 'ENLISTED',     re: /\b(enlisted|snco|staff noncommissioned|corporal|gunnery sergeant|master sergeant|first sergeant|master gunnery|lance corporal)\b/i },
  { tag: 'LANGUAGE',     re: /\b(language professional|dlpt|dlab|linguist|foreign language|command language program)\b/i },
  { tag: 'FAMILY',       re: /\b(maternity leave|parental leave|family|dependent|spouse|childcare)\b/i },
  { tag: 'POLICY',       re: /\b(implementing guidance|clarifying guidance|update to maradmin|change \d+ to maradmin|amplifying guidance)\b/i },
  { tag: 'READINESS',    re: /\b(readiness|mission ready|combat ready|operational readiness|military excellence and readiness)\b/i },
  { tag: 'INTELLIGENCE', re: /\b(intelligence|special technical operations|counterintelligence|marsoc)\b|\bsto\b/i },
  { tag: 'RECRUITING',   re: /\b(recruit|accession|affiliation incentive|applications being accepted|enlistment)\b/i },
  { tag: 'SEPARATION',   re: /\b(involuntary separation|absent from duty|misconduct|administrative separation|voluntary.*absence)\b/i },
  { tag: 'OPERATIONS',   re: /\b(operational support|expeditionary|deployment|capstone operating concept|warfighting|force employment)\b/i },
  { tag: 'ADMIN',        re: /\b(human resources|hr information|information system|access management|user access management|it procurement)\b/i },
  { tag: 'CIVILIAN',     re: /\b(civilian human resources|dod civilian|civilian personnel|civilian employees)\b/i },
  { tag: 'SPECIAL DUTY', re: /\b(special duty assignment|hqmc special duty|drill instructor|recruiter duty|embassy duty)\b/i },
  { tag: 'PERSONNEL',    re: /\b(fitness report|fitrep|performance evaluation|billet|assigned to|personnel action)\b/i },
];

export function tagsFromContent(subject: string, body: string): string[] {
  const scores = new Map<string, number>();

  for (const { tag, re } of TAG_RULES) {
    if (re.test(subject)) {
      scores.set(tag, (scores.get(tag) ?? 0) + 3);
    }
    if (body) {
      const count = Math.min((body.match(new RegExp(re.source, 'gi')) ?? []).length, 5);
      if (count > 0) scores.set(tag, (scores.get(tag) ?? 0) + count);
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);
}

// ── Message routing helpers ───────────────────────────────────────────────────

export function encodeMessageNumber(number: string): string {
  return number.replace(/\//g, '-');
}

export function decodeMessageNumber(messageNumber?: string): string | null {
  if (!messageNumber) return null;
  return messageNumber.replace(/-/g, '/');
}

export function buildMessagePath(msg: { number: string; id: string }): string {
  if (msg.number) return `/messages/${encodeMessageNumber(msg.number)}`;
  return `/messages/_id_${encodeURIComponent(msg.id)}`;
}
