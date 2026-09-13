import * as THREE from 'three';

// Individually authored pixel silhouettes, rendered as nearest-filtered sprites.
const W = 720, H = 292;
const palettes = { barbarian: true, sorceress: true };
function texture(draw, w=W, h=H) {
  const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
  const c=canvas.getContext('2d'); c.imageSmoothingEnabled=false; draw(c,w,h);
  const t=new THREE.CanvasTexture(canvas); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
function rng(seed=42) { return () => { seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }; }
function rect(c,color,x,y,w,h) { c.fillStyle=color; c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function poly(c,color,points) { c.fillStyle=color; c.beginPath(); points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath(); c.fill(); }
function ellipse(c,color,x,y,rx,ry){ c.fillStyle=color; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fill(); }
function cathedral(c,fish=false,zone='grave'){
  const r=rng(94), furnace=zone==='furnace',crypt=zone==='crypt',marsh=zone==='marsh';
  rect(c,'#141419',0,0,W,H);
  // Individually chipped masonry with unequal rows and dark mortar.
  for(let y=0;y<194;y+=16) for(let x=-48;x<W;x+=48){const xx=x+(y%32?24:0);rect(c,['#2d2d32','#303036','#28292f','#363337'][Math.floor(r()*4)],xx+1,y+1,46,14);rect(c,'#424045',xx+3,y+2,42,1);for(let n=0;n<7;n++)rect(c,'#202126',xx+r()*44,y+3+r()*11,2+r()*5,1);}
  // The central pointed arch is cut stone, with deep layered archivolts.
  const arch=(x,w,top,bottom,col)=>poly(c,col,[[x-w,bottom],[x-w,top+65],[x-w+10,top+43],[x-w+31,top+20],[x,top],[x+w-31,top+20],[x+w-10,top+43],[x+w,top+65],[x+w,bottom]]);
  arch(364,132,-17,190,'#525054');arch(364,123,-8,190,'#212127');arch(364,114,1,190,'#47454a');arch(364,105,9,191,'#0e1118');
  // Cut voussoirs, spalled edges and hairline fractures interrupt the arch bands.
  for(const pts of [[[239,56],[253,60]],[[250,34],[263,41]],[[267,15],[278,26]],[[287,0],[297,11]],[[474,55],[488,51]],[[465,35],[477,27]],[[452,18],[462,8]]]){c.strokeStyle='#222129';c.lineWidth=2;c.beginPath();c.moveTo(...pts[0]);c.lineTo(...pts[1]);c.stroke();}
  for(let i=0;i<35;i++){const x=i%2?237+r()*12:480+r()*12,y=70+r()*117;rect(c,'#3b3941',x,y,2+r()*5,1);rect(c,'#6d626b',x+1,y+2,2,1);}
  for(let i=0;i<8;i++){let y=63+i*16;rect(c,'#717079',232,y,16,2);rect(c,'#67646a',480,y,16,2);}
  arch(364,79,34,187,crypt?'#18212b':furnace?'#281719':'#1c1c25');arch(364,66,43,188,'#101017');
  for(let x=311;x<426;x+=16){rect(c,'#34333c',x,87,3,89);poly(c,'#66606a',[[x-2,87],[x+1,79],[x+4,87]]);}rect(c,'#57515a',304,112,121,3);rect(c,'#403944',304,151,121,3);
  // Armorial banners: oxblood fabric, split hems, tarnished bone emblems.
  [166,552].forEach((x,j)=>{rect(c,'#756658',x-25,27,50,4);rect(c,'#161419',x-24,31,50,119);poly(c,'#55212c',[[x-21,31],[x+21,31],[x+21,139],[x+11,133],[x+1,150],[x-10,134],[x-21,141]]);rect(c,'#772c36',x-19,32,4,102);rect(c,'#351c26',x+12,32,7,104);rect(c,'#9c7b62',x-12,42,25,2);poly(c,'#b3a18a',[[x,59],[x-9,70],[x-8,82],[x-3,85],[x-3,93],[x+4,93],[x+4,85],[x+9,80],[x+9,70]]);rect(c,'#3a2029',x-6,73,4,5);rect(c,'#3a2029',x+3,73,4,5);rect(c,'#8a695c',x-12,99,25,2);});
  // Tomb altar and votive candles at the threshold.
  poly(c,'#69606a',[[301,178],[315,166],[413,166],[430,178]]);rect(c,'#38343d',301,179,129,10);rect(c,'#817477',315,163,98,4);rect(c,'#494149',324,147,80,16);rect(c,'#837377',320,144,88,5);rect(c,'#25232c',333,150,62,10);
  poly(c,'#b4a38a',[[355,145],[355,125],[348,125],[348,120],[355,120],[355,109],[361,105],[367,109],[367,120],[374,120],[374,125],[367,125],[367,145]]);
  for(const x of [309,315,326,399,409,417]){rect(c,'#c4b59b',x,132+(x%5),3,12);rect(c,'#ffcf86',x,130+(x%5),2,3);ellipse(c,'#db8b391a',x,132,13,17);}
  poly(c,'#3a383f',[[0,187],[720,187],[720,292],[0,292]]);
  const rows=[187,199,215,237,264,292];rows.forEach((y,i)=>{rect(c,'#1c1d24',0,y,720,2);const ww=48+i*20;for(let x=-ww;x<720;x+=ww){const xx=x+(i%2?ww/2:0);rect(c,'#1b1e24',xx,y,2,(rows[i+1]||292)-y);rect(c,'#535057',xx+3,y+3,ww-6,1);}});
  for(let n=0;n<220;n++){const x=r()*W,y=188+r()*105;rect(c,['#24242b','#57505a','#46434a'][n%3],x,y,2+r()*9,1);}
  // Flattened ritual seal is integrated in the floor, not a floating UI ring.
  c.strokeStyle='#713b44';c.lineWidth=2;c.beginPath();c.ellipse(372,237,87,24,0,0,Math.PI*2);c.stroke();c.beginPath();c.ellipse(372,237,76,20,0,0,Math.PI*2);c.stroke();c.beginPath();for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI*4/5;const x=372+Math.cos(a)*68,y=237+Math.sin(a)*18;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  for(let n=0;n<11;n++){const x=220+r()*300,y=220+r()*46;poly(c,'#542a36',[[x,y],[x+11,y-2],[x+21,y+1],[x+9,y+4],[x-3,y+2]]);}
  // Foreground pillars have broken capitals and skeletal reliefs.
  [71,645].forEach((x,j)=>{rect(c,'#1c1b23',x-23,0,45,218);rect(c,'#3e3a43',x-18,0,35,207);rect(c,'#615762',x-16,0,6,205);rect(c,'#2b2832',x+9,0,8,205);for(let y=16;y<201;y+=23)rect(c,'#201e26',x-18,y,37,2);rect(c,'#73656a',x-26,28,53,7);rect(c,'#4f454e',x-22,35,45,10);rect(c,'#74656a',x-26,202,53,7);rect(c,'#403741',x-30,209,61,10);for(let n=0;n<8;n++)rect(c,'#28252e',x-9+(n%3)*5,47+n*18,2,7);});
  [[124,226],[583,229]].forEach(([x,y])=>{poly(c,'#686069',[[x-25,y-5],[x-10,y-18],[x+27,y-14],[x+41,y],[x+26,y+12],[x-14,y+10]]);poly(c,'#36323d',[[x-25,y-5],[x-14,y+10],[x+26,y+12],[x+26,y+22],[x-15,y+18],[x-25,y+4]]);rect(c,'#a5938a',x-1,y-13,4,13);rect(c,'#a5938a',x-6,y-9,14,3);});
  [205,506].forEach(x=>{rect(c,'#22202a',x-3,134,7,47);rect(c,'#807071',x-8,140,17,4);poly(c,'#52424b',[[x-10,132],[x+11,132],[x+6,142],[x-5,142]]);rect(c,'#a48b75',x-10,131,21,2);});
  // Bone piles, broken slabs and iron fence silhouettes.
  for(let n=0;n<25;n++){const x=r()*W,y=258+r()*24;poly(c,'#595059',[[x,y],[x+6,y-3],[x+14,y],[x+11,y+5],[x,y+3]]);if(n%3===0){rect(c,'#ab9b88',x,y-3,5,4);rect(c,'#332b34',x+1,y-2,1,2);rect(c,'#a29381',x-4,y+4,14,2);}}
  for(let x=0;x<720;x+=22){if(x>150&&x<574)continue;rect(c,'#12121a',x,255,3,37);poly(c,'#22212a',[[x-3,257],[x+1,246],[x+5,257]]);}rect(c,'#17141d',0,283,720,9);
  if(crypt){for(let n=0;n<25;n++)poly(c,'#77949e',[[238+n*10,67],[240+n*10,76+n%4*4],[243+n*10,67]]);}
  if(furnace){for(let x=312;x<422;x+=16){rect(c,'#893e2f',x,164,10,10);rect(c,'#e48143',x+2,168,5,6);}poly(c,'#733128',[[45,271],[181,270],[216,277],[200,281],[44,277]]);}
  if(fish||marsh){poly(c,'#192b35',[[313,205],[409,191],[588,194],[720,209],[720,278],[454,268],[333,241]]);for(let n=0;n<95;n++){const x=350+r()*366,y=207+r()*54;rect(c,n%3?'#31424b':'#536069',x,y,3+r()*17,1);}poly(c,'#63524c',[[258,216],[334,214],[356,231],[273,235]]);for(let n=0;n<8;n++)rect(c,'#29252d',271+n*10,218,2,13);}
}
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

export function createScene(container,getState){
  let renderer;
  try {renderer=new THREE.WebGLRenderer({alpha:false,antialias:false,powerPreference:'low-power'});}catch(error){
    const fallback=document.createElement('canvas');fallback.width=W;fallback.height=H;fallback.style.cssText='width:100%;height:100%;object-fit:contain;background:#141419;image-rendering:pixelated';cathedral(fallback.getContext('2d'));container.append(fallback);
    return {dispose(){fallback.remove();},diagnostics(){return {fallback:true,calls:0,triangles:0,textures:0};}};
  }
  renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;object-fit:contain;background:#141419;image-rendering:pixelated';renderer.domElement.setAttribute('aria-label','像素风幽暗修道院：英雄正在自动战斗');container.append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#141419');const camera=new THREE.OrthographicCamera(0,W,0,H,0.1,100);camera.position.z=10;
  const textures=[],materials=[],geometries=[];
  function plane(t,w,h,x,y,z=0){textures.push(t);const mat=new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false,side:THREE.DoubleSide,forceSinglePass:true});materials.push(mat);const geo=new THREE.PlaneGeometry(w,h);geometries.push(geo);const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.rotation.x=Math.PI;mesh.renderOrder=z;scene.add(mesh);return mesh;}
  const bg=plane(texture(c=>cathedral(c)),W,H,W/2,H/2,0);
  const lakeTex=texture(c=>cathedral(c,true));textures.push(lakeTex);const regionTextures={grave:bg.material.map};for(const zone of ['crypt','furnace','marsh']){regionTextures[zone]=texture(c=>cathedral(c,false,zone));textures.push(regionTextures[zone]);}
  const heroes={};Object.keys(palettes).forEach(kind=>{heroes[kind]=plane(texture(c=>hero(c,kind),56,72),75,96,283,195,3);heroes[kind].visible=false;});
  const enemies=[];for(let i=0;i<3;i++)enemies.push(plane(texture(c=>skeleton(c,false,i),56,72),64,82,418+i*52,204+(i%2)*13,3));
  const demon=plane(texture(c=>skeleton(c,true),80,96),152,182,455,162,3);demon.visible=false;
  const fxCanvas=document.createElement('canvas');fxCanvas.width=W;fxCanvas.height=H;const fx=fxCanvas.getContext('2d');const fxTexture=new THREE.CanvasTexture(fxCanvas);fxTexture.magFilter=THREE.NearestFilter;fxTexture.minFilter=THREE.NearestFilter;fxTexture.colorSpace=THREE.SRGBColorSpace;
  plane(fxTexture,W,H,W/2,H/2,5);
  let frame=0,last=0,time=0,disposed=false;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resize=new ResizeObserver(()=>{renderer.setSize(W,H,false);});resize.observe(container);
  function animate(ms){
    if(disposed)return;frame=requestAnimationFrame(animate);if(ms-last<1000/(reduce?12:30))return;const dt=Math.min(.1,(ms-last)/1000);last=ms;
    const s=getState()||{};if(s.running!==false)time+=dt;
    const activity=String(s.activity||'');const fish=/fish|钓/.test(activity),boss=/boss|首领/.test(activity);const kind=/mage|witch|sorc|法|巫/.test(String(s.classId))?'sorceress':'barbarian';
    const build=String(s.buildId||(kind==='barbarian'?'whirlwind':'fireball'));
    const cycle=time%2.4, strike=cycle>.8&&cycle<1.9&&s.running!==false;
    bg.material.map=fish?lakeTex:(regionTextures[s.zoneId]||regionTextures.grave);
    Object.entries(heroes).forEach(([k,m])=>{m.visible=k===kind;m.position.x=fish?284:283+(strike&&!reduce&&kind==='barbarian'?Math.sin((cycle-.8)*Math.PI/1.1)*27:0);m.position.y=195+(!reduce?Math.round(Math.sin(time*2)*1):0);});
    enemies.forEach((m,i)=>{m.visible=!fish&&!boss;m.position.y=204+(i%2)*13+Math.round(Math.sin(time*2+i)*2);m.material.color.set(strike&&i===0?'#ffc1a2':'#ffffff');});demon.visible=boss;demon.position.y=162+Math.round(Math.sin(time*1.6)*2);
    fx.clearRect(0,0,W,H);
    // Pixel fire, individual ember sparks and restrained atmospheric dust.
    [205,506].forEach((x,i)=>{ellipse(fx,'#a8763330',x,128,27,32);poly(fx,'#a6572e',[[x-7,135],[x-7,124],[x-2,111+Math.sin(time*7+i)*3],[x+1,123],[x+5,115],[x+7,130],[x+4,136]]);poly(fx,'#e4a14f',[[x-4,134],[x-3,121],[x+1,125],[x+3,120],[x+4,134]]);rect(fx,'#ffe0a0',x-2,127,4,7);});
    for(let i=0;i<25;i++){const x=(i*79+Math.sin(time*.3+i)*12)%W,y=(i*31-time*(3+i%3)+1000)%H;rect(fx,i%3?'#b0ad733d':'#d7b46670',x,y,1,1);}
    ellipse(fx,'#090f1166',283,234,24,5);
    if(fish){
      poly(fx,'#957d53',[[309,210],[323,161],[325,160],[311,211]]);fx.strokeStyle='#b9b393';fx.lineWidth=1;fx.beginPath();fx.moveTo(324,162);fx.lineTo(385,223);fx.stroke();rect(fx,'#be6650',383,219+Math.sin(time*2),3,5);fx.strokeStyle='#658177';fx.beginPath();fx.ellipse(385,227,9+Math.sin(time*2)*2,2,0,0,Math.PI*2);fx.stroke();
    }else{
      const ex=boss?455:418;ellipse(fx,'#090f1155',ex,237,boss?43:20,5);
      if(strike){
        const t=(cycle-.8)/1.1, motion=reduce?.45:t, reach=boss?ex:470;
        fx.lineWidth=2;fx.globalAlpha=reduce?.7:1;
        if(build==='whirlwind'){
          const cx=310+Math.sin(t*Math.PI)*28;
          fx.strokeStyle='#d6c4a9';for(let i=0;i<3;i++){fx.beginPath();fx.ellipse(cx,211,36+i*5,14+i*2,0,motion*9+i*2,motion*9+i*2+2.1);fx.stroke();}
          for(let i=0;i<8;i++){const a=i*Math.PI/4+motion*8;rect(fx,'#a78370',cx+Math.cos(a)*45,212+Math.sin(a)*19,3,2);}
        }else if(build==='frenzy'){
          const side=Math.floor(motion*8)%2;fx.strokeStyle=side?'#d5b798':'#e4d9c6';fx.lineWidth=3;fx.beginPath();fx.moveTo(319,side?181:222);fx.lineTo(356,side?221:177);fx.stroke();fx.lineWidth=1;fx.strokeStyle='#a76555';fx.beginPath();fx.moveTo(325,side?178:226);fx.lineTo(365,side?218:181);fx.stroke();
        }else if(build==='warcry'){
          fx.strokeStyle='#c9a975';for(let i=0;i<3;i++){const radius=22+((motion+i*.27)%1)*105;fx.globalAlpha=.8-radius/160;fx.beginPath();fx.ellipse(294,200,radius,radius*.46,0,-1.3,1.3);fx.stroke();}fx.globalAlpha=1;
        }else if(build==='blizzard'){
          for(let i=0;i<12;i++){const q=(motion+i*.137)%1,x=ex-34+(i*31)%122,y=118+q*115;poly(fx,'#98bcd1',[[x,y-8],[x-3,y],[x,y+7],[x+3,y]]);rect(fx,'#e1e4db',x-1,y-5,1,6);}fx.strokeStyle='#709cae';fx.beginPath();fx.ellipse(ex+16,237,62,11,0,0,Math.PI*2);fx.stroke();
        }else if(build==='chainlightning'){
          fx.strokeStyle='#91b1d9';fx.lineWidth=3;fx.beginPath();fx.moveTo(316,181);for(let i=1;i<12;i++){const x=316+(reach-300)*i/11,y=192+Math.sin(i*3+Math.floor(motion*6))*13;fx.lineTo(x,y);}fx.stroke();fx.strokeStyle='#e3e4e2';fx.lineWidth=1;fx.stroke();
          for(let i=0;i<(boss?1:3);i++){rect(fx,'#d8e3ed',ex+i*52-2,185,4,15);rect(fx,'#b3c7e3',ex+i*52-7,191,14,3);}
        }else{
          const x=318+(ex-318)*motion;ellipse(fx,'#af492e55',x,193,15,10);poly(fx,'#cc6537',[[x+9,190],[x+4,185],[x-8,188],[x-21,185],[x-14,194],[x-23,198],[x-6,198],[x+5,200]]);ellipse(fx,'#edaf60',x,193,6,5);rect(fx,'#f5d8a1',x,190,4,5);if(t>.8){for(let i=0;i<7;i++){const a=i*Math.PI*2/7;rect(fx,'#e8a25b',ex+Math.cos(a)*18,194+Math.sin(a)*15,3,3);}}
        }
        fx.globalAlpha=1;fx.lineWidth=1;
      }
      // A tiny unique-item gleam gives the floor a recognizable treasure focus.
      ellipse(fx,'#99703c22',362,244,19,7);rect(fx,'#7a643f',357,236,10,6);rect(fx,'#d5b566',358,234,9,2);rect(fx,'#ead38b',362,229,1,12);rect(fx,'#e6cf8555',358,231,9,1);
    }
    fxTexture.needsUpdate=true;renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(animate);
  return {
    diagnostics(){return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,pixelRatio:1,resolution:`${W}×${H}`};},
    dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());renderer.dispose();renderer.domElement.remove();}
  };
}
