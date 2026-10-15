import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {newCase,cases} from '../core.js';

const source=fs.readFileSync(new URL('../main.js',import.meta.url),'utf8');
function load(raw){
  const storage=new Map([['otter-classroom-v1',raw]]);
  const context=vm.createContext({newCase,cases,Date,JSON,document:{querySelector(){}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)}});
  const startup=source.slice(source.indexOf('const $='),source.indexOf('let scene='));
  vm.runInContext(startup+';globalThis.saved=s;',context);
  return {state:context.saved,storage};
}
test('旧进度缺少场景和位置时，补齐默认值并保留调查记录',()=>{
  const old={student:'S09',started:123,index:1,current:newCase(1),events:[{type:'lesson_started'}],reports:[],toolEdges:[]};
  const {state}=load(JSON.stringify(old));
  assert.equal(state.student,'S09');assert.equal(state.index,1);
  assert.equal(state.scene,'fair');assert.equal(state.player.x,320);
  assert.equal(state.events.length,1);
});
test('无效进度不会导致启动白屏，原始内容留作恢复备份',()=>{
  for(const raw of ['{}','"abc"','{"index":99}',JSON.stringify({index:0,current:newCase(0),events:null}),'broken json']){
    const {state,storage}=load(raw);
    assert.ok(Array.isArray(state.current.hypotheses));
    assert.ok(Array.isArray(state.events));assert.equal(state.index,0);
    assert.equal(storage.get('otter-classroom-v1-recovery'),raw);
  }
});

test('旧版已完成进度保留三份报告，默认仍能重新进入庆祝展示',()=>{const reports=[0,1,2].map(index=>({index,reason:'报告'+index}));const raw={index:2,current:newCase(2),reports,events:[],toolEdges:[],completed:true,accepted:true,carrying:true};const {state}=load(JSON.stringify(raw));assert.equal(state.completed,true);assert.equal(state.celebrating,false);assert.equal(state.reports.length,3);assert.equal(state.reports[1].reason,'报告1');});
