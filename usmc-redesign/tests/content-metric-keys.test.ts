import assert from 'node:assert/strict';
import {
  buildContentMetricKey,
  buildMARADMINMetricKey,
  buildNewsArticleMetricKey,
} from '../src/app/features/metrics/contentMetricKeys';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

test('builds namespaced news article metric keys', () => {
  assert.equal(
    buildNewsArticleMetricKey('4483464-department-of-the-navy-releases-fiscal-year-2027-shipbuilding-plan'),
    'news:4483464-department-of-the-navy-releases-fiscal-year-2027-shipbuilding-plan',
  );
});

test('builds MARADMIN metric keys from message numbers', () => {
  assert.equal(buildMARADMINMetricKey('123/26'), 'maradmin:123-26');
});

test('sanitizes custom metric namespaces and raw keys', () => {
  assert.equal(
    buildContentMetricKey('Custom Namespace', '  Some/Metric Key!  '),
    'custom-namespace:some-metric-key',
  );
});

test('returns undefined for missing or unusable keys', () => {
  assert.equal(buildNewsArticleMetricKey(undefined), undefined);
  assert.equal(buildMARADMINMetricKey('!!!'), undefined);
});

test('caps metric keys to Worker-safe length', () => {
  const key = buildNewsArticleMetricKey(`${'a'.repeat(120)}-${'b'.repeat(120)}`);
  assert.ok(key);
  assert.ok(key.length <= 180, `metric key should be capped, got ${key.length}`);
  assert.ok(!/[-._~]$/.test(key), 'metric key should not end with a separator');
});

markTestFilePass();
