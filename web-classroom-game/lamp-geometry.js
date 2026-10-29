// Anchors measured in the existing lamp image. Use the same transform as art.js.
export function bulbGlass(x,y,w,h){
  const scale=w*.692/448;
  return {x:x+w*.154+(373-158)*scale,y:y+h*.676+(219-425)*scale,rx:93*scale,ry:89*scale};
}
export function lampDropMatches(point,a,b,verticalOffset=0){
  const center=(a[0]+b[0])/2,g=bulbGlass(center-83,a[1]-98,166,145);
  g.y+=verticalOffset;
  // Include the glass and screw cap, not the entire fixed lamp holder.
  return ((point.x-g.x)/(g.rx+14))**2+((point.y-g.y)/(g.ry+14))**2<=1||Math.abs(point.x-g.x)<28&&point.y>=g.y&&point.y<=g.y+55;
}
