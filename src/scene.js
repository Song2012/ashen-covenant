import * as THREE from 'three';
import { drawMonster } from './monster-art.js';
import { drawRegion, regionLights } from './region-art.js';

// Individually authored pixel silhouettes, rendered as nearest-filtered sprites.
const W = 720, H = 292;
const palettes = { barbarian: true, sorceress: true };
function texture(draw, w=W, h=H) {
  const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
  const c=canvas.getContext('2d'); c.imageSmoothingEnabled=false; draw(c,w,h);
  const t=new THREE.CanvasTexture(canvas); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
function rect(c,color,x,y,w,h) { c.fillStyle=color; c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function poly(c,color,points) { c.fillStyle=color; c.beginPath(); points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath(); c.fill(); }
function ellipse(c,color,x,y,rx,ry){ c.fillStyle=color; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fill(); }
function hero(c,kind){
  if(kind==='barbarian'){
    // Broad unhelmeted silhouette: bare muscular arms, fur, leather and twin axes.
    poly(c,'#1c1921',[[18,22],[10,27],[7,43],[14,48],[17,62],[13,66],[26,67],[28,54],[31,67],[43,67],[39,61],[39,47],[46,40],[43,25],[34,22]]);
    poly(c,'#685449',[[16,23],[11,26],[10,33],[15,35],[18,31],[21,34],[28,30],[33,34],[38,31],[42,34],[41,25],[35,22]]);
    for(let i=0;i<8;i++)rect(c,i%2?'#b09b81':'#443a37',13+i*4,25+(i%3),2,5);
    rect(c,'#b58b70',19,29,17,17);rect(c,'#d4ad86',20,30,7,7);rect(c,'#c39b7c',29,30,6,7);rect(c,'#785449',26,30,2,14);rect(c,'#704b43',20,39,15,2);
    poly(c,'#c59b7b',[[12,33],[17,33],[19,39],[16,46],[10,43]]);poly(c,'#ba8c70',[[37,33],[42,33],[44,40],[40,46],[35,43]]);
    rect(c,'#6a6870',10,40,8,5);rect(c,'#c0b2a5',11,40,2,4);rect(c,'#6a6870',37,40,7,5);rect(c,'#c0b2a5',38,40,2,4);
    rect(c,'#423039',19,46,17,6);rect(c,'#a9936d',18,45,19,3);rect(c,'#d4c4a2',25,45,5,4);
    rect(c,'#685045',19,52,7,9);rect(c,'#58413c',30,52,7,9);rect(c,'#878078',18,59,8,5);rect(c,'#746a67',30,59,8,5);rect(c,'#29232c',15,64,11,3);rect(c,'#29232c',30,64,12,3);
    rect(c,'#4d342c',21,10,15,15);rect(c,'#c69b7c',23,12,12,11);rect(c,'#dbb893',24,12,7,3);rect(c,'#372b2c',24,17,3,1);rect(c,'#372b2c',31,17,3,1);rect(c,'#75483a',25,21,8,3);rect(c,'#654034',23,10,12,3);rect(c,'#4a302d',22,12,2,10);
    rect(c,'#69503d',7,24,3,33);rect(c,'#ad8b63',8,27,1,27);poly(c,'#999aa0',[[7,23],[1,20],[0,30],[7,33],[12,29],[12,23]]);rect(c,'#dfd9cb',1,23,2,6);
    rect(c,'#69503d',47,17,3,38);rect(c,'#ad8b63',48,20,1,31);poly(c,'#b3adb0',[[48,17],[43,16],[41,22],[47,27],[54,23],[55,13]]);rect(c,'#e3d9c9',53,15,2,7);
  }else{
    poly(c,'#191724',[[21,20],[14,30],[11,64],[19,61],[26,67],[34,62],[41,65],[37,31],[31,21]]);
    poly(c,'#4c3958',[[21,24],[17,34],[15,61],[22,58],[26,64],[31,59],[36,62],[32,29]]);poly(c,'#86718e',[[21,30],[20,51],[17,59],[23,56],[26,62],[25,33]]);
    rect(c,'#b3a082',21,33,12,3);rect(c,'#d0bca0',24,34,3,4);rect(c,'#2f273d',26,40,3,17);
    poly(c,'#7b6387',[[18,26],[12,32],[12,44],[17,43],[20,32],[31,29],[37,35],[40,31],[33,24]]);rect(c,'#c9a9a0',36,32,7,4);
    poly(c,'#49344e',[[19,22],[19,12],[22,6],[28,2],[34,10],[36,23],[31,27],[30,16],[24,13],[23,22]]);rect(c,'#c9a9a0',24,13,9,10);rect(c,'#ead0b6',24,14,3,5);rect(c,'#402d40',25,17,2,1);rect(c,'#402d40',31,17,2,1);rect(c,'#806276',27,21,4,1);rect(c,'#c2a16c',23,12,11,2);rect(c,'#b9cfe2',27,11,3,3);
    rect(c,'#745744',45,18,3,45);rect(c,'#c8a57c',45,23,1,37);poly(c,'#b9a082',[[44,20],[39,13],[40,6],[42,13],[47,16],[51,12],[51,6],[54,11],[51,19]]);poly(c,'#9ebcdb',[[46,5],[42,10],[46,14],[50,10]]);rect(c,'#e8e4d7',45,8,2,3);
  }
}
function skeleton(c,boss=false,variant=0){
  if(boss){
    // Broad bat wings with angular torn membranes and visible finger bones.
    poly(c,'#241722',[[32,38],[19,16],[3,7],[8,26],[1,41],[13,34],[18,50],[25,43],[33,53]]);
    poly(c,'#683342',[[30,38],[19,22],[7,13],[11,27],[5,35],[15,30],[20,42],[25,38]]);
    poly(c,'#241722',[[48,38],[61,16],[77,7],[72,26],[79,41],[67,34],[62,50],[55,43],[47,53]]);
    poly(c,'#683342',[[50,38],[61,22],[73,13],[69,27],[75,35],[65,30],[60,42],[55,38]]);
    poly(c,'#a27d76',[[4,8],[20,19],[32,39],[30,41],[18,22]]);poly(c,'#a27d76',[[76,8],[60,19],[48,39],[50,41],[62,22]]);
    poly(c,'#271d21',[[28,29],[9,8],[17,36],[3,48],[11,69],[22,52],[25,78],[20,87],[36,87],[41,68],[49,85],[62,87],[61,77],[56,49],[67,64],[72,43],[60,28],[66,9],[48,29]]);
    poly(c,'#65433c',[[27,29],[20,19],[26,37],[16,44],[15,54],[29,44],[32,71],[29,81],[35,80],[40,63],[48,72],[50,81],[56,82],[50,42],[61,50],[60,39],[50,33],[59,19],[48,30]]);
    poly(c,'#8c6651',[[28,33],[34,28],[45,28],[51,36],[45,48],[33,47]]);rect(c,'#a98363',31,35,15,3);rect(c,'#3d2a2b',35,40,10,14);
    rect(c,'#8e5d48',33,18,14,14);rect(c,'#d5a775',35,18,10,4);rect(c,'#ed774d',32,24,5,3);rect(c,'#ed774d',42,24,5,3);rect(c,'#261e20',37,29,5,4);
    poly(c,'#beb091',[[33,21],[25,13],[24,3],[29,13],[37,17]]);poly(c,'#beb091',[[44,20],[52,12],[54,3],[54,16],[48,23]]);
  }else{
    rect(c,'#252922',21,18,14,12);rect(c,'#c0b69a',22,19,12,10);rect(c,'#ded0a9',23,19,8,3);rect(c,'#242822',24,23,3,3);rect(c,'#242822',31,23,3,3);rect(c,'#92896f',25,28,7,3);
    rect(c,'#ada588',27,32,3,18);for(let i=0;i<4;i++){rect(c,'#beb394',21,33+i*4,14,2);rect(c,'#7c7d65',26,34+i*4,3,1);}
    poly(c,'#b7ad8d',[[20,32],[16,36],[14,47],[18,48],[20,38],[25,36]]);rect(c,'#aca386',34,34,3,15);
    rect(c,'#97957b',23,49,4,12);rect(c,'#ada88a',30,48,4,14);rect(c,'#bab293',20,61,7,3);rect(c,'#bab293',30,61,8,3);
    rect(c,'#776751',40,23,2,28);poly(c,'#9a9e89',[[40,23],[41,12],[45,17],[43,28]]);
    if(variant===1){
      poly(c,'#211c2a',[[20,27],[12,36],[13,59],[9,65],[23,61],[29,65],[36,60],[39,64],[36,34],[30,26]]);
      poly(c,'#5b3548',[[20,29],[16,39],[17,57],[23,53],[29,59],[33,55],[31,31]]);poly(c,'#493044',[[19,23],[21,14],[28,9],[35,18],[37,29],[30,25],[23,26]]);rect(c,'#181522',24,20,10,6);rect(c,'#f09076',26,21,2,1);rect(c,'#f09076',31,21,2,1);rect(c,'#a48b77',41,27,2,36);rect(c,'#bca78b',38,24,8,5);
    }else if(variant===2){
      poly(c,'#493942',[[20,32],[13,35],[11,46],[19,43],[22,52],[31,51],[38,45],[39,33],[31,29]]);rect(c,'#8c7375',21,33,13,13);rect(c,'#bba69b',22,34,3,10);rect(c,'#6c555b',20,17,15,8);rect(c,'#b4a096',23,17,10,2);rect(c,'#28202c',22,22,13,3);rect(c,'#df8a64',25,22,7,1);poly(c,'#ada097',[[40,25],[37,15],[45,12],[48,20],[43,25]]);
    }
  }
}

function heroPose(c,kind,pose){
  c.save();c.translate(12,4);hero(c,kind);c.restore();
  if(!pose)return;
  // Replace the weapon-side forearm and weapon, preserving the authored body.
  c.clearRect(55,4,25,65);
  if(kind==='barbarian'){
    if(pose===1){poly(c,'#c29978',[[48,35],[56,31],[58,19],[63,20],[62,36],[55,42]]);rect(c,'#80767b',56,23,7,7);rect(c,'#a28661',60,5,3,34);poly(c,'#c1bdba',[[61,6],[52,3],[50,11],[58,16],[68,12],[70,2]]);rect(c,'#e9deca',68,3,2,8);}
    else{poly(c,'#c9a07e',[[48,37],[60,36],[68,43],[64,49],[55,45],[48,44]]);rect(c,'#8d8588',57,37,7,8);poly(c,'#a28661',[[64,34],[67,34],[75,58],[72,59]]);poly(c,'#d1c7bb',[[68,47],[61,47],[60,56],[69,64],[78,60],[79,47]]);rect(c,'#ece0c9',76,50,2,8);}
  }else{
    poly(c,'#a88b9f',[[48,33],[60,29],[65,31],[64,37],[55,40],[48,39]]);rect(c,'#d1b3a6',61,30,6,5);
    poly(c,'#c0a782',[[62,22],[65,21],[76,61],[73,62]]);poly(c,'#a8c5df',[[62,11],[57,18],[62,25],[68,18]]);rect(c,'#e4e4db',61,16,2,6);
  }
}

export function createScene(container,getState,getCombat=()=>null,getEvents=()=>[],getSettings=()=>({})){
  let renderer;
  try {renderer=new THREE.WebGLRenderer({alpha:false,antialias:false,powerPreference:'low-power'});}catch(error){
    const fallback=document.createElement('canvas');fallback.width=W;fallback.height=H;fallback.style.cssText='width:100%;height:100%;object-fit:var(--scene-fit,contain);background:#141419;image-rendering:pixelated';drawRegion(fallback.getContext('2d'),{zoneId:getState()?.zoneId,activity:getState()?.activity});container.append(fallback);
    return {dispose(){fallback.remove();},diagnostics(){return {fallback:true,calls:0,triangles:0,textures:0,eventCursor:0};}};
  }
  renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;object-fit:var(--scene-fit,contain);background:#141419;image-rendering:pixelated';renderer.domElement.setAttribute('aria-label','像素战场：动作、命中与战利品跟随实际战斗结算');container.append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#141419');const camera=new THREE.OrthographicCamera(0,W,0,H,0.1,100);camera.position.z=10;
  const textures=new Set(),materials=[],geometries=[];
  function plane(t,w,h,x,y,z=0){textures.add(t);const mat=new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false,side:THREE.DoubleSide,forceSinglePass:true});materials.push(mat);const geo=new THREE.PlaneGeometry(w,h);geometries.push(geo);const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.rotation.x=Math.PI;mesh.renderOrder=z;scene.add(mesh);return mesh;}
  const bg=plane(texture(c=>drawRegion(c)),W,H,W/2,H/2,0);
  const lakeTex=texture(c=>drawRegion(c,{activity:'fish'}));textures.add(lakeTex);const regions={grave:bg.material.map};for(const zone of ['crypt','furnace','marsh']){regions[zone]=texture(c=>drawRegion(c,{zoneId:zone}));textures.add(regions[zone]);}
  const throneTex=texture(c=>drawRegion(c,{activity:'boss'}));textures.add(throneTex);
  let environment='grave',torchPoints=regionLights();
  const heroFrames={};for(const kind of Object.keys(palettes)){heroFrames[kind]=[0,1,2].map(p=>{const t=texture(c=>heroPose(c,kind,p),80,80);textures.add(t);return t;});}
  const player=plane(heroFrames.barbarian[0],96,96,280,199,3);
  const monsterCache=new Map();
  const transparent=texture(()=>{},80,96);const enemy=plane(transparent,88,106,432,195,3);
  const bossTex=texture(c=>skeleton(c,true),80,96);textures.add(bossTex);
  const fxCanvas=document.createElement('canvas');fxCanvas.width=W;fxCanvas.height=H;const fx=fxCanvas.getContext('2d');const fxTexture=new THREE.CanvasTexture(fxCanvas);fxTexture.magFilter=THREE.NearestFilter;fxTexture.minFilter=THREE.NearestFilter;fxTexture.colorSpace=THREE.SRGBColorSpace;
  plane(fxTexture,W,H,W/2,H/2,5);
  const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const initialEvents=getEvents(0)||[];
  let lastEvent=initialEvents.length?Math.max(...initialEvents.map(e=>e.id||0)):0;
  let frame=0,last=0,time=0,disposed=false,lastEncounter='',lastActivity='',phase='approach',reduce=false;
  let hit=null,defeat=null,reward=null,catchFx=null;
  let lastMonster=null,lastPose=0,observedHits=0,observedLoot=0,enemyX=432,playerX=280;
  const resize=new ResizeObserver(()=>renderer.setSize(W,H,false));resize.observe(container);
  function useMonster(monster,boss){
    if(boss){enemy.material.map=bossTex;return;}
    const key=`${monster.id}:${monster.color}:${!!monster.elite}`;
    if(!monsterCache.has(key)){const t=texture(c=>drawMonster(c,monster),80,96);textures.add(t);monsterCache.set(key,t);}
    enemy.material.map=monsterCache.get(key);
  }
  function effects(build,charge,impact,cx,tx,boss){
    const q=reduce?(charge>0?.8:0):Math.max(0,Math.min(1,charge)),iy=boss?177:199;
    const active=impact>0;
    fx.lineWidth=2;
    if(build==='whirlwind'){
      if(q<.5&&!active)return;
      fx.strokeStyle=active?'#eee1bf':'#aa9884';const turn=reduce?1:q*5;
      for(let n=0;n<3;n++){fx.beginPath();fx.ellipse(cx+14,210,37+n*3,16+n*2,0,turn+n*2,turn+n*2+1.8);fx.stroke();}
    }else if(build==='frenzy'){
      if(q<.7&&!active)return;
      const flip=observedHits%2;fx.strokeStyle=active?'#e9ddc5':'#a88c7f';fx.lineWidth=3;fx.beginPath();fx.moveTo(cx+21,flip?179:222);fx.lineTo(tx+6,flip?218:184);fx.stroke();
    }else if(build==='warcry'){
      if(q<.55&&!active)return;
      fx.strokeStyle=active?'#e3c893':'#aa946d';for(let n=0;n<2;n++){const radius=active?tx-cx:25+q*32+n*8;fx.beginPath();fx.ellipse(cx,201,radius,radius*.5,0,-1.25,1.25);fx.stroke();}
    }else if(build==='blizzard'){
      if(q<.35&&!active)return;
      for(let n=0;n<7;n++){const x=tx-23+n*9,y=active?iy-10+(n%3)*6:105+(q-.35)/.65*80+(n%3)*5;poly(fx,'#b3d3e1',[[x,y-8],[x-3,y],[x,y+8],[x+3,y]]);rect(fx,'#f1f0df',x-1,y-6,1,8);}
      if(active){fx.strokeStyle='#9cbeca';fx.beginPath();fx.ellipse(tx,237,33,7,0,0,Math.PI*2);fx.stroke();}
    }else if(build==='chainlightning'){
      if(!active){if(q>.6){rect(fx,'#b1c6e0',cx+28,172,6,6);rect(fx,'#ece9df',cx+30,170,2,10);}return;}
      fx.strokeStyle='#8eafd7';fx.lineWidth=3;fx.beginPath();fx.moveTo(cx+26,173);for(let n=1;n<=11;n++)fx.lineTo(cx+26+(tx-cx-26)*n/11,173+(iy-173)*n/11+(n===11?0:(n%2?8:-7)));fx.stroke();fx.strokeStyle='#e5e8e5';fx.lineWidth=1;fx.stroke();
    }else{
      if(q<.4&&!active)return;
      const travel=active?1:Math.min(.98,(q-.4)/.6),x=cx+28+(tx-cx-28)*travel,y=173+(iy-173)*travel;
      if(!reduce)ellipse(fx,'#b2503028',x,y,16,11);
      poly(fx,'#ca6338',[[x+9,y-3],[x+4,y-8],[x-8,y-5],[x-20,y-8],[x-13,y+1],[x-21,y+5],[x-5,y+5],[x+5,y+7]]);ellipse(fx,'#efb86c',x,y,6,5);rect(fx,'#f6dfac',x,y-3,4,5);
    }
    if(active){for(let n=0;n<8;n++){const a=n*Math.PI/4,rr=reduce?10:8+(1-impact)*23;rect(fx,build==='blizzard'||build==='chainlightning'?'#dae6e5':'#e7c8a2',tx+Math.cos(a)*rr,iy+Math.sin(a)*rr*.7,3,2);}}
    fx.lineWidth=1;
  }
  function animate(ms){
    if(disposed)return;frame=requestAnimationFrame(animate);
    reduce=getSettings()?.reducedMotion??systemMotion.matches;
    if(ms-last<1000/(reduce?15:30))return;const resumed=ms-last>2000;const dt=Math.min(.1,(ms-last)/1000);last=ms;
    const s=getState()||{},combat=getCombat()||{},paused=s.running===false||combat.phase==='paused';
    if(!paused){time+=dt;for(const eff of [hit,defeat,reward,catchFx])if(eff)eff.age+=dt;}
    const activity=combat.activity||s.activity||'hunt',fish=activity==='fish',boss=activity==='boss';
    const kind=/mage|witch|sorc|法|巫/.test(String(s.classId))?'sorceress':'barbarian';
    const build=String(s.buildId||(kind==='barbarian'?'whirlwind':'fireball'));
    const id=combat.id||`${activity}:${s.kills||0}:${s.boss?.kills||0}`;
    if(activity!==lastActivity){hit=null;defeat=null;reward=null;catchFx=null;lastActivity=activity;}
    const previousEncounter=lastEncounter;
    if(id!==lastEncounter){hit=null;if(!defeat?.boss)defeat=null;lastEncounter=id;lastMonster=combat.monster||null;}
    if(combat.monster)lastMonster=combat.monster;
    if(!paused)phase=combat.phase||'approach';
    else if(id!==previousEncounter)phase=fish?'fishing':boss?'attack':(combat.progress||0)<.15?'approach':(combat.progress||0)<.8?'attack':(combat.progress||0)<.9?'defeat':'loot';
    const events=getEvents(lastEvent)||[];
    for(const e of events){
      if(e.id<=lastEvent)continue;lastEvent=e.id;
      if(resumed)continue; // Catch up authoritative HP without replaying a background burst.
      if(e.activity&&e.activity!==activity)continue;
      if((e.type==='hit'||e.type==='bossHit')&&(!e.encounterId||e.encounterId===id)&&(!e.buildId||e.buildId===build)){
        hit={age:0,build:e.buildId||build,damage:e.damage||0};observedHits++;
        if(e.type==='bossHit'&&defeat?.boss)defeat=null;
      }else if((e.type==='defeat'||e.type==='bossDefeat')&&(!e.encounterId||e.encounterId===id||e.encounterId===previousEncounter)){
        defeat={age:0,boss:e.type==='bossDefeat'};
      }else if(e.type==='loot'&&e.item){reward={age:0,item:e.item,x:boss?455:432};observedLoot++;}
      else if(e.type==='fish')catchFx={age:0};
    }
    if(hit?.age>.38)hit=null;if(reward?.age>1.65)reward=null;if(catchFx?.age>1)catchFx=null;
    const progress=Math.max(0,Math.min(1,combat.progress??s.progress??0));
    const approach=phase==='approach'?Math.min(1,progress/.15):1;
    const bossDying=boss&&defeat?.boss&&defeat.age<.72;
    const dead=!fish&&lastMonster&&(bossDying||(lastMonster.hp??1)<=0||phase==='defeat'||phase==='loot');
    const decay=bossDying?Math.min(1,defeat.age/.6):dead?Math.max(0,Math.min(1,phase==='loot'?1:(progress-.8)/.1)):0;
    const charge=!dead&&phase==='attack'?Math.max(0,Math.min(1,combat.attackProgress||0)):0;
    const impact=hit?Math.max(0,1-hit.age/.3):0;
    const target=boss?455:432;
    enemyX=target+(reduce?0:(1-approach)*75)+(impact&&!reduce?Math.sin((1-impact)*Math.PI)*5:0);
    const contact=boss?401:376;
    const advance=fish?0:kind==='barbarian'?(reduce?1:approach):0;
    playerX=fish?284:280+(contact-280)*advance;
    const pose=fish||dead?0:impact?2:charge>.78?2:charge>.35?1:0;
    player.material.map=heroFrames[kind][pose];lastPose=pose;
    player.renderOrder=boss?4:3; // Keep the melee hero readable in front of the large boss.
    player.position.set(playerX,199+(reduce?0:phase==='approach'?Math.sin(time*14)*2:0),3);
    player.rotation.z=reduce?0:impact&&kind==='barbarian'?-.045:pose===1?.025:0;
    const nextEnvironment=fish?'fish':boss?'boss':s.zoneId||'grave';
    if(environment!==nextEnvironment){environment=nextEnvironment;torchPoints=regionLights({zoneId:s.zoneId,activity});}
    bg.material.map=fish?lakeTex:boss?throneTex:(regions[s.zoneId]||regions.grave);
    enemy.visible=!!lastMonster&&!fish&&decay<1;
    if(enemy.visible){
      useMonster(lastMonster,boss);const size=boss?1.78:lastMonster.family==='brute'?1.18:1;
      enemy.scale.set(size,size*(1-(reduce?0:decay*.78)),1);
      enemy.position.set(enemyX,boss?159+(reduce?0:decay*76):195+(reduce?0:decay*42)+( !reduce&&lastMonster.family==='wraith'?Math.sin(time*2)*3:0),3);
      enemy.rotation.z=reduce?0:dead?decay*.7:0;
      enemy.material.opacity=1-decay;
      const flash=reduce?0:impact*1.4;enemy.material.color.setRGB(1+flash,1+flash,1+flash);
    }
    fx.clearRect(0,0,W,H);
    torchPoints.forEach(({x,y},n)=>{fx.save();fx.translate(0,y-128);if(!reduce)ellipse(fx,'#a8763320',x,128,24,29);poly(fx,'#a6572e',[[x-7,135],[x-7,124],[x-2,113+(reduce?0:Math.sin(time*7+n)*3)],[x+1,123],[x+5,115],[x+7,130],[x+4,136]]);poly(fx,'#e4a14f',[[x-4,134],[x-3,121],[x+1,125],[x+3,120],[x+4,134]]);rect(fx,'#ffe0a0',x-2,127,4,7);fx.restore();});
    if(!reduce)for(let n=0;n<18;n++){const x=(n*79+Math.sin(time*.3+n)*12)%W,y=(n*31-time*(3+n%3)+1000)%H;rect(fx,'#d7b46650',x,y,1,1);}
    ellipse(fx,'#090b1166',playerX,239,25,5);if(enemy.visible)ellipse(fx,'#090b1166',enemyX,240,boss?43:25,5);
    if(fish){
      const dip=reduce?0:catchFx?Math.sin(Math.min(1,catchFx.age)*Math.PI)*6:Math.sin(time*2)*1;
      poly(fx,'#a08b69',[[playerX+22,209],[playerX+39,162],[playerX+41,161],[playerX+24,210]]);
      fx.strokeStyle='#b9b393';fx.beginPath();fx.moveTo(playerX+40,163);fx.lineTo(385,223+dip);fx.stroke();rect(fx,'#be6650',383,219+dip,3,5);fx.strokeStyle='#65818b';fx.beginPath();fx.ellipse(385,227,reduce?9:9+Math.sin(time*2)*2,2,0,0,Math.PI*2);fx.stroke();
      if(catchFx){const y=reduce?210:223-Math.sin(catchFx.age*Math.PI)*35;poly(fx,'#a3bcc4',[[379,y],[387,y-3],[392,y],[387,y+4]]);poly(fx,'#7195a4',[[391,y],[396,y-4],[396,y+4]]);rect(fx,'#28383f',382,y,1,1);}
    }else{
      if(!dead||impact)effects(hit?.build||build,charge,impact,playerX,enemyX,boss);
      if(dead&&decay<1&&!reduce){for(let n=0;n<16;n++){const x=enemyX+(n%4-1.5)*10+Math.sin(n)*decay*18,y=181+Math.floor(n/4)*14+decay*25;rect(fx,n%2?'#bba99b':'#6c6570',x,y,2,2);}}
    }
    if(reward){
      const t=reward.age,alpha=Math.min(1,(1.65-t)*2);fx.globalAlpha=Math.max(0,alpha);const color=reward.item.rarity==='legendary'?'#e5b76a':reward.item.rarity==='rare'?'#d3c686':'#a7b7d6';
      if(!reduce){ellipse(fx,`${color}25`,reward.x,242,23,7);rect(fx,`${color}66`,reward.x,205,1,37);}
      poly(fx,'#655349',[[reward.x-7,242],[reward.x-7,232],[reward.x-3,228],[reward.x+5,228],[reward.x+9,234],[reward.x+8,242]]);rect(fx,color,reward.x-5,230,10,3);rect(fx,'#e6d8b7',reward.x-1,233,3,7);
      if(!reduce){for(let n=0;n<5;n++){const a=n*1.25+t;rect(fx,color,reward.x+Math.cos(a)*17,228+Math.sin(a)*10,2,2);}}fx.globalAlpha=1;
    }
    fxTexture.needsUpdate=true;renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(animate);
  return {
    diagnostics(){return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,pixelRatio:1,resolution:`${W}×${H}`,eventCursor:lastEvent,observedHits,observedLoot,encounterId:lastEncounter,phase,environment,monsterFamily:lastMonster?.family||null,playerX:Math.round(playerX),enemyX:Math.round(enemyX),pose:lastPose,reducedMotion:reduce,cachedMonsters:monsterCache.size};},
    dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());renderer.dispose();renderer.domElement.remove();}
  };
}
