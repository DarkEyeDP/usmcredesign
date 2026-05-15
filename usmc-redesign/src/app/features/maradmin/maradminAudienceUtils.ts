import type { RSSMessage } from './maradminUtils';
import type { CustomView } from './maradminStorage';

export const AUDIENCES = ['TOTAL FORCE', 'ENLISTED', 'OFFICER', 'WARRANT OFFICER', 'RESERVE', 'CIVILIAN'] as const;
export type Audience = typeof AUDIENCES[number];

export function audiencesOf(msg: RSSMessage): Audience[] {
  const s = msg.subject;
  const result: Audience[] = [];

  if (/\b(enlisted|snco|corporal|gunnery sergeant|master sergeant|first sergeant|master gunnery|lance corporal|private)\b/i.test(s))
    result.push('ENLISTED');

  if (/\bwarrant officer\b|\bcwo\d?\b/i.test(s))
    result.push('WARRANT OFFICER');

  if (/\bofficer\b/i.test(s) && !/\b(noncommissioned|non-commissioned|warrant)\s+officer/i.test(s))
    result.push('OFFICER');

  if (/\b(reserve component|smcr|irr|individual ready reserve|active reserve|selected marine corps reserve)\b/i.test(s))
    result.push('RESERVE');

  if (/\b(civilian|dod civilian|civilian personnel|civilian employees)\b/i.test(s))
    result.push('CIVILIAN');

  if (/\btotal force\b|\ball marines\b|\bactive duty and reserve\b/i.test(s) || result.length === 0)
    result.push('TOTAL FORCE');

  return result;
}

export function matchesCustomView(msg: RSSMessage, view: CustomView): boolean {
  if (view.keywords.length > 0) {
    const sub = msg.subject.toLowerCase();
    if (!view.keywords.some(k => sub.includes(k.toLowerCase()))) return false;
  }
  if (view.tags.length > 0) {
    if (!msg.tags.some(t => view.tags.includes(t))) return false;
  }
  if (view.audiences.length > 0) {
    if (!audiencesOf(msg).some(a => view.audiences.includes(a))) return false;
  }
  return true;
}
