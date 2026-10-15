import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as core from '../core.js';
import {guideFor,testerPurpose,testerIntro} from '../guidance.js';

const source=fs.readFileSync(new URL('../main.js',import.meta.url),'utf8');
test('首次自检通过后，连续更换检测对象不会被重复自检阻断',()=>{
  const current={...core.newCase(0),power:false};
  const context=vm.createContext({...core,s:{toolReady:true,current},ready:false,snaps:['2','3'],lastResult:'',pairTarget:(a,b)=>a===2?'lamp':'wire',log(){},caption(){},tone(){}});
  const code=source.slice(source.indexOf('function autoDetect(){'),source.indexOf('function repair('));
  vm.runInContext(code+';autoDetect();snaps=["3","4"];autoDetect();',context);
  assert.equal(current.evidence.length,2);
  assert.deepEqual(current.evidence.map(e=>e.target),['lamp','wire']);
});
test('显眼说明解释制作目的、工具组成和检测现象，名称来自教材',()=>{
  const s={toolReady:false,removed:false,toolEdges:[]};
  assert.match(testerPurpose(s),/为什么|作品不亮/);
  assert.match(testerPurpose(s),/电池、灯泡和导线/);
  assert.match(testerIntro,/电路检测器/);assert.match(testerIntro,/检测头/);
  assert.doesNotMatch(testerIntro,/自检器/);
});
test('接通后提供有意义的转换按钮，不要求拖拽收纳',()=>{
  const s={accepted:true,carrying:true,toolReady:false,removed:false,toolEdges:[[0,2],[3,4],[5,1]],current:core.newCase(0)};
  assert.equal(guideFor(s,'tool').action,'prepare-tester');
  assert.match(testerPurpose(s),/成为这个回路的一部分/);
  s.toolReady=true;s.current.power=false;
  assert.match(guideFor(s,'bench',false).title,/选一个/);
});
