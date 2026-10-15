import test from 'node:test';import assert from 'node:assert/strict';import {readPlayHistory,archiveAndReset} from '../replay.js';
const key='game',state={reports:[{index:2,reason:'原始报告'}],current:{reportDraft:{reason:'草稿'}},events:[{type:'measurement'}]};
function storage(){const m=new Map([[key,JSON.stringify(state)]]);return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
test('重玩前保存报告、检测与草稿，之后只清当前进度',()=>{const s=storage();archiveAndReset(s,key,state);assert.equal(s.getItem(key),null);const history=readPlayHistory(s,key);assert.equal(history.length,1);assert.equal(history[0].state.reports[0].reason,'原始报告');assert.equal(history[0].state.current.reportDraft.reason,'草稿');assert.equal(history[0].state.events.length,1);});
test('再次重玩追加历史，不覆盖之前轮次',()=>{const s=storage();archiveAndReset(s,key,state);archiveAndReset(s,key,{...state,reports:[]});assert.equal(readPlayHistory(s,key).length,2);assert.equal(readPlayHistory(s,key)[1].state.reports[0].reason,'原始报告');});
test('空间不足保存失败时不清空当前游戏',()=>{const s=storage();s.setItem=()=>{throw Error('quota');};assert.throws(()=>archiveAndReset(s,key,state));assert.ok(s.getItem(key));});
test('历史损坏时不覆盖历史也不清空当前游戏',()=>{const s=storage();s.setItem(key+'-history','broken');assert.throws(()=>archiveAndReset(s,key,state));assert.ok(s.getItem(key));assert.equal(s.getItem(key+'-history'),'broken');});
