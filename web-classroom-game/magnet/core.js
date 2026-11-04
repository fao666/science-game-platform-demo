export const materials = [
 {id:'clip',name:'铁回形针',symbol:'🖇',material:'铁',attracts:true},
 {id:'wood',name:'木块',symbol:'🪵',material:'木',attracts:false},
 {id:'aluminum',name:'铝片',symbol:'▰',material:'铝',attracts:false},
 {id:'iron',name:'铁片',symbol:'▰',material:'铁',attracts:true},
 {id:'plastic',name:'塑料积木',symbol:'🧱',material:'塑料',attracts:false},
 {id:'copper',name:'铜片',symbol:'▰',material:'铜',attracts:false},
 {id:'nail',name:'铁钉',symbol:'🔩',material:'铁',attracts:true},
 {id:'paper',name:'纸卡',symbol:'▱',material:'纸',attracts:false}
];
export const fresh = () => ({id:globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,tab:'materials',predictions:{},tests:[],moves:[],events:[],reflection:'',done:false,cart:90,magnet:270,load:'wood',board:'none',round:0,delivered:[false,false]});
export function stepCart(cart,magnet,load,board='none') {
 const m=materials.find(x=>x.id===load);
 if(!m?.attracts || board==='thick') return cart;
 const distance=magnet-cart;
 // A qualitative classroom model: attraction has a limited working range.
 if(Math.abs(distance)>120 || Math.abs(distance)<35) return cart;
 return Math.max(55,Math.min(735,cart+Math.sign(distance)*Math.min(5,Math.abs(distance)-35)));
}
export function archive(history,state) {
 if(!state.done) return history;
 return history.some(x=>x.id===state.id)?history:[...history,JSON.parse(JSON.stringify(state))];
}
