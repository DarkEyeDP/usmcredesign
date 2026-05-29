import { Fragment } from 'react';
import type { ReactNode } from 'react';

export interface Contact {
  name: string;
  section?: string;
  email?: string;
  comm?: string;
}

const RANK_NORM: Record<string, string> = {
  GEN: 'Gen', LTGEN: 'LtGen', MAJGEN: 'MajGen', BGEN: 'BGen',
  COL: 'Col', LTCOL: 'LtCol', MAJ: 'Maj', CAPT: 'Capt',
  '1STLT': '1stLt', '2NDLT': '2ndLt',
  CWO5: 'CWO5', CWO4: 'CWO4', CWO3: 'CWO3', CWO2: 'CWO2', CWO: 'CWO', WO: 'WO',
  SGTMAJ: 'SgtMaj', MGYSGT: 'MGySgt', MSGT: 'MSgt', GYSGT: 'GySgt',
  SSGT: 'SSgt', SGT: 'Sgt', CPL: 'Cpl', LCPL: 'LCpl', PFC: 'Pfc', PVT: 'Pvt',
  CIV: 'Civ', SES: 'SES', GS: 'GS', SMAJ: 'SgtMaj',
};

function titleCaseWord(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

export function splitContactEmails(value: string): string[] {
  const normalized = value
    .replace(/\s*\(\s*at\s*\)\s*/gi, '@')
    .replace(/\s*\[\s*at\s*\]\s*/gi, '@')
    .replace(/\s+at\s+/gi, '@')
    .replace(/\s+(?:or|and)\s+/gi, '|')
    .replace(/\s*[,;/]\s*/g, '|')
    .replace(/\s+/g, '')
    .replace(/\.+(?=@)/g, '.')
    .replace(/\.{2,}/g, '.')
    .toLowerCase();

  return Array.from(new Set(normalized.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/g) ?? []));
}

export function normalizeHeaderPOCEmail(value: string): string {
  return splitContactEmails(value).join(' or ');
}

export function renderContactEmail(email: string): ReactNode {
  const emails = splitContactEmails(email);
  if (emails.length === 0) return email;

  return (
    <>
      {emails.map((addr, index) => (
        <Fragment key={addr}>
          {index > 0 && ' or '}
          <a href={`mailto:${addr}`} className="underline underline-offset-2">
            {addr}
          </a>
        </Fragment>
      ))}
    </>
  );
}

export function parseHeaderPOCs(raw: string): Contact[] {
  const normalized = raw.replace(/POC\s*\d*\/([\s\S]+?)\/\//gi, match =>
    match
      .replace(/\r?\n\s*/g, ' ')
      .replace(/\s+\/\s+/g, '/'),
  );

  const contacts: Contact[] = [];
  const pocRe = /POC\s*\d*\/([\s\S]+?)\/\//gi;
  let m: RegExpExecArray | null;

  while ((m = pocRe.exec(normalized)) !== null) {
    const fields = m[1].split('/').map(f => f.trim()).filter(Boolean);
    if (fields.length < 2) continue;

    const rawName = fields[0];
    const rawRank = fields[1];

    const telField   = fields.find(f => /^TEL:/i.test(f));
    const emailField = fields.find(f => /^EMAIL:/i.test(f));
    const telIdx     = fields.findIndex(f => /^TEL:/i.test(f));
    const emailIdx   = fields.findIndex(f => /^EMAIL:/i.test(f));

    const comm  = telField?.replace(/^TEL:\s*/i, '').trim();
    const email = emailField
      ? normalizeHeaderPOCEmail(emailField.replace(/^EMAIL:\s*/i, '').trim())
      : undefined;

    const dataEnd   = Math.min(telIdx >= 0 ? telIdx : fields.length, emailIdx >= 0 ? emailIdx : fields.length);
    const unitParts = fields.slice(2, dataEnd).filter(Boolean);
    const section   = unitParts.length > 0 ? unitParts.join('/') : undefined;

    const formattedName = rawName.split(/\s+/).map(w =>
      w.endsWith('.') ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : titleCaseWord(w),
    ).join(' ');

    const rank = RANK_NORM[rawRank.toUpperCase()] ?? rawRank;
    const name = `${rank} ${formattedName}`.trim();

    if (name && (email || comm)) {
      contacts.push({ name, section, email, comm });
    }
  }

  return contacts;
}

// Ordered longest-first so "LtCol" matches before "Lt", "MajGen" before "Maj", etc.
const POC_RANK_PAT = [
  'SgtMaj', 'MGySgt', 'LtGen', 'MajGen', 'BGen', 'LtCol', '1stLt', '2ndLt',
  'CWO5', 'CWO4', 'CWO3', 'CWO2',
  'VADM', 'RADM', 'RDML', 'LCDR', 'LTJG',
  'GySgt', 'SSgt', 'MSgt', 'SMAJ',
  'Gen', 'Col', 'Maj', 'Capt', 'CWO', 'WO',
  'Sgt', 'Cpl', 'LCpl', 'Pfc', 'Pvt',
  'ADM', 'CAPT', 'CDR', 'ENS', 'LT',
].join('|');

const FULL_RANK_NORM: Record<string, string> = {
  colonel: 'Col',
  'lieutenant colonel': 'LtCol',
  major: 'Maj',
  captain: 'Capt',
  'gunnery sergeant': 'GySgt',
  'master sergeant': 'MSgt',
  'staff sergeant': 'SSgt',
  'mr.': 'Mr.',
  'ms.': 'Ms.',
  'mrs.': 'Mrs.',
};

const FORMAL_RANK_PAT = [
  'Lieutenant\\s+Colonel',
  'Gunnery\\s+Sergeant',
  'Master\\s+Sergeant',
  'Staff\\s+Sergeant',
  'Colonel',
  'Captain',
  'Major',
  'Mr\\.',
  'Ms\\.',
  'Mrs\\.',
].join('|');

function splitNameAndRole(value: string): { name: string; section?: string } {
  const cleaned = value.replace(/\s+/g, ' ').replace(/,+$/, '').trim();
  if (!cleaned) return { name: '' };

  const roleMatch = cleaned.match(/\b(?:Branch Head|Ground Col Monitor|Aviation Col Monitor|Combat Arms|Combat Service Support|Aviation Lieutenant Colonel Monitor|Information Lieutenant Colonel Monitor|CMC Fellowships|Foreign PME|Registrar)\b/i);
  if (roleMatch?.index && roleMatch.index > 0) {
    return {
      name: cleaned.slice(0, roleMatch.index).trim().replace(/,+$/, ''),
      section: cleaned.slice(roleMatch.index).trim(),
    };
  }

  const commaIdx = cleaned.indexOf(',');
  if (commaIdx > 0) {
    const name = cleaned.slice(0, commaIdx).trim();
    const section = cleaned.slice(commaIdx + 1).trim();
    return { name, section: section || undefined };
  }

  return { name: cleaned };
}

function normalizeFormalRank(rank: string): string {
  return FULL_RANK_NORM[rank.replace(/\s+/g, ' ').toLowerCase()] ?? rank;
}

function extractFormalBodyContacts(text: string): Contact[] {
  const starts = [...text.matchAll(new RegExp(`\\b(${FORMAL_RANK_PAT})\\s+(?!Monitor\\b)(?=[A-Z])`, 'gi'))];
  if (starts.length === 0) return [];

  const contacts: Contact[] = [];

  starts.forEach((match, index) => {
    const chunkStart = match.index ?? 0;
    const chunkEnd = starts[index + 1]?.index ?? text.length;
    const chunk = text.slice(chunkStart, chunkEnd).replace(/\s+/g, ' ').trim();
    const rankMatch = chunk.match(new RegExp(`^(${FORMAL_RANK_PAT})\\s+(?!Monitor\\b)`, 'i'));
    if (!rankMatch) return;

    const rank = normalizeFormalRank(rankMatch[1]);
    const content = chunk.slice(rankMatch[0].length).trim();
    const emailMatch = content.match(/Email:\s*([\w.+-]+@[\w.-]+\.[a-zA-Z]{2,})/i);
    const commMatch = content.match(/Comm:\s*([\d()\-. ]+?)(?=\s+Email:|$)/i);
    const email = emailMatch ? normalizeHeaderPOCEmail(emailMatch[1]) : undefined;
    const comm = commMatch?.[1]?.trim();

    const commIdx = content.search(/\bComm:/i);
    const emailIdx = content.search(/\bEmail:/i);
    const metaIdxs = [commIdx, emailIdx].filter(idx => idx >= 0);
    const nameRoleEnd = metaIdxs.length > 0 ? Math.min(...metaIdxs) : content.length;
    const { name, section } = splitNameAndRole(content.slice(0, nameRoleEnd));

    if (name && (email || comm)) {
      contacts.push({ name: `${rank} ${name}`.trim(), section, email, comm });
    }
  });

  return contacts;
}

export function extractContacts(text: string): Contact[] {
  const formalContacts = extractFormalBodyContacts(text);
  if (formalContacts.length > 0) return formalContacts;

  const SPLIT_RE = new RegExp(`(^|\\s)((?:[A-Z]{2,6})\\s+)?(${POC_RANK_PAT})\\s+(?=[A-Z])`, 'g');

  const starts: Array<{ index: number; section: string | undefined }> = [];
  let m: RegExpExecArray | null;

  while ((m = SPLIT_RE.exec(text)) !== null) {
    starts.push({
      index: m.index + m[1].length,
      section: m[2]?.trim() || undefined,
    });
  }

  if (starts.length === 0) {
    const emailRe = /([^\n.]+?)\s+Email:\s*([\w.+-]+@[\w.-]+\.[a-zA-Z]{2,})/gi;
    const fallback: Contact[] = [];
    while ((m = emailRe.exec(text)) !== null) {
      const name  = m[1].trim().replace(/^\d+[.a-z]+\s+/i, '');
      const email = m[2];
      const rest  = text.slice(m.index + m[0].length, m.index + m[0].length + 80);
      const comm  = (rest.match(/Comm:\s*([\d.\-\s]+)/) ?? [])[1]?.trim();
      fallback.push({ name, email, comm });
    }
    return fallback;
  }

  const contacts: Contact[] = [];
  let currentSection: string | undefined;

  for (let i = 0; i < starts.length; i++) {
    if (starts[i].section) currentSection = starts[i].section;

    const chunkStart = starts[i].index + (starts[i].section ? starts[i].section!.length + 1 : 0);
    const chunkEnd   = starts[i + 1]?.index ?? text.length;
    const chunk      = text.slice(chunkStart, chunkEnd).trim();

    const emailMatch = chunk.match(/Email:\s*([\w.+-]+@[\w.-]+\.[a-zA-Z]{2,})/i);
    const email      = emailMatch?.[1];

    const commMatch = chunk.match(/Comm:\s*([\d()\-. ]+?)(?=\s+(?:Email:|[A-Z])|$)/i)
                   ?? chunk.match(/Comm:\s*([\d()\-. ]+)/i);
    const comm = commMatch?.[1]?.trim().replace(/\s+$/, '');

    const emailIdx = email ? chunk.indexOf('Email:') : chunk.length;
    const commIdx  = comm  ? chunk.indexOf('Comm:')  : chunk.length;
    const name     = chunk.slice(0, Math.min(emailIdx, commIdx)).trim();

    if (name && (email || comm)) {
      contacts.push({ name, section: currentSection, email, comm });
    }
  }

  return contacts;
}
