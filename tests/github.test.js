import test from 'node:test';
import assert from 'node:assert/strict';
import {getProfile,getRepositories} from '../src/github.js';

test('profile failures provide readable guidance and permit later recovery', async () => {
  const original=globalThis.fetch;
  try {
    for (const [status,expected] of [[404,/계정을 찾을/],[403,/요청이 제한/],[429,/요청이 제한/],[500,/정보를 가져오지/]]) {
      globalThis.fetch=async()=>({ok:false,status});
      await assert.rejects(getProfile(`failure-${status}`),expected);
    }
    globalThis.fetch=async()=>{throw new TypeError('Failed to fetch');};
    await assert.rejects(getProfile('network-failure'),/인터넷 연결/);
    globalThis.fetch=async()=>({ok:true,json:async()=>{throw new SyntaxError('Unexpected token');}});
    await assert.rejects(getProfile('invalid-response'),/응답을 읽지 못/);
    globalThis.fetch=async()=>({ok:true,json:async()=>({type:'Organization'})});
    await assert.rejects(getProfile('organization'),/개인 계정/);
    const profile={type:'User',login:'failure-404',public_repos:0,followers:0};
    globalThis.fetch=async()=>({ok:true,json:async()=>profile});
    assert.equal((await getProfile('failure-404')).login,profile.login);
  } finally {globalThis.fetch=original;}
});

test('repository failure does not discard a successful cached profile', async () => {
  const original=globalThis.fetch;
  try {
    let profileCalls=0;
    globalThis.fetch=async url=>{
      if(url.includes('/repos?')) return {ok:false,status:429};
      profileCalls++;
      return {ok:true,json:async()=>({type:'User',login:'partial-example'})};
    };
    await getProfile('partial-example');
    await assert.rejects(getRepositories('partial-example'),/요청이 제한/);
    assert.equal((await getProfile('PARTIAL-EXAMPLE')).login,'partial-example');
    assert.equal(profileCalls,1);
    globalThis.fetch=async()=>({ok:true,json:async()=>[]});
    assert.deepEqual(await getRepositories('partial-example'),[]);
  } finally {globalThis.fetch=original;}
});

test('a stalled network request times out and releases its timer', async t => {
  const original=globalThis.fetch;
  t.mock.timers.enable({apis:['setTimeout']});
  try {
    globalThis.fetch=(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError'))));
    const request=getProfile('timeout-example');
    const assertion=assert.rejects(request,/응답 시간/);
    t.mock.timers.tick(12000);
    await assertion;
  } finally {globalThis.fetch=original;t.mock.timers.reset();}
});
