import assert from 'node:assert/strict';
import {
  applyUserStateToMessages,
  getCachedArchiveCursor,
  limitStoredFeedMessages,
  mergeArchiveMessages,
  mergeFeedMessages,
  pruneArticleEntries,
  saveCachedFeed,
  type MARADMINUserState,
} from '../src/app/components/maradminStorage';
import type { RSSMessage } from '../src/app/components/maradminUtils';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

const storageMap = new Map<string, string>();

globalThis.window = {
  localStorage: {
    getItem(key: string) {
      return storageMap.has(key) ? storageMap.get(key)! : null;
    },
    setItem(key: string, value: string) {
      storageMap.set(key, value);
    },
    removeItem(key: string) {
      storageMap.delete(key);
    },
    clear() {
      storageMap.clear();
    },
  },
} as unknown as Window & typeof globalThis;

function makeMessage(overrides: Partial<RSSMessage>): RSSMessage {
  return {
    id: '1',
    number: '210/26',
    subject: 'Test Message',
    date: '06 MAY 2026',
    displayDate: '06 MAY 2026',
    month: 'MAY 2026',
    source: 'HQMC',
    link: 'https://example.com/210-26',
    unread: true,
    isNew: false,
    saved: false,
    archived: false,
    tags: [],
    ...overrides,
  };
}

test('applies persisted read and saved state to messages', () => {
  const userState: MARADMINUserState = {
    readNumbers: ['210/26'],
    newNumbers: ['211/26'],
    savedNumbers: ['211/26'],
  };

  const messages = applyUserStateToMessages([
    makeMessage({ number: '210/26' }),
    makeMessage({ id: '2', number: '211/26' }),
  ], userState);

  assert.equal(messages[0].unread, false);
  assert.equal(messages[1].saved, true);
  assert.equal(messages[1].isNew, true);
});

test('preserves extracted sources while merging fresh feed messages', () => {
  const userState: MARADMINUserState = {
    readNumbers: [],
    newNumbers: [],
    savedNumbers: [],
  };

  const cachedMessages = [
    makeMessage({ number: '210/26', source: 'Reserve Affairs Division' }),
  ];
  const freshMessages = [
    makeMessage({ number: '210/26', source: 'HQMC' }),
    makeMessage({ id: '2', number: '211/26', source: 'HQMC' }),
  ];

  const merged = mergeFeedMessages(cachedMessages, freshMessages, userState);

  assert.equal(merged.messages[0].source, 'Reserve Affairs Division');
  assert.equal(merged.messages[1].source, 'HQMC');
  assert.deepEqual(merged.newMessageNumbers, ['211/26']);
  assert.deepEqual(merged.userState.newNumbers, ['211/26']);
});

test('preserves older archive-loaded messages when refreshing the latest feed', () => {
  const userState: MARADMINUserState = {
    readNumbers: [],
    newNumbers: [],
    savedNumbers: [],
  };

  const cachedMessages = [
    makeMessage({ number: '215/26' }),
    makeMessage({ id: '2', number: '214/26' }),
    makeMessage({ id: '3', number: '150/26' }),
  ];
  const freshMessages = [
    makeMessage({ number: '215/26' }),
    makeMessage({ id: '2', number: '214/26' }),
  ];

  const merged = mergeFeedMessages(cachedMessages, freshMessages, userState);

  assert.deepEqual(
    merged.messages.map(message => message.number),
    ['215/26', '214/26', '150/26'],
  );
});

test('appends older archive messages without duplicating existing feed items', () => {
  const userState: MARADMINUserState = {
    readNumbers: ['214/26'],
    newNumbers: [],
    savedNumbers: [],
  };

  const existingMessages = [
    makeMessage({ number: '215/26' }),
    makeMessage({ id: '2', number: '214/26' }),
  ];
  const olderMessages = [
    makeMessage({ id: '3', number: '214/26' }),
    makeMessage({ id: '4', number: '149/26' }),
  ];

  const merged = mergeArchiveMessages(existingMessages, olderMessages, userState);

  assert.deepEqual(
    merged.map(message => message.number),
    ['215/26', '214/26', '149/26'],
  );
  assert.equal(merged[1].unread, false);
  assert.equal(merged[2].unread, true);
});

test('limits stored feed metadata to the most recent 500 messages', () => {
  const messages = Array.from({ length: 520 }, (_, index) =>
    makeMessage({
      id: String(index),
      number: `${index + 1}/26`,
    }),
  );

  const limited = limitStoredFeedMessages(messages);

  assert.equal(limited.length, 500);
  assert.equal(limited[0].number, '1/26');
  assert.equal(limited.at(-1)?.number, '500/26');
});

test('prunes article cache while preserving saved MARADMINs', () => {
  const articles = Object.fromEntries(
    Array.from({ length: 80 }, (_, index) => [
      `${index + 1}/26`,
      {
        text: `Message ${index + 1}`,
        method: 'direct' as const,
        source: null,
        cachedAt: index + 1,
      },
    ]),
  );

  const pruned = pruneArticleEntries(articles, ['1/26', '2/26']);

  assert.equal(Object.keys(pruned).length, 77);
  assert.ok(pruned['1/26']);
  assert.ok(pruned['2/26']);
  assert.ok(!pruned['3/26']);
  assert.ok(pruned['80/26']);
});

test('persists archive cursor state with cached feed metadata', () => {
  storageMap.clear();

  saveCachedFeed([makeMessage({ number: '215/26' })], { nextPage: 4, hasMore: false });

  assert.deepEqual(getCachedArchiveCursor(), { nextPage: 4, hasMore: false });
});

markTestFilePass();
