import test from 'node:test';
import assert from 'node:assert/strict';
import {reflectionFields,reflectionOptions,composeReflection,reflectionValue} from '../magnet/reflection.js';
test('reflection offers only materials with real records, without choosing an answer',()=>{
 const state={tests:[{name:'铜片'},{name:'铜片'}],moves:[{name:'木块'}]};
 assert.deepEqual(reflectionOptions(reflectionFields[0],state),['铜片']);
 assert.deepEqual(reflectionOptions(reflectionFields[3],state),['木块']);
 assert.equal((composeReflection({}).match(/____/g)||[]).length,6);
});
test('chosen observations and short custom text are preserved without correcting the learner',()=>{
 const draft={material:{choice:'铜片'},observed:{choice:'被吸引了'},motion:{choice:'other',text:'我还没看清'}};
 assert.match(composeReflection(draft),/测试后看到它被吸引了/);
 assert.equal(reflectionValue(draft,'motion'),'我还没看清');
 assert.match(composeReflection(draft),/我还没看清/);
});
