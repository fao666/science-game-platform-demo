// Contextual readings: do not infer an individual child's literacy from grade alone.
export const readings = {
 '磁力运输队':'cí lì yùn shū duì','磁铁':'cí tiě','吸引':'xī yǐn','材料':'cái liào',
 '调查':'diào chá','实验':'shí yàn','观察':'guān chá','预测':'yù cè','猜想':'cāi xiǎng',
 '科学':'kē xué','综合探究':'zōng hé tàn jiū','展台':'zhǎn tái','展':'zhǎn',
 '解释':'jiě shì','发现':'fā xiàn','测试':'cè shì','实测':'shí cè','记录':'jì lù',
 '运输':'yùn shū','装载槽':'zhuāng zài cáo','装载':'zhuāng zài','物品':'wù pǐn',
 '铁回形针':'tiě huí xíng zhēn','回形针':'huí xíng zhēn','铝片':'lǚ piàn',
 '铁片':'tiě piàn','铜片':'tóng piàn','铁钉':'tiě dīng','塑料积木':'sù liào jī mù','木块':'mù kuài','纸卡':'zhǐ kǎ',
 '塑料':'sù liào','铝':'lǚ','铜':'tóng','铁':'tiě','隔板':'gé bǎn','薄纸板':'báo zhǐ bǎn',
 '厚垫板':'hòu diàn bǎn','隔物':'gé wù','距离':'jù lí','位置':'wèi zhì','移动':'yí dòng',
 '靠近':'kào jìn','接触':'jiē chù','拖动':'tuō dòng','滑块':'huá kuài','按钮':'àn niǔ',
 '方向键':'fāng xiàng jiàn','选择':'xuǎn zé','比较':'bǐ jiào','结果':'jié guǒ',
 '现象':'xiàn xiàng','相似':'xiāng sì','直接':'zhí jiē','尝试':'cháng shì',
 '保存':'bǎo cún','导出':'dǎo chū','历史':'lì shǐ','重新':'chóng xīn','归类':'guī lèi',
 '归档':'guī dàng','完成':'wán chéng','补测':'bǔ cè','修改':'xiū gǎi','返回':'fǎn huí',
 '整理':'zhěng lǐ','准备':'zhǔn bèi','路线':'lù xiàn','证据':'zhèng jù','分享':'fēn xiǎng',
 '交流':'jiāo liú','目标':'mù biāo','说明':'shuō míng','失败':'shī bài','保留':'bǎo liú',
 '检查':'jiǎn chá','调整':'tiáo zhěng','有效':'yǒu xiào','金属':'jīn shǔ','器材':'qì cái',
 '课堂':'kè táng','模型':'mó xíng','验证':'yàn zhèng','轮':'lún','明显':'míng xiǎn',
 '碰':'pèng','猜':'cāi','练':'liàn','测':'cè','选':'xuǎn','类':'lèi'
};
export function installPinyin(root=document.body){
 const words=Object.keys(readings).sort((a,b)=>b.length-a.length);
 const pattern=new RegExp(words.join('|'),'g');
 function annotate(){
   observer.disconnect();
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
     if(!node.textContent.trim()||node.parentElement?.closest('ruby,rt,rp,script,style,textarea,option,canvas,[data-no-pinyin]'))return NodeFilter.FILTER_REJECT;
     return NodeFilter.FILTER_ACCEPT;
   }});
   const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
   for(const node of nodes){
     const text=node.textContent;pattern.lastIndex=0;if(!pattern.test(text))continue;
     pattern.lastIndex=0;const fragment=document.createDocumentFragment();let end=0;
     for(const match of text.matchAll(pattern)){
       fragment.append(document.createTextNode(text.slice(end,match.index)));
       const group=document.createElement('span');group.className='pinyin-word';
       const syllables=readings[match[0]].split(' ');
       [...match[0]].forEach((char,i)=>{const ruby=document.createElement('ruby');ruby.append(document.createTextNode(char));const rt=document.createElement('rt');rt.textContent=syllables[i];ruby.append(rt);group.append(ruby)});
       fragment.append(group);end=match.index+match[0].length;
     }
     fragment.append(document.createTextNode(text.slice(end)));node.replaceWith(fragment);
   }
   observer.observe(root,{childList:true,subtree:true,characterData:true});
 }
 const observer=new MutationObserver(annotate);annotate();return observer;
}
