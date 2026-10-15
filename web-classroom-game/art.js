const crafts=new Image();crafts.src='assets/craft-models-v3.png';
const parts=new Image();parts.src='assets/circuit-parts-v3.png';

export function drawCraft(ctx,index,x,y,w,h){
  if(!crafts.complete||!crafts.naturalWidth)return;
  const cell=crafts.naturalWidth/3;
  ctx.drawImage(crafts,index*cell,0,cell,crafts.naturalHeight,x,y,w,h);
}
export function drawPart(ctx,kind,x,y,w,h){
  if(!parts.complete||!parts.naturalWidth)return;
  // The source is a transparent atlas; retain the complete battery holder.
  const rects={battery:[0,0,.5,.55],bulb:[.5,0,.5,.55],switch:[0,.56,.5,.44],wire:[.5,.56,.5,.44]};
  const [sx,sy,sw,sh]=rects[kind],iw=parts.naturalWidth,ih=parts.naturalHeight;
  ctx.drawImage(parts,sx*iw,sy*ih,sw*iw,sh*ih,x,y,w,h);
}
