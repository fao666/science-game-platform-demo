import {cases,names} from './core.js';

export const questOwners=[
  {id:'rabbit',name:'米米',place:'广场右侧',role:'灯塔制作者',question:'我的寻宝灯塔昨天还能亮，今天合上开关却没有反应。灯泡、导线、连接、开关或电池都有可能，你能帮我查一查吗？'},
  {id:'turtle',name:'慢慢',place:'上方长椅旁',role:'纸屋制作者',question:'我想让纸屋的小夜灯照亮窗户，可是装好电池、合上开关也不亮。看起来相似的现象，会是同一种原因吗？请帮我调查。'},
  {id:'hedgehog',name:'团团',place:'左下方草坪边',role:'星星舞台制作者',question:'我的星星舞台不亮了，而且内部器材的位置和前两件不一样。你愿意带回工坊，根据检测结果找到原因吗？'}
];
export function questStatus(s,index){return s.reports.some(r=>r.index===index)?'delivered':index===s.index&&s.carrying?'investigating':s.investigations?.[index]?.carrying?'paused':'available';}

// Text is inserted as textContent, including student-authored reports.
export function createSpeech(stage){
  const root=document.createElement('section');root.id='worldSpeech';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-label','场景对话');root.innerHTML='<button id="speechToggle" type="button" aria-expanded="true" aria-controls="speechContent">收起对话 ▾</button><div id="speechContent"><span class="speaker-portrait" aria-hidden="true"></span><small></small><h2></h2><p></p><div class="speech-actions"><button id="speechAction" class="primary"></button><button id="speechClose">稍后再聊</button></div></div>';stage.append(root);
  const primary=root.querySelector('#speechAction'),close=root.querySelector('#speechClose'),toggle=root.querySelector('#speechToggle');let previousFocus,collapsed=false;
  const hintToggle=document.createElement('button');hintToggle.id='hintToggle';hintToggle.type='button';hintToggle.textContent='收起提示 ▾';hintToggle.setAttribute('aria-controls','caption');hintToggle.setAttribute('aria-expanded','true');stage.append(hintToggle);hintToggle.onclick=()=>{const hidden=stage.classList.toggle('hints-collapsed');hintToggle.textContent=hidden?'展开提示 ▴':'收起提示 ▾';hintToggle.setAttribute('aria-expanded',String(!hidden));};
  toggle.onclick=()=>{collapsed=!collapsed;root.classList.toggle('collapsed',collapsed);toggle.textContent=collapsed?'展开对话 ▴':'收起对话 ▾';toggle.setAttribute('aria-expanded',String(!collapsed));};
  const api={isOpen:()=>!root.hidden&&!collapsed,close(){root.hidden=true;stage.classList.remove('speaking');if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});},show({spot,title,text,label,action,happy=false}){previousFocus=document.activeElement;collapsed=false;root.classList.remove('collapsed');toggle.textContent='收起对话 ▾';toggle.setAttribute('aria-expanded','true');const qi=questOwners.findIndex(q=>q.id===spot?.id),portrait=root.querySelector('.speaker-portrait');portrait.hidden=qi<0;portrait.style.backgroundPosition=(Math.max(qi,0)*50)+'% '+(happy?100:0)+'%';root.querySelector('small').textContent='校园游园会 · '+(spot?.label||title);root.querySelector('h2').textContent=title;root.querySelector('p').textContent=text;root.style.left=Math.min(53,Math.max(3,(spot?.x||600)/12-38))+'%';const foot=spot?.y||500,head=foot-(spot?.size||140);root.style.top=Math.min(49,Math.max(8,(head<220?foot+50:head-270)/7.6))+'%';primary.hidden=!action;primary.textContent=label||'继续';primary.onclick=()=>{api.close();action?.();};close.textContent=action?'稍后再聊':'知道了';close.onclick=api.close;root.hidden=false;stage.classList.add('speaking');(action?primary:close).focus({preventScroll:true});}};
  root.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();api.close();}};return api;
}

export function renderSummary(box,s){
  const add=(parent,tag,text,cls)=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;parent.append(el);return el;};
  add(box,'p','你的实际完成顺序：'+(s.reports.map(r=>questOwners[r.index].name+'的'+cases[r.index].title).join(' → ')||'尚未交付作品'),'completion-order');
  s.reports.forEach((r,order)=>{
    const article=document.createElement('article');article.className='summary-case';box.append(article);
    add(article,'h3','第 '+(order+1)+' 个完成 · '+cases[r.index].title+' · '+questOwners[r.index].name+'的求助');
    add(article,'p','修复操作：'+((r.actions||[]).map(k=>names[k]||k).join('、')||'旧记录未保存操作明细'));
    add(article,'p','通电复验：'+(r.verification||'已交还的作品已完成通电复验'));
    const details=document.createElement('details');details.open=true;article.append(details);add(details,'summary','检测记录（'+(r.evidence||[]).length+'条）');
    if(!r.evidence?.length)add(details,'p','没有保存检测记录；不能据此断言最初的故障原因。');
    else{const list=document.createElement('ol');details.append(list);r.evidence.forEach(e=>add(list,'li',(names[e.target]||'未知部位')+' · '+(e.afterRepair?'调整后':'调整前')+'：'+(e.method==='reference-substitution'?'换入后参考灯':'检测器的灯')+(e.lit?'亮':'不亮')));}
    add(article,'h4','我提交的报告');add(article,'p',r.reason||'旧记录没有报告文字','student-report');
    add(article,'p','我的判断：'+(names[r.target]||'还不确定具体原因'));
    if(r.feedback)add(article,'p',r.feedback,'summary-feedback');
  });
  const pending=Array.isArray(s.investigations)?s.investigations.map((entry,index)=>({entry,index})).filter(({entry,index})=>!s.reports.some(r=>r.index===index)&&(entry.accepted||entry.carrying||entry.current?.evidence?.length||entry.current?.reportDraft)):[];
  pending.forEach(({entry,index})=>{const c=entry.current,article=document.createElement('article');article.className='summary-case';box.append(article);add(article,'h3','未交付的调查 · '+cases[index].title);add(article,'p','阶段：'+(c.verified?'已通电点亮':c.fixed.length?'已调整，尚待复验':'调查中'));const list=document.createElement('ol');article.append(list);(c.evidence||[]).forEach(e=>add(list,'li',(names[e.target]||e.target)+' · '+(e.afterRepair?'调整后':'调整前')+'：'+(e.method==='reference-substitution'?'换入后参考灯':'检测器的灯')+(e.lit?'亮':'不亮')));add(article,'p','修复操作：'+((c.fixed||[]).map(k=>names[k]||k).join('、')||'暂无'));if(c.report?.reason||c.reportDraft?.reason)add(article,'p','报告或草稿：'+(c.report?.reason||c.reportDraft.reason),'student-report');});
  if(!s.reports.length&&!pending.length)add(box,'p','还没有交还作品。羽老师会在这里保留你完成后的记录。');
}
