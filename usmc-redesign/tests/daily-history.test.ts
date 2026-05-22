import assert from 'node:assert/strict';
import {
  dailyHistoryEventToHeroSlide,
  getDailyHistoryDateKey,
  getDailyHistoryEvent,
  type DailyHistoryEvent,
} from '../src/app/features/history';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

const sampleEvent: DailyHistoryEvent = {
  dateKey: '11-10',
  year: 1775,
  campaign: 'Institutional History',
  label: 'MARINE CORPS BIRTHDAY',
  heading: ['250 YEARS', 'AND MOVING.'],
  sub: ['TWO BATTALIONS ARE AUTHORIZED.', 'THE LEGACY STARTS IN PHILADELPHIA.'],
  summary: 'The Continental Congress authorized two battalions of Marines.',
  image: '/history/images/birthday.webp',
  videoId: 'semper-fidelis-250',
  source: {
    title: 'Test Source',
    url: 'https://example.com/history',
  },
};

test('formats daily history date keys in the configured timezone', () => {
  const date = new Date('2026-11-10T04:30:00.000Z');

  assert.equal(getDailyHistoryDateKey(date, 'America/New_York'), '11-09');
  assert.equal(getDailyHistoryDateKey(date, 'America/Los_Angeles'), '11-09');
  assert.equal(getDailyHistoryDateKey(date, 'UTC'), '11-10');
});

test('finds events by the page-load date', () => {
  const date = new Date('2026-11-10T15:00:00.000Z');

  assert.equal(getDailyHistoryEvent(date, [sampleEvent], { timezone: 'America/New_York' }), sampleEvent);
});

test('preview date overrides the page-load date', () => {
  const date = new Date('2026-01-01T15:00:00.000Z');

  assert.equal(getDailyHistoryEvent(date, [sampleEvent], { previewDateKey: '11-10' }), sampleEvent);
});

test('maps a daily history event to a hero slide', () => {
  const slide = dailyHistoryEventToHeroSlide(sampleEvent);

  assert.equal(slide.image, '/history/images/birthday.webp');
  assert.deepEqual(slide.heading, ['250 YEARS', 'AND MOVING.']);
  assert.equal(slide.label, 'MARINE CORPS BIRTHDAY | 1775');
  assert.equal(slide.videoId, 'semper-fidelis-250');
});

markTestFilePass();
