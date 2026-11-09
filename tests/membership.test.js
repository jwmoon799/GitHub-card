import test from 'node:test';
import assert from 'node:assert/strict';
import { getMembership } from '../src/membership.js';

test('joining year is year 1, rather than completed years of employment', () => {
  const now = new Date('2026-11-09T10:00:00Z');
  assert.deepEqual(getMembership('2026-01-01T00:00:00Z', now), { joinYear: 2026, yearNumber: 1 });
  assert.deepEqual(getMembership('2024-12-31T00:00:00Z', now), { joinYear: 2024, yearNumber: 3 });
});
test('new-year boundaries use Korean calendar years for both dates', () => {
  assert.deepEqual(getMembership('2025-12-31T16:00:00Z', new Date('2026-01-01T00:00:00Z')), { joinYear: 2026, yearNumber: 1 });
  assert.deepEqual(getMembership('2025-06-01T00:00:00Z', new Date('2025-12-31T15:00:00Z')), { joinYear: 2025, yearNumber: 2 });
});
test('missing, invalid, and future join dates do not show a fabricated badge', () => {
  const now = new Date('2026-11-09T10:00:00Z');
  for (const date of [undefined, '', 'invalid', '2027-01-01T00:00:00Z']) assert.equal(getMembership(date, now), null);
});
