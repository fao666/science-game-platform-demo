import test from 'node:test';
import assert from 'node:assert/strict';
import {newCase,assessReport} from '../core.js';

test('改动多个部位后，不能把修复成功归因于单一部位',()=>{
  const c={...newCase(0),fixed:['lamp','contact'],verified:true,evidence:[{id:0,target:'contact',lit:false,afterRepair:false}]};
  const result=assessReport(c,[0],'contact');
  assert.equal(result.allowed,true);
  assert.equal(result.evidenceStatus,'multiple_changes');
  assert.match(result.feedback,/多个部位/);
});
