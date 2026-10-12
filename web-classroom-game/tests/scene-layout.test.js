import test from 'node:test';import assert from 'node:assert/strict';
import {fairResidents,courierAt,nearestSpot,workshopSpots} from '../scene-layout.js';
test('固定角色分区，不集中重叠，绘制与互动共用位置',()=>{
  for(const a of fairResidents){assert.ok(a.x>70&&a.x<1130&&a.y<690&&a.y-a.size>30);for(const b of fairResidents){if(a!==b)assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>180,`${a.id}/${b.id} too close`);}assert.equal(nearestSpot(fairResidents,a,75)?.id,a.id);}
});
test('搬运员全程不穿过固定人物且路线连续',()=>{
  let last=courierAt(0);for(let t=0;t<=72;t+=.1){const p=courierAt(t);for(const a of fairResidents)assert.ok(Math.hypot(p.x-a.x,p.y-a.y)>120,`courier overlaps ${a.id}`);assert.ok(Math.hypot(p.x-last.x,p.y-last.y)<8);last=p;}
});
test('相邻互动范围重叠时选最近的物件，不按数组顺序误触',()=>{
  assert.equal(nearestSpot([{id:'a',x:10,y:10},{id:'b',x:60,y:10}],{x:59,y:10},90).id,'b');
  for(const p of workshopSpots)assert.equal(nearestSpot(workshopSpots,p,90).id,p.id);
});
