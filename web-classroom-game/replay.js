export function readPlayHistory(storage,key){
  const raw=storage.getItem(key+'-history');if(!raw)return [];
  const history=JSON.parse(raw);
  if(!Array.isArray(history)||history.some(r=>!r||!r.state||!Array.isArray(r.state.reports)))throw Error('历史记录暂时无法读取。当前进度没有清除，请先导出本轮记录。');
  return history;
}
export function archiveAndReset(storage,key,state){
  const history=readPlayHistory(storage,key);
  const entry={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),savedAt:new Date().toISOString(),state:JSON.parse(JSON.stringify(state))};
  // Save and verify before clearing the active run. A quota error must preserve progress.
  const value=JSON.stringify([entry,...history]);storage.setItem(key+'-history',value);
  if(storage.getItem(key+'-history')!==value)throw Error('历史记录未能保存，当前进度已保留。');
  storage.removeItem(key);return entry;
}

// Discard only when explicitly chosen; previous archived runs are never changed.
export function discardAndReset(storage,key){
  storage.removeItem(key);
  if(storage.getItem(key)!==null)throw Error('本轮进度未能清除，请重试。');
}

export function archiveCompleted(storage,key,state){
  if(!state.completed||![0,1,2,3].every(i=>state.reports.some(r=>r.index===i)))return null;
  const history=readPlayHistory(storage,key),id='completed-'+state.started;
  if(history.some(entry=>entry.id===id))return history.find(entry=>entry.id===id);
  const entry={id,savedAt:new Date().toISOString(),state:JSON.parse(JSON.stringify(state))};
  const value=JSON.stringify([entry,...history]);storage.setItem(key+'-history',value);
  if(storage.getItem(key+'-history')!==value)throw Error('通关记录保存失败，请导出备份。');
  return entry;
}
