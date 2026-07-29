import assert from 'node:assert/strict';
import test from 'node:test';

import {
  nextIndex,
  normalizeIndex,
  previousIndex,
  relativeOffset,
} from '../carousel-state.js';

test('normalizeIndex preserves and wraps indexes for a five-slide deck', () => {
  assert.equal(normalizeIndex(0, 5), 0);
  assert.equal(normalizeIndex(5, 5), 0);
  assert.equal(normalizeIndex(7, 5), 2);
  assert.equal(normalizeIndex(-1, 5), 4);
  assert.equal(normalizeIndex(-6, 5), 4);
});

test('nextIndex and previousIndex move normally and wrap at both ends', () => {
  assert.equal(nextIndex(2, 5), 3);
  assert.equal(nextIndex(4, 5), 0);
  assert.equal(previousIndex(2, 5), 1);
  assert.equal(previousIndex(0, 5), 4);
});

test('relativeOffset returns the shortest signed offsets for each deck layer', () => {
  assert.equal(relativeOffset(2, 2, 5), 0);
  assert.equal(relativeOffset(3, 2, 5), 1);
  assert.equal(relativeOffset(4, 2, 5), 2);
  assert.equal(relativeOffset(1, 2, 5), -1);
  assert.equal(relativeOffset(0, 2, 5), -2);
  assert.equal(relativeOffset(0, 4, 5), 1);
});

test('state helpers reject invalid slide counts', () => {
  const invalidCounts = [0, -1, 2.5, Number.NaN];

  for (const count of invalidCounts) {
    assert.throws(() => normalizeIndex(0, count), RangeError);
    assert.throws(() => nextIndex(0, count), RangeError);
    assert.throws(() => previousIndex(0, count), RangeError);
    assert.throws(() => relativeOffset(0, 0, count), RangeError);
  }
});
