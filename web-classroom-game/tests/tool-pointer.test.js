import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync(new URL('../main.js',import.meta.url),'utf8');
function press(x,y){
  const c={speech:{isOpen:()=>false},toolLit:()=>false,canvas:{addEventListener(_,fn){this.handler=fn;},focus(){},setPointerCapture(){}},$:()=>({hidden:true}),pointer:e=>e,scene:'tool',s:{removed:false},drag:null,toolPorts:{0:[245,225],1:[245,450],2:[610,225],3:[735,225],4:[610,450],5:[735,450]},hit:(p,x,y,w,h)=>p.x>x&&p.x<x+w&&p.y>y&&p.y<y+h};
  vm.runInNewContext(source.split('\n').find(l=>l.startsWith("canvas.addEventListener('pointerdown',e=>{if(!$('#welcome').hidden||speech.isOpen())return;")),c);
  c.canvas.handler({x,y,pointerId:1});return c.drag;
}
test('开关上的接点优先用于接线，不被拆开关手势挡住',()=>{assert.equal(press(610,450)?.kind,'wire');assert.equal(press(735,450)?.kind,'wire');});
test('不再要求抓取开关并拖入托盘，普通接点仍可自由连接',()=>assert.equal(press(680,425),null));
