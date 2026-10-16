import {assessReport} from './core.js';

// Notes and physical verification are independent: never ask for the same text twice.
export function synchronizeReport(c){
  const note=c.reportDraft||c.report;
  if(!note?.reason?.trim()){c.report=null;return false;}
  if(!c.reportDraft)c.reportDraft={target:note.target||'',reason:note.reason,ids:[...(note.ids||[])]};
  const assessment=assessReport(c,note.ids||[],note.target||'');
  if(!assessment.allowed){c.report=null;return false;}
  c.report={target:note.target||'',reason:note.reason,ids:[...(note.ids||[])],evidenceStatus:assessment.evidenceStatus,verification:'模型重新供电后亮起',actions:[...c.fixed],feedback:assessment.feedback};
  return true;
}
