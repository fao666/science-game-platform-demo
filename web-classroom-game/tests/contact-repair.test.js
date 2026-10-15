import test from 'node:test';
import assert from 'node:assert/strict';
import {contactLayout,clipFits,openContactRepair} from '../contact-repair.js';
for(const mirrored of [false,true])test(`夹头需夹到真实接线柱，布局镜像=${mirrored}`,()=>{
 const layout=contactLayout(mirrored);assert.equal(clipFits(layout.start,layout.post),false);assert.equal(clipFits(layout.post,layout.post),true);assert.equal(clipFits([layout.post[0]+50,layout.post[1]],layout.post),false);
});
test('未夹到接线柱不修复，正确夹紧只记录一次',()=>{
 const ctx=new Proxy({},{get:(_,key)=>key==='setLineDash'?()=>{}:()=>{},set:()=>true});
 const canvas={getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:760,height:420}),setPointerCapture(){}};
 const status={},close={};globalThis.document={querySelector:s=>s==='#contactRepairCanvas'?canvas:s==='#contactRepairStatus'?status:close};
 let repairs=0;try{
 openContactRepair({openDialog(){},onRepair(){repairs++;},drawPart(){},drawLead(){}});
 const e=(x,y)=>({clientX:x,clientY:y,pointerId:1});
 canvas.onpointerdown(e(130,310));canvas.onpointerup(e(200,310));assert.equal(repairs,0);
 canvas.onpointerdown(e(180,310));canvas.onpointermove(e(376,229));canvas.onpointerup(e(376,229));assert.equal(repairs,1);assert.match(status.textContent,/放回电池/);
 canvas.onpointerdown(e(376,229));canvas.onpointerup(e(376,229));assert.equal(repairs,1);
 }finally{delete globalThis.document;}
});
