import test from 'node:test';
import assert from 'node:assert/strict';
import {newCase} from '../core.js';
import {guideFor,nearDoor} from '../guidance.js';
const state=()=>({index:0,current:newCase(0),reports:[],toolEdges:[],accepted:false,carrying:false,toolReady:false,removed:false});
test('接任务、取作品、制作工具和调查都有明确去处',()=>{
  const s=state();assert.equal(guideFor(s,'fair').target,'stall');
  s.accepted=true;assert.match(guideFor(s,'fair').title,/拿起/);
  s.carrying=true;assert.equal(guideFor(s,'fair').target,'door');
  assert.equal(guideFor(s,'workshop').target,'tool');
  s.toolReady=true;assert.equal(guideFor(s,'workshop').target,'bench');
  assert.match(guideFor(s,'bench').title,/电池/);
  s.current.power=false;assert.match(guideFor(s,'bench').title,/工具/);
  assert.match(guideFor(s,'bench',true).title,/选一个/);
});
test('已修复后引导写报告、离开桌面和交还，而不泄漏故障答案',()=>{
  const s={...state(),accepted:true,carrying:true,toolReady:true};
  s.current.verified=true;assert.equal(guideFor(s,'bench').action,'notebook');
  s.current.report={reason:'测试'};
  assert.equal(guideFor(s,'bench').action,'leave');
  assert.equal(guideFor(s,'workshop').target,'door');
  assert.equal(guideFor(s,'fair').target,'stall');
  const hints=[];for(let i=0;i<3;i++){s.current=newCase(i);s.current.power=false;hints.push(guideFor(s,'bench',true).detail);}assert.equal(new Set(hints).size,1);
});
test('门前区域支持靠近进入；站在出生点不会反复进出',()=>{
  assert.equal(nearDoor('fair',{x:205,y:400}),true);
  assert.equal(nearDoor('workshop',{x:120,y:470}),true);
  assert.equal(nearDoor('fair',{x:360,y:610}),false);
  assert.equal(nearDoor('workshop',{x:470,y:610}),false);
  assert.equal(nearDoor('bench',{x:90,y:455}),false);
});
