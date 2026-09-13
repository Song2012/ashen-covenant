import { CLASSES, createGame } from '../src/engine.js';

// A reproducible diagnostic, not a claim that the economy is balanced.
// Hold initial gear, spend no talents, remain in grave, collect every real loot
// event before the 32-entry ring can overwrite it; count auto-sold drops too.
const rows = [];
for (const profession of CLASSES) for (const build of profession.builds) {
  const game = createGame(null);
  game.act('class', profession.id);
  game.act('build', build.id);
  let cursor = 0, legendaryGenerated = 0, totalDrops = 0, autoSold = 0;
  for (let elapsed = 3; elapsed <= 8 * 3600; elapsed += 3) {
    game.tick(3);
    for (const event of game.eventsSince(cursor)) {
      cursor = event.id;
      if (event.type !== 'loot' || !event.item) continue;
      totalDrops++;
      if (event.item.rarity === 'legendary') legendaryGenerated++;
      if (event.autoSold) autoSold++;
    }
    if (elapsed === 3600 || elapsed === 8 * 3600) rows.push({
      class: profession.id, build: build.id, hours: elapsed / 3600,
      level: game.state.level, gold: game.state.gold, kills: game.state.kills,
      legendaryGenerated, legendaryHeld: game.state.inventory.filter(i => i.rarity === 'legendary').length,
      totalDrops, autoSold, rng: game.state.rng,
    });
  }
}
console.log(JSON.stringify({
  version: '0.4-encounter-baseline',
  method: '固定种子184731；墓园挂机；初始装备；不加技能、不换装、不交易；3秒步长；传奇掉落数含满包自动出售，持有数含初始传奇。金币为最终余额。仅建立基线，尚未完成平衡。',
  rows,
}, null, 2));
