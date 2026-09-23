export const REQUIRED_EDGES = [['bR','sL'],['sR','lL'],['lR','bL']];

export function evaluateCircuit(connections, switchClosed) {
  const hasPair = ([a,b]) => connections.some(edge => edge.includes(a) && edge.includes(b));
  if (connections.some(edge => edge.includes('bL') && edge.includes('bR'))) {
    return {status:'short', message:'电池两端被直接连接'};
  }
  const complete = REQUIRED_EDGES.every(hasPair) && connections.length === REQUIRED_EDGES.length;
  if (!complete) return {status:'open', message:'线路尚未形成完整通路'};
  if (!switchClosed) return {status:'switch-open', message:'线路已完整，但开关仍是断开状态'};
  return {status:'success', message:'闭合回路已形成'};
}
