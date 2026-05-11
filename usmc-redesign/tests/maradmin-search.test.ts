import assert from 'node:assert/strict';
import {
  extractExactMARADMINNumberQuery,
  normalizeMARADMINNumber,
  promoteExactMARADMINMatches,
} from '../src/app/components/maradminSearch';
import type { RSSMessage } from '../src/app/components/maradminUtils';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

function makeMessage(overrides: Partial<RSSMessage>): RSSMessage {
  return {
    id: '1',
    number: '188/26',
    subject: 'Test Message',
    date: '01 MAY 2026',
    displayDate: '01 MAY 2026',
    month: 'MAY 2026',
    source: 'HQMC',
    link: 'https://example.com/188-26',
    unread: true,
    isNew: false,
    saved: false,
    archived: false,
    tags: [],
    ...overrides,
  };
}

test('extracts exact MARADMIN number queries from direct number searches', () => {
  assert.equal(extractExactMARADMINNumberQuery('188/26'), '188/26');
  assert.equal(extractExactMARADMINNumberQuery('MARADMIN 188-26'), '188/26');
  assert.equal(extractExactMARADMINNumberQuery('  maradmin 041/26  '), '041/26');
  assert.equal(extractExactMARADMINNumberQuery('188'), null);
  assert.equal(extractExactMARADMINNumberQuery('bonus 188/26 update'), null);
});

test('promotes exact MARADMIN matches to the top of the search results', () => {
  const ranked = promoteExactMARADMINMatches(
    [
      makeMessage({ id: '1', number: '118/26' }),
      makeMessage({ id: '2', number: '188/26' }),
      makeMessage({ id: '3', number: '188/25' }),
    ],
    'MARADMIN 188/26',
  );

  assert.deepEqual(ranked.map(message => message.number), ['188/26', '118/26', '188/25']);
});

test('normalizes MARADMIN numbers for exact comparison', () => {
  assert.equal(normalizeMARADMINNumber('188-26'), '188/26');
  assert.equal(normalizeMARADMINNumber('  041/26 '), '041/26');
});

markTestFilePass();
