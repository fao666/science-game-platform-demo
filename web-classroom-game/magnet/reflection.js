export const reflectionFields = [
 {id:'material',label:'我测试了哪件物品？',kind:'tested'},
 {id:'guess',label:'测试前，我猜它……',choices:['能被吸引','不能被吸引','还不确定']},
 {id:'observed',label:'测试后，我看到它……',choices:['被吸引了','没有被吸引','还没看清楚']},
 {id:'load',label:'我给小车装了什么？',kind:'loaded'},
 {id:'action',label:'我怎样移动磁铁？',choices:['移到小车右边','移到小车左边','慢慢移近小车','移得离小车很远']},
 {id:'motion',label:'我看到小车……',choices:['向右移动了','向左移动了','没有明显移动','还没看清楚']}
];
export function reflectionOptions(field,state){
 if(field.kind==='tested')return [...new Set(state.tests.map(t=>t.name))];
 if(field.kind==='loaded')return [...new Set(state.moves.map(t=>t.name))];
 return field.choices;
}
export function reflectionValue(draft,id){
 const item=draft?.[id];
 return item?.choice==='other'?(item.text||'').trim().slice(0,24):(item?.choice||'');
}
export function composeReflection(draft){
 const v=id=>reflectionValue(draft,id)||'____';
 return `我测试了${v('material')}。我原来猜它${v('guess')}，测试后看到它${v('observed')}。\n我给小车装了${v('load')}，把磁铁${v('action')}，看到小车${v('motion')}。`;
}
