export const names={contact:'灯座连接',lamp:'小灯泡',wire:'右侧导线',switch:'闭合的开关'};
export const cases=[{title:'寻宝灯塔',fault:'contact',story:'灯塔昨天还能亮，今天合上开关却不亮了。请把模型带回科学工坊查一查。'},{title:'纸屋的小夜灯',fault:'lamp',story:'灯塔恢复了！同学送来另一件作品：纸屋的小夜灯也不亮。外观相同，不代表原因相同。'},{title:'星星舞台',fault:'wire',story:'最后一件作品换了器材的位置。独立判断：这一次，什么证据能找到原因？'}];
export function newCase(i){return {index:i,fixed:[],power:true,closed:true,evidence:[],hypotheses:[],verified:false,report:null};}
export function connected(edges,a,b){const seen=new Set([a]),queue=[a];for(const n of queue){for(const [x,y] of edges){const v=x===n?y:y===n?x:null;if(v!==null&&!seen.has(v)){seen.add(v);queue.push(v);}}}return seen.has(b);}
export function internalEdges(c){const broken=k=>cases[c.index].fault===k&&!c.fixed.includes(k);return [[0,6],[7,2],[5,1],...(!broken('wire')?[[3,4]]:[]),...(!broken('lamp')?[[2,3]]:[]),...(!broken('contact')?[[6,7]]:[]),...(c.closed?[[4,5]]:[])];}
export function lit(c){return c.power&&connected(internalEdges(c),0,1);}
export function detect(c,target,ready){if(!ready)return {blocked:'先确认检测器本身可用：让两个检测端互碰。'};if(c.power)return {blocked:'先取下模型电池。检测器自带电池，不能带着原电源检测。'};const pairs={lamp:[2,3],contact:[6,7],wire:[3,4],switch:[4,5]};if(!pairs[target])return {blocked:'这里不能用连通检测器检测；不要把它直接接到电池两极。'};return {target,lit:connected(internalEdges(c),...pairs[target])};}
export function supported(c,ids,target){const selected=c.evidence.filter(e=>ids.includes(e.id));return c.verified&&target===cases[c.index].fault&&selected.some(e=>e.target===target&&!e.lit&&!e.afterRepair)&&selected.some(e=>e.target!==target&&e.lit);}
// Completion and strength of causal evidence are separate; never require a fixed evidence combination.
export function assessReport(c,ids,target){
  if(!c.verified||!lit(c)||!c.fixed.length)return {allowed:false,feedback:'还没完成修复后的通电检查。请回实验桌，放回电池、合上开关，观察模型灯是否亮起。你的文字会保留。'};
  const records=ids.length?c.evidence.filter(e=>ids.includes(e.id)):c.evidence;
  const before=records.some(e=>e.target===target&&!e.lit&&!e.afterRepair);
  const after=records.some(e=>e.target===target&&e.lit&&e.afterRepair);
  const supportedCause=before&&target===cases[c.index].fault&&c.fixed.includes(target);
  if(supportedCause)return {allowed:true,evidenceStatus:'supported',feedback:`作品已修复！你记录了${names[target]}调整前检测灯不亮，${after?'调整后检测灯亮起，并且':''}修复后模型也亮了，这些现象支持你的判断。正常部位的检测记录可以帮助排除其他原因，但不必凑齐才能交还作品。`};
  return {allowed:true,evidenceStatus:c.fixed.length>1?'multiple_changes':'repair_only',feedback:c.fixed.length>1?'作品已修复，可以交还同学！你调整了多个部位，暂时不能确定是哪一次调整起了作用。下次可以一次只改一处，再观察变化。':'作品已修复，可以交还同学！修复后模型亮了，能说明这次修复有效；但缺少支持原故障判断的修复前记录，还不能完全确定原来哪里出了问题。不必恢复故障补记录，下次可以先检测再调整。'};
}
export function toolLit(edges,removed){return !removed&&connected([...edges,[2,3],[4,5]],0,1)&&!connected([...edges,[4,5]],0,1);}
