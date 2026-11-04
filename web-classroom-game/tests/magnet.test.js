import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,stepCart,archive} from '../magnet/core.js';
test('magnet attracts iron in either direction, not copper or distant targets',()=>{
 assert.ok(stepCart(100,180,'iron')>100);
 assert.ok(stepCart(600,520,'clip')<600);
 assert.equal(stepCart(100,180,'copper'),100);
 assert.equal(stepCart(100,400,'iron'),100);
 assert.equal(stepCart(100,180,'iron','thick'),100);
 assert.ok(stepCart(100,180,'iron','paper')>100);
});
test('completed history deduplicates and keeps unfinished rounds out',()=>{
 const s=fresh();assert.equal(archive([],s).length,0);s.done=true;
 const history=archive([],s);assert.equal(history.length,1);assert.equal(archive(history,s).length,1);
 s.reflection='changed';assert.notEqual(history[0].reflection,s.reflection);
});
