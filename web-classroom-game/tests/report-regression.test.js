import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as core from '../core.js';
import {synchronizeReport} from '../notebook-state.js';

function submit(evidence=[],verified=true){
  const source=readFileSync(new URL('../main.js',import.meta.url),'utf8');
  const body=source.slice(source.indexOf('function notebook(){'),source.indexOf('function download('));
  const current={...core.newCase(2),fault:'wire',fixed:['wire'],verified,evidence};
  const elements={};
  const $=key=>elements[key]??=( {value:key==='#conclusion'?'wire':key==='#reason'?'我更换导线，放回电池后模型灯亮了。':'',textContent:'',querySelectorAll:()=>[],close(){}} );
  const context=vm.createContext({...core,synchronizeReport,s:{index:2,current},selected:new Set(),$,openDialog(){},log(){},caption(){},tone(){},download(){},JSON});
  vm.runInContext(body+';notebook();',context);
  $('#conclusion').value='wire';
  $('#reason').value='我更换导线，放回电池后模型灯亮了。';
  $('#submitReport').onclick();
  return {current,elements};
}
test('实际结案界面：修复复验成功，没有修复前检测记录也可提交',()=>{
  const {current}=submit();assert.ok(current.report);assert.equal(current.report.evidenceStatus,'repair_only');
});
test('实际结案界面：有故障部位记录，不强制再找正常部位',()=>{
  const {current}=submit([{id:0,target:'wire',lit:false,afterRepair:false}]);assert.ok(current.report);assert.equal(current.report.evidenceStatus,'supported');
});
test('未完成修复复验不能宣称已修好',()=>{
  const {current}=submit([],false);assert.equal(current.report,null);
});
