import test from 'node:test';
import assert from 'node:assert/strict';
import { getAverageStars, formatAverageStars } from '../src/stars.js';

test('average includes every fetched repository, including zero-star repositories', () => {
  assert.equal(getAverageStars([{stargazers_count:6},{stargazers_count:0}]),3);
  assert.equal(getAverageStars([{stargazers_count:2},{stargazers_count:0},{stargazers_count:0}]),2/3);
  assert.equal(getAverageStars([{stargazers_count:0}]),0);
  assert.equal(getAverageStars([]),null);
});
test('compact average uses lowercase k and retains useful fractional values', () => {
  for (const [value, formatted] of [[0,'0'],[3,'3'],[2/3,'0.7'],[999,'999'],[999.99,'1k'],[1000,'1k'],[1250,'1.3k'],[1000000,'1m']]) {
    assert.equal(formatAverageStars(value),formatted);
  }
});
