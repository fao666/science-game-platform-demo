// The same anchors drive drawing, hit-testing and keyboard interactions.
export const fairResidents=[
  {id:'stall',x:1050,y:375,label:'阿圆 · 摊位负责人',sprite:0,size:152},
  {id:'mentor',x:360,y:430,label:'羽老师 · 科学指导',sprite:1,size:150},
  {id:'rabbit',x:810,y:570,label:'米米 · 作品制作者',sprite:2,size:152},
  {id:'organizer',x:1070,y:650,label:'小栗 · 活动志愿者',sprite:0,size:148,extra:true},
  {id:'hedgehog',x:170,y:650,label:'团团 · 风车同学',sprite:2,size:136,extra:true},
  {id:'turtle',x:750,y:245,label:'慢慢 · 长椅上的同学',sprite:3,size:105,extra:true}
];
export const workshopSpots=[
  {id:'bench',x:795,y:405,label:'模型实验桌'},
  {id:'tool',x:330,y:385,label:'工具制作台'},
  {id:'door',x:110,y:435,label:'返回游园会'}
];
export function courierAt(seconds){
  const nodes=[[485,355],[580,410],[700,410],[885,405]],phase=((seconds%36)+36)%36;
  if(phase<4)return {x:485,y:355,moving:false};
  if(phase>=16&&phase<22)return {x:885,y:405,moving:false};
  const forward=phase<16,t=forward?(phase-4)/12:(36-phase)/14;
  const progress=Math.min(2.999,Math.max(0,t*3)),i=Math.floor(progress),f=progress-i;
  return {x:nodes[i][0]+(nodes[i+1][0]-nodes[i][0])*f,y:nodes[i][1]+(nodes[i+1][1]-nodes[i][1])*f,moving:true};
}
export function nearestSpot(spots,p,radius){
  return spots.map(spot=>({spot,d:Math.hypot(spot.x-p.x,spot.y-p.y)})).filter(v=>v.d<radius).sort((a,b)=>a.d-b.d)[0]?.spot;
}
