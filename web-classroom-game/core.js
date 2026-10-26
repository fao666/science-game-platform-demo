export const names={contact:'灯泡与灯座接触',lamp:'小灯泡',wire:'整根导线',switch:'开关',battery:'电池'};
export const cases=[{title:'寻宝灯塔',fault:'contact',story:'灯塔昨天还能亮，今天合上开关却不亮了。请把模型带回科学工坊查一查。'},{title:'纸屋的小夜灯',fault:'lamp',story:'慢慢的纸屋小夜灯装好电池、合上开关仍然不亮。看起来相似的现象，不一定来自相同原因。'},{title:'星星舞台',fault:'battery',story:'团团的星星舞台不亮了，可能是灯泡、导线、连接、开关或电池出了问题。观察布局，自由选择检查方法，用证据帮助判断。'}];
export function faultOf(c){return c.fault||['contact','lamp','wire'][c.index];}
export function newCase(i){return {index:i,fault:cases[i].fault,fixed:[],power:true,closed:true,evidence:[],hypotheses:[],verified:false,report:null};}
export function connected(edges,a,b){const seen=new Set([a]),queue=[a];for(const n of queue){for(const [x,y] of edges){const v=x===n?y:y===n?x:null;if(v!==null&&!seen.has(v)){seen.add(v);queue.push(v);}}}return seen.has(b);}
// Node 6 is the bulb's screw contact inside the holder, not an extra object on a wire.
export function internalEdges(c){const broken=k=>faultOf(c)===k&&!c.fixed.includes(k);return [[0,2],[5,1],...(!broken('wire')?[[3,4]]:[]),...(!broken('lamp')?[[2,6]]:[]),...(!broken('contact')?[[6,3]]:[]),...(c.closed?[[4,5]]:[])];}
export function batteryUsable(c){return faultOf(c)!=='battery'||c.fixed.includes('battery');}
export function lit(c){return c.power&&batteryUsable(c)&&connected(internalEdges(c),0,1);}
export function detect(c,target,ready){if(!ready)return {blocked:'先确认检测器本身可用：让两个金属检测头互碰。'};if(c.power)return {blocked:'先取下模型电池。检测器自带电池，不能带着原电源检测。'};const pairs={lamp:[2,6],contact:[2,3],wire:[3,4],switch:[4,5]};if(!pairs[target])return {blocked:'电池不能接在带电检测头之间。请选“电池”，把待测电池换入已知正常的参考电路。'};return {target,lit:connected(internalEdges(c),...pairs[target]),method:'continuity'};}
export function testBattery(c,ready){if(!ready)return {blocked:'请先完成参考电路制作与首次自检，确认参考器材正常。'};if(c.power)return {blocked:'先从模型取下待测电池。'};return {target:'battery',lit:batteryUsable(c),method:'reference-substitution'};}
export function supported(c,ids,target){const selected=c.evidence.filter(e=>ids.includes(e.id));return c.verified&&target===faultOf(c)&&selected.some(e=>e.target===target&&!e.lit&&!e.afterRepair)&&selected.some(e=>e.target!==target&&e.lit);}
// Completion and strength of causal evidence are separate; never require a fixed evidence combination.
export function assessReport(c,ids,target){
  if(!c.verified||!lit(c)||!c.fixed.length)return {allowed:false,feedback:'还没完成修复后的通电检查。请回实验桌，放回电池、合上开关，观察模型灯是否亮起。你的文字会保留。'};
  const records=ids.length?c.evidence.filter(e=>ids.includes(e.id)):c.evidence;
  const before=records.some(e=>e.target===target&&!e.lit&&!e.afterRepair);
  const after=records.some(e=>e.target===target&&e.lit&&e.afterRepair);
  const supportedCause=before&&target===faultOf(c)&&c.fixed.length===1&&c.fixed.includes(target);
  if(supportedCause)return {allowed:true,evidenceStatus:'supported',feedback:`作品已修复！你记录了${names[target]}调整前${target==='battery'?'换入参考电路后灯不亮':'检测灯不亮'}，${after?'调整后复测灯亮起，并且':''}修复后模型也亮了，这些现象支持你的判断。正常部位的检测记录可以帮助排除其他原因，但不必凑齐才能交还作品。`};
  return {allowed:true,evidenceStatus:c.fixed.length>1?'multiple_changes':'repair_only',feedback:c.fixed.length>1?'作品已修复，可以交还同学！你调整了多个部位，暂时不能确定是哪一次调整起了作用。下次可以一次只改一处，再观察变化。':'作品已修复，可以交还同学！修复后模型亮了，能说明这次修复有效；但缺少支持原故障判断的修复前记录，还不能完全确定原来哪里出了问题。不必恢复故障补记录，下次可以先检测再调整。'};
}
export function toolLit(edges,removed){return !removed&&connected([...edges,[2,3],[4,5]],0,1)&&!connected([...edges,[4,5]],0,1);}
