import assert from 'node:assert/strict';
import {evaluateCircuit} from '../src/circuitLogic.js';

const correct=[['bR','sL'],['sR','lL'],['lR','bL']];
assert.equal(evaluateCircuit(correct,false).status,'switch-open','未合闸必须失败');
assert.equal(evaluateCircuit(correct,true).status,'success','正确接线并合闸必须通电');
assert.equal(evaluateCircuit([['bL','bR']],true).status,'short','直连电池两端必须识别为短路');
console.log('PASS: 电路逻辑能区分断路、合闸成功和短路');
