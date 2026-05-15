import type { ReactNode } from 'react';
import { fixSpelledOutURLs } from './maradminLinkUtils';

export interface LinkButton {
  url: string;
  label: string;
}

export function renderWithLinks(raw: string): ReactNode {
  const text  = fixSpelledOutURLs(raw);
  const TOKEN = /(https?:\/\/[^\s<>"')\]]+|[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}|\b(?:DSN[:\s]*)?\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const val = m[1].replace(/[.,;:)]+$/, '');
    if (val.startsWith('http')) {
      parts.push(
        <a key={m.index} href={val} target="_blank" rel="noopener noreferrer"
          className="text-red-400 hover:text-red-300 underline underline-offset-2 break-all">
          {val}
        </a>,
      );
    } else if (val.includes('@')) {
      parts.push(
        <a key={m.index} href={`mailto:${val}`}
          className="text-red-400 hover:text-red-300 underline underline-offset-2">
          {val}
        </a>,
      );
    } else {
      parts.push(
        <a key={m.index} href={`tel:${val.replace(/\D/g, '')}`}
          className="text-red-400 hover:text-red-300 underline underline-offset-2 whitespace-nowrap">
          {val}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function extractURLButtons(text: string): LinkButton[] {
  const fixed   = fixSpelledOutURLs(text);
  const matches = [...fixed.matchAll(/https?:\/\/[^\s<>"')\]]+/g)];
  return matches.map(m => {
    const url = m[0].replace(/[.,;:)]+$/, '');
    try { return { url, label: new URL(url).hostname.replace(/^www\./, '').toUpperCase() }; }
    catch { return { url, label: 'VIEW LINK' }; }
  });
}
