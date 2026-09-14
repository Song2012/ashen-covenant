import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createGame, SAVE_KEY } from '../src/engine.js';
const base=process.env.TEST_URL||'http://127.0.0.1:5189';
const label=base.includes('github.io')?'public':'production';
const out='artifacts/v07';await fs.mkdir(out,{recursive:true});
const game=createGame(null);Object.assign(game.state,{level:26,running:false,savedAt:Date.now()});
const browser=await chromium.launch({headless:true}),errors=[],captures=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1050}});
 await context.addInitScript(({state,key})=>{if(!sessionStorage.getItem('release-fixture')){localStorage.setItem(key,JSON.stringify(state));sessionStorage.setItem('release-fixture','yes');}},{state:game.state,key:SAVE_KEY});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const response=await page.goto(base);assert.equal(response.status(),200);
 await page.waitForSelector('#scene canvas');assert.match(await page.locator('footer').textContent(),/v0\.7/);
 const click=s=>page.locator(s).first().click();
 await click('[data-zone="marsh"]');await click('[data-depth="2"]');
 const state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);assert.equal(state.depth,2);assert.equal(state.level,26);
 assert.match(await page.locator('[data-depth-power]').textContent(),/\+6/);
 for(const width of [1440,320]){
  await page.setViewportSize({width,height:1050});
  for(const activity of ['hunt','boss','fish']){
   if(activity==='hunt')await click('nav [data-page="adventure"]');
   else{await click(`nav [data-page="${activity}"]`);await click(`[data-activity="${activity}"]`);}
   await page.locator('#scene-panel').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(width===320)assert.equal(await page.locator('#scene canvas').evaluate(el=>getComputedStyle(el).objectFit),'cover');
   const path=`${out}/${label}-${activity}-${width}.png`;await page.locator('#scene-panel').screenshot({path});captures.push(path);
  }
 }
 assert.equal(await page.evaluate(()=>typeof window.__ASHEN__),'undefined','production hides mutation hooks');
 assert.deepEqual(errors,[]);
 const report={passed:true,base,status:response.status(),version:'0.7',depth:state.depth,captures,errors,checkedAt:new Date().toISOString()};
 await fs.writeFile(`${out}/${label}-check.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
