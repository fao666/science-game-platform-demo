import {toolLit} from './core.js';

// Describe the next action without revealing the faulty part.
export function guideFor(s,scene,ready=false){
  const c=s.current;
  const guide=(step,title,detail,target=null,action=null)=>({step,title,detail,target,action});
  if(s.completed)return guide(4,'三件作品都亮了！','打开调查本，比较三次修复的发现，再和同学交流。',null,'summary');
  if(!s.accepted||!s.carrying){
    if(scene==='workshop')return guide(0,'先回游园会领取作品','从左侧门出去，到右上方红白帐篷找阿圆。','door');
    if(scene!=='fair')return guide(0,'先回游园会领取作品','先离开工作台，从工坊左侧门出去找阿圆。',null,'leave');
    return !s.accepted?guide(0,'先问问摊位的阿圆','到右上方红白帐篷，靠近水豚同学按 E，或直接点击同学。','stall'):guide(0,'拿起这次要修的作品','再和阿圆互动一次。三件作品会依次交给你，不用同时搬走。','stall');
  }
  if(c.report&&c.verified){
    if(scene==='fair')return guide(4,'把修好的作品交还阿圆','到右上方红白帐篷互动，交还后会接到下一件作品。','stall');
    if(scene==='workshop')return guide(4,'从左侧门回游园会','走进门口的发光区域就会自动离开工坊。','door');
    return guide(4,'带上作品回游园会','先离开工作台，再从工坊左侧的门出去。',null,'leave');
  }
  if(scene==='fair')return guide(s.toolReady?2:1,'带着作品去科学工坊','左上方木屋就是工坊。走到门前的发光区域会自动进入。','door');
  if(scene==='workshop')return s.toolReady?guide(2,'到右侧模型实验桌','把作品放到右边的桌上，自由选择要检查的部位。','bench'):guide(1,'先到左侧工具制作台','用电池、小灯泡和导线，做一个能看见通断的检测工具。','tool');
  if(scene==='tool'){
    if(s.toolReady)return guide(1,'检测工具准备好了','离开工具台，去右侧模型实验桌调查作品。',null,'leave');
    if(s.removed)return guide(1,'首次使用前，让两个检测头碰一碰','拖动红、蓝导线末端互相接触。自己的灯亮了，才知道这个工具能用；成功后可以一直使用。');
    if(toolLit(s.toolEdges,false))return guide(1,'灯亮了！接下来留出两个检测头','取下开关，让待检查的部件接到这个空缺处。点击右侧“取下开关，留下两个检测头”即可。',null,'prepare-tester');
    return guide(1,'先确认我们自己的电路能亮','把电池、小灯泡和开关连成回路，确认这些器材能工作。可拖动接点，也可依次点击两个接点，连接顺序由你决定。');
  }
  if(c.verified)return guide(3,'模型亮了，记下你的发现','打开调查本，写下调整了什么、重新供电后看到了什么。',null,'notebook');
  if(c.fixed.length&&!c.power)return guide(2,'调整之后，重新供电看看','点击左上方“放回电池复验”。如果还不亮，可以继续调查，不必重来。');
  if(c.power)return guide(2,'先把作品里的电池取下来','点击左上方“取下模型电池”。检测工具自带电池，不能带着原电源检测。');
  if(!s.toolReady)return guide(2,'先完成检测器的首次自检','如果还没做工具，先回左侧制作台。让已制作工具的两个检测头互碰，确认自己的灯能亮。');
  return guide(2,'选一个想检查的部位','把两个检测头分别拖到同一部位两端的金色接点，观察检测器自己的灯。你可以自由选择和更换检测对象，不必重复自检。');
}

export function testerPurpose(s){
  if(s.toolReady)return '这个电路检测器已通过首次自检，可以继续使用。把待检查部位接在两个检测头之间，用检测器自己的灯观察它是否连通。';
  if(s.removed)return '两个检测头互碰，相当于接入一段连通的导线。先看自己的灯能否亮，避免把工具的问题误认为作品的问题。';
  if(toolLit(s.toolEdges,false))return '拆掉开关会留出两个自由线头，也就是教材说的“检测头”。待检查部件接在它们之间，就成为这个回路的一部分。';
  return '作品不亮，单凭外观很难判断哪里有问题。我们先用正常的电池、灯泡和导线做一个电路检测器，之后用它检查作品各部分是否连通。';
}

export const testerIntro=`<div class="tester-intro"><small>先弄明白，再动手 · 教科版四下第30页</small><h2>为什么要做电路检测器？</h2><p class="book-definition">教材第30页：“把简易电路中的开关拆除后，就形成了一个电路检测器。”</p><p class="lesson-lead">作品不亮，可能是灯泡、导线或连接出了问题。我们需要一个<strong>自己能正常工作的电路</strong>，帮我们逐项检查。</p><svg viewBox="0 0 460 220" role="img" aria-label="电池、小灯泡和导线构成电路检测器，待检查的部件接在两个检测头之间"><path d="M65 87V48H175M225 48H360V100M65 151V185H360V166" fill="none" stroke="#499d8b" stroke-width="7" stroke-linecap="round"/><rect x="44" y="88" width="42" height="64" rx="9" fill="#efc46b" stroke="#926e31" stroke-width="2"/><text x="65" y="107" text-anchor="middle">＋</text><text x="65" y="142" text-anchor="middle">−</text><circle cx="200" cy="48" r="25" fill="#fff0ac" stroke="#b68c3d" stroke-width="3"/><path d="m186 35 28 26m-28 0 28-26" stroke="#b68c3d" stroke-width="3"/><circle cx="360" cy="100" r="8" fill="#db8268"/><circle cx="360" cy="166" r="8" fill="#65a5cd"/><rect x="286" y="114" width="148" height="38" rx="9" fill="#fff8e4" stroke="#c49e54" stroke-dasharray="5 4"/><g font-size="14" fill="#335e50" text-anchor="middle"><text x="65" y="174">电池</text><text x="200" y="96">自己的小灯泡</text><text x="360" y="139">接入待检查的部位</text><text x="360" y="82">检测头</text><text x="360" y="207">检测头</text></g></svg><div class="lesson-points"><p><b>为什么先让它亮？</b>确认工具本身正常，后面的检测结果才有意义。</p><p><b>为什么留下两个线头？</b>待检查的部件接在这里，就成为回路的一部分。</p><p><b>怎么看检测结果？</b>看检测器自己的灯。灯亮支持该部位连通；不亮则需要继续检查原因。</p></div><p class="lesson-note">游戏中只要求首次自检。之后可自由选择检测顺序，怀疑工具有问题时也可以主动再自检。</p></div>`;

export const doorZones={fair:{x:180,y:385,rx:105,ry:76},workshop:{x:90,y:455,rx:75,ry:85}};
export function nearDoor(scene,player){
  const d=doorZones[scene];
  return !!d&&((player.x-d.x)/d.rx)**2+((player.y-d.y)/d.ry)**2<=1;
}
