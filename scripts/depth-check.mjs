import { createGame, CLASSES, ZONES, DEPTHS } from '../src/engine.js';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const training = { whirlwind:['whirlwind','weaponMastery','bash'],frenzy:['frenzy','weaponMastery','bash'],warcry:['warCry','ironSkin','shout'],fireball:['fireBall','fireMastery','fireBolt'],blizzard:['blizzard','coldMastery','iceBolt'],chainlightning:['chainLightning','lightningMastery','chargedBolt'] };
const rows=[];
for(const level of [12,26,50])for(const cls of CLASSES)for(const build of cls.builds){
  const game=createGame(null);game.act('class',cls.id);game.act('build',build.id);game.state.level=level;
  const gearPower=Math.round((9+16+level*.7+4.5)*1.5);
  for(const item of Object.values(game.state.equipment))Object.assign(item,{rarity:'rare',element:build.element,power:gearPower,bonus:18,forgeRank:0});
  while(game.stats().skillPoints>0){const ranks=game.state.talents[cls.id];const id=training[build.id].filter(id=>(ranks[id]||0)<10).sort((a,b)=>(ranks[a]||0)-(ranks[b]||0))[0];if(!id)break;game.act('train',id);}
  if(build.id==='frenzy')game.state.combatStacks=5;
  for(const zone of ZONES)for(const depth of DEPTHS){
    const q=game.expeditionQuote(depth.id,zone.id);
    const variant=key=>game.stats({...game.state.equipment,weapon:{...game.state.equipment.weapon,[key]:game.state.equipment.weapon[key]+(key==='bonus'?3:20)}},{depth:depth.id,zoneId:zone.id});
    const affinity=variant('bonus'),power=variant('power');
    rows.push({level,build:build.id,zone:zone.id,...q,gearPower,affinityGainPct:(q.huntSeconds/affinity.huntSeconds-1)*100,powerGainPct:(q.huntSeconds/power.huntSeconds-1)*100,rareMeanPower:(9+zone.level*2+level*.7+4.5+q.powerBonus)*1.5});
  }
}
const checks=[];
for(const [level,depth]of [[12,1],[26,2],[50,5]]){
  const selected=rows.filter(r=>r.level===level&&r.depth===depth&&r.zone==='marsh');
  assert.equal(selected.length,6);assert.ok(selected.every(r=>r.unlocked&&r.huntSeconds>3.5&&r.huntSeconds<30&&r.affinityGainPct>0&&r.powerGainPct>0));
  checks.push({level,depth,builds:6,minSeconds:Math.min(...selected.map(r=>r.huntSeconds)),maxSeconds:Math.max(...selected.map(r=>r.huntSeconds))});
}
const sourceHash=createHash('sha256').update(await readFile(new URL('../src/engine.js',import.meta.url))).digest('hex');
const report={sourceHash,depths:DEPTHS,method:'Production engine quotes; same-level marsh rare mean power, affinity18 on three slots, three main talents evenly trained to10, frenzy5. Snapshot only; no evolving loot loadout. XP/gold exclude item auto-sales.',checks,rows};
await writeFile(new URL('../artifacts/v07-depth-production.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sourceHash,checks},null,2));
