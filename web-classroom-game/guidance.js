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
    if(s.removed)return guide(1,'让两个检测端碰一碰','拖动红、蓝导线末端互相接触。自己的灯亮了，才说明工具可靠。');
    if(toolLit(s.toolEdges,false))return guide(1,'灯亮了！把开关拆下来','拖住开关中间的手柄，放到右下托盘。两根空出的线就是检测端。');
    return guide(1,'先接通一个简易电路','从一个金色接点拖到另一个接点；也可以先点起点，再点终点。让电流经过小灯泡和开关回到电池。');
  }
  if(c.verified)return guide(3,'模型亮了，记下你的发现','打开调查本，写下调整了什么、重新供电后看到了什么。',null,'notebook');
  if(c.fixed.length&&!c.power)return guide(2,'调整之后，重新供电看看','点击左上方“放回电池复验”。如果还不亮，可以继续调查，不必重来。');
  if(c.power)return guide(2,'先把作品里的电池取下来','点击左上方“取下模型电池”。检测工具自带电池，不能带着原电源检测。');
  if(!ready)return guide(2,'检测前，先确认工具可用','把红、蓝检测端互碰一下，看检测工具自己的灯能否亮起。每次检测前都要自检。');
  return guide(2,'选一个想检查的部位','把两个检测端分别拖到同一部位两端的金色接点。观察检测灯亮不亮，再决定下一步。');
}

export const doorZones={fair:{x:180,y:385,rx:105,ry:76},workshop:{x:90,y:455,rx:75,ry:85}};
export function nearDoor(scene,player){
  const d=doorZones[scene];
  return !!d&&((player.x-d.x)/d.rx)**2+((player.y-d.y)/d.ry)**2<=1;
}
