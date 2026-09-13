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
      activeHours: Number((game.state.simTime / 3600).toFixed(4)),
      level: game.state.level, gold: game.state.gold, kills: game.state.kills,
      legendaryGenerated, legendaryHeld: [...game.state.inventory, ...game.state.vault, ...(game.state.pendingLoot ? [game.state.pendingLoot] : [])].filter(i => i.rarity === 'legendary').length,
      vaultCount: game.state.vault.length, pending: Boolean(game.state.pendingLoot), pauseReason: game.state.pauseReason,
      protectedSaleValue: [...game.state.vault, ...(game.state.pendingLoot ? [game.state.pendingLoot] : [])].reduce((sum, item) => sum + item.value, 0),
      totalDrops, autoSold, rng: game.state.rng,
    });
  }
}
console.log(JSON.stringify({
  version: '0.5-loot-protection-baseline',
  method: '固定种子184731；墓园挂机；初始装备；不加技能、不换装、不交易、不清理仓库；3秒步长；传奇溢出进入120格仓库，再满保留单件待处理并暂停。hours是请求观察时长，activeHours是实际战斗时长。传奇持有数含初始传奇与保护装备；protectedSaleValue为未兑换的保护装备售价值，不是金币收益。仅建立基线，尚未完成成长平衡。',
  rows,
}, null, 2));
