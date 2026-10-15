import {newCase} from './core.js';

export function initializeInvestigations(s){
  const previous=Array.isArray(s.investigations)?s.investigations:[];
  s.investigations=[0,1,2].map(index=>{
    const old=previous[index],base=newCase(index);
    if(old?.current?.index===index&&['fixed','evidence','hypotheses'].every(k=>Array.isArray(old.current[k])))return {...old,current:{...base,...old.current}};
    const report=s.reports.find(r=>r.index===index);
    return {accepted:!!report,carrying:false,current:report?{...base,fixed:report.actions||[],evidence:report.evidence||[],hypotheses:report.hypotheses||[],verified:true,report}:base};
  });
  storeInvestigation(s);
}
export function storeInvestigation(s){s.investigations[s.index]={accepted:s.accepted,carrying:s.carrying,current:s.current};}
export function chooseInvestigation(s,index){
  if(!Number.isInteger(index)||index<0||index>2||s.reports.some(r=>r.index===index))return false;
  storeInvestigation(s);const entry=s.investigations[index];s.index=index;s.current=entry.current;s.accepted=!!entry.accepted;s.carrying=!!entry.carrying;return true;
}
export function missionPhase(s,index){
  if(s.reports.some(r=>r.index===index))return {key:'delivered',label:'已完成 · 已交付'};
  const entry=index===s.index?{carrying:s.carrying,current:s.current}:s.investigations?.[index];
  if(!entry?.carrying)return {key:'available',label:'等待领取'};
  if(entry.current.report&&entry.current.verified)return {key:'handoff',label:'待交付阿圆'};
  if(entry.current.verified)return {key:'report',label:'已点亮 · 待写报告'};
  if(entry.current.fixed.length)return {key:'verify',label:'已调整 · 待复验'};
  return {key:'investigating',label:index===s.index?'正在调查':'已暂存 · 可继续'};
}
