const holders=new Image();holders.src='assets/battery-holder-v5.png';
const crafts=new Image();crafts.src='assets/craft-models-v3.png';
const parts=new Image();parts.src='assets/circuit-parts-v4.png';
const students=new Image();students.src='assets/students-v3.png';
const leads=new Image();leads.src='assets/long-leads-v4.png';

export function drawCraft(ctx,index,x,y,w,h){
  if(!crafts.complete||!crafts.naturalWidth)return;
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
  if(parts.complete&&parts.naturalWidth){
    const cell=parts.naturalWidth/3;
    // Render the real base, then animate the copper blade independently.
    spriteBetween(ctx,cell*2,400,cell,parts.naturalHeight-400,[174,45],[650,85],a,b);
  }
  const end=closed?b:[a[0]+(b[0]-a[0])*.8,a[1]-60];
  ctx.save();ctx.lineCap='round';ctx.strokeStyle='#8f602c';ctx.lineWidth=12;
  ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...end);ctx.stroke();
  ctx.strokeStyle='#e3b87b';ctx.lineWidth=7;ctx.stroke();ctx.restore();
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
