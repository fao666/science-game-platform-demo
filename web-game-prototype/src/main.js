import Phaser from 'phaser';
import './style.css';
import {evaluateCircuit} from './circuitLogic.js';

const ui={
  title:document.querySelector('#taskTitle'), text:document.querySelector('#taskText'), count:document.querySelector('#taskCount'),
  progress:document.querySelector('#progressBar'), hint:document.querySelector('#hintText'), events:document.querySelector('#eventCount'),
  preview:document.querySelector('#eventPreview')
};
const state={step:0,inventory:new Set(),events:[],hints:0,startedAt:Date.now(),muted:false,hypothesis:null};
const tasks=[
  ['去护士站了解情况','移动到护士身边，按 E 或点击护士进行交流。','护士站位于急诊大厅中央，头顶有黄色任务标记。'],
  ['调查三个房间','分别检测电池、灯泡和开关，判断哪些元件能够用于急诊室复电。','先观察房间名称和设备图标；靠近检测台后按 E。'],
  ['提出故障假设','结合三处检测证据，先判断最可能的故障位置。','比较三条证据：哪个元件的表现不稳定？'],
  ['前往急诊配电箱','带着故障假设前往备用配电箱，用实际接线进行验证。','医院停电时，电路元件通常会被接到配电设备上。'],
  ['搭建闭合回路','把三个元件串联起来，合上开关，再进行通电测试。','从一个接线柱拖到另一个接线柱。电流必须从电池出发，经过开关和灯泡，再回到电池。'],
  ['处理二次突发','备用灯已亮，但抢救设备仍未启动，请判断总回路状态。','局部灯能亮说明元件可用；再看哪里还把整个回路断开了。']
];
function record(type,detail={}){
  const event={type,elapsedMs:Date.now()-state.startedAt,step:state.step+1,...detail};state.events.push(event);
  localStorage.setItem('hospital-power-prototype-events',JSON.stringify(state.events));
  ui.events.textContent=`${state.events.length} 条`;ui.preview.textContent=`${type}　${JSON.stringify(detail)}`;
}
function updateTask(step){state.step=step;const task=tasks[step];ui.title.textContent=task[0];ui.text.textContent=task[1];ui.count.textContent=`${step+1} / ${tasks.length}`;ui.progress.style.width=`${((step+1)/tasks.length)*100}%`;ui.hint.textContent='线索会引导观察，不直接给出答案。';record('task_started',{task:task[0]});}
function markItem(item){state.inventory.add(item);const el=document.querySelector(`[data-item="${item}"]`);el.classList.add('found');el.querySelector('small').textContent='已取得';record('component_collected',{item});}
document.querySelector('#hintButton').addEventListener('click',()=>{state.hints++;ui.hint.textContent=tasks[state.step][2];record('hint_opened',{hintLevel:state.hints});});
document.querySelector('#downloadLog').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({prototype:'急诊室复电行动',...state,inventory:[...state.inventory]},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='急诊室复电行动-体验记录.json';a.click();URL.revokeObjectURL(a.href);});

class HospitalScene extends Phaser.Scene{
  constructor(){super('hospital')}
  create(){
    this.makeTextures();this.buildMap();this.createCharacters();this.createItems();this.createEffects();this.createGuidance();
    this.keys=this.input.keyboard.addKeys('W,A,S,D,E,UP,DOWN,LEFT,RIGHT');this.interactKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.input.on('pointerdown',p=>{if(this.boardOpen||this.tutorialActive||p.x>this.scale.width) return;this.moveTarget=new Phaser.Math.Vector2(p.x,p.y);this.pendingInteraction=null;});
    this.physics.add.collider(this.player,this.walls);this.cameras.main.fadeIn(500,12,28,57);this.showBanner('医院突然停电了！', '找到护士，了解急诊室的情况');
    this.interactCooldownUntil=0;this.keyboardHandler=(event)=>{if(event.code==='KeyE'&&!this.boardOpen&&!this.tutorialActive){event.preventDefault();this.tryInteract();}};window.addEventListener('keydown',this.keyboardHandler);
    updateTask(0);record('game_started',{viewport:[this.scale.width,this.scale.height]});
  }
  makeTextures(){
    const g=this.make.graphics({x:0,y:0,add:false});
    g.fillStyle(0x4b83f0).fillRoundedRect(5,9,28,34,10).fillStyle(0xeaf4ff).fillCircle(19,13,10).fillStyle(0x172b55).fillCircle(16,12,2).fillCircle(22,12,2).fillStyle(0xffd45e).fillTriangle(15,23,23,23,19,31);g.generateTexture('bot',38,47);g.clear();
    g.fillStyle(0xffffff).fillCircle(18,12,10).fillStyle(0x38a8a2).fillRoundedRect(6,20,24,27,7).fillStyle(0x17345c).fillCircle(15,11,2).fillCircle(21,11,2).fillStyle(0xf16b6b).fillRect(16,20,4,12);g.generateTexture('nurse',36,48);g.clear();
    g.fillStyle(0x3f5276).fillRoundedRect(0,0,48,60,6).lineStyle(3,0x5fdcf1).strokeRoundedRect(2,2,44,56,5).fillStyle(0x162541).fillRect(8,10,32,30).fillStyle(0x65e6fb).fillCircle(16,48,4).fillCircle(31,48,4);g.generateTexture('panel',48,60);g.clear();
    g.fillStyle(0xffcf4a).fillCircle(16,16,13).fillStyle(0xff8b45).fillCircle(16,16,6);g.generateTexture('spark',32,32);g.destroy();
  }
  buildMap(){
    const w=this.scale.width,h=this.scale.height;this.add.rectangle(w/2,h/2,w,h,0x142b53);
    this.add.rectangle(w/2,h/2,w-32,h-32,0xeaf2f7).setStrokeStyle(8,0x35527c);
    const rooms=[
      [170,130,280,180,0xd6f1ed,'器材室'],[w-170,130,280,180,0xe1e9fb,'备用设备间'],
      [170,h-135,280,190,0xf7ead6,'维修仓库'],[w-190,h-145,320,210,0xe3ebf6,'急诊室']
    ];
    rooms.forEach(([x,y,rw,rh,color,label])=>{this.add.rectangle(x,y,rw,rh,color).setStrokeStyle(5,0xb8c8da);this.add.text(x,y-rh/2+17,label,{fontFamily:'Microsoft YaHei',fontSize:'16px',fontStyle:'bold',color:'#37506f'}).setOrigin(.5)});
    this.walls=this.physics.add.staticGroup();
    [[w/2,22,w-32,20],[w/2,h-22,w-32,20],[22,h/2,20,h-32],[w-22,h/2,20,h-32]].forEach(([x,y,rw,rh])=>this.walls.add(this.add.rectangle(x,y,rw,rh,0x35527c)));
    this.add.rectangle(w/2,h/2,300,135,0xffffff,.72).setStrokeStyle(3,0xcad8e7);this.add.text(w/2,h/2-42,'急诊大厅',{fontFamily:'Microsoft YaHei',fontSize:'20px',fontStyle:'bold',color:'#284366'}).setOrigin(.5);
    for(let x=340;x<w-320;x+=95)this.add.rectangle(x,h/2+33,64,22,0xbed0df).setStrokeStyle(2,0x8ca3ba);
    this.add.text(42,h-62,'小地图：蓝色机器人是你　★ 是目标',{fontFamily:'Microsoft YaHei',fontSize:'13px',color:'#365271',backgroundColor:'#ffffffcc',padding:{x:9,y:6}}).setDepth(20);
  }
  createCharacters(){
    const h=this.scale.height,w=this.scale.width;this.player=this.physics.add.sprite(90,h/2,'bot').setDepth(10).setCollideWorldBounds(true);this.player.body.setSize(28,36).setOffset(5,8);
    this.nurse=this.physics.add.sprite(w/2,h/2+12,'nurse').setImmovable(true).setDepth(9);this.nurse.setInteractive({useHandCursor:true}).on('pointerdown',()=>this.goToInteract(this.nurse,()=>this.talkNurse(),'护士小林'));
    this.questStar=this.add.text(this.nurse.x,this.nurse.y-50,'★',{fontSize:'28px',color:'#ffc72f'}).setOrigin(.5).setDepth(12);this.tweens.add({targets:this.questStar,y:'-=9',duration:700,yoyo:true,repeat:-1,ease:'Sine.inOut'});
    this.physics.add.collider(this.player,this.nurse);
  }
  createItems(){
    const w=this.scale.width,h=this.scale.height;const data=[['battery','🔋',125,120],['lamp','💡',w-125,120],['switch','🎚️',125,h-130]];
    this.items=this.physics.add.staticGroup();data.forEach(([id,icon,x,y])=>{const zone=this.add.container(x,y);const glow=this.add.circle(0,0,31,0x54d8e8,.19).setStrokeStyle(2,0x4dcfe5);const txt=this.add.text(0,0,icon,{fontSize:'35px'}).setOrigin(.5);const tag=this.add.text(0,42,'按 E 检测',{fontFamily:'Microsoft YaHei',fontSize:'12px',align:'center',color:'#24476e',backgroundColor:'#ffffffdd',padding:{x:6,y:3}}).setOrigin(.5).setVisible(false);zone.add([glow,txt,tag]);zone.itemId=id;zone.tag=tag;zone.setSize(65,65);this.physics.add.existing(zone,true);zone.setInteractive({useHandCursor:true}).on('pointerdown',()=>this.goToInteract(zone,()=>this.pickup(zone),this.itemName(id)));this.items.add(zone);this.tweens.add({targets:glow,scale:1.18,alpha:.06,duration:900,yoyo:true,repeat:-1});});
    this.panel=this.physics.add.staticSprite(w-120,h-125,'panel').setDepth(5).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.goToInteract(this.panel,()=>this.openBoard(),'急诊配电箱'));this.panelGlow=this.add.rectangle(this.panel.x,this.panel.y,75,88,0x4fe2f0,0).setStrokeStyle(3,0x4fe2f0,0).setDepth(4);
  }
  createEffects(){
    const w=this.scale.width,h=this.scale.height;this.dark=this.add.rectangle(w/2,h/2,w,h,0x061226,.55).setDepth(15).setBlendMode(Phaser.BlendModes.MULTIPLY);this.player.setDepth(17);this.nurse.setDepth(17);this.questStar.setDepth(18);this.items.getChildren().forEach(x=>x.setDepth(17));this.panel.setDepth(17);
    this.emergencyLights=[];[[w-285,h-200],[w-95,h-205],[w-270,h-80]].forEach(([x,y])=>{const light=this.add.circle(x,y,10,0xff425f,.8).setDepth(18);this.emergencyLights.push(light);this.tweens.add({targets:light,alpha:.15,duration:460,yoyo:true,repeat:-1});});
  }
  createGuidance(){
    const w=this.scale.width,h=this.scale.height;
    this.guideRing=this.add.circle(0,0,48,0xffd45e,.08).setStrokeStyle(4,0xffd45e,.95).setDepth(24);
    this.guideArrow=this.add.text(0,0,'⬇',{fontFamily:'Arial',fontSize:'38px',color:'#ffd45e',stroke:'#6b4e00',strokeThickness:3}).setOrigin(.5).setDepth(25);
    this.tweens.add({targets:[this.guideRing,this.guideArrow],scale:1.13,duration:640,yoyo:true,repeat:-1,ease:'Sine.inOut'});
    this.guideBox=this.add.container(34,124).setDepth(58);const box=this.add.rectangle(0,0,390,78,0x071a38,.95).setOrigin(0).setStrokeStyle(2,0x58d8e9);this.guideTitle=this.add.text(16,11,'第一步：先与护士小林交谈',{fontFamily:'Microsoft YaHei',fontSize:'18px',fontStyle:'bold',color:'#ffffff'});this.guideText=this.add.text(16,39,'看黄色 ★，点击护士；靠近后也可按 E。',{fontFamily:'Microsoft YaHei',fontSize:'13px',color:'#b9eafa'});this.guideBox.add([box,this.guideTitle,this.guideText]);
    this.nearPrompt=this.add.text(w/2,h-32,'',{fontFamily:'Microsoft YaHei',fontSize:'16px',fontStyle:'bold',color:'#17365f',backgroundColor:'#fff5c7',padding:{x:16,y:9}}).setOrigin(.5).setDepth(59).setVisible(false);
    this.tutorialActive=true;this.tutorial=this.add.container(w/2,h/2).setDepth(80);const shade=this.add.rectangle(0,0,w,h,0x041229,.7);const panel=this.add.rectangle(0,0,570,310,0xffffff).setStrokeStyle(5,0x5bd7e9);const title=this.add.text(0,-115,'欢迎来到急诊室复电行动！',{fontFamily:'Microsoft YaHei',fontSize:'27px',fontStyle:'bold',color:'#17365f'}).setOrigin(.5);const copy=this.add.text(0,-55,'你将像一位小维修员一样：\n① 找护士领任务　② 找齐三个元件　③ 亲手连线复电',{fontFamily:'Microsoft YaHei',fontSize:'18px',align:'center',lineSpacing:12,color:'#3e5576'}).setOrigin(.5);const tip=this.add.text(0,38,'不用记住所有按键：看到发光目标，直接点击就能前往。',{fontFamily:'Microsoft YaHei',fontSize:'14px',color:'#2764d9'}).setOrigin(.5);const start=this.add.rectangle(0,102,220,52,0x2764d9).setInteractive({useHandCursor:true});const startText=this.add.text(0,102,'开始行动 →',{fontFamily:'Microsoft YaHei',fontSize:'18px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);this.tutorial.add([shade,panel,title,copy,tip,start,startText]);start.on('pointerdown',()=>{start.disableInteractive();this.time.delayedCall(1,()=>{this.tutorialActive=false;this.tweens.add({targets:this.tutorial,alpha:0,duration:220,onComplete:()=>this.tutorial.destroy()});this.showBanner('第一步：找护士小林','点击大厅中央带黄色 ★ 的护士；靠近后按 E 也可以。');record('tutorial_closed');});});
    this.refreshGuidance();
  }
  itemName(id){return({battery:'电池',lamp:'灯泡',switch:'开关'})[id];}
  refreshGuidance(){
    let target=this.nurse,title='第一步：先与护士小林交谈',text='看黄色 ★，点击护士；靠近后也可按 E。';
    if(state.step>=1){this.guideBox.setVisible(false);this.guideRing.setVisible(false);this.guideArrow.setVisible(false);return;}
    this.guideBox.setVisible(true);this.guideRing.setVisible(true);this.guideArrow.setVisible(true);this.guideTitle.setText(title);this.guideText.setText(text);if(target){this.guideTarget=target;this.guideRing.setPosition(target.x,target.y);this.guideArrow.setPosition(target.x,target.y-63);}
  }
  goToInteract(target,action,label){
    if(this.tutorialActive||this.boardOpen)return;const distance=Phaser.Math.Distance.Between(this.player.x,this.player.y,target.x,target.y);if(distance<105){action();return;}if(state.step===0){this.moveTarget=new Phaser.Math.Vector2(target.x,target.y);this.pendingInteraction={target,action,label};this.nearPrompt.setText(`机器人正在前往「${label}」…`).setVisible(true);record('auto_walk_started',{target:label});return;}this.nearPrompt.setText(`需要先走近「${label}」才能互动。`).setVisible(true);this.time.delayedCall(1800,()=>this.nearPrompt.setVisible(false));record('interaction_target_seen',{target:label});
  }
  tryInteract(){
    if(this.tutorialActive||this.time.now<this.interactCooldownUntil)return;this.interactCooldownUntil=this.time.now+180;
    if(state.step===0){if(Phaser.Math.Distance.Between(this.player.x,this.player.y,this.nurse.x,this.nurse.y)<105){this.talkNurse();return;}}
    if(state.step===1){const nearby=this.items.getChildren().find(x=>Phaser.Math.Distance.Between(this.player.x,this.player.y,x.x,x.y)<105);if(nearby){this.pickup(nearby);return;}}
    if(state.step===3&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.panel.x,this.panel.y)<125){this.openBoard();return;}
    this.nearPrompt.setText('还没有靠近当前发光目标。可以直接点击它，机器人会自动前往。').setVisible(true);this.time.delayedCall(2200,()=>{if(!this.pendingInteraction)this.nearPrompt.setVisible(false);});record('interaction_out_of_range',{step:state.step+1});
  }
  updateNearPrompt(){
    if(this.pendingInteraction)return;let target=null,label='';if(state.step===0){target=this.nurse;label='护士小林';}if(state.step===1){this.items.getChildren().forEach(item=>{if(item.tag)item.tag.setVisible(Phaser.Math.Distance.Between(this.player.x,this.player.y,item.x,item.y)<110);});target=this.items.getChildren().find(x=>Phaser.Math.Distance.Between(this.player.x,this.player.y,x.x,x.y)<105);label=target?this.itemName(target.itemId):'';}if(state.step===3){target=Phaser.Math.Distance.Between(this.player.x,this.player.y,this.panel.x,this.panel.y)<125?this.panel:null;label='急诊配电箱';}if(!target||this.tutorialActive){this.nearPrompt.setVisible(false);return;}const near=Phaser.Math.Distance.Between(this.player.x,this.player.y,target.x,target.y)<105;if(near)this.nearPrompt.setText(`已到达「${label}」：按 E 互动，或直接点击`).setVisible(true);else this.nearPrompt.setVisible(false);
  }
  showBanner(title,sub){const w=this.scale.width;const bg=this.add.rectangle(w/2,74,480,82,0x071a38,.93).setDepth(60).setStrokeStyle(2,0x62dff0);const a=this.add.text(w/2,60,title,{fontFamily:'Microsoft YaHei',fontSize:'22px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5).setDepth(61);const b=this.add.text(w/2,88,sub,{fontFamily:'Microsoft YaHei',fontSize:'13px',color:'#aadfeb'}).setOrigin(.5).setDepth(61);this.time.delayedCall(2500,()=>{this.tweens.add({targets:[bg,a,b],alpha:0,duration:350,onComplete:()=>{bg.destroy();a.destroy();b.destroy();}})});}
  talkNurse(){if(state.step!==0)return;record('npc_talked',{npc:'nurse'});this.showDialogue('护士小林','急诊室备用灯也熄灭了！请找到电池、灯泡和开关，再去配电箱组成完整回路。');this.questStar.destroy();this.pendingInteraction=null;updateTask(1);this.refreshGuidance();}
  showDialogue(name,text){const w=this.scale.width,h=this.scale.height;const bg=this.add.rectangle(w/2,h-70,w-70,105,0x071a38,.96).setDepth(70).setStrokeStyle(2,0x75dbea);const n=this.add.text(65,h-104,name,{fontFamily:'Microsoft YaHei',fontSize:'16px',fontStyle:'bold',color:'#66e0ee'}).setDepth(71);const t=this.add.text(65,h-77,text,{fontFamily:'Microsoft YaHei',fontSize:'15px',color:'#ffffff',wordWrap:{width:w-130}}).setDepth(71);this.time.delayedCall(3400,()=>{bg.destroy();n.destroy();t.destroy();});}
  pickup(zone){if(state.step<1||state.inventory.has(zone.itemId)||Phaser.Math.Distance.Between(this.player.x,this.player.y,zone.x,zone.y)>105)return;this.pendingInteraction=null;this.boardOpen=true;record('inspection_started',{item:zone.itemId});this.scene.pause();this.scene.launch('diagnostic',{hospital:this,zone,kind:zone.itemId});}
  completeInspection(zone){markItem(zone.itemId);this.boardOpen=false;this.scene.resume();this.tweens.add({targets:zone,scale:1.5,alpha:0,duration:300,onComplete:()=>{zone.destroy();this.refreshGuidance();}});this.showBanner('检测完成，记录已保存',state.inventory.size<3?`还有 ${3-state.inventory.size} 处设备等待检测`:'证据收集完成，请先提出故障假设');if(state.inventory.size===3){updateTask(2);this.time.delayedCall(650,()=>{this.boardOpen=true;this.scene.pause();this.scene.launch('hypothesis',{hospital:this});});}this.refreshGuidance();}
  hypothesisComplete(choice){state.hypothesis=choice;this.boardOpen=false;this.scene.resume();updateTask(3);this.tweens.add({targets:this.panelGlow,alpha:.9,duration:600,yoyo:true,repeat:-1});this.showBanner('假设已记录','现在去急诊配电箱用实际回路验证');}
  openBoard(){if(state.step!==3||state.inventory.size<3||Phaser.Math.Distance.Between(this.player.x,this.player.y,this.panel.x,this.panel.y)>125)return;record('repair_panel_opened');this.pendingInteraction=null;updateTask(4);this.refreshGuidance();this.boardOpen=true;this.scene.pause();this.scene.launch('circuit',{hospital:this});}
  update(){if(this.boardOpen)return;let vx=0,vy=0;const speed=185;if(this.keys.A.isDown||this.keys.LEFT.isDown)vx=-speed;if(this.keys.D.isDown||this.keys.RIGHT.isDown)vx=speed;if(this.keys.W.isDown||this.keys.UP.isDown)vy=-speed;if(this.keys.S.isDown||this.keys.DOWN.isDown)vy=speed;if(vx||vy)this.moveTarget=null;if(this.moveTarget){const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,this.moveTarget.x,this.moveTarget.y);if(d<8)this.moveTarget=null;else{const angle=Phaser.Math.Angle.Between(this.player.x,this.player.y,this.moveTarget.x,this.moveTarget.y);vx=Math.cos(angle)*speed;vy=Math.sin(angle)*speed;}}
    this.player.setVelocity(vx,vy);if(vx||vy){this.player.rotation=Math.sin(this.time.now/90)*.035;this.player.setScale(1,1+Math.sin(this.time.now/85)*.03);}else{this.player.rotation=0;this.player.setScale(1)}
    if(this.pendingInteraction&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.pendingInteraction.target.x,this.pendingInteraction.target.y)<94){const next=this.pendingInteraction;this.moveTarget=null;next.action();}
    if(Phaser.Input.Keyboard.JustDown(this.interactKey))this.tryInteract();this.updateNearPrompt();
  }
  beginSecondaryFault(){this.boardOpen=true;this.scene.pause();updateTask(5);this.scene.launch('transfer',{hospital:this});}
  finishMission(){this.boardOpen=false;this.scene.resume();this.dark.setAlpha(.03);this.emergencyLights.forEach(x=>x.setFillStyle(0x55e59a,.9));this.tweens.killTweensOf(this.emergencyLights);this.panelGlow.setAlpha(0);[[170,130],[this.scale.width-170,130],[170,this.scale.height-135],[this.scale.width-190,this.scale.height-145]].forEach(([x,y],i)=>{const glow=this.add.circle(x,y,125,[0xffdf70,0x8be6ff,0xb4f09b,0xffcf7a][i],.18).setDepth(14);this.tweens.add({targets:glow,alpha:.31,scale:1.08,duration:700,yoyo:true,repeat:-1});});this.add.rectangle(this.scale.width-190,this.scale.height-145,310,200,0xffefaa,.3).setDepth(14);this.showBanner('急诊室全面恢复供电！','病区灯光、抢救设备和应急系统已全部启动');this.showDialogue('护士小林','太棒了！你用证据找到故障，还让局部回路和总回路都恢复了闭合。');record('mission_completed',{hypothesis:state.hypothesis,attempts:this.registry.get('tests')||0,hints:state.hints,durationMs:Date.now()-state.startedAt});ui.title.textContent='急诊室供电恢复';ui.text.textContent='你完成了调查、假设、检测、接线、迁移解决和证据复盘。';ui.count.textContent='完成';ui.progress.style.width='100%';this.time.delayedCall(1600,()=>{this.scene.pause();this.scene.launch('reward',{hospital:this});});}
}

class HypothesisScene extends Phaser.Scene{
  constructor(){super('hypothesis')}
  init(data){this.hospital=data.hospital}
  create(){
    const w=this.scale.width,h=this.scale.height;this.add.rectangle(w/2,h/2,w,h,0x061329,.92).setInteractive();this.add.rectangle(w/2,h/2,820,500,0xf7faff).setStrokeStyle(6,0x4d75a8);
    this.add.text(w/2,92,'故障调查板',{fontFamily:'Microsoft YaHei',fontSize:'28px',fontStyle:'bold',color:'#17365f'}).setOrigin(.5);
    this.add.text(w/2,132,'不是猜答案：请把三条检测证据放在一起比较',{fontFamily:'Microsoft YaHei',fontSize:'15px',color:'#5b708c'}).setOrigin(.5);
    const cards=[['🔋 电池','1.5 V，指针稳定',0xedf5ff],['💡 灯泡','灯丝连续，未断开',0xfff7df],['🎚️ 旧开关','检测灯忽亮忽灭',0xffece8]];
    cards.forEach((c,i)=>{const x=300+i*250;this.add.rectangle(x,225,215,120,c[2]).setStrokeStyle(2,0xb8c9dc);this.add.text(x,202,c[0],{fontFamily:'Microsoft YaHei',fontSize:'18px',fontStyle:'bold',color:'#264663'}).setOrigin(.5);this.add.text(x,245,c[1],{fontFamily:'Microsoft YaHei',fontSize:'14px',color:'#52677e'}).setOrigin(.5);});
    this.add.text(w/2,315,'哪一项最值得优先怀疑？',{fontFamily:'Microsoft YaHei',fontSize:'20px',fontStyle:'bold',color:'#203b5d'}).setOrigin(.5);
    [['电池没电',false],['灯泡损坏',false],['开关接触不良',true]].forEach((choice,i)=>{const x=310+i*240;const b=this.add.rectangle(x,380,205,54,0xffffff).setStrokeStyle(2,0x8ca8ca).setInteractive({useHandCursor:true});this.add.text(x,380,choice[0],{fontFamily:'Microsoft YaHei',fontSize:'16px',fontStyle:'bold',color:'#28517d'}).setOrigin(.5);b.on('pointerdown',()=>this.choose(choice[0],choice[1]));});
    this.feedback=this.add.text(w/2,446,'先看哪条证据表明元件的状态不稳定。',{fontFamily:'Microsoft YaHei',fontSize:'14px',color:'#5e7089'}).setOrigin(.5);record('hypothesis_board_opened');
  }
  choose(label,correct){record('hypothesis_submitted',{label,correct});if(!correct){this.feedback.setText('这个判断与现有证据不符，请再比较三个检测现象。').setColor('#ad5024');this.cameras.main.shake(150,.004);return;}this.feedback.setText('假设成立：开关的表现不稳定，值得优先检修。').setColor('#14784c');this.time.delayedCall(900,()=>{this.scene.stop();this.hospital.hypothesisComplete(label);});}
}

class DiagnosticScene extends Phaser.Scene{
  constructor(){super('diagnostic')}
  init(data){this.hospital=data.hospital;this.zone=data.zone;this.kind=data.kind}
  create(){
    const w=this.scale.width,h=this.scale.height;const info={
      battery:{title:'电池检测台',icon:'🔋',evidence:'电压表显示 1.5 V，指针保持稳定。',question:'根据检测结果，这节电池应该怎样处理？',choices:[['继续使用','检测结果正常，可以作为电源。',true],['立即丢弃','只凭外观无法这样判断。',false]]},
      lamp:{title:'灯泡观察台',icon:'💡',evidence:'透过灯泡玻璃，可以看到灯丝连续，没有断开。',question:'这条观察证据说明什么？',choices:[['灯泡可能完好','灯丝连续，应该继续排查其他位置。',true],['灯泡一定损坏','灯丝没有断开，不支持这个判断。',false]]},
      switch:{title:'开关检测台',icon:'🎚️',evidence:'反复按动旧开关时，检测灯有时亮、有时不亮。',question:'最合理的维修决定是什么？',choices:[['更换接触不良的开关','现象不稳定，说明开关接触可能有问题。',true],['把导线全部扔掉','现有证据只指向开关，不支持更换全部导线。',false]]}
    }[this.kind];
    this.add.rectangle(w/2,h/2,w,h,0x061329,.9).setInteractive();this.add.rectangle(w/2,h/2,760,470,0xf7faff).setStrokeStyle(6,0x4f6f9d);
    this.add.text(w/2,92,info.title,{fontFamily:'Microsoft YaHei',fontSize:'27px',fontStyle:'bold',color:'#17365f'}).setOrigin(.5);
    this.add.text(w-190,87,'关闭 ×',{fontFamily:'Microsoft YaHei',fontSize:'15px',color:'#60718a'}).setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.close());
    const device=this.add.rectangle(315,290,260,250,0xeaf1f8).setStrokeStyle(3,0xb8c9dc);this.add.text(315,235,info.icon,{fontSize:'72px'}).setOrigin(.5);
    if(this.kind==='battery'){const meter=this.add.graphics();meter.lineStyle(8,0x6e819b).arc(315,325,72,Math.PI,Math.PI*2).strokePath();const needle=this.add.rectangle(315,325,67,5,0xff704c).setOrigin(0,.5).setRotation(Math.PI);this.tweens.add({targets:needle,rotation:-.35,duration:1100,ease:'Cubic.out'});this.add.text(315,354,'0　　　　　1.5 V',{fontFamily:'Microsoft YaHei',fontSize:'13px',color:'#4a5d78'}).setOrigin(.5);}
    if(this.kind==='lamp'){const filament=this.add.graphics();filament.lineStyle(6,0xff9c38).beginPath().moveTo(270,322).lineTo(292,300).lineTo(315,324).lineTo(338,300).lineTo(360,322).strokePath();this.tweens.add({targets:device,alpha:.72,duration:550,yoyo:true,repeat:-1});}
    if(this.kind==='switch'){const led=this.add.circle(315,329,18,0xff665f);this.tweens.add({targets:led,alpha:.18,duration:310,yoyo:true,repeat:-1});this.add.text(315,365,'检测灯忽亮忽灭',{fontFamily:'Microsoft YaHei',fontSize:'14px',color:'#a44238'}).setOrigin(.5);}
    this.add.text(490,185,'观察证据',{fontFamily:'Microsoft YaHei',fontSize:'14px',fontStyle:'bold',color:'#2764d9'});this.add.text(490,213,info.evidence,{fontFamily:'Microsoft YaHei',fontSize:'17px',color:'#354a67',wordWrap:{width:300},lineSpacing:8});
    this.add.text(490,285,info.question,{fontFamily:'Microsoft YaHei',fontSize:'18px',fontStyle:'bold',color:'#1c3658',wordWrap:{width:300}});
    this.feedback=this.add.text(490,410,'先观察动态现象，再作出判断。',{fontFamily:'Microsoft YaHei',fontSize:'14px',color:'#5e7089',wordWrap:{width:300}});
    info.choices.forEach((choice,index)=>{const y=350+index*58;const button=this.add.rectangle(625,y,270,44,0xffffff).setStrokeStyle(2,0x9cb4d2).setInteractive({useHandCursor:true});this.add.text(625,y,choice[0],{fontFamily:'Microsoft YaHei',fontSize:'15px',fontStyle:'bold',color:'#284e7a'}).setOrigin(.5);button.on('pointerdown',()=>this.answer(choice));});
  }
  answer(choice){record('inspection_answered',{item:this.kind,choice:choice[0],correct:choice[2]});if(!choice[2]){this.feedback.setText(`还需要利用证据：${choice[1]}`).setColor('#ad5024');this.cameras.main.shake(150,.004);return;}this.feedback.setText(`判断有依据：${choice[1]}`).setColor('#14784c');this.time.delayedCall(900,()=>{this.scene.stop();this.hospital.completeInspection(this.zone);});}
  close(){record('inspection_closed',{item:this.kind});this.scene.stop();this.hospital.boardOpen=false;this.hospital.scene.resume();}
}

class TransferScene extends Phaser.Scene{
  constructor(){super('transfer')}
  init(data){this.hospital=data.hospital}
  create(){
    const w=this.scale.width,h=this.scale.height;this.add.rectangle(w/2,h/2,w,h,0x061329,.94).setInteractive();this.add.rectangle(w/2,h/2,870,510,0xf4f8fc).setStrokeStyle(6,0x496b98);
    this.add.text(w/2,80,'二次突发：抢救设备仍未启动',{fontFamily:'Microsoft YaHei',fontSize:'27px',fontStyle:'bold',color:'#17365f'}).setOrigin(.5);
    this.add.text(w/2,122,'备用灯已经亮起，说明你刚才搭的局部回路有效。请观察总配电图。',{fontFamily:'Microsoft YaHei',fontSize:'15px',color:'#566c87'}).setOrigin(.5);
    this.add.rectangle(300,275,255,230,0xe9f8ef).setStrokeStyle(3,0x67b88a);this.add.text(300,220,'💡 备用照明',{fontFamily:'Microsoft YaHei',fontSize:'22px',fontStyle:'bold',color:'#246341'}).setOrigin(.5);const lamp=this.add.circle(300,285,38,0xffdc56,.9);this.tweens.add({targets:lamp,alpha:.45,scale:1.08,duration:650,yoyo:true,repeat:-1});this.add.text(300,350,'局部回路：正常',{fontFamily:'Microsoft YaHei',fontSize:'15px',color:'#32845a'}).setOrigin(.5);
    this.add.rectangle(740,275,340,230,0xffeeee).setStrokeStyle(3,0xda7770);this.add.text(740,205,'🏥 抢救设备',{fontFamily:'Microsoft YaHei',fontSize:'22px',fontStyle:'bold',color:'#8c3633'}).setOrigin(.5);this.add.text(740,258,'●  ○  ○',{fontSize:'34px',color:'#8b98aa'}).setOrigin(.5);this.add.text(740,310,'总开关：断开',{fontFamily:'Microsoft YaHei',fontSize:'18px',fontStyle:'bold',color:'#bd3e36'}).setOrigin(.5);this.add.text(740,350,'已知电池和灯泡通过检测',{fontFamily:'Microsoft YaHei',fontSize:'14px',color:'#765b5b'}).setOrigin(.5);
    this.feedback=this.add.text(w/2,422,'如何让整个抢救回路恢复闭合？',{fontFamily:'Microsoft YaHei',fontSize:'16px',fontStyle:'bold',color:'#294866'}).setOrigin(.5);
    [['合上总开关',true],['直接短接电池',false],['更换已正常的灯泡',false]].forEach((c,i)=>{const x=315+i*235;const b=this.add.rectangle(x,475,205,46,0xffffff).setStrokeStyle(2,0x91a9c7).setInteractive({useHandCursor:true});this.add.text(x,475,c[0],{fontFamily:'Microsoft YaHei',fontSize:'14px',fontStyle:'bold',color:'#284e79'}).setOrigin(.5);b.on('pointerdown',()=>this.answer(c[0],c[1]));});record('secondary_fault_started');
  }
  answer(label,correct){record('secondary_fault_answered',{label,correct});if(!correct){this.feedback.setText(label.includes('短接')?'短接会造成危险！请找到让总回路断开的位置。':'现有证据表明灯泡能正常发光，不需要更换。').setColor('#ad5024');this.cameras.main.shake(160,.004);return;}this.feedback.setText('总开关合上，整个回路恢复闭合！请完成最后证据复盘。').setColor('#14784c');this.time.delayedCall(900,()=>this.showReflection());}
  showReflection(){this.children.removeAll(true);const w=this.scale.width,h=this.scale.height;this.add.rectangle(w/2,h/2,w,h,0x102b43);this.add.rectangle(w/2,h/2,770,430,0xffffff).setStrokeStyle(6,0x5ac6a4);this.add.text(w/2,125,'维修复盘',{fontFamily:'Microsoft YaHei',fontSize:'29px',fontStyle:'bold',color:'#174f45'}).setOrigin(.5);this.add.text(w/2,175,'哪组证据最能说明“回路闭合后设备才能工作”？',{fontFamily:'Microsoft YaHei',fontSize:'18px',fontStyle:'bold',color:'#26435e'}).setOrigin(.5);
    const opts=[['灯泡颜色好看',false],['开关断开时不亮，合上后恢复',true],['机器人走得很快',false]];opts.forEach((c,i)=>{const y=235+i*62;const b=this.add.rectangle(w/2,y,500,48,0xf5f9fc).setStrokeStyle(2,0x9bb2ca).setInteractive({useHandCursor:true});this.add.text(w/2,y,c[0],{fontFamily:'Microsoft YaHei',fontSize:'15px',color:'#2f506d'}).setOrigin(.5);b.on('pointerdown',()=>{record('reflection_answered',{label:c[0],correct:c[1]});if(!c[1]){b.setFillStyle(0xffe8e5);return;}this.scene.stop();this.hospital.finishMission();});});}
}

class RewardScene extends Phaser.Scene{
  constructor(){super('reward')}
  init(data){this.hospital=data.hospital}
  create(){
    const w=this.scale.width,h=this.scale.height;const attempts=this.registry.get('tests')||1;this.add.rectangle(w/2,h/2,w,h,0x07182f,.88).setInteractive();
    for(let i=0;i<70;i++){const colors=[0xffd84f,0x5ae0d0,0xff7391,0x71a7ff,0xffffff];const p=this.add.rectangle(Phaser.Math.Between(40,w-40),Phaser.Math.Between(-220,-10),Phaser.Math.Between(5,11),Phaser.Math.Between(10,20),Phaser.Utils.Array.GetRandom(colors)).setRotation(Phaser.Math.FloatBetween(-1,1));this.tweens.add({targets:p,y:h+50,x:`+=${Phaser.Math.Between(-80,80)}`,rotation:`+=${Phaser.Math.FloatBetween(2,6)}`,duration:Phaser.Math.Between(1700,3300),delay:Phaser.Math.Between(0,900),repeat:-1});}
    this.add.circle(w/2,155,92,0xffd75c,.2).setStrokeStyle(5,0xffdf6f);const medal=this.add.text(w/2,155,'🏅',{fontSize:'96px'}).setOrigin(.5).setScale(.2);this.tweens.add({targets:medal,scale:1.12,duration:700,ease:'Back.out'});
    this.add.text(w/2,258,'急诊室复电英雄',{fontFamily:'Microsoft YaHei',fontSize:'34px',fontStyle:'bold',color:'#ffffff',stroke:'#1d5680',strokeThickness:5}).setOrigin(.5);
    this.add.text(w/2,305,'你不仅接亮了灯，还用证据解释了为什么回路能工作',{fontFamily:'Microsoft YaHei',fontSize:'16px',color:'#d9f5ff'}).setOrigin(.5);
    const badges=[['🔎','证据侦探'],['⚡','闭路工程师'],['🏥','急诊守护者']];badges.forEach((b,i)=>{const x=345+i*205;this.add.rectangle(x,380,170,82,0xffffff,.12).setStrokeStyle(2,0x79e8da);this.add.text(x-48,380,b[0],{fontSize:'31px'}).setOrigin(.5);this.add.text(x+20,380,b[1],{fontFamily:'Microsoft YaHei',fontSize:'15px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);});
    this.add.text(w/2,445,`通电尝试 ${attempts} 次　·　使用线索 ${state.hints} 次　·　获得 3 枚成就徽章`,{fontFamily:'Microsoft YaHei',fontSize:'14px',color:'#b7d8e8'}).setOrigin(.5);
    const hospitalBtn=this.button(w/2-210,520,'返回亮起的医院',0x1f9d78);hospitalBtn.on('pointerdown',()=>{record('reward_closed');this.scene.stop();this.hospital.scene.resume();});
    const replayBtn=this.button(w/2,520,'再挑战一次',0x2764d9);replayBtn.on('pointerdown',()=>window.location.reload());
    const homeBtn=this.button(w/2+210,520,'返回课程大厅',0xe18a2f);homeBtn.on('pointerdown',()=>{record('returned_to_portal');window.location.href='../index.html';});record('reward_shown',{attempts,hints:state.hints,badges:3});
  }
  button(x,y,label,color){const b=this.add.rectangle(x,y,184,50,color).setStrokeStyle(2,0xffffff,.75).setInteractive({useHandCursor:true});this.add.text(x,y,label,{fontFamily:'Microsoft YaHei',fontSize:'15px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);return b;}
}

class CircuitScene extends Phaser.Scene{
  constructor(){super('circuit')}
  init(data){this.hospital=data.hospital}
  create(){
    const w=this.scale.width,h=this.scale.height;this.connections=[];this.tests=0;this.switchClosed=false;this.dragStart=null;
    this.add.rectangle(w/2,h/2,w,h,0x061329,.91).setInteractive();this.add.rectangle(w/2,h/2,w-90,h-76,0xf5f8fb).setStrokeStyle(7,0x3f5b82);
    this.add.text(70,54,'急诊备用照明配电板',{fontFamily:'Microsoft YaHei',fontSize:'25px',fontStyle:'bold',color:'#17365f'});
    this.status=this.add.text(70,91,'拖动接线：让电池 → 开关 → 灯泡 → 电池形成完整通路',{fontFamily:'Microsoft YaHei',fontSize:'14px',color:'#64748b'});
    this.add.text(w-70,58,'×',{fontSize:'30px',color:'#53657e'}).setOrigin(1,0).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.closeBoard());
    this.wireGraphics=this.add.graphics();this.flowGraphics=this.add.graphics();
    this.add.text(w/2,182,'把三个元件连接成一条首尾相接的三角形通路',{fontFamily:'Microsoft YaHei',fontSize:'15px',color:'#53708e'}).setOrigin(.5);
    this.components={
      battery:this.component(285,h-195,'🔋','电池',[['bL',-55,42],['bR',55,-42]]),
      switch:this.component(w/2,286,'🎚️','开关',[['sL',-75,0],['sR',75,0]],true),
      lamp:this.component(w-285,h-195,'💡','急诊灯',[['lL',-55,-42],['lR',55,42]])
    };
    this.terminals=new Map();Object.values(this.components).forEach(c=>c.terminals.forEach(t=>this.terminals.set(t.id,t)));
    this.drawCircuitScaffold();
    this.repairMeter=this.add.text(w/2,210,'线路修复进度：0 / 3',{fontFamily:'Microsoft YaHei',fontSize:'16px',fontStyle:'bold',color:'#2764d9'}).setOrigin(.5);
    this.statusLights=[0,1,2].map(index=>{const x=w/2-34+index*34;return this.add.circle(x,236,9,0xcbd7e8).setStrokeStyle(2,0xffffff)});
    this.input.on('pointermove',p=>{if(this.dragStart)this.drawWires(p)});this.input.on('pointerup',p=>this.endWire(p));
    this.testButton=this.add.rectangle(w/2+90,h-82,170,48,0x2764d9).setInteractive({useHandCursor:true});this.add.text(w/2+90,h-82,'⚡ 通电测试',{fontFamily:'Microsoft YaHei',fontSize:'17px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5).setDepth(5);
    this.testButton.on('pointerdown',()=>this.testCircuit());this.resetButton=this.add.rectangle(w/2-110,h-82,160,48,0xe2e9f3).setInteractive({useHandCursor:true});this.add.text(w/2-110,h-82,'清除接线',{fontFamily:'Microsoft YaHei',fontSize:'16px',fontStyle:'bold',color:'#52627a'}).setOrigin(.5).setDepth(5);this.resetButton.on('pointerdown',()=>{this.connections=[];this.stopFlow();this.drawWires();record('wires_cleared');});
    this.feedback=this.add.text(w/2,145,'点击一个橙色插孔，再点击另一个插孔即可接线；也可以直接拖动。',{fontFamily:'Microsoft YaHei',fontSize:'14px',color:'#27547c',backgroundColor:'#e6f2ff',padding:{x:14,y:9}}).setOrigin(.5);
    record('circuit_board_started');
  }
  component(x,y,icon,label,terminalSpecs,isSwitch=false){
    const bg=this.add.rectangle(x,y,170,130,0xffffff).setStrokeStyle(3,0xc7d5e7);this.add.text(x,y-18,icon,{fontSize:'42px'}).setOrigin(.5);this.add.text(x,y+31,label,{fontFamily:'Microsoft YaHei',fontSize:'16px',fontStyle:'bold',color:'#294563'}).setOrigin(.5);
    const terminals=terminalSpecs.map(([id,offsetX,offsetY])=>{const tx=x+offsetX,ty=y+offsetY;const t=this.add.circle(tx,ty,18,0xff8b45).setStrokeStyle(4,0xffffff).setInteractive({useHandCursor:true}).setDepth(8);t.id=id;t.setData('id',id);t.on('pointerdown',()=>this.selectTerminal(id));return {id,x:tx,y:ty,display:t}});
    if(isSwitch){
      const toggle=this.add.rectangle(x,y-17,92,56,0xfff3d4).setStrokeStyle(3,0xe49a27).setInteractive({useHandCursor:true}).setDepth(10);
      const track=this.add.rectangle(x,y-17,54,16,0xb8c5d5).setDepth(11);const knob=this.add.circle(x-18,y-17,13,0xef674f).setDepth(12);
      const stateLabel=this.add.text(x,y+54,'○ 开关断开（点击此处合上）',{fontFamily:'Microsoft YaHei',fontSize:'12px',fontStyle:'bold',color:'#a44435',backgroundColor:'#fff2eccc',padding:{x:7,y:3}}).setOrigin(.5).setDepth(12);
      const toggleSwitch=()=>{this.switchClosed=!this.switchClosed;bg.setFillStyle(this.switchClosed?0xe4f9eb:0xffffff);toggle.setFillStyle(this.switchClosed?0xdff8e7:0xfff3d4).setStrokeStyle(3,this.switchClosed?0x3aae6f:0xe49a27);this.tweens.add({targets:knob,x:x+(this.switchClosed?18:-18),duration:150});knob.setFillStyle(this.switchClosed?0x31b86c:0xef674f);stateLabel.setText(this.switchClosed?'● 开关已合上':'○ 开关断开（点击此处合上）').setColor(this.switchClosed?'#167b46':'#a44435');this.feedback.setText(this.switchClosed?'开关已明确合上，现在可以通电测试。':'开关已断开，通路被切断。').setColor(this.switchClosed?'#14784c':'#9a5d12');record('switch_toggled',{closed:this.switchClosed});};
      toggle.on('pointerdown',toggleSwitch);track.setInteractive({useHandCursor:true}).on('pointerdown',toggleSwitch);knob.setInteractive({useHandCursor:true}).on('pointerdown',toggleSwitch);stateLabel.setInteractive({useHandCursor:true}).on('pointerdown',toggleSwitch);
    }
    return {x,y,bg,terminals};
  }
  drawCircuitScaffold(){const p=this.components;const g=this.add.graphics().setDepth(1);g.lineStyle(5,0xc8d9ed,.85);g.lineBetween(p.battery.terminals[1].x,p.battery.terminals[1].y,p.switch.terminals[0].x,p.switch.terminals[0].y);g.lineBetween(p.switch.terminals[1].x,p.switch.terminals[1].y,p.lamp.terminals[0].x,p.lamp.terminals[0].y);g.lineBetween(p.lamp.terminals[1].x,p.lamp.terminals[1].y,p.battery.terminals[0].x,p.battery.terminals[0].y);}
  selectTerminal(id){
    if(!this.dragStart){this.dragStart=id;this.terminals.get(id).display.setFillStyle(0xffd45e);this.feedback.setText(`已选择${this.name(id)}，再点击另一个插孔完成接线。`);record('wire_started',{from:id});return;}
    if(this.dragStart===id){this.terminals.get(id).display.setFillStyle(0xff8b45);this.dragStart=null;this.drawWires();return;}
    this.finishWire(this.dragStart,id);
  }
  finishWire(start,end){this.terminals.get(start).display.setFillStyle(0xff8b45);this.dragStart=null;const pair=[start,end];if(!this.connections.some(c=>c.includes(pair[0])&&c.includes(pair[1]))){this.connections.push(pair);record('wire_connected',{from:pair[0],to:pair[1]});this.feedback.setText(`已连接 ${this.name(pair[0])} 与 ${this.name(pair[1])}。`);}this.drawWires();}
  endWire(pointer){if(!this.dragStart)return;const start=this.dragStart;let closest=null,dist=68;this.terminals.forEach(t=>{const d=Phaser.Math.Distance.Between(pointer.x,pointer.y,t.x,t.y);if(t.id!==start&&d<dist){closest=t;dist=d}});if(closest)this.finishWire(start,closest.id);else this.drawWires();}
  name(id){return({bL:'电池左端',bR:'电池右端',sL:'开关左端',sR:'开关右端',lL:'灯泡左端',lR:'灯泡右端'})[id]}
  drawWires(pointer=null){this.wireGraphics.clear();this.wireGraphics.lineStyle(8,0x2876df,1);for(const [a,b] of this.connections){const p=this.terminals.get(a),q=this.terminals.get(b);this.wireGraphics.beginPath().moveTo(p.x,p.y).lineTo(q.x,q.y).strokePath();}if(this.dragStart&&pointer){const p=this.terminals.get(this.dragStart);this.wireGraphics.lineStyle(6,0x52cfe2,.75).beginPath().moveTo(p.x,p.y).lineTo(pointer.x,pointer.y).strokePath();}this.updateRepairMeter();}
  updateRepairMeter(){if(!this.repairMeter)return;const count=Math.min(this.connections.length,3);this.repairMeter.setText(`线路修复进度：${count} / 3`);this.statusLights.forEach((light,index)=>light.setFillStyle(index<count?0x42c98a:0xcbd7e8));}
  testCircuit(){this.tests++;this.registry.set('tests',this.tests);record('circuit_tested',{connections:this.connections,switchClosed:this.switchClosed,attempt:this.tests});const result=evaluateCircuit(this.connections,this.switchClosed);if(result.status==='short'){this.fail('危险：导线直接连接了电池两端，形成短路！请立即清除这根线。',true);return;}if(result.status==='switch-open'){this.fail('三段线路已经接对，现在请点击开关中央的橙色拨杆，看到“已合上”后再通电。');return;}if(result.status==='success'){this.success();return;}const used=new Set(this.connections.flat());const loose=[...this.terminals.keys()].filter(id=>!used.has(id)).length;this.fail(loose?`仍有 ${loose} 个接线柱没有接入通路。沿着线路逐段检查。`:'当前连接没有让电流依次经过开关和灯泡再回到电池。');}
  fail(message,short=false){this.stopFlow();this.feedback.setText(message).setColor(short?'#a83b27':'#9a5d12').setBackgroundColor(short?'#ffe9e2':'#fff3d5');if(short){for(let i=0;i<9;i++){const s=this.add.image(210+Phaser.Math.Between(-30,30),this.scale.height/2+Phaser.Math.Between(-35,35),'spark').setDepth(15).setScale(.25);this.tweens.add({targets:s,x:'+=random(-35,35)',y:'-=random(30,80)',alpha:0,duration:500,onComplete:()=>s.destroy()});}}record('circuit_failed',{reason:message,short});}
  success(){this.feedback.setText('闭合回路形成！备用灯已亮，但抢救设备似乎还有状况……').setColor('#14784c').setBackgroundColor('#e3f8ed');record('circuit_succeeded',{attempt:this.tests});this.animateFlow();this.time.delayedCall(2600,()=>{this.scene.stop();this.hospital.beginSecondaryFault();});}
  animateFlow(){this.flowDots=[];const path=[this.terminals.get('bR'),this.terminals.get('sL'),this.terminals.get('sR'),this.terminals.get('lL'),this.terminals.get('lR'),this.terminals.get('bL')];for(let i=0;i<12;i++){const dot=this.add.circle(path[0].x,path[0].y,5,0xffd84f).setDepth(12);this.flowDots.push(dot);const timeline=this.tweens.chain({targets:dot,tweens:path.slice(1).map((p,j)=>({x:p.x,y:p.y,duration:300,delay:j===0?i*90:0})),repeat:-1});}this.components.lamp.bg.setFillStyle(0xfff3ae);this.tweens.add({targets:this.components.lamp.bg,alpha:.68,duration:350,yoyo:true,repeat:-1});}
  stopFlow(){(this.flowDots||[]).forEach(x=>x.destroy());this.flowDots=[];}
  closeBoard(){record('repair_panel_closed');this.scene.stop();this.hospital.boardOpen=false;this.hospital.scene.resume();}
}

const config={type:Phaser.AUTO,parent:'game',backgroundColor:'#10254d',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:1100,height:619},physics:{default:'arcade',arcade:{debug:false}},scene:[HospitalScene,HypothesisScene,DiagnosticScene,TransferScene,RewardScene,CircuitScene],render:{antialias:true,pixelArt:false}};
new Phaser.Game(config);
