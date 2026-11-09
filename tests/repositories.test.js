import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeRepositories } from '../src/repositories.js';
import { getRepositories } from '../src/github.js';

const repository = (id, language, stars, updated = '2026-01-01') => ({ id, name: `project-${id}`, language, stargazers_count: stars, updated_at: updated });

test('language shares exclude unclassified repositories; ranking includes all repositories', () => {
  const items = [repository(1, 'JavaScript', 3), repository(2, null, 20), repository(3, 'Python', 5), repository(4, 'JavaScript', 1)];
  const original = structuredClone(items);
  const result = summarizeRepositories(items);
  assert.equal(result.classifiedCount, 3);
  assert.deepEqual(result.languages.map(({name, count}) => ({name, count})), [{name:'JavaScript',count:2},{name:'Python',count:1}]);
  assert.ok(Math.abs(result.languages[0].percent - 200 / 3) < 0.0001);
  assert.deepEqual(result.featured.map(repo => repo.id), [2,3,1]);
  assert.deepEqual(items, original);
});

test('empty and unclassified repositories produce no artificial language values', () => {
  assert.deepEqual(summarizeRepositories([]), {languages:[],classifiedCount:0,featured:[]});
  const result = summarizeRepositories([repository(1, null, 0)]);
  assert.equal(result.languages.length, 0);
  assert.equal(result.featured.length, 1);
});

test('equal star counts use recent update as tie breaker', () => {
  const result = summarizeRepositories([repository(1,'HTML',0,'2025-01-01'),repository(2,'CSS',0,'2026-01-01')]);
  assert.deepEqual(result.featured.map(repo => repo.id), [2,1]);
});

test('repository API uses bounded recent public list, reuses cache, retries failures', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async url => {
      calls++;
      assert.match(url, /type=owner&sort=updated&direction=desc&per_page=100$/);
      return {ok:true,status:200,json:async () => []};
    };
    assert.deepEqual(await getRepositories('CacheExample'), []);
    await getRepositories('cacheexample');
    assert.equal(calls,1);
    globalThis.fetch = async () => ({ok:false,status:429});
    await assert.rejects(getRepositories('RetryExample'), /요청이 제한/);
    globalThis.fetch = async () => ({ok:true,status:200,json:async () => [repository(1,null,0)]});
    assert.equal((await getRepositories('RetryExample')).length,1);
  } finally {globalThis.fetch=originalFetch;}
});
