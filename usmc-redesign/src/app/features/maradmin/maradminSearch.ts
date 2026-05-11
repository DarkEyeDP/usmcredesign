import MiniSearch from 'minisearch';
import type { RSSMessage } from './maradminUtils';

export interface SearchDoc {
  id: string;
  subject: string;
  tags: string;
  body: string;
}

export function createSearchIndex() {
  return new MiniSearch<SearchDoc>({
    fields: ['subject', 'tags', 'body'],
    storeFields: [],
    searchOptions: {
      boost: { subject: 3, tags: 2, body: 1 },
      fuzzy: 0.2,
      prefix: true,
    },
  });
}

export function msgToSearchDoc(msg: RSSMessage, body = ''): SearchDoc {
  return {
    id: msg.id,
    subject: msg.subject,
    tags: msg.tags.join(' '),
    body,
  };
}

export function normalizeMARADMINNumber(value: string): string {
  return value.trim().toUpperCase().replace(/-/g, '/');
}

export function extractExactMARADMINNumberQuery(query: string): string | null {
  const normalized = normalizeMARADMINNumber(query).replace(/^MARADMIN\s+/, '');
  return /^\d{1,4}\/\d{2}$/.test(normalized) ? normalized : null;
}

export function promoteExactMARADMINMatches(messages: RSSMessage[], query: string): RSSMessage[] {
  const exactNumber = extractExactMARADMINNumberQuery(query);
  if (!exactNumber) return messages;

  const exactMatches = messages.filter(message => normalizeMARADMINNumber(message.number) === exactNumber);
  if (exactMatches.length === 0) return messages;

  const exactIds = new Set(exactMatches.map(message => message.id));
  return [...exactMatches, ...messages.filter(message => !exactIds.has(message.id))];
}
