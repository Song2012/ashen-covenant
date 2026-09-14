import { CLASSES, BALANCE, createGame } from '../src/engine.js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const seeds = [184731, 123456789, 42, 20260914, 314159];
const priorities = { whirlwind: ['whirlwind','weaponMastery','bash'], frenzy: ['frenzy','weaponMastery','bash'], warcry: ['warCry','ironSkin','shout'], fireball: ['fireBall','fireMastery','fireBolt'], blizzard: ['blizzard','coldMastery','iceBolt'], chainlightning: ['chainLightning','lightningMastery','chargedBolt'] };
const rows = [];
for (const seed of seeds) for (const cls of CLASSES) for (const build of cls.builds) for (const activity of ['hunt','fish','boss']) {
  const game = createGame(null);
  game.act('class',cls.id); game.act('build',build.id); game.act('activity',activity);
  for (const [slot,power] of [['weapon',25],['armor',20],['ring',8]]) Object.assign(game.state.equipment[slot], { power, element:build.element, bonus:18, rarity:'rare', forgeRank:0 });
  game.state.rng = seed;
  let lastLevel = 0, cursor = 0, legendary = 0, drops = 0, firstBossRarity = null;
  for (let elapsed = 3; elapsed <= 28800; elapsed += 3) {
    if (game.state.level !== lastLevel) {
      lastLevel = game.state.level;
      while (game.stats().skillPoints > 0) {
        const ranks = game.state.talents[cls.id];
        const skill = priorities[build.id].filter(id => (ranks[id]||0)<10).sort((a,b)=>(ranks[a]||0)-(ranks[b]||0))[0];
        if (!skill) break;
        game.act('train',skill);
      }
    }
    game.tick(3);
    const events = game.eventsSince(cursor);
    if (events.length && events[0].id !== cursor + 1) throw new Error('Event buffer overflow');
    for (const event of events) {
      cursor = event.id;
      if (event.type === 'loot' && event.item) { drops++; if (event.item.rarity === 'legendary') legendary++; if (activity === 'boss' && firstBossRarity === null) firstBossRarity = event.item.rarity; }
    }
    if (activity === 'fish' && elapsed % 60 === 0) game.act('consumeFish');
    if (elapsed === 3600 || elapsed === 28800) rows.push({ seed, buildId:build.id, activity, requestedHours:elapsed/3600, activeHours:Number((game.state.simTime/3600).toFixed(5)), level:game.state.level, legendary, drops, vault:game.state.vault.length, pending:Boolean(game.state.pendingLoot), pauseReason:game.state.pauseReason, firstBossRarity });
  }
}
const range = values => [Math.min(...values),Math.max(...values)];
const summaries = [];
for (const activity of ['hunt','fish','boss']) for (const hours of [1,8]) {
  const selected = rows.filter(r=>r.activity===activity&&r.requestedHours===hours);
  summaries.push({ activity,hours,level:range(selected.map(r=>r.level)),legendary:range(selected.map(r=>r.legendary)),activeHours:range(selected.map(r=>r.activeHours)),storagePauses:selected.filter(r=>r.pending).length });
}
if (rows.some(r=>r.activity==='boss'&&r.firstBossRarity!=='legendary')) throw new Error('First boss guarantee failed');
const outputDirectory = new URL('../artifacts/v06/',import.meta.url);
await mkdir(outputDirectory,{recursive:true});
const sourceHash = createHash('sha256').update(await readFile(new URL('../src/engine.js',import.meta.url))).digest('hex');
const report = { balance:BALANCE,sourceHash,seeds,method:'直接导入生产engine；5种子×6流派×3活动共90组。适配同威能稀有装备25/20/8、各18亲和，仅模拟器合理训练3项技能；墓园不换装不精炼，钓鱼每分钟兑换，不清空保护仓库，3秒步长。所有统计来自真实事件和实际活动时长，不读取真实玩家存档。',summaries,rows };
await writeFile(new URL('production-progression.json',outputDirectory),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({balance:BALANCE,summaries},null,2));
