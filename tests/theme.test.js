import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const script = readFileSync(new URL('../public/theme.js', import.meta.url), 'utf8');
function visit(storage, type = 'navigate') {
  const document = { documentElement: {dataset:{}}, querySelector: () => ({setAttribute(){}}) };
  runInNewContext(script, {document, sessionStorage:storage, performance:{getEntriesByType:()=>[{type}]}});
  return document.documentElement.dataset.theme;
}
const memoryStorage = () => {
  const values = new Map();
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
};
test('refresh follows all five requested colors and wraps back to green', () => {
  const storage=memoryStorage();
  const actual=[visit(storage)];
  for(let i=0;i<5;i++) actual.push(visit(storage,'reload'));
  assert.deepEqual(actual,['green','blue','red','yellow','white','green']);
});
test('ordinary navigation does not advance the refresh color', () => {
  const storage=memoryStorage();
  visit(storage);
  assert.equal(visit(storage,'reload'),'blue');
  assert.equal(visit(storage),'blue');
});
test('blocked storage and invalid saved values fall back safely', () => {
  assert.equal(visit({getItem(){throw new Error('blocked');}}),'green');
  assert.equal(visit({getItem:()=>'-1',setItem(){}},'reload'),'green');
});
