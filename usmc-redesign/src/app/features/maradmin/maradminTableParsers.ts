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

function parseRankNameImosMccTable(text: string): ParsedTableFamily | null {
  const match = text.match(/^(.*?)\bRank\s+Name\s+IMOS\/MCC\s+(.+)$/is);
  if (!match) return null;

  const body = match[1].trim();
  const rankPattern = '(?:SgtMaj|MGySgt|1stSgt|MSgt|GySgt|SSgt)';
  const rowRe = new RegExp(
    `\\b(${rankPattern})\\s+(.+?)\\s+(\\d{4}\\/[A-Z0-9]{2,4})(?=\\s+(?:${rankPattern})\\s+|\\s+\\d+\\.\\s+[A-Z]|$)`,
    'gi',
  );

  const rows = [...match[2].trim().matchAll(rowRe)].map(rowMatch => [
    rowMatch[1],
    rowMatch[2].replace(/\s+/g, ' ').trim(),
    rowMatch[3],
  ]);

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['Rank', 'Name', 'IMOS/MCC'], rows }],
  };
}

function parseInlineRankNameMCCTable(text: string): ParsedTableFamily | null {
  const sectionRe = /Read in (?:three|3) columns\.?\s+Rank\s+Name\s+MCC\s*/gi;
  const firstMatch = sectionRe.exec(text);
  if (!firstMatch) return null;

  const mccRe = /^[A-Z0-9]{2,4}$/;
  const rankRe = /^(?:Sgt|SSgt|GySgt|MGySgt|1stSgt|SgtMaj|Cpl|LCpl|PFC|Pvt|WO|CWO[2-5]|2ndLt|1stLt|Capt|Maj|LtCol|Col)$/i;

  // Collect (headerStart, dataStart) for every "Read in N columns. Rank Name MCC" header.
  const sections: Array<{ headerStart: number; dataStart: number }> = [
    { headerStart: firstMatch.index, dataStart: firstMatch.index + firstMatch[0].length },
  ];
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(text)) !== null) {
    sections.push({ headerStart: m.index, dataStart: m.index + m[0].length });
  }

  // Everything before the first header is the shared body text.
  const body = text.slice(0, sections[0].headerStart).trim();

  // Titles for each table: section 0 has none; section s>0 gets the text
  // between section s-1's last data row and section s's "Read in" header.
  const tableTitles: string[] = new Array(sections.length).fill('');
  const tables: DetectedTable[] = [];

  for (let s = 0; s < sections.length; s++) {
    // Chunk spans from this section's data start to the next section's "Read in" header.
    const chunkEnd = sections[s + 1]?.headerStart ?? text.length;
    const chunk = text.slice(sections[s].dataStart, chunkEnd);
    const tokens = chunk.split(/\s+/).filter(Boolean);
    const rows: string[][] = [];
    let cursor = 0;

    while (cursor < tokens.length) {
      const rank = tokens[cursor];
      if (!rankRe.test(rank)) break;

      const nextRankIdx = tokens.findIndex((token, idx) => idx > cursor && rankRe.test(token));
      let rowEnd: number;
      if (nextRankIdx >= 0) {
        rowEnd = nextRankIdx;
      } else {
        // No next rank — use a section-label boundary (e.g. "1.b.") to avoid
        // consuming title text as part of the last data row.
        const labelIdx = tokens.findIndex((t, idx) => idx > cursor && /^\d+\.[a-z]\.?$/i.test(t));
        rowEnd = labelIdx >= 0 ? labelIdx : tokens.length;
      }

      const rowTokens = tokens.slice(cursor, rowEnd);
      if (rowTokens.length < 3) break;

      const mcc = rowTokens.at(-1) ?? '';
      const nameTokens = rowTokens.slice(1, -1);
      if (!mccRe.test(mcc) || nameTokens.length === 0) break;

      rows.push([rank, nameTokens.join(' '), mcc]);
      cursor = rowEnd;
    }

    // Any tokens left after the rows are the title label for the NEXT section.
    if (s + 1 < sections.length && cursor < tokens.length) {
      tableTitles[s + 1] = tokens.slice(cursor).join(' ');
    }

    if (rows.length > 0) {
      const table: DetectedTable = { headers: ['Rank', 'Name', 'MCC'], rows };
      if (tableTitles[s]) table.title = tableTitles[s];
      tables.push(table);
    }
  }

  if (tables.length === 0) return null;

  return { body, tables };
}

function parseAviationBoardResultsTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bL\.\s+NAME\s+F\.\s+NAME\s+MI\s+PMOS\s+(PROGRAM|LOCATION)\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].trim();
  const finalHeader = headerMatch[2].toUpperCase();
  const tokens = headerMatch[3].trim().split(/\s+/).filter(Boolean);
  const pmosRe = /^\d{4}$/;
  const rows: string[][] = [];
  let cursor = 0;

  while (cursor < tokens.length) {
    const pmosIdx = tokens.findIndex((token, idx) => idx >= cursor + 2 && pmosRe.test(token));
    if (pmosIdx < 0) break;

    const nameTokens = tokens.slice(cursor, pmosIdx);
    if (nameTokens.length < 2) break;

    const maybeMi = nameTokens.at(-1) ?? '';
    const hasMi = /^[A-Z]$/i.test(maybeMi);
    const lastAndFirst = hasMi ? nameTokens.slice(0, -1) : nameTokens;
    const mi = hasMi ? maybeMi.toUpperCase() : '';
    if (lastAndFirst.length < 2) break;

    const programStart = pmosIdx + 1;
    const nextPmosIdx = tokens.findIndex((token, idx) => idx > programStart && pmosRe.test(token));
    const programEnd = nextPmosIdx >= 0 ? findAviationBoardNameStart(tokens, nextPmosIdx) : tokens.length;
    const programTokens = tokens.slice(programStart, programEnd);
    if (programTokens.length === 0) break;

    rows.push([
      lastAndFirst.slice(0, -1).join(' '),
      lastAndFirst.at(-1) ?? '',
      mi,
      tokens[pmosIdx],
      programTokens.join(' '),
    ]);

    cursor = programEnd;
  }

  if (rows.length === 0 || cursor < tokens.length) return null;

  return {
    body,
    tables: [{ headers: ['L. Name', 'F. Name', 'MI', 'PMOS', titleCaseLabel(finalHeader)], rows }],
  };
}

function findAviationBoardNameStart(tokens: string[], pmosIdx: number): number {
  const hasMi = /^[A-Z]$/i.test(tokens[pmosIdx - 1] ?? '');
  const firstNameIdx = hasMi ? pmosIdx - 2 : pmosIdx - 1;
  let lastNameStart = firstNameIdx - 1;

  if (/^(?:Jr|Sr|II|III|IV)$/i.test(tokens[lastNameStart] ?? '')) {
    lastNameStart -= 1;
  }

  return Math.max(0, lastNameStart);
}

function parseIAPSelectionPanelResultsTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bName\s+Rank\s+PMOS\s+AMOS\s+Desig\s+Region\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].replace(/\s*:\s*$/, '').trim();
  const data = headerMatch[2].trim();
  const rankPattern = '(?:Gen|LtGen|MajGen|BGen|Col|LtCol|Maj|Capt|1stLt|2ndLt)';
  const namePattern = "[A-Z][A-Za-z'-]+(?:\\s+(?:Jr|Sr|II|III|IV))?,\\s*[A-Z](?:\\.[A-Z])?\\.?";
  const rowRe = new RegExp(
    `(${namePattern})\\s+(${rankPattern})\\s+(\\d{4})\\s+(\\d{4})\\s+([A-Z]{2,5})\\s+(.+?)(?=\\s+${namePattern}\\s+${rankPattern}\\s+\\d{4}\\s+\\d{4}\\s+[A-Z]{2,5}\\s|$)`,
    'gi',
  );

  const rows = [...data.matchAll(rowRe)].map(match => [
    match[1].replace(/\s+/g, ' ').trim(),
    match[2],
    match[3],
    match[4],
    match[5].toUpperCase(),
    match[6].replace(/\s+/g, ' ').trim(),
  ]);

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['Name', 'Rank', 'PMOS', 'AMOS', 'Desig', 'Region'], rows }],
  };
}

function titleCaseLabel(label: string): string {
  return label.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}

const SHORT_MONTH_RE = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
const MONTH_NAME_RE = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';

function parsePromotionBoardConveningTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bSelection\s+To\s+Component\s+Bd\.?Corr\.?Due\s+Convening\s+Date\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].trim();
  const data = headerMatch[2].trim();
  // A single grade token, optionally followed by an asterisk (e.g. "Capt*")
  const singleRank = '(?:Gen|LtGen|MajGen|BGen|Col|LtCol|Maj|Capt|CWO[2-5]|WO)\\*?';
  // "Selection To" may be one grade or a comma-separated pair like "Col, LtCol"
  const rankPattern = `${singleRank}(?:,\\s*${singleRank})*`;
  const componentPattern = '(?:Active|Reserve|USMCR|AR|SMCR|IRR)';
  const datePattern = `\\d{1,2}\\s+${SHORT_MONTH_RE}\\s+\\d{2}`;
  const rowRe = new RegExp(
    `\\b(${rankPattern})\\s+(${componentPattern})\\s+(${datePattern})\\s+(${datePattern})(?=\\s+${singleRank}\\s+(?:${componentPattern})\\s+|$)`,
    'gi',
  );
  const rows = [...data.matchAll(rowRe)].map(match => [
    match[1],
    match[2],
    match[3].replace(/\s+/g, ' ').trim(),
    match[4].replace(/\s+/g, ' ').trim(),
  ]);

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['Selection To', 'Component', 'Bd.Corr.Due', 'Convening Date'], rows }],
  };
}

function parseGeneralOfficerPromotionZoneTable(text: string): ParsedTableFamily | null {
  const firstRowMatch = text.match(/\b(?:Senior|Junior|Only)\s+Officer\s+(?:Above-Zone|In-Zone|Below-Zone)\s*-\s*/i);
  if (!firstRowMatch?.index && firstRowMatch?.index !== 0) return null;

  const body = text.slice(0, firstRowMatch.index).trim();
  const data = text.slice(firstRowMatch.index).trim();
  const rowStartRe = /\b(?:Senior|Junior|Only)\s+Officer\s+(?:Above-Zone|In-Zone|Below-Zone)\s*-\s*/gi;
  const starts = [...data.matchAll(rowStartRe)].map(match => match.index ?? 0);
  if (starts.length === 0) return null;

  const datePattern = `${SHORT_MONTH_RE}\\s+\\d{2}`;
  const rows: string[][] = [];

  for (let i = 0; i < starts.length; i += 1) {
    const segment = data.slice(starts[i], starts[i + 1] ?? data.length).trim();
    const rowMatch = segment.match(new RegExp(`^((?:Senior|Junior|Only)\\s+Officer\\s+(?:Above-Zone|In-Zone|Below-Zone))\\s*-\\s*(.+?)\\s+DOR\\s+(\\d{1,2}\\s+${datePattern})\\s+LCN\\s+(\\d{8})`, 'i'));
    if (!rowMatch) return null;

    rows.push([
      rowMatch[1].replace(/\s+/g, ' ').trim(),
      rowMatch[2].replace(/\s+/g, ' ').trim(),
      rowMatch[3].replace(/\s+/g, ' ').trim(),
      rowMatch[4],
    ]);
  }

  if (rows.length === 0) return null;

  return {
    body,
    tables: [{ headers: ['Position', 'Officer', 'DOR', 'LCN'], rows }],
  };
}

function parseProgramRankNameMccMosTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\(\s*Read:\s*Program\s*\/\s*Rank\s*\/\s*Name\s*\/\s*MCC\s*\/\s*MOS\s*\):?\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].trim();
  const data = headerMatch[2].trim();
  const rowRe = /\b([A-Z0-9]{2,8})\s*\/\s*([A-Za-z0-9]+)\s*\/\s*(.+?)\s*\/\s*([A-Z0-9]{3})\s*\/\s*(\d{4})(?=\s+[A-Z0-9]{2,8}\s*\/|$)/g;
  const rows = [...data.matchAll(rowRe)].map(match => [
    match[1],
    match[2],
    match[3].replace(/\s+/g, ' ').trim(),
    match[4],
    match[5],
  ]);

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['Program', 'Rank', 'Name', 'MCC', 'MOS'], rows }],
  };
}

function parseTLSMilestoneTimelineTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bDate\s+Milestone\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].replace(/[:\s]+$/, '').trim();
  const data = headerMatch[2].trim();
  const dateStartRe = new RegExp(`(?:Release\\s+of\\s+this\\s+message|\\d{1,2}\\s+${MONTH_NAME_RE}\\s+\\d{4})`, 'gi');
  const starts = [...data.matchAll(dateStartRe)].map(match => match.index ?? 0);
  if (starts.length < 2) return null;

  const rows: string[][] = [];
  for (let i = 0; i < starts.length; i += 1) {
    const segment = data.slice(starts[i], starts[i + 1] ?? data.length).trim();
    const rowMatch = segment.match(new RegExp(`^(Release\\s+of\\s+this\\s+message|\\d{1,2}\\s+${MONTH_NAME_RE}\\s+\\d{4})\\s+(.+)$`, 'i'));
    if (!rowMatch) return null;

    rows.push([
      rowMatch[1].replace(/\s+/g, ' ').trim(),
      rowMatch[2].replace(/\s+/g, ' ').trim(),
    ]);
  }

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['Date', 'Milestone'], rows }],
  };
}

function parseNumberedNoteRows(text: string): string[][] {
  const noteStarts = [...text.matchAll(/\bNote\s+(\d+):\s*/gi)];
  if (noteStarts.length === 0) return [];

  return noteStarts.map((match, index) => {
    const noteNumber = match[1];
    const noteStart = (match.index ?? 0) + match[0].length;
    const noteEnd = noteStarts[index + 1]?.index ?? text.length;
    const noteText = text.slice(noteStart, noteEnd).replace(/\s+/g, ' ').trim();

    return [`Note ${noteNumber}`, noteText];
  }).filter(([, noteText]) => noteText.length > 0);
}

function preserveNoteRefs(text: string): string {
  return text.replace(/\(Note\s+(\d+)\)/gi, '(Note_$1)');
}

function restoreNoteRefs(value: string): string {
  return value.replace(/\(Note_(\d+)\)/gi, '(Note $1)');
}

function parseTLSCourseAllocationTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bCourse\s+Title\/School\s+Quota\s+Convenes\s+Graduates\s+Note\s+(.+)$/is);
  if (!headerMatch) return null;

  const intro = headerMatch[1]
    .replace(/\(Read in (?:five|5) columns?\)\s*$/i, '')
    .replace(/[:\s]+$/, '')
    .trim();
  const afterHeader = headerMatch[2].trim();
  const firstNoteIdx = afterHeader.search(/\bNote\s+\d+:/i);
  const tableData = firstNoteIdx >= 0 ? afterHeader.slice(0, firstNoteIdx).trim() : afterHeader;
  const notes = firstNoteIdx >= 0 ? afterHeader.slice(firstNoteIdx).trim() : '';

  const dateValue = `${SHORT_MONTH_RE}\\s+\\d{2}`;
  const rowRe = new RegExp(`(.+?)\\s+(\\d+)\\s+(${dateValue})\\s+(${dateValue})(?:\\s+(\\d+(?:,\\d+)*))?(?=\\s+.+?\\s+\\d+\\s+${dateValue}\\s+${dateValue}|$)`, 'gis');
  const rows: string[][] = [];
  let m: RegExpExecArray | null;

  while ((m = rowRe.exec(tableData)) !== null) {
    const title = m[1].replace(/\s+/g, ' ').trim();
    if (!title) continue;

    rows.push([
      title,
      m[2],
      m[3].replace(/\s+/g, ' ').trim(),
      m[4].replace(/\s+/g, ' ').trim(),
      m[5] ?? '',
    ]);
  }

  if (rows.length < 2) return null;

  const noteRows = parseNumberedNoteRows(notes);
  const tables: DetectedTable[] = [
    { headers: ['Course Title / School', 'Quota', 'Convenes', 'Graduates', 'Note'], rows },
  ];

  if (noteRows.length > 0) {
    tables.push({
      title: 'Notes',
      headers: ['Note', 'Details'],
      rows: noteRows,
    });
  }

  return {
    body: intro,
    tables,
  };
}

function parseSNCOProjectedPromotionsTable(text: string): ParsedTableFamily | null {
  const noteStart = text.search(/\bNote\s+\d+:/i);
  const mainText = noteStart >= 0 ? text.slice(0, noteStart).trim() : text.trim();
  const notesText = noteStart >= 0 ? text.slice(noteStart).trim() : '';

  const projectionMatch = mainText.match(/^(.*?)\bAR\s+SMCR\s+IRR\s+(.+)$/is);
  const gradeRe = /^(?:SgtMaj\/MGySgt|1stSgt\/MSgt|MGySgt|MGYSGT|MSGT|MSgt|GySgt|SSgt)$/i;
  const valueRe = /^(?:\d+|\(Note_\d+\))$/i;

  if (projectionMatch) {
    const body = projectionMatch[1].replace(/[:\s]+$/, '').trim();
    const tokens = preserveNoteRefs(projectionMatch[2]).split(/\s+/).filter(Boolean);
    const rows: string[][] = [];
    let cursor = 0;

    while (cursor < tokens.length) {
      const grade = tokens[cursor];
      if (!gradeRe.test(grade)) break;

      const values = tokens.slice(cursor + 1, cursor + 4);
      if (values.length < 3 || !values.every(value => valueRe.test(value))) break;

      rows.push([grade, ...values.map(restoreNoteRefs)]);
      cursor += 4;
    }

    if (rows.length < 2) return null;

    const tables: DetectedTable[] = [{ headers: ['Grade', 'AR', 'SMCR', 'IRR'], rows }];
    const noteRows = parseNumberedNoteRows(notesText);
    if (noteRows.length > 0) {
      tables.push({ title: 'Notes', headers: ['Note', 'Details'], rows: noteRows });
    }

    return { body, tables };
  }

  const statusHeaderRe = /\bNUMBER\s+SENIOR\s+NO\.\s+JUN\s+26\s+LAST\s+SENIOR\s+PROJECTED\s+GRADE\s+SELECTED\s+PROM\s+MAY\s+26\s+PROM\s+NO\.\s+PROM\s+FOR\s+JUL\s+26\s+/i;
  const statusMatch = mainText.match(statusHeaderRe);
  if (!statusMatch?.index && statusMatch?.index !== 0) return null;

  const body = mainText.slice(0, statusMatch.index).replace(/[:\s]+$/, '').trim();
  const data = mainText.slice(statusMatch.index + statusMatch[0].length).trim();
  const tokens = preserveNoteRefs(data).split(/\s+/).filter(Boolean);
  const rows: string[][] = [];
  let cursor = 0;

  while (cursor < tokens.length) {
    const grade = tokens[cursor];
    if (!gradeRe.test(grade)) break;

    const values = tokens.slice(cursor + 1, cursor + 6);
    if (values.length < 5 || !values.every(value => valueRe.test(value))) break;

    rows.push([grade, ...values.map(restoreNoteRefs)]);
    cursor += 6;
  }

  if (rows.length < 2) return null;

  const tables: DetectedTable[] = [{
    headers: [
      'Grade',
      'Number Selected',
      'Senior No. Prom May 26',
      'Jun 26 Prom',
      'Last Senior No. Prom',
      'Projected For Jul 26',
    ],
    rows,
  }];

  const noteRows = parseNumberedNoteRows(notesText);
  if (noteRows.length > 0) {
    tables.push({ title: 'Notes', headers: ['Note', 'Details'], rows: noteRows });
  }

  return { body, tables };
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

function parseSergeantsMajorBilletSlateTable(text: string): ParsedTableFamily | null {
  const match = text.match(/^(.*?)\bName\s+Command\s+Location\s+NLT\s+Date\s+(.+)$/is);
  if (!match) return null;

  const body = match[1].replace(/\(read in\s+4\s+columns?\):?/i, '').replace(/[:\s]+$/, '').trim();
  const data = match[2].trim();
  const monthRe = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
  const segmentRe = new RegExp(`(.+?\\b${monthRe}\\s+\\d{4})(?=\\s+[A-Z]\\.\\s+[A-Z]\\.\\s+|$)`, 'gi');
  const rowSegments = [...data.matchAll(segmentRe)].map(match => match[1].trim());
  const rows: string[][] = [];

  for (const segment of rowSegments) {
    const rowMatch = segment.match(new RegExp(`^(.+?)\\s+(${monthRe}\\s+\\d{4})$`, 'i'));
    if (!rowMatch) return null;

    const beforeDate = rowMatch[1].trim();
    const nltDate = rowMatch[2].replace(/\s+/g, ' ').trim();
    const tokens = beforeDate.split(/\s+/).filter(Boolean);
    const commandStartIdx = tokens.findIndex(token =>
      /^(?:HQTRS,?|[0-9][A-Z]{2}|[A-Z]{2,}[A-Z0-9-]*,?)$/.test(token),
    );

    if (commandStartIdx <= 0) return null;

    let locationStartIdx = commandStartIdx + 1;
    while (
      locationStartIdx < tokens.length &&
      /^[A-Z0-9-]+,?$/.test(tokens[locationStartIdx])
    ) {
      locationStartIdx += 1;
    }

    const name = tokens.slice(0, commandStartIdx).join(' ').replace(/\s+/g, ' ').trim();
    const command = tokens.slice(commandStartIdx, locationStartIdx).join(' ').replace(/\s+/g, ' ').trim();
    const location = tokens.slice(locationStartIdx).join(' ').replace(/\s+/g, ' ').trim();
    if (!name || !command || !location) return null;

    rows.push([name, command, location, nltDate]);
  }

  if (rows.length === 0) return null;

  return {
    body,
    tables: [{ headers: ['Name', 'Command', 'Location', 'NLT Date'], rows }],
  };
}

function parseCommandMCCTentativeReportDateTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bCOMMAND\s+MCC\s+TENTATIVE\s+REPORT\s+DATE\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].replace(/[:\s]+$/, '').trim();
  const tokens = headerMatch[2].trim().split(/\s+/).filter(Boolean);
  const monthRe = /^(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/i;
  const yearRe = /^\d{4}$/;
  const mccRe = /^[A-Z0-9]{3}$/i;
  const rows: string[][] = [];
  let cursor = 0;

  while (cursor < tokens.length) {
    const monthIdx = tokens.findIndex((token, idx) =>
      idx > cursor && monthRe.test(token) && yearRe.test(tokens[idx + 1] ?? ''),
    );
    if (monthIdx < 0) break;

    const rowTokens = tokens.slice(cursor, monthIdx);
    const mcc = rowTokens.at(-1) ?? '';
    const commandTokens = rowTokens.slice(0, -1);
    if (!mccRe.test(mcc) || commandTokens.length === 0) break;

    rows.push([
      commandTokens.join(' '),
      mcc.toUpperCase(),
      `${tokens[monthIdx].toUpperCase()} ${tokens[monthIdx + 1]}`,
    ]);
    cursor = monthIdx + 2;
  }

  if (rows.length === 0) return null;

  return {
    body,
    tables: [{ headers: ['Command', 'MCC', 'Tentative Report Date'], rows }],
  };
}

function parseMCCUnitDescriptionNoteTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bMCC\s+Unit\s+Description\s+Note\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].replace(/[:\s]+$/, '').trim();
  const data = headerMatch[2].trim();
  const rowStartRe = /\b[A-Z0-9]{3}\s+(?:RS|OST)\b/gi;
  const starts = [...data.matchAll(rowStartRe)].map(match => match.index ?? 0);
  if (starts.length === 0) return null;

  const noteRe = /\s+(\d(?:,\d)*)$/;
  const rows: string[][] = [];

  for (let i = 0; i < starts.length; i += 1) {
    const segment = data.slice(starts[i], starts[i + 1] ?? data.length).trim();
    const mccMatch = segment.match(/^([A-Z0-9]{3})\s+(.+)$/i);
    if (!mccMatch) return null;

    const mcc = mccMatch[1].toUpperCase();
    let unitDescription = mccMatch[2].trim();
    let note = '';

    const noteMatch = unitDescription.match(noteRe);
    if (noteMatch) {
      note = noteMatch[1];
      unitDescription = unitDescription.slice(0, noteMatch.index).trim();
    }

    if (!/^(?:RS|OST)\b/i.test(unitDescription)) return null;
    rows.push([mcc, unitDescription, note]);
  }

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['MCC', 'Unit Description', 'Note'], rows }],
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

// Parses SRB kicker summary tables, e.g.:
// Kicker  Amount  Rank Eligibility  Para.
// Aircraft Maintenance Kicker  $5,000-15,000  E7 & Below  4.a
function parseSRBKickerTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bKicker\s+Amount\s+Rank\s+Eligibility\s+Para\.\s*/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].trim();
  const data = text.slice(headerMatch[0].length).trim();

  const rowRe = /(.+?Kicker)\s+(\$[\d,]+(?:-[\d,]+)?)\s+(E\d+\s*&\s*Below)\s+(\d+\.[a-g])/g;
  const rows: string[][] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(data)) !== null) {
    rows.push([m[1].trim(), m[2].trim(), m[3].trim(), m[4].trim()]);
  }

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['Kicker', 'Amount', 'Rank Eligibility', 'Para'], rows }],
  };
}

// Parses SRB PMOS zone bonus tables, e.g.:
// PMOS  E3  E4  E5 & Above          (Zone A — 3 grade columns)
// PMOS  E5  E6 & Above              (Zone B — 2 grade columns)
// PMOS  E7 & ABOVE                  (Zones D/E/F — 1 grade column)
// 0211LM  -  49,000  51,000
// 0231    17,250  19,000  19,750
function parseSRBPMOSBonusTable(text: string): ParsedTableFamily | null {
  const headerRe = /\bPMOS\s+(E\d+(?:\s*&\s*(?:Above|ABOVE))?(?:\s+E\d+(?:\s*&\s*(?:Above|ABOVE))?)*)\s/i;
  const headerMatch = text.match(headerRe);
  if (!headerMatch) return null;

  const body       = text.slice(0, headerMatch.index).trim();
  const afterHeader = text.slice((headerMatch.index ?? 0) + headerMatch[0].length).trim();

  const gradeHeaders = [...headerMatch[1].matchAll(/E\d+(?:\s*&\s*(?:Above|ABOVE))?/gi)]
    .map(m => m[0].replace(/\s+/g, ' ').trim());
  if (gradeHeaders.length === 0) return null;
  const numValueCols = gradeHeaders.length;

  const tokens   = afterHeader.split(/\s+/).filter(Boolean);
  const pmosRe   = /^\d{4}(?:LM)?$/i;
  const valueRe  = /^\d{1,3}(?:,\d{3})*$|^[-–—]$/;

  const rows: string[][] = [];
  let i = 0;

  while (i < tokens.length) {
    if (!pmosRe.test(tokens[i])) break;
    const pmos = tokens[i++];
    const values: string[] = [];
    for (let v = 0; v < numValueCols && i < tokens.length; v++) {
      if (valueRe.test(tokens[i])) { values.push(tokens[i++]); }
      else break;
    }
    if (values.length === numValueCols) rows.push([pmos, ...values]);
    else break;
  }

  if (rows.length < 3) return null;

  return {
    body,
    tables: [{ headers: ['PMOS', ...gradeHeaders], rows }],
  };
}

// Parses officer board/panel schedule tables, e.g.:
// Board/Panel  Convening Date
// FY27 Marine Barracks Washington (MBW) Panel  19 May 26
// FY27 Service Academy Slate Panel  1 Jun 26 ...
function parseBoardPanelScheduleTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bBoard\/Panel\s+Convening\s+Date\b\s*/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].trim();
  const data = text.slice(headerMatch[0].length).trim();

  // Each row starts with FY\d{2} or "Academic Year" — split on those boundaries.
  const segments = data.split(/(?=\bFY\d{2}\b|\bAcademic Year\b)/i).filter(s => s.trim());

  const dateRe = /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2})\b/i;
  const rows: string[][] = [];

  for (const segment of segments) {
    const dateMatch = segment.match(dateRe);
    if (!dateMatch) continue;
    const date = dateMatch[1].replace(/\s+/g, ' ').trim();
    // Remove the date from the segment; the rest (before + after) is the full board name.
    const name = segment.replace(dateRe, ' ').replace(/\s+/g, ' ').trim();
    if (name && date) rows.push([name, date]);
  }

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['Board / Panel', 'Convening Date'], rows }],
  };
}

function parseEnlistedBoardPanelScheduleTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bBoard\/Panel\s+Application\s+Deadline\s+Convening\s+Date\b\s*/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].trim();
  const data = text.slice(headerMatch[0].length).trim();
  const tokens = data.split(/\s+/).filter(Boolean);
  if (tokens.length < 9) return null;

  const monthTokenRe = /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)$/i;
  const fourDigitYearRe = /^\d{4}$/;
  const twoDigitYearRe = /^\d{2}$/;
  const maradminNumberRe = /^\d+\/\d+$/i;

  function readDeadline(start: number): { value: string; end: number } | null {
    const token = tokens[start];
    const next = tokens[start + 1];

    if (/^(Quarterly|Semi-Annual)$/i.test(token)) {
      return { value: token, end: start + 1 };
    }

    if (monthTokenRe.test(token) && next && fourDigitYearRe.test(next)) {
      return { value: `${token} ${next}`, end: start + 2 };
    }

    return null;
  }

  function readConvening(start: number): { value: string; end: number } | null {
    const token = tokens[start];
    const next = tokens[start + 1];
    const third = tokens[start + 2];

    if (/^(Quarterly|Semi-Annual)$/i.test(token)) {
      return { value: token, end: start + 1 };
    }

    if (monthTokenRe.test(token) && next && fourDigitYearRe.test(next)) {
      return { value: `${token} ${next}`, end: start + 2 };
    }

    if (/^See$/i.test(token) && /^MARADMIN$/i.test(next ?? '') && maradminNumberRe.test(third ?? '')) {
      return { value: `See MARADMIN ${third}`, end: start + 3 };
    }

    if (/^\d{1,2}$/.test(token) && monthTokenRe.test(next ?? '') && twoDigitYearRe.test(third ?? '')) {
      return { value: `${token} ${next} ${third}`, end: start + 3 };
    }

    return null;
  }

  const rows: string[][] = [];
  let cursor = 0;

  while (cursor < tokens.length) {
    let matched = false;

    for (let i = cursor + 1; i < tokens.length; i += 1) {
      const deadline = readDeadline(i);
      if (!deadline) continue;

      const convening = readConvening(deadline.end);
      if (!convening) continue;

      const boardPanel = tokens.slice(cursor, i).join(' ').trim();
      if (!boardPanel) continue;

      rows.push([boardPanel, deadline.value, convening.value]);
      cursor = convening.end;
      matched = true;
      break;
    }

    if (!matched) break;
  }

  if (rows.length < 3) return null;

  return {
    body,
    tables: [{ headers: ['Board / Panel', 'Application Deadline', 'Convening Date'], rows }],
  };
}

// Parses LDO/WO selectee lists with "Name MCC SMOS" header, e.g.:
// (Read in three columns). Name MCC SMOS
// ALDRICH, RYAN M. 15A 2340 BARNETT, RUFUS B. 779 0430 ...
function parseLDOSelecteeTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bName\s+MCC\s+SMOS\b\s+(.+)$/is);
  if (!headerMatch) return null;

  const body   = headerMatch[1].trim();
  const data   = headerMatch[2].trim();
  const tokens = data.split(/\s+/).filter(Boolean);

  const smosRe = /^\d{4}$/;
  const mccRe  = /^[A-Z0-9]{3}$/i;

  const rows: string[][] = [];
  let nameStart = 0;

  for (let i = 0; i < tokens.length; i++) {
    if (smosRe.test(tokens[i]) && i > 0 && mccRe.test(tokens[i - 1])) {
      const nameTokens = tokens.slice(nameStart, i - 1);
      if (nameTokens.length > 0) {
        rows.push([nameTokens.join(' '), tokens[i - 1], tokens[i]]);
      }
      nameStart = i + 1;
    }
  }

  if (rows.length === 0) return null;

  return {
    body,
    tables: [{ headers: ['Name', 'MCC', 'SMOS'], rows }],
  };
}

// Parses SSgt/SNCO seniority number → projected promotion month table, e.g.:
// Sen Num  Proj Month
// 250      Aug 2026
// 500      Sep 2026
// (List Clear)  Jul 2027
function parseSeniorityProjectedMonthTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bSen\s+Num\s+Proj\s+Month\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].trim();
  const data = headerMatch[2].trim();
  const monthRe = /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i;
  const yearRe = /^\d{4}$/;
  const numRe = /^\d+$/;
  const tokens = data.split(/\s+/).filter(Boolean);
  const rows: string[][] = [];
  let i = 0;

  while (i < tokens.length) {
    if (/^\(List$/i.test(tokens[i]) && /^Clear\)$/i.test(tokens[i + 1] ?? '')) {
      if (monthRe.test(tokens[i + 2] ?? '') && yearRe.test(tokens[i + 3] ?? '')) {
        rows.push(['(List Clear)', `${tokens[i + 2]} ${tokens[i + 3]}`]);
        i += 4;
      } else {
        break;
      }
    } else if (/^\(List\s+Clear\)$/i.test(tokens[i])) {
      if (monthRe.test(tokens[i + 1] ?? '') && yearRe.test(tokens[i + 2] ?? '')) {
        rows.push(['(List Clear)', `${tokens[i + 1]} ${tokens[i + 2]}`]);
        i += 3;
      } else {
        break;
      }
    } else if (numRe.test(tokens[i])) {
      if (monthRe.test(tokens[i + 1] ?? '') && yearRe.test(tokens[i + 2] ?? '')) {
        rows.push([tokens[i], `${tokens[i + 1]} ${tokens[i + 2]}`]);
        i += 3;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (rows.length < 3) return null;

  return {
    body,
    tables: [{ headers: ['Sen Num', 'Proj Month'], rows }],
  };
}

// Parses SNCO selectee lists with "NAME IMOS/ SRNO/MCC" header, e.g.:
// (for proper order read left to right): NAME IMOS/ SRNO/MCC NAME IMOS/ SRNO/MCC
// ABAKAR A 3381/ 2936/026 ABALOS JM 6132/ 1037/1JQ ...
function parseNameImosSrnoMccTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bNAME\s+IMOS\/\s+SRNO\/MCC\s+(?:NAME\s+IMOS\/\s+SRNO\/MCC\s+)?(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1].trim();
  const data = headerMatch[2].trim();

  // Pattern: LASTNAME [SUFFIX] INITIALS IMOS/ SRNO/MCC
  // SRNO may carry a letter suffix (e.g. 940A, 2653A) or be plain digits (e.g. 2936, 291)
  // e.g.  ABAKAR A 3381/ 2936/026   or   ARMSTRONG CC 6483/ 940A/H60   or   ABBOTT IV RM 3529/ 291/1CM
  const rowRe = /\b([A-Z]{2,}(?:\s+(?:II|III|IV|JR|SR))?)\s+([A-Z]{1,3})\s+(\d{4})\/\s+(\d{2,4}[A-Z]?)\/([A-Z0-9]{2,4})\b/g;
  const rows: string[][] = [];

  for (const match of data.matchAll(rowRe)) {
    rows.push([match[1].trim(), match[2], match[3], `${match[4]}/${match[5]}`]);
  }

  if (rows.length < 3) return null;

  return {
    body,
    tables: [{ headers: ['Name', 'Init', 'IMOS', 'SRNO/MCC'], rows }],
  };
}

// Parses SNCO/enlisted promotion board zone/allocation tables, e.g.:
// ABOVE ZONE  PROMOTION ZONE  BELOW ZONE
// ALLOC IMOS  JR DOR AFADBD  JR DOR AFADBD  JR DOR AFADBD
// 5 0111 20211101 NA 20220401 20071220 20220401 20080401 ...
// THE FOLLOWING OCCFLD(S) ARE CLOSED: 0321, 0399 ...
function parseSNCOBoardZoneTable(text: string): ParsedTableFamily | null {
  // Supports both column orders: "IMOS ALLOC ..." and "ALLOC IMOS ..."
  const imoFirstRe  = /ABOVE\s+ZONE\s+PROMOTION\s+ZONE\s+BELOW\s+ZONE\s+IMOS\s+ALLOC\s+JR\s+DOR\s+AFADBD\s+JR\s+DOR\s+AFADBD\s+JR\s+DOR\s+AFADBD/i;
  const allocFirstRe = /ABOVE\s+ZONE\s+PROMOTION\s+ZONE\s+BELOW\s+ZONE\s+ALLOC\s+IMOS\s+JR\s+DOR\s+AFADBD\s+JR\s+DOR\s+AFADBD\s+JR\s+DOR\s+AFADBD/i;

  const imosFirst = imoFirstRe.test(text);
  const headerMatch = text.match(imosFirst ? imoFirstRe : allocFirstRe);
  if (!headerMatch) return null;

  const matchStart = headerMatch.index ?? 0;
  const body = text.slice(0, matchStart).trim();
  const afterHeader = text.slice(matchStart + headerMatch[0].length).trim();

  const closedIdx = afterHeader.search(/\bTHE FOLLOWING OCCFLD\(S\) ARE CLOSED\b/i);
  const dataStr   = closedIdx >= 0 ? afterHeader.slice(0, closedIdx).trim() : afterHeader;
  const closedStr = closedIdx >= 0 ? afterHeader.slice(closedIdx).trim() : '';

  const tokens = dataStr.split(/\s+/).filter(Boolean);
  const dateOrNa = /^(\d{6,8}|NA)$/i;
  const isAlloc  = /^\d{1,3}$/;
  const isImos   = /^\d{4}$/;

  const rows: string[][] = [];
  let i = 0;

  while (i + 7 < tokens.length) {
    const first  = tokens[i];
    const second = tokens[i + 1];
    const cols   = tokens.slice(i + 2, i + 8);

    const firstOk  = imosFirst ? isImos.test(first) : isAlloc.test(first);
    const secondOk = imosFirst ? isAlloc.test(second) : isImos.test(second);
    if (!firstOk || !secondOk || !cols.every(t => dateOrNa.test(t))) break;

    const imos  = imosFirst ? first : second;
    const alloc = imosFirst ? second : first;
    rows.push([imos, alloc, ...cols]);
    i += 8;
  }

  if (rows.length === 0) return null;

  const closedCodes = closedStr.match(/\d{4}/g);
  const footerNote  = closedCodes && closedCodes.length > 0
    ? `OCCFLD(S) CLOSED: ${closedCodes.join(', ')}`
    : '';

  return {
    body: [body, footerNote].filter(Boolean).join(' '),
    tables: [{
      headers: ['IMOS', 'ALLOC', 'AZ JR DOR', 'AZ AFADBD', 'PZ JR DOR', 'PZ AFADBD', 'BZ JR DOR', 'BZ AFADBD'],
      rows,
    }],
  };
}

// Parses recruiting station availability tables, e.g.:
// RS availability for FY28 ... (Read in seven columns):
// Recruiting Station  1-28  2-28  3-28  4-28  5-28  6-28
// ALBANY, NY          3     4     3     3     4     3
// Parses university/vacancy billet tables, e.g.:
// University/Vacancy                 MCC   Location
// UNIVERSITY OF WASHINGTON           H95   Seattle, WA
// MARINE CORPS RECRUIT DEPOT, PI     040   Parris Island, SC
// Institution names are ALL CAPS; city/state is mixed-case — used to split the two.
// Parses officer NAME / RANK / MOS panel-result tables, e.g.:
// NAME                    RANK   MOS
// Westley, Nicholas S.    Maj    4402
// Hudson, Christopher M.  Capt   0302
// Names use "Last, First MI." format; rank is a standard grade token.
function parseNameRankMOSTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bNAME\s+RANK\s+MOS\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1]
    .replace(/\(read in (?:three|3) columns?\):?\s*$/i, '')
    .replace(/[:\s]+$/, '')
    .trim();
  const data = headerMatch[2].trim();

  const rankPattern = '(?:Gen|LtGen|MajGen|BGen|Col|LtCol|Maj|Capt|1stLt|2ndLt|CWO[2-5]|WO)';
  const rowRe = new RegExp(
    `([A-Za-z][A-Za-z'-]+,\\s+[A-Za-z][A-Za-z'.\\s-]+?)\\s+(${rankPattern})\\s+(\\d{4})`,
    'g',
  );

  const rows: string[][] = [];
  for (const match of data.matchAll(rowRe)) {
    rows.push([match[1].trim(), match[2], match[3]]);
  }

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['Name', 'Rank', 'MOS'], rows }],
  };
}

function parseUniversityVacancyTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bUniversity\/Vacancy\s+MCC\s+Location\s+(.+)$/is);
  if (!headerMatch) return null;

  const body = headerMatch[1]
    .replace(/\(read in (?:three|3) columns?\):?\s*$/i, '')
    .replace(/[:\s]+$/, '')
    .trim();
  const data = headerMatch[2].trim();

  // Institution names are all-caps (may include commas, e.g. "DEPOT, PI").
  // MCC is 2–4 alphanumeric chars. Location is mixed-case "City[, City], ST".
  const rowRe = /([A-Z][A-Z,./\s]+?)\s+([A-Z0-9]{2,4})\s+((?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+[A-Z]{2})/g;
  const rows: string[][] = [];

  for (const match of data.matchAll(rowRe)) {
    rows.push([match[1].trim(), match[2], match[3].trim()]);
  }

  if (rows.length < 2) return null;

  return {
    body,
    tables: [{ headers: ['University / Vacancy', 'MCC', 'Location'], rows }],
  };
}

function parseRecruitingStationAvailabilityTable(text: string): ParsedTableFamily | null {
  const headerMatch = text.match(/^(.*?)\bRecruiting\s+Station\s+((?:\d+-\d+\s+){2,}\d+-\d+)\s+/i);
  if (!headerMatch) return null;

  const colHeaders = headerMatch[2].match(/\d+-\d+/g) ?? [];
  if (colHeaders.length < 2) return null;

  // Strip trailing "Read in N columns" artifact and colon from body
  const body = headerMatch[1]
    .replace(/\(Read in (?:seven|7) columns\):?\s*$/i, '')
    .replace(/[:\s]+$/, '')
    .trim();

  const data = text.slice(headerMatch[0].length).trim();
  const tokens = data.split(/\s+/).filter(Boolean);

  const stateRe = /^[A-Z]{2}$/;
  const numRe = /^\d+$/;
  const numCols = colHeaders.length;
  const rows: string[][] = [];
  let i = 0;

  while (i < tokens.length) {
    // City name: one or more words, last token ends with comma, next token is a 2-letter state.
    let commaIdx = -1;
    for (let j = i; j < Math.min(i + 5, tokens.length - 1); j++) {
      if (tokens[j].endsWith(',') && stateRe.test(tokens[j + 1])) {
        commaIdx = j;
        break;
      }
    }
    if (commaIdx < 0) break;

    const stateIdx = commaIdx + 1;
    const numStart = stateIdx + 1;
    if (numStart + numCols > tokens.length) break;

    const nums = tokens.slice(numStart, numStart + numCols);
    if (!nums.every(t => numRe.test(t))) break;

    const cityPart = tokens.slice(i, commaIdx + 1).join(' ').replace(/,$/, '');
    rows.push([`${cityPart}, ${tokens[stateIdx]}`, ...nums]);
    i = numStart + numCols;
  }

  if (rows.length < 3) return null;

  return {
    body,
    tables: [{ headers: ['Recruiting Station', ...colHeaders], rows }],
  };
}

const TABLE_FAMILY_PARSERS = [
  parseSeniorityProjectedMonthTable,
  parseNameImosSrnoMccTable,
  parseInlineEligibilityTable,
  parsePromotionBoardConveningTable,
  parseGeneralOfficerPromotionZoneTable,
  parseProgramRankNameMccMosTable,
  parseTLSMilestoneTimelineTable,
  parseTLSCourseAllocationTable,
  parseSNCOProjectedPromotionsTable,
  parseEnlistedBoardPanelScheduleTable,
  parseBoardPanelScheduleTable,
  parseSRBKickerTable,
  parseSRBPMOSBonusTable,
  parseInlinePromotionTable,
  parseLDOSelecteeTable,
  parseInlineAttendeeTable,
  parseRankNameImosMccTable,
  parseInlineRankNameMCCTable,
  parseAviationBoardResultsTable,
  parseIAPSelectionPanelResultsTable,
  parseNameRankMOSTable,
  parseUniversityVacancyTable,
  parseRecruitingStationAvailabilityTable,
  parseCommandMCCTentativeReportDateTable,
  parseMCCUnitDescriptionNoteTable,
  parseSergeantsMajorBilletSlateTable,
  parseVacancySummaryTable,
  parseProjectedPromotionsTable,
  parseFeederMosTable,
  parseSNCOBoardZoneTable,
  parseAllocationCutoffTables,
];

export function parseRecognizedTableFamily(text: string): ParsedTableFamily | null {
  for (const parser of TABLE_FAMILY_PARSERS) {
    const parsed = parser(text);
    if (parsed) return parsed;
  }

  return null;
}
