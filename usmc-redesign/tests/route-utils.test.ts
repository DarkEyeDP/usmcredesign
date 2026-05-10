import assert from 'node:assert/strict';
import { isFullscreenCapablePath } from '../src/app/routeUtils';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

test('treats MARADMIN index as fullscreen-capable', () => {
  assert.equal(isFullscreenCapablePath('/messages'), true);
});

test('treats individual MARADMIN routes as fullscreen-capable', () => {
  assert.equal(isFullscreenCapablePath('/messages/213-26'), true);
});

test('treats lateral move as fullscreen-capable', () => {
  assert.equal(isFullscreenCapablePath('/lateral-move'), true);
});

test('treats unrelated routes as not fullscreen-capable', () => {
  assert.equal(isFullscreenCapablePath('/pay-benefits'), false);
});

markTestFilePass();
