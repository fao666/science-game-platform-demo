// A physical close-up: move the wire's metal clip onto a lamp-holder post.
export function contactLayout(mirrored=false){return {start:mirrored?[650,310]:[150,310],post:mirrored?[583.8,228.72]:[376.2,228.72],anchor:mirrored?[730,340]:[30,340]};}
export function clipFits(point,post){return Math.hypot(point[0]-post[0],point[1]-post[1])<=34;}
export function drawClip(ctx,point,closed=false){
  ctx.save();ctx.translate(...point);ctx.lineJoin='round';
  ctx.fillStyle='#a74535';ctx.fillRect(-67,-12,40,24);
  ctx.fillStyle='#bcc7cb';ctx.strokeStyle='#5c6c72';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-30,-11);ctx.lineTo(12,closed?-3:-10);ctx.lineTo(2,1);ctx.lineTo(-30,2);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-30,11);ctx.lineTo(12,closed?3:10);ctx.lineTo(2,-1);ctx.lineTo(-30,-2);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#66777b';ctx.beginPath();ctx.arc(-23,0,4,0,Math.PI*2);ctx.fill();ctx.restore();
}
export function openContactRepair({openDialog,onRepair,mirrored=false,drawPart,drawLead}){
  openDialog('<h2>重新夹紧灯座导线</h2><p>导线要与灯座的金属接线柱接触，电流才能通过。这里放大了灯座的一侧。</p><p><strong>拖动红色导线末端的金属夹头，把夹口夹到金色接线柱上。</strong></p><canvas id="contactRepairCanvas" width="760" height="420" aria-label="灯座连接放大操作" style="width:100%;height:auto;touch-action:none;background:#f5efdf;border-radius:18px"></canvas><p id="contactRepairStatus" role="status">这是一次调整尝试；夹紧后仍需放回电池，观察作品是否亮起。</p>');
  const canvas=document.querySelector('#contactRepairCanvas'),ctx=canvas.getContext('2d'),layout=contactLayout(mirrored);
  let point=[...layout.start],dragging=false,done=false;
  const render=()=>{ctx.clearRect(0,0,760,420);drawPart(ctx,'bulb',330,80,300,220);ctx.strokeStyle=done?'#38815c':'#c29134';ctx.lineWidth=3;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(...layout.post,27,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);drawLead(ctx,layout.anchor,[point[0]-65,point[1]],'#b45241',11);drawClip(ctx,point,done);ctx.textAlign='center';ctx.fillStyle='#455849';ctx.font='18px sans-serif';ctx.fillText('灯座金属接线柱',layout.post[0],55);ctx.beginPath();ctx.moveTo(layout.post[0],65);ctx.lineTo(layout.post[0],layout.post[1]-34);ctx.stroke();ctx.fillText(done?'夹口已夹紧接线柱':'拖动这个金属夹头 →',done?point[0]:185,done?390:375);};
  const position=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*760/r.width,(e.clientY-r.top)*420/r.height];};
  canvas.onpointerdown=e=>{const p=position(e);if(done||Math.hypot(p[0]-(point[0]-25),p[1]-point[1])>65)return;dragging=true;canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(dragging){point=position(e);render();}};
  canvas.onpointerup=e=>{if(!dragging)return;dragging=false;point=position(e);if(clipFits(point,layout.post)){point=[...layout.post];done=true;onRepair();document.querySelector('#contactRepairStatus').textContent='已夹紧：夹口接触了金属接线柱。回实验桌放回电池，检查作品有没有亮。';document.querySelector('#closeDialog').textContent='回实验桌复验';}else{document.querySelector('#contactRepairStatus').textContent='夹口还没有夹到金属接线柱，请把夹头前端移到金色圆柱上。';}render();};
  canvas.onpointercancel=()=>{dragging=false;point=[...layout.start];render();};render();
}
