import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createGame, SAVE_KEY } from '../src/engine.js';
const out='artifacts/v07';
await fs.mkdir(`${out}/frames`,{recursive:true});
await fs.mkdir(`${out}/video`,{recursive:true});
const browser=await chromium.launch({headless:true});
const game=createGame(null);
Object.assign(game.state,{level:26,running:true,depth:0,rng:0,savedAt:Date.now()});
game.state.equipment.weapon.power=72;
const errors=[],captures=[],frames=[];
const base=process.env.TEST_URL||'http://127.0.0.1:5188';
const context=await browser.newContext({viewport:{width:1440,height:1050},recordVideo:{dir:`${out}/video`,size:{width:960,height:700}}});
await context.addInitScript(({state,key})=>{localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('ashen-covenant-settings-v1',JSON.stringify({muted:true,reducedMotion:false,volume:.35}));},{state:game.state,key:SAVE_KEY});
try{
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForSelector('#scene canvas');
  const click=selector=>page.locator(selector).first().click();
  const freeze=value=>page.evaluate(value=>window.__THREE_GAME_TEST_HOOKS__.setPausedForScreenshot(value),value);
  const diagnostic=()=>page.evaluate(()=>({...window.__ASHEN__.scene.diagnostics(),progress:window.__ASHEN__.game.state.progress,kills:window.__ASHEN__.game.state.kills,simTime:window.__ASHEN__.game.state.simTime}));
  const canvas=page.locator('#scene canvas');
  for(const environment of ['grave','crypt','furnace','marsh','boss','fish']){
    await freeze(false);
    if(['boss','fish'].includes(environment)){await click(`nav [data-page="${environment}"]`);await click(`[data-activity="${environment}"]`);}
    else{await click('nav [data-page="adventure"]');await click(`[data-zone="${environment}"]`);}
    await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(600);await freeze(true);await page.waitForTimeout(100);
    const path=`${out}/region-${environment}.png`;await canvas.screenshot({path});
    const d=await diagnostic();assert.equal(d.environment,environment);assert.ok(d.calls<=150&&d.textures<=40&&!d.fallback);
    captures.push({environment,path,diagnostics:d});
  }
  await freeze(false);await click('nav [data-page="adventure"]');await click('[data-zone="marsh"]');await click('[data-depth="1"]');await canvas.scrollIntoViewIfNeeded();
  const before=await diagnostic();
  for(let i=0;i<48;i++){
    await page.waitForTimeout(250);
    const path=`${out}/frames/${String(i).padStart(2,'0')}.png`;
    await canvas.screenshot({path});frames.push({path,...await diagnostic()});
  }
  const after=await diagnostic(),phases=new Set(frames.map(f=>f.phase));
  assert.ok(after.observedLoot>before.observedLoot,'motion includes an actual item pickup effect');
  assert.ok(after.kills>before.kills&&after.observedHits>=before.observedHits+3,'complete deep encounter and its actual hit events');
  for(const phase of ['approach','attack','defeat','loot'])assert.ok(phases.has(phase),`motion must include ${phase}`);
  const picks=[0,6,12,18,24,30,36,42];
  for(const phase of ['defeat','loot']){const index=frames.findIndex(f=>f.phase===phase);if(index>=0&&!picks.includes(index))picks[phase==='defeat'?6:7]=index;}
  const montage=new PNG({width:1440,height:292});
  for(let n=0;n<8;n++){
    const p=PNG.sync.read(await fs.readFile(frames[picks[n]].path));
    for(let y=0;y<146;y++)for(let x=0;x<360;x++){
      const from=(Math.min(p.height-1,Math.floor(y*p.height/146))*p.width+Math.min(p.width-1,Math.floor(x*p.width/360)))*4;
      const to=((Math.floor(n/4)*146+y)*1440+(n%4)*360+x)*4;
      p.data.copy(montage.data,to,from,from+4);
    }
  }
  await fs.writeFile(`${out}/motion-contact.png`,PNG.sync.write(montage));
  await click('[data-act="pause"]');await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(250);
  const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
  const paused=hash(await canvas.screenshot());await page.waitForTimeout(450);assert.equal(hash(await canvas.screenshot()),paused,'pause freezes every visible animation');
  await click('nav [data-page="settings"]');await click('[data-setting="reducedMotion"]');
  await click('nav [data-page="adventure"]');await click('[data-act="pause"]');await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(400);
  assert.equal((await diagnostic()).reducedMotion,true);
  await page.setViewportSize({width:390,height:844});await freeze(true);await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('#scene-panel').screenshot({path:`${out}/region-mobile.png`});
  const video=page.video();await context.close();await fs.rename(await video.path(),`${out}/region-motion.webm`);
  assert.deepEqual(errors,[]);
  const report={passed:true,base,captures,frames,montageFrames:picks,phases:[...phases],before,after,pausePixelsIdentical:true,reducedMotion:true,errors,checkedAt:new Date().toISOString()};
  await fs.writeFile(`${out}/region-results.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify({passed:true,regions:captures.length,phases:[...phases],hits:after.observedHits-before.observedHits,kills:after.kills-before.kills,pausePixelsIdentical:true,errors}));
}finally{await context.close();await browser.close();}
