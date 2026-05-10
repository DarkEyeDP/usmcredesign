import type { DetectedTable } from './maradminUtils';

export interface ParsedTableFamily {
  body: string;
  tables?: DetectedTable[];
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function parseInlineEligibilityTable(text: string): ParsedTableFamily | null {
  const match = text.match(/^(.*?Eligibility:)\s+PMOS\s+(.+)$/i);
  if (!match) return null;

  const label = match[1].trim();
  const tokens = match[2].trim().split(/\s+/).filter(Boolean);
  const firstCodeIdx = tokens.findIndex(token => /^\d{4}$/.test(token));
  if (firstCodeIdx <= 0) return null;

  const headerTokens = tokens.slice(0, firstCodeIdx);
  const headers = ['PMOS'];
  for (let i = 0; i < headerTokens.length; i++) {
    const token = headerTokens[i];
    if (headerTokens[i + 1] === '&' && /^above$/i.test(headerTokens[i + 2] ?? '')) {
      headers.push(`${token} & Above`);
      i += 2;
    } else {
      headers.push(token);
    }
  }

  const valueColumnCount = headers.length - 1;
  if (valueColumnCount <= 0) return null;

  const rows: string[][] = [];
  let index = firstCodeIdx;

  while (index < tokens.length) {
    const code = tokens[index];
    if (!/^\d{4}$/.test(code)) return null;
    index += 1;

    const values: string[] = [];
    while (index < tokens.length && !/^\d{4}$/.test(tokens[index])) {
      values.push(tokens[index]);
      index += 1;
    }

    if (values.length === 0 || values.length > valueColumnCount) return null;

    const paddedValues =
      values.length === valueColumnCount
        ? values
        : Array(valueColumnCount - values.length).fill('').concat(values);

    rows.push([code, ...paddedValues]);
  }

  if (rows.length === 0) return null;

  return {
    body: label,
    tables: [{ headers, rows }],
  };
}

function parseInlinePromotionTable(text: string): ParsedTableFamily | null {
  const mccRe = /^[A-Z0-9]{2,4}$/;
  const dateRe = /^\d{2}[A-Za-z]{3}\d{2}$/;
  const gradeRe = /^(?:Gen|LtGen|MajGen|BGen|Col|LtCol|Maj|Capt|1stLt|2ndLt|CWO[2-5]|WO)$/i;

  const dorMatch = text.match(/^(.*?)\bName\s+DOR\s+MCC\s+(.+)$/i);
  if (dorMatch) {
    const body = dorMatch[1].trim();
    const tokens = dorMatch[2].trim().split(/\s+/).filter(Boolean);
    const rows: string[][] = [];

    let cursor = 0;
    while (cursor < tokens.length) {
      const dateIdx = tokens.findIndex((token, idx) => idx >= cursor && dateRe.test(token));
      if (dateIdx < 0) break;

      const nameTokens = tokens.slice(cursor, dateIdx);
      const dor = tokens[dateIdx];
      const mcc = tokens[dateIdx + 1];

      if (nameTokens.length === 0 || !mcc || !mccRe.test(mcc)) return null;

      rows.push([nameTokens.join(' '), dor, mcc]);
      cursor = dateIdx + 2;
    }

    if (rows.length < 3) return null;

    return {
      body,
      tables: [{ headers: ['Name', 'DOR', 'MCC'], rows }],
    };
  }

  const gradeMatch = text.match(/^(.*?)\bName\s+Grade\s+MCC\s+(.+)$/i);
  if (!gradeMatch) return null;

  const body = gradeMatch[1].trim();
  const tokens = gradeMatch[2].trim().split(/\s+/).filter(Boolean);
  const rows: string[][] = [];
  let cursor = 0;

  while (cursor < tokens.length) {
    const gradeIdx = tokens.findIndex((token, idx) => idx >= cursor && gradeRe.test(token));
    if (gradeIdx < 0) break;

    const nameTokens = tokens.slice(cursor, gradeIdx);
    const grade = tokens[gradeIdx];
    const mcc = tokens[gradeIdx + 1];

    if (nameTokens.length === 0 || !mcc || !mccRe.test(mcc)) return null;

    rows.push([nameTokens.join(' '), grade, mcc]);
    cursor = gradeIdx + 2;
  }

  if (rows.length < 3) return null;

  return {
    body,
    tables: [{ headers: ['Name', 'Grade', 'MCC'], rows }],
  };
}

function parseInlineAttendeeTable(text: string): ParsedTableFamily | null {
  const match = text.match(/^(.*?Read in three columns\.)\s+Name\s+Rank\s+MCC\s+(.+)$/i);
  if (!match) return null;

  const body = match[1].trim();
  const tokens = match[2].trim().split(/\s+/).filter(Boolean);
  const mccRe = /^[A-Z0-9]{2,4}$/;
  const rankRe = /^(?:Sgt|SSgt|GySgt|MGySgt|1stSgt|SgtMaj|Cpl|LCpl|PFC|Pvt|WO|CWO[2-5]|2ndLt|1stLt|Capt|Maj|LtCol|Col)$/i;
  const rows: string[][] = [];
  let cursor = 0;

  while (cursor < tokens.length) {
    const rankIdx = tokens.findIndex((token, idx) => idx >= cursor && rankRe.test(token));
    if (rankIdx < 0) break;

    const nameTokens = tokens.slice(cursor, rankIdx);
    const rank = tokens[rankIdx];
    const mcc = tokens[rankIdx + 1];

    if (nameTokens.length === 0 || !mcc || !mccRe.test(mcc)) return null;

    rows.push([nameTokens.join(' '), rank, mcc]);
    cursor = rankIdx + 2;
  }

  if (rows.length === 0) return null;

  return {
    body,
    tables: [{ headers: ['Name', 'Rank', 'MCC'], rows }],
  };
}

function parseVacancySummaryTable(text: string): ParsedTableFamily | null {
  const match = text.match(/^(.*?\(read in four columns\):)\s+BMOS\s+Grade\s+Billet\s+Quantity\s+(.+)$/i);
  if (!match) return null;

  const body = match[1].trim();
  const tokens = match[2].trim().split(/\s+/).filter(Boolean);
  const bmosRe = /^\d{4}[a-z]?$/i;
  const gradeRe = /^(?:O-?\d(?:\/O-?\d)?|E\d)$/i;
  const quantityRe = /^\d+$/;
  const rows: string[][] = [];

  let cursor = 0;
  while (cursor < tokens.length) {
    const nextBmosIdx = tokens.findIndex((token, idx) => idx >= cursor && bmosRe.test(token));
    if (nextBmosIdx < 0) break;

    const rowStart = nextBmosIdx;
    let rowEnd = tokens.findIndex((token, idx) => idx > rowStart && bmosRe.test(token));
    if (rowEnd < 0) rowEnd = tokens.length;

    const rowTokens = tokens.slice(rowStart, rowEnd);
    if (rowTokens.length < 4) return null;

    const [bmos, grade, ...rest] = rowTokens;
    const quantity = rest.at(-1) ?? '';
    const billetTokens = rest.slice(0, -1);

    if (!gradeRe.test(grade) || !quantityRe.test(quantity) || billetTokens.length === 0) return null;

    rows.push([bmos, grade, billetTokens.join(' '), quantity]);
    cursor = rowEnd;
  }

  if (rows.length === 0) return null;

  return {
    body,
    tables: [{ headers: ['BMOS', 'Grade', 'Billet', 'Quantity'], rows }],
  };
}

function parseProjectedPromotionsTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bSenior Officer\s+Sel\s+Junior Officer\s+Sel\s+(.+)$/i);
  if (!headerMatch) return null;

  const body = headerMatch[1].trim();
  const data = headerMatch[2].trim();
  const rowStartRe = /(MOS:\s*\d{4}|(?:Col|LtCol|Maj|MAJ|Capt|CWO[2-5])(?:\s+\([A-Z]+\))?)/g;
  const matches = [...data.matchAll(rowStartRe)];
  if (matches.length === 0) return null;

  const rows: string[][] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index ?? 0;
    const end = matches[i + 1]?.index ?? data.length;
    const segment = data.slice(start, end).trim();
    const label = matches[i][0].replace(/\s+/g, ' ').trim();
    const rest = segment.slice(matches[i][0].length).trim();

    if (!rest) {
      rows.push([label, '', '', '', '']);
      continue;
    }

    if (/^list cleared\s+list cleared$/i.test(rest)) {
      rows.push([label, 'list cleared', '', 'list cleared', '']);
      continue;
    }

    if (/^none\s+none\s+none\s+none$/i.test(rest)) {
      rows.push([label, 'none', 'none', 'none', 'none']);
      continue;
    }

    const rankedMatch = rest.match(/^(.+?)\s+(\d+)\s+(.+?)\s+(\d+)$/);
    if (rankedMatch) {
      rows.push([label, rankedMatch[1], rankedMatch[2], rankedMatch[3], rankedMatch[4]]);
      continue;
    }

    return null;
  }

  if (rows.length === 0) return null;

  return {
    body,
    tables: [{
      headers: ['Board / MOS', 'Senior Officer', 'Sel', 'Junior Officer', 'Sel'],
      rows,
    }],
  };
}

function parseFeederMosTable(text: string): ParsedTableFamily | null {
  const match = text.match(/^(.*?:)\s+((?:COLUMN\s+\(A\)\s+COLUMN\s+\(B\)\s*)+)(.+)$/i);
  if (!match) return null;

  const body = match[1].trim();
  const headerGroup = match[2];
  const data = match[3].trim();
  const pairCount = [...headerGroup.matchAll(/COLUMN\s+\(A\)\s+COLUMN\s+\(B\)/gi)].length;
  if (pairCount === 0) return null;

  const values = data.match(/\d{4}/g) ?? [];
  if (values.length < 2 || values.length % 2 !== 0) return null;

  const pairs = chunkArray(values, 2);
  const rows = chunkArray(pairs, pairCount).map(group => {
    const flattened = group.flat();
    while (flattened.length < pairCount * 2) flattened.push('');
    return flattened;
  });

  const headers = Array.from({ length: pairCount }, () => ['COLUMN (A)', 'COLUMN (B)']).flat();

  return {
    body,
    tables: [{ headers, rows }],
  };
}

function parseAllocationCutoffTables(text: string): ParsedTableFamily | null {
  const firstTitleIdx = text.search(/\bALLOCATIONS TO [A-Z ]+?(?=\s+IMOS\b)/);
  if (firstTitleIdx < 0) return null;

  const body = text.slice(0, firstTitleIdx).trim();
  const data = text.slice(firstTitleIdx).trim();
  const titleRe = /ALLOCATIONS TO [A-Z ]+?(?=\s+IMOS\b)/g;
  const titleMatches = [...data.matchAll(titleRe)];
  if (titleMatches.length === 0) return null;

  const tables: DetectedTable[] = [];
  const rowRe = /(\d{4})\s+(\d+)\s+(\d+)\s+(\d{8}|NA)\s+(\d{8}|NA)\s+(\d{8}|NA)\s+(\d{8}|NA)\s+(\d{8}|NA)\s+(\d{8}|NA)/g;

  for (let i = 0; i < titleMatches.length; i++) {
    const start = titleMatches[i].index ?? 0;
    const end = titleMatches[i + 1]?.index ?? data.length;
    const segment = data.slice(start, end).trim();
    const title = titleMatches[i][0].trim();

    const closedMarker = 'THE FOLLOWING PMOS(S) ARE CLOSED:';
    const closedIdx = segment.indexOf(closedMarker);
    const tablePart = closedIdx >= 0 ? segment.slice(0, closedIdx).trim() : segment;
    const closedPart = closedIdx >= 0 ? segment.slice(closedIdx + closedMarker.length).trim() : '';

    const rows = [...tablePart.matchAll(rowRe)].map(match => match.slice(1));
    if (rows.length > 0) {
      tables.push({
        title,
        headers: ['IMOS', 'IRR', 'SMCR', 'AZ', 'PEBD', 'IZ', 'PEBD', 'BZ', 'PEBD'],
        rows,
      });
    }

    const closedCodes = closedPart.match(/\d{4}/g) ?? [];
    if (closedCodes.length > 0) {
      const closedRows = chunkArray(closedCodes, 6).map(row => {
        while (row.length < 6) row.push('');
        return row;
      });

      tables.push({
        title: `${title} - Closed PMOS`,
        headers: ['PMOS', 'PMOS', 'PMOS', 'PMOS', 'PMOS', 'PMOS'],
        rows: closedRows,
      });
    }
  }

  if (tables.length === 0) return null;

  return {
    body,
    tables,
  };
}

const TABLE_FAMILY_PARSERS = [
  parseInlineEligibilityTable,
  parseInlinePromotionTable,
  parseInlineAttendeeTable,
  parseVacancySummaryTable,
  parseProjectedPromotionsTable,
  parseFeederMosTable,
  parseAllocationCutoffTables,
];

export function parseRecognizedTableFamily(text: string): ParsedTableFamily | null {
  for (const parser of TABLE_FAMILY_PARSERS) {
    const parsed = parser(text);
    if (parsed) return parsed;
  }

  return null;
}
