const holders=new Image();holders.src='assets/battery-holder-v5.png';
const crafts=new Image();crafts.src='assets/craft-models-v3.png';
const parts=new Image();parts.src='assets/circuit-parts-v4.png';
const students=new Image();students.src='assets/students-v3.png';
const leads=new Image();leads.src='assets/long-leads-v4.png';

export function drawCraft(ctx,index,x,y,w,h){
  if(index===3){ctx.save();ctx.translate(x,y);ctx.scale(w/160,h/170);ctx.fillStyle='#426b95';ctx.beginPath();ctx.roundRect(18,125,124,25,8);ctx.fill();ctx.fillStyle='#f2c95c';ctx.fillRect(72,28,16,100);ctx.fillStyle='#d7efff';ctx.beginPath();ctx.roundRect(40,42,80,66,12);ctx.fill();ctx.strokeStyle='#3e749a';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#ffe48a';ctx.beginPath();ctx.arc(80,72,20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#345f87';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('欢迎',80,118);ctx.restore();return;}if(!crafts.complete||!crafts.naturalWidth)return;
  const cell=crafts.naturalWidth/3;
  ctx.drawImage(crafts,index*cell,0,cell,crafts.naturalHeight,x,y,w,h);
}
export function drawPart(ctx,kind,x,y,w,h){
  if(kind==='battery'||kind==='emptyBattery'){
    if(!holders.complete||!holders.naturalWidth)return;
    const center=kind==='battery'?617:1157,scale=h/790;
    ctx.save();ctx.translate(x+w/2,y);ctx.scale(scale,scale);
    ctx.drawImage(holders,center-125,0,250,887,-125,-44,250,887);ctx.restore();return;
  }
  if(kind==='wire'){
    if(leads.complete&&leads.naturalWidth)ctx.drawImage(leads,0,0,leads.naturalWidth,leads.naturalHeight/2,x,y,w,h);
    return;
  }
  if(!parts.complete||!parts.naturalWidth)return;
  const cell=parts.naturalWidth/3;
  if(kind==='bulb'){
    spriteBetween(ctx,cell+85,0,cell-85,parts.naturalHeight,[73,425],[521,425],[x+w*.154,y+h*.676],[x+w*.846,y+h*.676]);
  }else if(kind==='switch')drawSwitch(ctx,[x+w*.15,y+h*.68],[x+w*.85,y+h*.68],true);
}

function spriteBetween(ctx,sx,sy,sw,sh,from,to,a,b){
  const angle=Math.atan2(b[1]-a[1],b[0]-a[0])-Math.atan2(to[1]-from[1],to[0]-from[0]);
  const scale=Math.hypot(b[0]-a[0],b[1]-a[1])/Math.hypot(to[0]-from[0],to[1]-from[1]);
  ctx.save();ctx.translate(...a);ctx.rotate(angle);ctx.scale(scale,scale);
  ctx.drawImage(parts,sx,sy,sw,sh,-from[0],-from[1],sw,sh);ctx.restore();
}

export function drawSwitch(ctx,a,b,closed){
  if(a[0]>b[0])[a,b]=[b,a];
  // Whole base and posts share the actual connection anchors; no cropped sprite.
  ctx.save();ctx.translate(a[0],a[1]);const length=b[0]-a[0];
  ctx.fillStyle='#ba851c';ctx.beginPath();ctx.roundRect(-22,-5,length+44,42,10);ctx.fill();
  ctx.fillStyle='#f5cf39';ctx.beginPath();ctx.roundRect(-22,-18,length+44,42,10);ctx.fill();
  ctx.strokeStyle='#e5ae27';ctx.lineWidth=2;ctx.stroke();
  for(const x of [0,length]){ctx.fillStyle='#a67528';ctx.fillRect(x-8,-16,16,18);ctx.fillStyle='#f7d78b';ctx.beginPath();ctx.ellipse(x,0,10,8,0,0,Math.PI*2);ctx.fill();}
  const end=closed?[length,0]:[length*.75,-55];ctx.lineCap='round';ctx.strokeStyle='#85572c';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(...end);ctx.stroke();ctx.strokeStyle='#e5b573';ctx.lineWidth=7;ctx.stroke();ctx.restore();
}

export function drawStudent(ctx,avatar,x,y,w,h){
  if(!students.complete||!students.naturalWidth)return;
  const r=avatar==='girl'?[.56,.025,.35,.95]:[.12,.025,.33,.95];
  ctx.drawImage(students,r[0]*students.naturalWidth,r[1]*students.naturalHeight,r[2]*students.naturalWidth,r[3]*students.naturalHeight,x,y,w,h);
}

export function drawLead(ctx,a,b,color='#b85f4e',width=7){
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
  const bend=Math.min(28,len*.09),cx=(a[0]+b[0])/2-dy/len*bend,cy=(a[1]+b[1])/2+dx/len*bend;
  ctx.save();ctx.lineCap='round';ctx.strokeStyle='#5c49362b';ctx.lineWidth=width+3;
  ctx.beginPath();ctx.moveTo(a[0],a[1]+3);ctx.quadraticCurveTo(cx,cy+3,b[0],b[1]+3);ctx.stroke();
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo(cx,cy,...b);ctx.stroke();
  ctx.globalAlpha=.35;ctx.strokeStyle='#fff7dd';ctx.lineWidth=2;ctx.stroke();ctx.restore();
}

// Render only the removable glass bulb and screw cap; the yellow holder stays put.
export function drawLooseBulb(ctx,x,y,size=1){
  if(!parts.complete||!parts.naturalWidth)return;
  const cell=parts.naturalWidth/3;
  ctx.save();ctx.translate(x,y);ctx.scale(.2564*size,.2564*size);
  ctx.beginPath();ctx.ellipse(0,0,93,89,0,0,Math.PI*2);ctx.rect(-65,60,130,118);ctx.clip();
  ctx.drawImage(parts,cell+270,125,210,280,-103,-94,210,280);ctx.restore();
}

export function drawLampBase(ctx,x,y,w,h){
  // An intentionally empty holder, drawn whole rather than clipping away the bulb.
  const left=x+w*.154,right=x+w*.846,py=y+h*.676,cx=(left+right)/2;
  ctx.save();ctx.fillStyle='#d5a01e';ctx.beginPath();ctx.roundRect(left-18,py-8,right-left+36,39,8);ctx.fill();
  ctx.fillStyle='#f5cf36';ctx.beginPath();ctx.roundRect(left-18,py-18,right-left+36,37,8);ctx.fill();
  ctx.fillStyle='#b58129';ctx.beginPath();ctx.ellipse(cx,py-18,18,11,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#604e38';ctx.beginPath();ctx.ellipse(cx,py-18,12,7,0,0,Math.PI*2);ctx.fill();
  for(const px of [left,right]){ctx.fillStyle='#aa792e';ctx.fillRect(px-7,py-18,14,18);ctx.fillStyle='#f9dd92';ctx.beginPath();ctx.ellipse(px,py,10,8,0,0,Math.PI*2);ctx.fill();}ctx.restore();
}
