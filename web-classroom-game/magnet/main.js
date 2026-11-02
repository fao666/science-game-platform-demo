import {installPinyin,readings} from './pinyin.js';
import {materials,fresh,stepCart,archive} from './core.js';
const $=s=>document.querySelector(s), KEY='science-magnet-v1', HIST='science-magnet-history-v1';
const spriteIndex={clip:3,wood:4,iron:5,aluminum:5,copper:6,plastic:7};
const icon=m=>spriteIndex[m.id]===undefined?m.symbol:`<span class="prop" style="background-position:${spriteIndex[m.id]%3*50}% ${Math.floor(spriteIndex[m.id]/3)*50}%"></span>`;
const propImage=new Image();propImage.src='../assets/magnet/props.png';propImage.onload=()=>{if(state.tab==='transport')draw()};
function checkedHistory(){const raw=localStorage.getItem(HIST);const value=raw?JSON.parse(raw):[];if(!Array.isArray(value))throw Error('历史格式错误');return value}
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
const coreMaterials=['clip','wood','copper'];
let state=read(KEY,null)||fresh(),selected='clip',hint=0,practice=false,prediction=null,drag=false;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{$('#status').textContent='保存失败，请先导出记录后再退出。';return false}}
function event(type,data={}){state.events.push({type,time:new Date().toISOString(),...data});save()}
function say(text){$('#status').textContent=text}
function modal(html,noPinyin=false){$('#dialogContent').toggleAttribute('data-no-pinyin',noPinyin);$('#dialogContent').innerHTML=html;$('#dialog').showModal()}
$('#closeDialog').onclick=()=>$('#dialog').close();
function board(){ $('#observations').innerHTML=[...state.tests.map(t=>`<div class="observation">${escape(t.name)}：原来猜${t.prediction?'能':'不能'}吸引 → 实测${t.result?'被吸引':'没有被吸引'}</div>`),...state.moves.map(t=>`<div class="observation">小车第${t.round+1}轮 · ${escape(t.name)} · ${escape(t.board)}${Math.abs(t.to-t.from)>5?(t.to>t.from?'，小车向右移动':'，小车向左移动'):'，小车没有明显移动'}</div>`)].reverse().join('')||'<p class="muted">还没有测试。先选一件物品，再猜一猜。</p>';;updateProgress(); }

function tested(id){return state.tests.some(t=>t.id===id)}
function updateProgress(){
 const count=coreMaterials.filter(tested).length, routes=state.delivered.filter(Boolean).length;
 $('#missionProgress').innerHTML=`<strong>今天只做这3步</strong><span class="${count===3?'complete':''}">${count===3?'✓':'①'} 查材料 ${count}/3</span><span class="${routes===2?'complete':''}">${routes===2?'✓':'②'} 送小车 ${routes}/2</span><span class="${state.done?'complete':''}">${state.done?'✓':'③'} 和老师说发现</span><small>多余材料和隔板实验是选做。先做一小步，不用一次做完。</small>`;
 const next=state.done?'本轮已完成！可以回看记录，或自由试试选做实验。':state.tab==='materials'?(count<3?(tested(selected)?`这件已调查。可以在下面分一分类，再选下一件。已查${count}/3件。`:`现在先查：${materials.find(m=>m.id===selected).name}。先猜，再按“试一试”。已查${count}/3件。`):'3件都查过了！可以去小车台，也可以再试一次。'):state.tab==='transport'?`这是第${state.round+1}条路线。${state.delivered[state.round]?'已经送达，按下面的绿色按钮继续。':'先选装载材料，再移动磁铁。目标是黄色展台。'}`:'看看上方哪一步还没完成；完成后，向老师说一说你的发现。';
 $('#nextAction').textContent=next;
 document.querySelectorAll('[data-material]').forEach(b=>{const id=b.dataset.material,done=tested(id);b.classList.toggle('investigated',done);b.querySelector('.check-status').textContent=done?'✓ 已调查 · 可再试':'○ 还没调查';b.setAttribute('aria-label',materials.find(m=>m.id===id).name+(done?'，已调查，可以再试':'，还没调查'));});
}
function materialCard(m){return `<button class="material ${m.id===selected?'active':''}" data-material="${m.id}"><span class="symbol">${icon(m)}</span><strong>${m.name}</strong><span class="check-status">○ 还没调查</span></button>`}
function render(){
 hint=0;$('#hint').textContent=''; document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));
 if(state.tab==='materials')renderMaterials();else if(state.tab==='transport')renderTransport();else renderReflect();board();save();
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{recordMove();state.tab=b.dataset.tab;render()});
function renderMaterials(){
 $('#station').innerHTML=`<h2>第1步 · 先查3件材料</h2><div class="actions"><button id="practice">先练一练</button><button id="direct">直接调查</button></div><div id="practiceText"></div><p class="task-note">先调查下面3件物品就好。猜错没关系，测过会出现“✓ 已调查”。</p><div id="bench" class="bench"></div><h3>换一件继续查</h3><div class="materials core-materials">${coreMaterials.map(id=>materialCard(materials.find(m=>m.id===id))).join('')}</div><details class="extra-materials"><summary>还有5件材料，想多试再打开（选做）</summary><div class="materials">${materials.filter(m=>!coreMaterials.includes(m.id)).map(materialCard).join('')}</div></details><div class="actions"><button class="primary" id="toTransport">查好了，去送小车 →</button></div>`;
 document.querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>{selected=b.dataset.material;prediction=null;renderBench();updateProgress();document.querySelectorAll('[data-material]').forEach(x=>x.classList.toggle('active',x===b))});
 $('#practice').onclick=()=>{practice=true;$('#practiceText').innerHTML='<div class="practice">① 选一件物品。② 按“我猜能/不能”。③ 点“磁铁靠近”，观察结果。猜错可以改想法，不扣分。现在由你来试。</div>';event('practice')};
 $('#direct').onclick=()=>{$('#practiceText').innerHTML='';practice=false};
 $('#toTransport').onclick=()=>{state.tab='transport';render()};renderBench();
}
function renderBench(){
 const m=materials.find(x=>x.id===selected);
 $('#bench').innerHTML=`<h3>${m.name}</h3><div><span id="magnetIcon" class="symbol"><span class="prop" style="background-position:0% 0%"></span></span><span id="objectIcon" class="symbol">${icon(m)}</span></div><p class="current-step">${prediction===null?'现在先选：我猜能，还是不能？':'已选好猜想。下一步：按绿色按钮试一试。'}</p><div class="actions"><button id="yes" class="${prediction===true?'active':''}">我猜能吸引</button><button id="no" class="${prediction===false?'active':''}">我猜不能吸引</button></div><button id="test" class="primary" ${prediction===null?'disabled':''}>让磁铁靠近，试一试</button><p id="result" class="result">结果还没有出现，先留下你的猜想。</p>`;
 $('#yes').onclick=()=>{prediction=true;renderBench()};$('#no').onclick=()=>{prediction=false;renderBench()};
 $('#test').onclick=()=>{state.tests.push({id:m.id,name:m.name,prediction,result:m.attracts,time:new Date().toISOString()});event('material-test',{material:m.id,prediction,result:m.attracts});$('#result').textContent=m.attracts?'✓ 调查过了：物品被吸引了。可以在下面分一分类，再选下一件。':'✓ 调查过了：物品没有被吸引。可以在下面分一分类，再选下一件。';$('#objectIcon').animate([{transform:'translateX(0)'},{transform:`translateX(${m.attracts?-42:0}px)`}],{duration:600,fill:'forwards'});board();showClassification(m);};
}
function showClassification(m){
 $('#classification')?.remove();const box=document.createElement('div');box.id='classification';
 box.innerHTML='<p>再想一想：根据刚才的现象，分到哪一类？</p><div class="actions"><button data-group="yes">能被吸引</button><button data-group="no">不能被吸引</button></div><p id="groupFeedback"></p><button id="nextMaterial" class="primary">选下一件 →</button>';
 $('#bench').append(box);$('#nextMaterial').onclick=()=>{const next=coreMaterials.find(id=>!tested(id));if(next){selected=next;prediction=null;render();$('#station').scrollIntoView({behavior:'smooth',block:'start'});}else{state.tab='transport';render();$('#station').scrollIntoView({behavior:'smooth',block:'start'});}};box.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>{const group=b.dataset.group==='yes';state.groups??={};state.groups[m.id]=group;event('classify',{material:m.id,group});updateProgress();$('#groupFeedback').textContent=group===m.attracts?'✓ 已分类。按“选下一件”继续，也可以重新测试。':'这和观察板里刚才的现象不同。可以保留这个想法，再测试一次或重新归类。';});
}
let moveStart=null, lastCart=0;
function renderTransport(){
 const r=state.round;
 $('#station').innerHTML=`<h2>${r?'换个展台，再试一次':'让小车到达黄色展台'}</h2><p>小车的装载槽放什么？把磁铁放在哪里？你可以返回材料站补做调查。</p><div class="controls"><label>装载材料 <select id="load">${materials.map(m=>`<option value="${m.id}" ${state.load===m.id?'selected':''}>${m.name}（${(readings[m.name]||'').replaceAll(' ',' ')}）</option>`).join('')}</select></label><label>隔物实验 <select id="barrier"><option value="none">不加隔板（gé bǎn）</option><option value="paper">薄纸板（báo zhǐ bǎn）</option><option value="thick">厚垫板（hòu diàn bǎn）</option></select></label></div><canvas id="track" width="800" height="290" tabindex="0" aria-label="运输实验台，拖动磁铁或使用下方左右按钮和位置滑块"></canvas><p class="muted">拖动红蓝磁铁，或用下方滑块/左右按钮。磁铁与小车留有间隙。方向键也能移动磁铁。</p><label>磁铁位置 <input id="position" class="range" type="range" min="35" max="770" value="${state.magnet}" aria-label="磁铁位置"></label><div class="actions"><button id="left">← 磁铁向左</button><button id="right">磁铁向右 →</button><button id="resetCart">小车回起点</button><button id="nextRound" class="primary">${r?'去整理发现':'试试另一条运输路线'}</button></div><p class="result" id="transportResult">${state.delivered[r]?'已送达！可以继续测试不同材料。':'把小车送到黄色区域。若没有移动，比较材料和磁铁位置。'}</p><p class="muted">试着加上薄纸板，看看小车还动不动。厚垫板让磁铁离小车更远；这不表示它挡住了磁力。请和老师用真的磁铁试一试。</p>`;
 $('#barrier').value=state.board;
 $('#load').onchange=e=>{recordMove();state.load=e.target.value;event('load',{load:state.load});draw()};
 $('#barrier').onchange=e=>{recordMove();state.board=e.target.value;event('barrier',{board:state.board});draw()};
 $('#position').oninput=e=>{beginMove();state.magnet=Number(e.target.value);draw()};$('#position').onchange=recordMove;
 const canvas=$('#track');
 const setPointer=e=>{const box=canvas.getBoundingClientRect();state.magnet=Math.max(35,Math.min(770,(e.clientX-box.left)*800/box.width));$('#position').value=state.magnet;draw()};
 canvas.onpointerdown=e=>{drag=true;beginMove();canvas.setPointerCapture(e.pointerId);setPointer(e)};canvas.onpointermove=e=>{if(drag)setPointer(e)};canvas.onpointerup=()=>{drag=false;recordMove()};canvas.onpointercancel=()=>{drag=false;recordMove()};
 const nudge=d=>{beginMove();state.magnet=Math.max(35,Math.min(770,state.magnet+d));$('#position').value=state.magnet;draw();setTimeout(recordMove,350)};
 $('#left').onclick=()=>nudge(-35);$('#right').onclick=()=>nudge(35);canvas.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();nudge(e.key==='ArrowLeft'?-25:25)}};
 $('#resetCart').onclick=()=>{recordMove();state.cart=r?680:90;state.magnet=r?590:180;event('reset-cart');draw()};
 $('#nextRound').onclick=()=>{recordMove();if(!state.delivered[r]){say('这一轮还没送达。可以调整材料与磁铁位置，也可以先去整理发现。');return}if(!r){state.round=1;state.cart=680;state.magnet=590;event('new-route');render()}else{state.tab='reflect';render()}};draw();
}
function beginMove(){if(moveStart===null)moveStart=state.cart}
function recordMove(){if(moveStart===null)return;state.moves.push({round:state.round,from:moveStart,to:state.cart,name:materials.find(m=>m.id===state.load).name,board:{none:'无隔板',paper:'薄纸板',thick:'厚垫板'}[state.board],time:new Date().toISOString()});moveStart=null;save();board()}
function draw(){const c=$('#track');if(!c)return;const g=c.getContext('2d');g.clearRect(0,0,800,290);g.fillStyle='#f3e7d1';g.fillRect(0,150,800,140);g.fillStyle='#d9ad5c';g.fillRect(25,200,750,7);g.fillStyle='#f8d96d';const goal=state.round?55:650;g.fillRect(goal,130,95,100);g.fillStyle='#665322';g.font='bold 20px sans-serif';g.fillText('展台',goal+25,120);g.font='16px sans-serif';g.fillText('zhǎn tái',goal+20,98);if(state.board!=='none'){g.fillStyle=state.board==='paper'?'#fffdf1':'#bac7b9';g.fillRect(20,235,760,state.board==='paper'?6:25)}const x=state.cart;if(!propImage.complete||!propImage.naturalWidth){g.fillStyle='#438ba0';g.fillRect(x-34,150,68,35);g.fillStyle='#203b50';for(const w of [-23,23]){g.beginPath();g.arc(x+w,191,12,0,Math.PI*2);g.fill()}g.font='24px sans-serif';g.fillText(materials.find(m=>m.id===state.load).symbol,x-12,150);}const mx=state.magnet;if(!propImage.complete||!propImage.naturalWidth){g.fillStyle='#ec6c60';g.fillRect(mx-24,65,24,45);g.fillStyle='#498cb5';g.fillRect(mx,65,24,45);}g.fillStyle='#203b50';g.font='16px sans-serif';g.fillText('磁铁',mx-16,52);g.font='16px sans-serif';g.fillText('cí tiě',mx-17,31);g.font='15px sans-serif';g.fillText('装载槽',x-22,225);g.font='15px sans-serif';g.fillText('zhuāng zài cáo',x-35,243);if(propImage.complete&&propImage.naturalWidth){const sw=propImage.naturalWidth/3,sh=propImage.naturalHeight/3;g.drawImage(propImage,2*sw,2*sh,sw,sh,x-48,125,96,80);g.font='22px sans-serif';g.fillText(materials.find(m=>m.id===state.load).symbol,x-10,147);g.drawImage(propImage,0,0,sw,sh,mx-33,62,66,55);}}
setInterval(()=>{if(state.tab!=='transport')return;const before=state.cart;state.cart=stepCart(state.cart,state.magnet,state.load,state.board);if(state.cart!==before){beginMove();draw();lastCart=Date.now();const arrived=state.round?state.cart<=145:state.cart>=650;if(arrived&&!state.delivered[state.round]){state.delivered[state.round]=true;event('delivered',{round:state.round});$('#transportResult').textContent='送达了！回想一下，你改变了什么才让它动起来？';say('小车已送达展台。');updateProgress()}}else if(moveStart!==null&&!drag&&Date.now()-lastCart>700)recordMove()},40);
function renderReflect(){
 $('#station').innerHTML=`<h2>把发现带回课堂</h2><p>你完成了${new Set(state.tests.map(x=>x.id)).size}种材料测试，送达了${state.delivered.filter(Boolean).length}条路线。车动了是结果，为什么动需要你用证据说明。</p><p class="practice">可以说：我原来猜____，测试后看到____。我给小车装了____，把磁铁____，小车____。</p><label for="reflection">我的解释（也可以先和老师口头交流）</label><textarea id="reflection" placeholder="我先猜……后来我看到……"></textarea><div class="actions"><button id="backMaterial">返回补测</button><button id="finish" class="primary">完成调查并保存</button></div><p id="finishMessage"></p>`;
 $('#reflection').value=state.reflection;$('#reflection').oninput=e=>{state.reflection=e.target.value;save()};$('#backMaterial').onclick=()=>{state.tab='materials';render()};
 $('#finish').onclick=()=>{if(!coreMaterials.every(tested)||!state.delivered.every(Boolean)){say('看看上面的进度：查完3件材料、送达2条路线，就可以完成。可以随时返回继续。');return}state.done=true;event('complete');updateProgress();try{localStorage.setItem(HIST,JSON.stringify(archive(checkedHistory(),state)));save();$('#finishMessage').innerHTML='<h3>科学展准备好了！</h3><p>你的观察已经保存。和老师、同学分享一次改变想法的经历吧。</p>'}catch{state.done=false;say('归档失败，本轮保留。请导出后再试。')}};
}
$('#help').onclick=()=>{const hints=state.tab==='materials'?['选一件物品，先留下猜想，再让磁铁靠近。','比较两件外观相似、材料不同的物品，结果相同吗？','观察板里哪一次结果和猜想不一样？可以再试一次。']:['目标是把小车送到黄色区域。先看看装载槽和磁铁的位置。','一次只改变材料或磁铁位置，比较小车是否移动。','可以回材料站找一条真实测试记录，再决定装什么。'];$('#hint').textContent=hints[Math.min(hint++,hints.length-1)];event('help',{tab:state.tab,level:hint})};
$('#teacher').onclick=()=>modal('<h2>40分钟综合探究课</h2><p>教师演示机＋学生一人一机。建议先在演示机介绍操作，再让学生独立预测、测试和修正。</p><ol><li>0—5分钟：情境与预测；演示操作，不演示答案。</li><li>5—13分钟：真实磁铁与材料实验，对照网页调查站。</li><li>13—23分钟：个人完成调查与第一条运输路线。</li><li>23—31分钟：变化路线与修改，薄纸板隔物实验可选。</li><li>31—37分钟：暂停全班游戏，讨论两种不同的试验路径。</li><li>37—40分钟：出口说明、导出个人记录。</li></ol><p>追问：你改了什么？看到了什么？还需要比较什么？</p><p>预计时长需试教。此版本为各设备本地记录，不含实时班级监控。实物实验使用适龄磁铁，不使用强力磁铁。</p>',true);
$('#history').onclick=()=>{const records=read(HIST,[]);modal(`<h2>已完成的调查</h2>${records.map((s,i)=>`<h3>第${i+1}轮</h3><p>${s.tests.length}次材料测试 · ${s.moves.length}次运输观察</p><p>${escape(s.reflection||'解释留待课堂交流')}</p>`).join('')||'<p>完成调查后会自动保存到这里。</p>'}`)};
$('#export').onclick=()=>{recordMove();const blob=new Blob([JSON.stringify({game:'磁力运输队',current:state,history:read(HIST,[])},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='磁力运输队观察记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$('#restart').onclick=()=>{if(state.done){try{localStorage.setItem(HIST,JSON.stringify(archive(checkedHistory(),state)))}catch{say('归档失败，请先导出记录。本轮仍保留。');return}}moveStart=null;state=fresh();prediction=null;render();say('新一轮调查已开始，已完成的历史仍保留。')};
render();if(!state.events.length)modal('<h2>我们先查一件物品</h2><p>今天只做3步：查3件材料、送2次小车、说说发现。</p><p>先看铁回形针，猜一猜它能不能被磁铁吸引，再按绿色按钮试一试。</p><p>猜错没关系。其他材料是选做，进度会帮你记住，不用急。</p>');

installPinyin();
