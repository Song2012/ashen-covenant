import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, SAVE_KEY, CLASSES, INVENTORY_CAPACITY, VAULT_CAPACITY, BALANCE } from './engine.js';
import { MONSTERS, getMonster } from './encounters.js';

const memory = () => { const data = new Map(); return { getItem: k => data.get(k) || null, setItem: (k, v) => data.set(k, v) }; };

test('automatic combat grants loot, experience and levels; equipment changes build damage', () => {
  const game = createGame(memory());
  const initial = game.stats().dps;
  game.tick(240);
  assert.ok(game.state.kills >= 10);
  assert.ok(game.state.level > 1);
  assert.ok(game.state.gold > 1280);
  assert.ok(game.state.inventory.length > 8);
  game.act('class', 'sorceress');
  game.act('build', 'blizzard');
  const unaligned = game.stats().dps;
  game.act('equip', 'frost-wand');
  assert.ok(game.stats().dps > unaligned);
  assert.ok(initial > 0);
  game.act('zone', 'crypt');
  assert.ok(Math.abs(game.stats().zoneResistance - 0.2) < 0.00001);
  assert.ok(game.stats().effectiveDps < game.stats().dps);
  game.act('build', 'chainlightning');
  assert.equal(game.stats().zoneResistance, 0);
});

test('market enforces ownership, conserves items and deducts gold only on purchase', () => {
  const game = createGame(memory());
  const initialGold = game.state.gold;
  const initialCount = game.state.inventory.length;
  game.act('list', 'ghost-ring');
  assert.equal(game.state.inventory.length, initialCount - 1);
  const listing = game.state.listings.find(l => l.owner === 'you');
  game.act('buy', listing.id);
  assert.equal(game.state.gold, initialGold);
  assert.equal(game.state.inventory.length, initialCount - 1);
  game.act('cancel', listing.id);
  assert.equal(game.state.inventory.length, initialCount);
  game.act('cancel', 'market-1');
  assert.equal(game.state.listings.length, 3);
  game.act('buy', 'market-1');
  assert.equal(game.state.gold, initialGold - 720);
  assert.equal(game.state.inventory.length, initialCount + 1);
  game.act('sell', 'ember-blade');
  assert.equal(game.state.inventory.length, initialCount + 1);
});

test('pause freezes all progress; fishing and boss produce their own real rewards', () => {
  const game = createGame(memory());
  game.act('pause');
  game.tick(100);
  assert.equal(game.state.kills, 0);
  assert.equal(game.state.progress, 0);
  game.act('activity', 'fish');
  assert.equal(game.state.running, true);
  game.tick(24);
  assert.equal(game.state.fish, 3);
  const gold = game.state.gold;
  game.act('consumeFish');
  assert.equal(game.state.gold, gold + 105);
  assert.equal(game.state.fish, 0);
  game.act('activity', 'boss');
  game.tick(120);
  assert.ok(game.state.boss.kills >= 1);
  assert.ok(game.state.inventory.some(i => i.rarity === 'legendary' && i.id.startsWith('drop-')));
});

test('save restores RNG and computes bounded offline progress without double-claiming', () => {
  const storage = memory();
  const game = createGame(storage);
  game.act('activity', 'fish');
  game.tick(3);
  game.save();
  const raw = JSON.parse(storage.getItem(SAVE_KEY));
  const clone = createGame(storage);
  assert.equal(clone.state.rng, raw.rng);
  assert.equal(clone.state.progress, raw.progress);
  raw.savedAt = Date.now() - 10 * 3600 * 1000;
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  const offline = createGame(storage);
  assert.equal(offline.state.fish, 3600);
  assert.match(offline.state.offlineSummary, /最多结算 8 小时/);
  const reopened = createGame(storage);
  assert.equal(reopened.state.fish, offline.state.fish);
  assert.equal(reopened.state.offlineSummary, '');
});

test('paused offline saves do not advance; corrupted saves recover safely', () => {
  const storage = memory();
  const game = createGame(storage);
  game.act('pause');
  const raw = JSON.parse(storage.getItem(SAVE_KEY));
  raw.savedAt -= 3600000;
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  assert.equal(createGame(storage).state.kills, 0);
  storage.setItem(SAVE_KEY, '{broken');
  assert.equal(createGame(storage).state.level, 1);
  raw.inventory = [{ id: 'bad' }];
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  assert.equal(createGame(storage).state.inventory.length, 8);
});

test('long hunt caps inventory and reports overflow liquidation', () => {
  const game = createGame(memory());
  game.tick(3600);
  assert.equal(game.state.inventory.length, 60);
  assert.ok(game.state.logs.some(l => l.includes('自动出售')));
  const listed = game.state.inventory.find(i => !Object.values(game.state.equipment).some(e => e?.id === i.id));
  game.act('list', listed.id);
  const id = game.state.listings.find(l => l.owner === 'you').id;
  game.tick(3600);
  assert.ok(game.state.listings.some(l => l.id === id));
});

test('unlocked zone selection returns to hunting while locked zones preserve current activity', () => {
  const game = createGame(memory());
  game.act('activity', 'boss');
  game.tick(5);
  const progress = game.state.progress;
  game.act('zone', 'marsh');
  assert.equal(game.state.activity, 'boss');
  assert.equal(game.state.progress, progress);
  assert.equal(game.state.zoneId, 'grave');
  game.act('zone', 'grave');
  assert.equal(game.state.activity, 'hunt');
  assert.equal(game.state.progress, 0);
  game.act('activity', 'fish');
  game.act('zone', 'grave');
  assert.equal(game.state.activity, 'hunt');
});

test('warcry converts defense into magic damage; physical builds do not', () => {
  const game = createGame(memory());
  game.act('equip', 'storm-coat');
  const emberWithArmor = game.stats().dps;
  const armor = game.state.equipment.armor;
  game.state.equipment.armor = null;
  assert.equal(game.stats().dps, emberWithArmor);
  game.act('build', 'warcry');
  const steelWithoutArmor = game.stats().dps;
  const defenseWithoutArmor = game.stats().defense;
  game.state.equipment.armor = armor;
  assert.ok(game.stats().dps > steelWithoutArmor);
  assert.equal(game.stats().defense - defenseWithoutArmor, armor.power * 3);
  assert.ok(Math.abs(game.stats().dps - steelWithoutArmor - armor.power * 3 * 0.45) <= 1);
  assert.equal(game.stats().element, 'magic');
});

test('fishing can recover equipment and huge ticks are capped to eight hours', () => {
  const game = createGame(memory());
  game.act('activity', 'fish');
  game.tick(100000000);
  assert.equal(game.state.fish, 3600);
  assert.ok(game.state.inventory.some(i => i.id.startsWith('drop-')));
  assert.ok(game.state.shards > 12);
});

test('explicit activity selection resumes pause without discarding progress on re-selection', () => {
  const game = createGame(memory());
  game.act('activity', 'fish');
  game.tick(4);
  game.act('pause');
  game.act('activity', 'fish');
  assert.equal(game.state.running, true);
  assert.equal(game.state.progress, 0.5);
  game.tick(4);
  assert.equal(game.state.fish, 1);
  game.act('pause');
  game.act('zone', 'grave');
  assert.equal(game.state.running, true);
  assert.equal(game.state.activity, 'hunt');
});

test('missing or failing storage keeps game playable and reports save failures truthfully', () => {
  const absent = createGame(null);
  assert.equal(absent.state.storageAvailable, false);
  assert.equal(absent.save(), false);
  absent.tick(30);
  assert.ok(absent.state.kills > 0);
  const failing = createGame({ getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); } });
  assert.equal(failing.state.storageAvailable, false);
  assert.equal(failing.save(), false);
  assert.equal(createGame(memory()).state.storageAvailable, true);
});

test('a throwing localStorage getter does not prevent game initialization', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
    const game = createGame();
    assert.equal(game.state.storageAvailable, false);
    game.tick(30);
    assert.ok(game.state.kills > 0);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('only Barbarian and Sorceress are offered, with three automated builds and three skill trees each', () => {
  assert.deepEqual(CLASSES.map(c => c.id), ['barbarian', 'sorceress']);
  for (const cls of CLASSES) {
    assert.equal(cls.builds.length, 3);
    assert.equal(cls.trees.length, 3);
    assert.ok(cls.builds.every(b => b.skills.length === 3 && b.role && b.mechanic));
    assert.ok(cls.trees.every(t => t.skills.length === 3 && t.skills.every(s => s.maxRank === 10)));
  }
});

test('talents spend earned points, refund for free, retain class allocations and enforce rank caps', () => {
  const game = createGame(memory());
  assert.equal(game.stats().skillPoints, 3);
  const initialDps = game.stats().dps;
  game.act('train', 'whirlwind');
  assert.ok(game.stats().dps > initialDps);
  assert.equal(game.stats().skillPoints, 2);
  game.act('train', 'weaponMastery');
  game.act('train', 'bash');
  assert.equal(game.stats().skillPoints, 0);
  assert.match(game.act('train', 'ironSkin'), /技能点不足/);
  assert.equal(game.state.talents.barbarian.ironSkin, undefined);
  game.act('class', 'sorceress');
  assert.equal(game.stats().skillPoints, 3);
  game.act('train', 'fireBall');
  game.act('class', 'barbarian');
  assert.equal(game.stats().skillPoints, 0);
  assert.equal(game.state.talents.barbarian.whirlwind, 1);
  const gold = game.state.gold;
  game.act('resetTalents');
  assert.equal(game.stats().skillPoints, 3);
  assert.equal(game.state.gold, gold);
  assert.equal(game.state.talents.sorceress.fireBall, 1);
  game.state.level = 20;
  for (let i = 0; i < 12; i++) game.act('train', 'whirlwind');
  assert.equal(game.state.talents.barbarian.whirlwind, 10);
  assert.equal(game.stats().skillPoints, 12);
  assert.match(game.act('train', 'fireBall'), /没有这项技能/);
});

test('every trainable skill changes actual relevant output or hunt recovery', () => {
  const relevantBuild = { whirlwind: 'whirlwind', frenzy: 'frenzy', bash: 'whirlwind', weaponMastery: 'whirlwind', ironSkin: 'warcry', naturalResistance: 'whirlwind', shout: 'warcry', battleOrders: 'whirlwind', warCry: 'warcry', fireBolt: 'fireball', fireBall: 'fireball', fireMastery: 'fireball', iceBolt: 'blizzard', blizzard: 'blizzard', coldMastery: 'blizzard', chargedBolt: 'chainlightning', chainLightning: 'chainlightning', lightningMastery: 'chainlightning' };
  for (const cls of CLASSES) for (const talent of cls.trees.flatMap(t => t.skills)) {
    const game = createGame(memory());
    game.act('class', cls.id);
    game.act('build', relevantBuild[talent.id]);
    const before = game.stats();
    game.act('train', talent.id);
    const after = game.stats();
    assert.ok(after.dps > before.dps || after.bossDps > before.bossDps || after.huntSeconds < before.huntSeconds, `${talent.name} must change real battle output`);
  }
});

test('elemental talents never improve an inactive element, and physical mastery excludes warcry', () => {
  const game = createGame(memory());
  game.act('class', 'sorceress');
  game.act('build', 'blizzard');
  const before = game.stats().dps;
  game.act('train', 'fireBall');
  game.act('train', 'lightningMastery');
  assert.equal(game.stats().dps, before);
  game.act('class', 'barbarian');
  game.act('build', 'warcry');
  const cryDps = game.stats().dps;
  game.act('train', 'weaponMastery');
  game.act('train', 'bash');
  assert.equal(game.stats().dps, cryDps);
  game.act('train', 'warCry');
  assert.ok(game.stats().dps > cryDps);
});

test('six builds have real clear speed, stacking, magic find, penetration and boss differences', () => {
  const game = createGame(memory());
  const whirlwind = game.stats();
  game.act('build', 'frenzy');
  assert.ok(whirlwind.huntSeconds < game.stats().huntSeconds);
  game.act('activity', 'boss');
  const unstacked = game.stats().bossDps;
  game.tick(20);
  assert.equal(game.state.combatStacks, 5);
  assert.ok(game.stats().bossDps > unstacked);
  game.act('build', 'frenzy');
  game.act('class', 'barbarian');
  game.act('activity', 'boss');
  assert.equal(game.state.combatStacks, 5);
  assert.equal(game.state.buildId, 'frenzy');
  game.act('build', 'warcry');
  assert.equal(game.state.combatStacks, 0);
  assert.ok(game.stats().magicFind > whirlwind.magicFind);
  game.act('class', 'sorceress');
  const fire = game.stats();
  assert.ok(fire.bossDps > fire.dps);
  const bossHp = game.state.boss.hp;
  game.tick(1);
  assert.ok(Math.abs(bossHp - game.state.boss.hp - fire.bossDps - 225) < 1e-8);
  game.act('build', 'chainlightning');
  assert.ok(game.stats().huntSeconds < fire.huntSeconds);
  assert.equal(game.stats().bossDps, game.stats().dps);
  game.state.level = 3;
  game.act('build', 'blizzard');
  game.act('zone', 'crypt');
  const resistant = game.stats();
  game.act('train', 'coldMastery');
  assert.ok(game.stats().zoneResistance < resistant.zoneResistance);
  assert.ok(game.stats().damageReduction > 0);
});

test('talent validation ignores foreign ids and bounds each class by earned budget', () => {
  const storage = memory();
  const game = createGame(storage);
  const raw = JSON.parse(storage.getItem(SAVE_KEY));
  raw.talents = { barbarian: { whirlwind: 999, frenzy: 2, fireBall: 3, bash: -5, shout: 1.5 }, sorceress: { fireBall: 2, fireMastery: 3, unknown: 5 } };
  raw.classId = 'barbarian'; raw.buildId = 'fireball';
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  const restored = createGame(storage);
  assert.equal(restored.state.buildId, 'whirlwind');
  assert.deepEqual(restored.state.talents.barbarian, { whirlwind: 3 });
  assert.deepEqual(restored.state.talents.sorceress, { fireBall: 2, fireMastery: 1 });
  assert.equal(restored.stats().skillPoints, 0);
  game.act('class', 'reaper');
  assert.equal(game.state.classId, 'barbarian');
});

for (const [oldClass, oldBuild, newClass, newBuild] of [
  ['knight', 'ember', 'barbarian', 'whirlwind'], ['knight', 'steel', 'barbarian', 'warcry'],
  ['witch', 'frost', 'sorceress', 'blizzard'], ['witch', 'storm', 'sorceress', 'chainlightning'],
  ['reaper', 'plague', 'sorceress', 'fireball'], ['reaper', 'shadow', 'sorceress', 'fireball'],
]) test(`legacy ${oldClass}/${oldBuild} migrates without losing progression or equipment`, () => {
  const storage = memory();
  const game = createGame(storage);
  game.act('list', 'ghost-ring');
  game.act('pause');
  const raw = JSON.parse(storage.getItem(SAVE_KEY));
  Object.assign(raw, { classId: oldClass, buildId: oldBuild, level: 12, xp: 81, gold: 5432, shards: 77, fish: 9, kills: 212, zoneId: 'marsh', activity: 'boss', progress: 0.5 });
  raw.boss = { hp: 14000, maxHp: 28000, contribution: 3000, kills: 3 };
  raw.inventory[0].name = '旧版余烬誓剑'; raw.inventory[0].element = 'fire';
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  const migrated = createGame(storage);
  assert.equal(migrated.state.classId, newClass);
  assert.equal(migrated.state.buildId, newBuild);
  for (const key of ['level', 'xp', 'gold', 'shards', 'fish', 'kills', 'zoneId', 'activity', 'progress', 'running']) assert.equal(migrated.state[key], raw[key], key);
  assert.deepEqual(migrated.state.inventory, raw.inventory);
  assert.deepEqual(migrated.state.listings, raw.listings);
  assert.deepEqual(migrated.state.boss, raw.boss);
  assert.equal(migrated.state.equipment.weapon.element, 'fire');
  assert.equal(migrated.state.logs.filter(l => l.includes('已迁移')).length, 1);
  const reopened = createGame(storage);
  assert.equal(reopened.state.logs.filter(l => l.includes('已迁移')).length, 1);
});

test('offline-size batches match small online ticks, including frenzy stack boundaries and talent effects', () => {
  for (const activity of ['hunt', 'boss', 'fish']) {
    const storageA = memory(), storageB = memory();
    const batched = createGame(storageA);
    batched.act('build', 'frenzy');
    batched.act('train', 'frenzy');
    batched.act('train', 'weaponMastery');
    batched.act('activity', activity);
    batched.tick(1.25);
    batched.save();
    storageB.setItem(SAVE_KEY, storageA.getItem(SAVE_KEY));
    const stepped = createGame(storageB);
    batched.tick(600);
    for (let n = 0; n < 2400; n++) stepped.tick(0.25);
    for (const key of ['level', 'xp', 'gold', 'shards', 'fish', 'kills', 'rng', 'combatStacks']) assert.equal(stepped.state[key], batched.state[key], `${activity}/${key}`);
    assert.deepEqual(stepped.state.inventory, batched.state.inventory);
    assert.ok(Math.abs(stepped.state.progress - batched.state.progress) < 1e-7, `${activity}/progress`);
    assert.ok(Math.abs(stepped.state.boss.hp - batched.state.boss.hp) < 1e-6, `${activity}/boss hp`);
    assert.ok(Math.abs(stepped.state.boss.contribution - batched.state.boss.contribution) < 1e-6, `${activity}/contribution`);
  }
});

test('twelve deterministic monsters vary by zone; every fifth encounter is cosmetic elite only', () => {
  assert.equal(Object.values(MONSTERS).flat().length, 12);
  assert.equal(new Set(Object.values(MONSTERS).flat().map(m => m.id)).size, 12);
  for (const zone of Object.keys(MONSTERS)) {
    assert.equal(new Set([0, 1, 2].map(k => getMonster(zone, k).id)).size, 3);
    assert.equal(getMonster(zone, 3).elite, false);
    assert.equal(getMonster(zone, 4).elite, true);
    assert.equal(getMonster(zone, 9).elite, true);
    assert.equal(getMonster(zone, 4).maxHp, getMonster(zone, 1).maxHp);
  }
  const game = createGame(memory());
  const seed = game.state.rng;
  for (let i = 0; i < 30; i++) { game.combat(); getMonster('crypt', i); }
  assert.equal(game.state.rng, seed);
});

test('hunt produces exactly three real hits, a death window and one authoritative reward', () => {
  const game = createGame(memory());
  const initial = game.combat();
  const duration = game.stats().huntSeconds;
  assert.equal(initial.phase, 'approach');
  game.tick(duration * 0.249);
  assert.equal(game.eventsSince().length, 0);
  game.tick(duration * 0.001);
  assert.equal(game.combat().attackIndex, 1);
  assert.equal(game.eventsSince().length, 1);
  const first = game.eventsSince()[0];
  assert.equal(first.damage, initial.monster.maxHp - game.combat().monster.hp);
  game.tick(duration * 0.55);
  assert.equal(game.combat().phase, 'defeat');
  assert.equal(game.combat().monster.hp, 0);
  assert.equal(game.combat().attackProgress, 0);
  const damageEvents = game.eventsSince().filter(e => e.type === 'hit');
  assert.equal(damageEvents.length, 3);
  assert.equal(damageEvents.reduce((sum, e) => sum + e.damage, 0), initial.monster.maxHp);
  assert.equal(game.eventsSince().filter(e => e.type === 'defeat').length, 1);
  assert.equal(game.state.kills, 0, 'settlement remains at the original full round boundary');
  const cursor = game.eventsSince().at(-1).id;
  game.tick(duration * 0.1);
  assert.equal(game.combat().phase, 'loot');
  assert.equal(game.eventsSince(cursor).length, 0, 'no attacks against a dead target');
  const gold = game.state.gold;
  game.tick(duration * 0.1);
  assert.equal(game.state.kills, 1);
  assert.notEqual(game.combat().id, initial.id);
  const reward = game.eventsSince(cursor).find(e => e.type === 'loot');
  assert.equal(reward.encounterId, initial.id);
  assert.equal(reward.gold, game.state.gold - gold);
  assert.equal(game.combat().lastReward.id, reward.id);
});

test('event queue is cursor-based, bounded, unique and detached from inventory', () => {
  const game = createGame(memory());
  game.tick(300);
  const events = game.eventsSince();
  assert.equal(events.length, 32);
  assert.equal(new Set(events.map(e => e.id)).size, 32);
  assert.ok(events.every((e, i) => i === 0 || e.id > events[i - 1].id));
  assert.equal(game.eventsSince(events.at(-1).id).length, 0);
  const drop = events.find(e => e.item);
  assert.ok(drop);
  const item = game.state.inventory.find(i => i.id === drop.item.id);
  const name = item.name;
  drop.item.name = 'caller mutation'; drop.item.affixes[0] = 'caller mutation';
  assert.equal(item.name, name);
  assert.notEqual(item.affixes[0], 'caller mutation');
});

test('pause and activity switches cannot replay attacks or attach old damage to a new encounter', () => {
  const game = createGame(memory());
  game.tick(game.stats().huntSeconds * 0.3);
  const before = game.combat();
  const cursor = game.eventsSince().at(-1).id;
  game.act('pause');
  game.tick(100);
  assert.equal(game.combat().phase, 'paused');
  assert.equal(game.combat().monster.hp, before.monster.hp);
  assert.equal(game.eventsSince(cursor).length, 0);
  game.act('activity', 'fish');
  assert.equal(game.combat().monster, null);
  game.tick(8);
  const catches = game.eventsSince(cursor);
  assert.ok(catches.some(e => e.type === 'fish'));
  assert.ok(catches.every(e => e.type === 'fish' || e.type === 'loot'));
  game.act('zone', 'grave');
  const returned = game.combat();
  assert.notEqual(returned.id, before.id);
  assert.equal(returned.monster.hp, returned.monster.maxHp);
  assert.equal(returned.attackIndex, 0);
});

test('restoring an in-progress save derives monster HP but never replays recorded or offline hits', () => {
  const storage = memory();
  const game = createGame(storage);
  game.tick(game.stats().huntSeconds * 0.6);
  game.save();
  const oldCursor = game.eventsSince().at(-1).id;
  const restored = createGame(storage);
  assert.equal(restored.eventsSince().length, 0);
  assert.equal(restored.combat().attackIndex, 2);
  assert.equal(restored.combat().monster.hp, game.combat().monster.hp);
  restored.tick(restored.stats().huntSeconds * 0.21);
  assert.equal(restored.eventsSince(oldCursor).filter(e => e.type === 'hit').length, 1);
  assert.ok(restored.eventsSince().every(e => e.id > oldCursor));
  restored.save();
  const raw = JSON.parse(storage.getItem(SAVE_KEY));
  raw.savedAt = Date.now() - 3600000;
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  const offline = createGame(storage);
  assert.equal(offline.eventsSince().length, 0);
  assert.equal(offline.combat().lastReward, null);
  assert.ok(offline.state.kills > game.state.kills);
  const offlineSequence = offline.state.eventSequence;
  offline.tick(15);
  assert.ok(offline.eventsSince().every(e => e.id > offlineSequence));
});

test('boss hit events account for actual player and ally damage with fixed cadence across tick sizes', () => {
  const batch = createGame(memory()), small = createGame(memory());
  for (const game of [batch, small]) { game.act('build', 'frenzy'); game.act('activity', 'boss'); }
  const initial = batch.state.boss.hp;
  batch.tick(10);
  for (let i = 0; i < 100; i++) small.tick(0.1);
  const a = batch.eventsSince(), b = small.eventsSince();
  assert.equal(a.length, 10);
  assert.equal(b.length, 10);
  assert.ok(a.every(e => e.type === 'bossHit'));
  assert.ok(Math.abs(a.reduce((sum, e) => sum + e.damage + e.allyDamage, 0) - (initial - batch.state.boss.hp)) < 1e-7);
  assert.ok(Math.abs(a.reduce((sum, e) => sum + e.damage, 0) - batch.state.boss.contribution) < 1e-7);
  for (let i = 0; i < a.length; i++) {
    assert.equal(a[i].id, b[i].id);
    assert.ok(Math.abs(a[i].damage - b[i].damage) < 1e-7);
    assert.ok(Math.abs(a[i].time - b[i].time) < 1e-7);
  }
  batch.state.boss.hp = 10;
  const cursor = a.at(-1).id;
  batch.tick(0.1);
  const final = batch.eventsSince(cursor);
  assert.equal(final[0].type, 'bossHit');
  assert.ok(Math.abs(final[0].damage + final[0].allyDamage - 10) < 1e-7);
  assert.equal(final[1].type, 'bossDefeat');
  assert.equal(final[2].type, 'loot');
  assert.equal(final[2].item.rarity, 'legendary');
});

test('hunt event timing and identities are independent of online tick size', () => {
  const batch = createGame(memory()), small = createGame(memory());
  batch.tick(25);
  for (let i = 0; i < 250; i++) small.tick(0.1);
  const a = batch.eventsSince(), b = small.eventsSince();
  assert.equal(a.length, b.length);
  for (let i = 0; i < a.length; i++) {
    assert.equal(a[i].id, b[i].id);
    assert.equal(a[i].type, b[i].type);
    assert.equal(a[i].encounterId, b[i].encounterId);
    assert.equal(a[i].damage, b[i].damage);
    assert.ok(Math.abs(a[i].time - b[i].time) < 1e-7);
  }
  assert.equal(batch.state.rng, small.state.rng);
});

test('v0.6 one-hour baseline slows initial progression and retains protected loot without artificial liquidation income', () => {
  const baseline = { whirlwind: [11,91720,773,1008873296,3,1738], frenzy: [11,101174,833,355995720,3,1738], warcry: [10,56439,517,3521610042,3,1562], fireball: [8,36811,365,3196061519,0,0], blizzard: [9,48990,453,3116899704,1,506], chainlightning: [10,64923,578,1529672868,3,1738] };
  for (const cls of CLASSES) for (const build of cls.builds) {
    const game = createGame(memory());
    game.act('class', cls.id); game.act('build', build.id); game.tick(3600);
    const protectedValue = game.state.vault.reduce((sum, item) => sum + item.value, 0);
    assert.deepEqual([game.state.level, game.state.gold, game.state.kills, game.state.rng, game.state.vault.length, protectedValue], baseline[build.id], `${build.id}/actual new balance`);
    assert.ok(game.state.level >= 8 && game.state.level <= 12);
    assert.ok(game.state.vault.every(item => item.rarity === 'legendary'));
    assert.equal(game.state.pendingLoot, null);
  }
});

test('legacy saves without encounter fields resume at the correct hit boundary', () => {
  const storage = memory();
  createGame(storage);
  const raw = JSON.parse(storage.getItem(SAVE_KEY));
  for (const key of ['simTime', 'eventSequence', 'encounterSerial', 'bossPulseProgress', 'bossPulseDamage', 'bossPulseAllyDamage', 'bossAttackIndex']) delete raw[key];
  raw.progress = 0.52;
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  const game = createGame(storage);
  assert.equal(game.combat().attackIndex, 2);
  assert.equal(game.eventsSince().length, 0);
  game.act('pause');
  game.act('build', 'warcry');
  assert.equal(game.combat().attackIndex, 2);
  assert.equal(game.combat().phase, 'paused');
  game.act('pause');
  game.tick(game.stats().huntSeconds * 0.28);
  assert.equal(game.combat().monster.hp, 0);
  assert.equal(game.eventsSince().filter(e => e.type === 'hit').length, 1);
});

test('changing boss build flushes only old-build damage and offline damage is never replayed', () => {
  const storage = memory();
  const game = createGame(storage);
  game.act('activity', 'boss');
  const oldDps = game.stats().bossDps;
  game.tick(0.4);
  game.act('build', 'warcry');
  const flushed = game.eventsSince().at(-1);
  assert.equal(flushed.type, 'bossHit');
  assert.equal(flushed.buildId, 'whirlwind');
  assert.ok(Math.abs(flushed.damage - oldDps * 0.4) < 1e-8);
  game.tick(0.2);
  game.save();
  const raw = JSON.parse(storage.getItem(SAVE_KEY));
  raw.savedAt = Date.now() - 3600000;
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  const restored = createGame(storage);
  assert.deepEqual(restored.eventsSince(), []);
  const dps = restored.stats().bossDps;
  const untilPulse = 1 - restored.state.bossPulseProgress;
  restored.tick(untilPulse);
  const pulse = restored.eventsSince().find(e => e.type === 'bossHit');
  assert.ok(pulse);
  assert.ok(Math.abs(pulse.damage - dps * untilPulse) < 1e-7, 'first new pulse must not contain offline accumulated damage');
});

const testItem = (game, id, overrides = {}) => ({ ...(game.state.equipment.weapon || game.state.inventory[0]), id, name: id, rarity: 'magic', locked: false, affixes: ['测试词缀'], ...overrides });
function fillBag(game) {
  while (game.state.inventory.length < INVENTORY_CAPACITY) game.state.inventory.push(testItem(game, `bag-${game.state.inventory.length}`));
}
function fillVault(game) {
  while (game.state.vault.length < VAULT_CAPACITY) game.state.vault.push(testItem(game, `vault-${game.state.vault.length}`, { rarity: 'legendary' }));
}
const heldIds = game => [...game.state.inventory, ...game.state.vault, ...(game.state.pendingLoot ? [game.state.pendingLoot] : []), ...game.state.listings.map(l => l.item)].map(i => i.id);

test('legendary boss drops are protected in vault, never liquidated, and non-legendaries still liquidate', () => {
  const game = createGame(memory()); fillBag(game);
  game.act('activity', 'boss'); game.state.boss.hp = 1;
  const gold = game.state.gold;
  game.tick(0.1);
  assert.equal(game.state.inventory.length, INVENTORY_CAPACITY);
  assert.equal(game.state.vault.length, 1);
  assert.equal(game.state.vault[0].rarity, 'legendary');
  assert.equal(game.state.gold, gold + 420);
  const event = game.eventsSince().find(e => e.type === 'loot');
  assert.equal(event.destination, 'vault'); assert.equal(event.autoSold, false);
  game.act('zone', 'grave'); game.tick(120);
  assert.ok(game.eventsSince().some(e => e.destination === 'sold' && e.item.rarity !== 'legendary'));
  assert.ok(game.eventsSince().every(e => e.destination !== 'sold' || e.item.rarity !== 'legendary'));
});

test('full vault preserves one pending legendary and stops an eight-hour tick immediately', () => {
  const game = createGame(memory()); fillBag(game); fillVault(game);
  game.act('activity', 'boss'); game.state.boss.hp = 1;
  const gold = game.state.gold, time = game.state.simTime;
  game.tick(8 * 3600);
  assert.equal(game.state.boss.kills, 1);
  assert.equal(game.state.gold, gold + 420);
  assert.ok(game.state.simTime - time < 0.01);
  assert.equal(game.state.pendingLoot.rarity, 'legendary');
  assert.equal(game.state.running, false);
  assert.equal(game.state.pauseReason, 'lootProtection');
  assert.equal(game.state.vault.length, VAULT_CAPACITY);
  assert.equal(new Set(heldIds(game)).size, heldIds(game).length);
  const pendingId = game.state.pendingLoot.id, cursor = game.state.eventSequence;
  for (const [type, id] of [['pause'], ['activity', 'fish'], ['zone', 'grave']]) assert.match(game.act(type, id), /等待处理|待处理/);
  game.act('build', 'warcry'); game.act('class', 'sorceress');
  game.tick(1000);
  assert.equal(game.state.pendingLoot.id, pendingId);
  assert.equal(game.state.boss.kills, 1);
  assert.equal(game.state.running, false);
  assert.equal(game.eventsSince(cursor).length, 0);
});

test('claim is transactional, pending can move into a freed vault slot, and recovery requires explicit resume', () => {
  const game = createGame(memory()); fillBag(game); fillVault(game);
  game.act('activity', 'boss'); game.state.boss.hp = 1; game.tick(1);
  const pendingId = game.state.pendingLoot.id, vaultId = game.state.vault[0].id;
  const before = heldIds(game).sort();
  game.act('claim', vaultId); game.act('claim', pendingId);
  assert.deepEqual(heldIds(game).sort(), before);
  game.act('sell', vaultId);
  game.act('claim', pendingId);
  assert.equal(game.state.pendingLoot, null);
  assert.ok(game.state.vault.some(i => i.id === pendingId));
  assert.equal(game.state.running, false);
  assert.equal(game.state.pauseReason, 'manual');
  game.act('pause'); assert.equal(game.state.running, true);
  game.act('sellMagic');
  game.act('claim', pendingId);
  assert.ok(game.state.inventory.some(i => i.id === pendingId));
  assert.equal(new Set(heldIds(game)).size, heldIds(game).length);
});

test('vault and pending equip swap items safely at full capacity and preserve old-item locks', () => {
  const game = createGame(memory()); fillBag(game); fillVault(game);
  const old = game.state.equipment.weapon; game.act('lock', old.id);
  const vaultItem = game.state.vault[0];
  const before = heldIds(game).sort();
  game.act('equip', vaultItem.id);
  assert.equal(game.state.equipment.weapon.id, vaultItem.id);
  assert.ok(game.state.vault.some(i => i.id === old.id && i.locked));
  assert.deepEqual(heldIds(game).sort(), before);
  game.state.pendingLoot = testItem(game, 'pending-weapon', { rarity: 'legendary', power: 90 });
  game.state.running = false; game.state.pauseReason = 'lootProtection';
  game.act('lock', vaultItem.id);
  const allBefore = heldIds(game).sort();
  game.act('equip', 'pending-weapon');
  assert.equal(game.state.equipment.weapon.id, 'pending-weapon');
  assert.equal(game.state.pendingLoot.id, vaultItem.id);
  assert.equal(game.state.pendingLoot.locked, true);
  assert.equal(game.state.running, false);
  assert.deepEqual(heldIds(game).sort(), allBefore);
  assert.equal(game.state.inventory.length, INVENTORY_CAPACITY);
  assert.equal(game.state.vault.length, VAULT_CAPACITY);
});

test('locked items cannot be sold, listed or bulk sold; equipped items remain protected too', () => {
  const game = createGame(memory());
  game.state.inventory.push(testItem(game, 'loose-magic', { value: 17 }));
  game.state.inventory.push(testItem(game, 'locked-magic', { value: 29 }));
  game.act('lock', 'locked-magic');
  game.state.vault.push(testItem(game, 'vault-magic', { value: 50 }));
  const gold = game.state.gold;
  game.act('sell', 'locked-magic'); game.act('list', 'locked-magic');
  game.act('sell', game.state.equipment.weapon.id);
  assert.equal(game.state.gold, gold);
  const sale = game.act('sellMagic');
  assert.match(sale, /1 件.*17 金币/);
  assert.equal(game.state.gold, gold + 17);
  assert.ok(game.state.inventory.some(i => i.id === 'locked-magic'));
  assert.ok(game.state.inventory.some(i => i.id === game.state.equipment.armor.id));
  assert.ok(game.state.vault.some(i => i.id === 'vault-magic'));
  game.act('lock', 'locked-magic'); game.act('list', 'locked-magic');
  assert.ok(game.state.listings.some(l => l.item.id === 'locked-magic'));
});

test('pending items can be sold or listed and locked pending items stay protected', () => {
  for (const action of ['sell', 'list']) {
    const game = createGame(memory());
    game.state.pendingLoot = testItem(game, `pending-${action}`, { rarity: 'legendary', locked: true });
    game.state.running = false; game.state.pauseReason = 'lootProtection';
    const id = game.state.pendingLoot.id;
    assert.match(game.act(action, id), /锁定/);
    assert.equal(game.state.pendingLoot.id, id);
    game.act('lock', id); game.act(action, id);
    assert.equal(game.state.pendingLoot, null);
    assert.equal(game.state.running, false);
    if (action === 'list') assert.ok(game.state.listings.some(l => l.item.id === id));
  }
});

test('comparison is a detached pure query and matches actual equip across protected containers', () => {
  const storage = memory(); const game = createGame(storage); fillBag(game);
  game.state.vault.push(testItem(game, 'vault-upgrade', { power: 70, rarity: 'legendary', element: 'physical' }));
  game.save();
  const serialized = JSON.stringify(game.state), saved = storage.getItem(SAVE_KEY);
  const comparison = game.compareItem('vault-upgrade');
  assert.ok(comparison.differences.dps > 0);
  assert.ok(comparison.differences.magicFind > 0);
  assert.equal(JSON.stringify(game.state), serialized);
  assert.equal(storage.getItem(SAVE_KEY), saved);
  comparison.item.name = 'mutated'; comparison.currentItem.affixes[0] = 'mutated'; comparison.before.dps = -1;
  assert.notEqual(game.state.vault[0].name, 'mutated');
  assert.notEqual(game.state.equipment.weapon.affixes[0], 'mutated');
  game.act('equip', 'vault-upgrade');
  assert.deepEqual(game.stats(), comparison.after);
  assert.equal(game.compareItem('missing'), null);
});

test('legacy migration and restore deduplicate containers, preserve locks, and enforce pending pause', () => {
  const storage = memory(); const game = createGame(storage);
  const raw = JSON.parse(storage.getItem(SAVE_KEY));
  const oldGold = raw.gold;
  delete raw.vault; delete raw.pendingLoot; delete raw.pauseReason;
  raw.inventory.forEach(i => delete i.locked);
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  const legacy = createGame(storage);
  assert.equal(legacy.state.gold, oldGold);
  assert.equal(legacy.state.inventory.length, 8);
  assert.ok(legacy.state.inventory.every(i => i.locked === false));
  const duplicate = { ...legacy.state.inventory[0], locked: true };
  raw.vault = [duplicate, testItem(legacy, 'vault-distinct', { locked: true }), { invalid: true }];
  raw.pendingLoot = testItem(legacy, 'drop-999', { rarity: 'legendary', locked: true });
  raw.running = true; raw.savedAt = Date.now() - 3600000;
  raw.listings.push({ id: 'duplicate-listing', owner: 'you', price: 2, item: duplicate });
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  const restored = createGame(storage);
  assert.equal(new Set(heldIds(restored)).size, heldIds(restored).length);
  assert.equal(restored.state.inventory[0].locked, true);
  assert.equal(restored.state.vault.length, 1);
  assert.equal(restored.state.pendingLoot.id, 'drop-999');
  assert.equal(restored.state.pendingLoot.locked, true);
  assert.equal(restored.state.running, false);
  assert.equal(restored.state.pauseReason, 'lootProtection');
  assert.equal(restored.state.kills, raw.kills);
  assert.ok(restored.state.sequence >= 999);
});

test('offline overflow pauses at the same reward boundary without losing legendary or replaying events', () => {
  const storage = memory(); const game = createGame(storage); fillBag(game); fillVault(game);
  game.act('activity', 'boss'); game.state.boss.hp = 1; game.save();
  const raw = JSON.parse(storage.getItem(SAVE_KEY)); raw.savedAt = Date.now() - 8 * 3600000;
  storage.setItem(SAVE_KEY, JSON.stringify(raw));
  const restored = createGame(storage);
  assert.equal(restored.state.boss.kills, 1);
  assert.equal(restored.state.pendingLoot.rarity, 'legendary');
  assert.equal(restored.state.running, false);
  assert.match(restored.state.offlineSummary, /传奇保护暂停/);
  assert.deepEqual(restored.eventsSince(), []);
  assert.equal(createGame(storage).state.pendingLoot.id, restored.state.pendingLoot.id);
});

test('eight-hour bounded and small ticks stop identically at protected loot capacity', () => {
  const large = createGame(memory()), small = createGame(memory());
  for (const game of [large, small]) { fillBag(game); fillVault(game); game.state.vault.pop(); }
  large.tick(8 * 3600);
  for (let i = 0; i < 8 * 1200; i++) small.tick(3);
  for (const field of ['gold', 'level', 'kills', 'rng', 'sequence', 'running', 'pauseReason']) assert.equal(large.state[field], small.state[field], field);
  assert.deepEqual(large.state.vault, small.state.vault);
  assert.deepEqual(large.state.pendingLoot, small.state.pendingLoot);
  assert.equal(large.state.pendingLoot.rarity, 'legendary');
  assert.equal(large.state.vault.length, VAULT_CAPACITY);
});

test('fishing legendary drops obey the same protection and exact stop boundary as bosses', () => {
  for (const full of [false, true]) {
    const game = createGame(memory()); fillBag(game); if (full) fillVault(game);
    game.act('activity', 'fish');
    // This persisted seed yields a treasure catch and legendary quality under
    // the ordinary fishing RNG sequence; no drop hook or forced reward path.
    game.state.rng = 3569;
    const gold = game.state.gold;
    game.tick(full ? 3600 : 8);
    const item = full ? game.state.pendingLoot : game.state.vault[0];
    assert.equal(item.rarity, 'legendary');
    assert.equal(game.state.gold, gold);
    assert.equal(game.state.fish, 1);
    assert.equal(game.state.running, !full);
    assert.ok(game.eventsSince().some(e => e.type === 'loot' && e.destination === (full ? 'pending' : 'vault') && e.autoSold === false));
  }
});

test('external equip cannot discard an item when the full bag has an empty equipment slot', () => {
  const game = createGame(memory()); fillBag(game);
  game.state.equipment.weapon = null;
  game.state.vault.push(testItem(game, 'external-weapon', { slot: 'weapon', rarity: 'legendary' }));
  const before = heldIds(game).sort();
  assert.match(game.act('equip', 'external-weapon'), /腾出一格/);
  assert.deepEqual(heldIds(game).sort(), before);
  assert.equal(game.state.equipment.weapon, null);
  game.act('sellMagic'); game.act('equip', 'external-weapon');
  assert.equal(game.state.equipment.weapon.id, 'external-weapon');
  assert.ok(game.state.inventory.some(i => i.id === 'external-weapon'));
  assert.ok(!game.state.vault.some(i => i.id === 'external-weapon'));
});

test('balance migration preserves level and current-level completion exactly once', () => {
  const storage = memory(); const game = createGame(storage);
  assert.equal(game.state.balanceVersion, BALANCE.version);
  assert.ok(!game.state.logs.some(l => l.includes('成长节奏已更新')));
  const raw = JSON.parse(storage.getItem(SAVE_KEY));
  delete raw.balanceVersion;
  Object.assign(raw,{ level:85,xp:1000,gold:54321,shards:987,running:false,fish:123 });
  raw.inventory[0].locked = true;
  raw.talents.barbarian = { whirlwind:10,weaponMastery:10,ironSkin:5 };
  raw.boss.kills = 12;
  storage.setItem(SAVE_KEY,JSON.stringify(raw));
  const migrated = createGame(storage);
  const expected = Math.floor(raw.xp / (80+85*35) * (80+85*35+24*85**2));
  assert.equal(migrated.state.level,85);
  assert.equal(migrated.state.xp,expected);
  assert.equal(migrated.state.balanceVersion,1);
  for(const key of ['gold','shards','fish']) assert.equal(migrated.state[key],raw[key]);
  assert.deepEqual(migrated.state.inventory,raw.inventory);
  assert.deepEqual(migrated.state.talents.barbarian,raw.talents.barbarian);
  assert.equal(migrated.state.boss.kills,12);
  assert.equal(migrated.state.logs.filter(l=>l.includes('成长节奏已更新')).length,1);
  const reopened = createGame(storage);
  assert.equal(reopened.state.xp,expected);
  assert.equal(reopened.state.logs.filter(l=>l.includes('成长节奏已更新')).length,1);
});

test('boss first kill guarantees legendary, later kills have rare floor and grant the configured XP', () => {
  const storage = memory(); const game = createGame(storage);
  game.act('activity','boss');
  game.state.rng = 1; game.state.boss.hp = 1; game.tick(0.01);
  let reward = game.eventsSince().find(e=>e.type==='loot');
  assert.equal(reward.item.rarity,'legendary');
  assert.equal(reward.xp,BALANCE.bossXp);
  game.save();
  const restored = createGame(storage);
  restored.state.rng = 1; restored.state.boss.hp = 1; restored.tick(0.01);
  reward = restored.eventsSince().find(e=>e.type==='loot');
  assert.equal(reward.item.rarity,'rare');
  assert.equal(restored.state.boss.kills,2);
  assert.ok(!restored.state.logs[0].includes('首次击败'));
});

test('forge quote is pure, detached and computes fixed per-rank costs', () => {
  const storage = memory(); const game = createGame(storage);
  game.state.shards = 500; game.state.gold = 5000; game.save();
  const item = game.state.equipment.weapon, serialized = JSON.stringify(game.state), saved = storage.getItem(SAVE_KEY);
  const quote = game.forgeQuote(item.id);
  assert.equal(quote.rank,0); assert.equal(quote.maxRank,5);
  assert.equal(quote.costShards,20); assert.equal(quote.costGold,320);
  assert.equal(quote.bonusAfter,item.bonus+3); assert.equal(quote.canForge,true);
  quote.item.bonus = -1; quote.item.affixes[0] = 'caller change';
  assert.equal(JSON.stringify(game.state),serialized);
  assert.equal(storage.getItem(SAVE_KEY),saved);
  assert.equal(game.forgeQuote('missing').canForge,false);
  assert.equal(game.forgeQuote('missing').item,null);
});

test('forge atomically improves equipped affinity and preserves identity, base properties and RNG', () => {
  const storage = memory(); const game = createGame(storage);
  game.state.shards = 100; game.state.gold = 2000;
  const item = game.state.equipment.weapon;
  const reference = item, before = { ...item,affixes:[...item.affixes] }, stats = game.stats(), rng = game.state.rng, sequence = game.state.sequence, progress = game.state.progress;
  const message = game.act('forge',item.id);
  assert.match(message,/精炼至 1 阶/);
  assert.equal(game.state.shards,80); assert.equal(game.state.gold,1680);
  assert.equal(item.bonus,before.bonus+3); assert.equal(item.forgeRank,1);
  assert.equal(game.state.equipment.weapon,reference);
  assert.equal(game.state.inventory.find(i=>i.id===item.id),reference);
  for(const key of ['id','rarity','element','power','value']) assert.equal(item[key],before[key]);
  assert.equal(game.state.rng,rng); assert.equal(game.state.sequence,sequence); assert.equal(game.state.progress,progress);
  assert.ok(game.stats().dps>stats.dps);
  assert.equal(item.affixes[0],`+${item.bonus}% 物理伤害`);
  const restored = createGame(storage);
  assert.equal(restored.state.equipment.weapon.forgeRank,1);
  assert.equal(restored.state.equipment.weapon.bonus,item.bonus);
  assert.equal(restored.state.equipment.weapon,restored.state.inventory.find(i=>i.id===item.id));
});

test('stale forge quotes cannot bypass resource, lock, rank or ownership checks', () => {
  const game = createGame(memory()); game.state.gold=10000;game.state.shards=1000;
  const id = game.state.equipment.weapon.id;
  assert.equal(game.forgeQuote(id).canForge,true);
  game.state.shards=19;
  let before=JSON.stringify(game.state); assert.match(game.act('forge',id),/余烬不足/); assert.equal(JSON.stringify(game.state),before);
  game.state.shards=1000;game.state.gold=319;
  before=JSON.stringify(game.state); assert.match(game.act('forge',id),/金币不足/); assert.equal(JSON.stringify(game.state),before);
  game.state.gold=10000;game.act('lock',id);
  before=JSON.stringify(game.state); assert.match(game.act('forge',id),/锁定/); assert.equal(JSON.stringify(game.state),before);
  game.act('lock',id);
  for(let i=0;i<5;i++) game.act('forge',id);
  assert.equal(game.state.equipment.weapon.forgeRank,5);
  const quote=game.forgeQuote(id);assert.equal(quote.canForge,false);assert.equal(quote.bonusAfter,quote.bonusBefore);
  before=JSON.stringify(game.state);assert.match(game.act('forge',id),/上限/);assert.equal(JSON.stringify(game.state),before);
});

test('vault forging works without equipping while pending and listed items cannot forge', () => {
  const game=createGame(memory());game.state.shards=500;game.state.gold=10000;
  game.state.vault.push(testItem(game,'stored-forge',{forgeRank:2,bonus:30}));
  const equippedId=game.state.equipment.weapon.id;
  const quote=game.forgeQuote('stored-forge');assert.equal(quote.costShards,80);assert.equal(quote.costGold,1280);
  game.act('forge','stored-forge');
  assert.equal(game.state.vault[0].bonus,33);assert.equal(game.state.vault[0].forgeRank,3);
  assert.equal(game.state.equipment.weapon.id,equippedId);
  game.state.pendingLoot=testItem(game,'pending-forge');game.state.running=false;
  assert.match(game.forgeQuote('pending-forge').reason,/待处理/);
  assert.equal(game.forgeQuote('pending-forge').canForge,false);
  game.act('list','frost-wand');
  assert.match(game.forgeQuote('frost-wand').reason,/挂单/);
  assert.equal(game.forgeQuote('frost-wand').canForge,false);
});

test('missing forge ranks migrate to zero and malformed ranks normalize without losing items', () => {
  const storage=memory();createGame(storage);
  const raw=JSON.parse(storage.getItem(SAVE_KEY));
  delete raw.inventory[0].forgeRank;raw.inventory[1].forgeRank=999;raw.inventory[2].forgeRank=-4;raw.inventory[3].forgeRank=2.4;
  raw.inventory[4].forgeRank=3;raw.inventory[4].locked=true;
  storage.setItem(SAVE_KEY,JSON.stringify(raw));
  const game=createGame(storage);
  assert.deepEqual(game.state.inventory.slice(0,5).map(i=>i.forgeRank),[0,5,0,0,3]);
  assert.equal(game.state.inventory[4].locked,true);assert.equal(game.state.inventory.length,8);
});

test('refined equipment produces equivalent online and offline-size simulation results', () => {
  const storage=memory();const batch=createGame(storage);batch.state.shards=100;batch.state.gold=5000;
  batch.act('forge',batch.state.equipment.weapon.id);
  batch.act('build','frenzy');batch.act('activity','boss');batch.save();
  const copy=memory();copy.setItem(SAVE_KEY,storage.getItem(SAVE_KEY));const small=createGame(copy);
  batch.tick(900);for(let i=0;i<300;i++)small.tick(3);
  for(const key of ['level','xp','gold','shards','rng','sequence'])assert.equal(batch.state[key],small.state[key],key);
  assert.deepEqual(batch.state.inventory,small.state.inventory);assert.deepEqual(batch.state.vault,small.state.vault);
  assert.ok(Math.abs(batch.state.boss.hp-small.state.boss.hp)<1e-6);
});

test('forge cannot push a valid legacy affinity past the save schema limit', () => {
  const storage=memory();const game=createGame(storage);
  game.state.gold=10000;game.state.shards=100;game.state.level=77;
  const item=game.state.equipment.weapon;item.bonus=1e7;
  const before=JSON.stringify(game.state);
  assert.equal(game.forgeQuote(item.id).canForge,false);
  assert.match(game.act('forge',item.id),/亲和.*上限/);
  assert.equal(JSON.stringify(game.state),before);
  game.save();const restored=createGame(storage);
  assert.equal(restored.state.level,77);assert.equal(restored.state.gold,10000);
  assert.equal(restored.state.equipment.weapon.bonus,1e7);
  assert.equal(restored.state.inventory.length,game.state.inventory.length);
});

test('ordinary legendary chance stays capped even for high-level legacy magic find', () => {
  const game=createGame(memory());game.state.level=10000;game.state.rng=901;
  assert.ok(BALANCE.normalLegendaryBase+game.stats().magicFind/BALANCE.magicFindDivisor>BALANCE.normalLegendaryCap);
  // This seed's ordinary rarity roll is 0.01961258: above the 1.5% cap.
  game.tick(game.stats().huntSeconds);
  const reward=game.eventsSince().find(e=>e.type==='loot');
  assert.equal(reward.item.rarity,'rare');
});

test('one-time migration notice survives long offline log churn but never replays on next load', () => {
  const storage=memory();const fresh=createGame(storage);
  assert.equal(fresh.state.balanceMigrationNotice,'');
  const raw=JSON.parse(storage.getItem(SAVE_KEY));
  delete raw.balanceVersion;
  raw.savedAt=Date.now()-8*3600000;
  raw.balanceMigrationNotice='untrusted stale notice';
  storage.setItem(SAVE_KEY,JSON.stringify(raw));
  const migrated=createGame(storage);
  assert.ok(migrated.state.kills>100);
  assert.match(migrated.state.balanceMigrationNotice,/成长节奏已更新/);
  assert.ok(!migrated.state.balanceMigrationNotice.includes('untrusted'));
  assert.ok(migrated.state.logs.length<=30);
  const reopened=createGame(storage);
  assert.equal(reopened.state.balanceMigrationNotice,'');
  storage.setItem(SAVE_KEY,JSON.stringify({version:1,balanceMigrationNotice:'bad',inventory:[{invalid:true}]}));
  assert.equal(createGame(storage).state.balanceMigrationNotice,'');
});

test('depth zero keeps the original hunt formula and old saves default to zero', () => {
  const game=createGame(memory());
  assert.equal(game.state.depth,0);
  const s=game.stats(), recovery=(1.12-Math.min(.2,s.defense/800))*(1-s.damageReduction*.5);
  assert.equal(s.huntSeconds,Math.max(3.5,Math.min(14,8*108/Math.max(35,s.effectiveDps*(1+s.areaBonus))*recovery)));
  assert.equal(s.huntBaseXp,18);assert.equal(s.huntBaseGold,17);assert.equal(s.lootPowerBonus,0);
  for(const value of [undefined,-1,1.5,99,'2',NaN,5]){
    const raw=JSON.parse(JSON.stringify(game.state));raw.depth=value;raw.savedAt=Date.now();
    const storage=memory();storage.setItem(SAVE_KEY,JSON.stringify(raw));
    assert.equal(createGame(storage).state.depth,0);
  }
  game.state.level=26;game.act('depth','2');game.save();
  const storage=memory();storage.setItem(SAVE_KEY,JSON.stringify(game.state));
  assert.equal(createGame(storage).state.depth,2);
});

test('expedition quotes are pure and validate both depth and zone unlocks', () => {
  const storage=memory(),game=createGame(storage);const before=JSON.stringify(game.state),saved=storage.getItem(SAVE_KEY);
  for(const depth of [-1,1.5,6,'1',null,NaN])assert.equal(game.expeditionQuote(depth).unlocked,false);
  assert.equal(game.expeditionQuote(1).unlocked,false);assert.equal(game.expeditionQuote(0,'marsh').unlocked,false);
  assert.equal(game.expeditionQuote(0,'missing').unlocked,false);
  game.expeditionQuote(0).huntSeconds=-1;
  assert.equal(JSON.stringify(game.state),before);assert.equal(storage.getItem(SAVE_KEY),saved);
  game.state.level=26;const q=game.expeditionQuote(2,'marsh');assert.equal(q.unlocked,true);
  game.act('zone','marsh');game.act('depth','2');
  assert.equal(q.huntSeconds,game.stats().huntSeconds);assert.equal(q.huntXpPerHour,game.stats().huntXpPerHour);
});

test('depth switching clears partial rounds and preserves manual pause; pending loot blocks it', () => {
  const game=createGame(memory());game.state.level=50;game.tick(game.stats().huntSeconds*.9);
  const kills=game.state.kills,id=game.combat().id;game.act('pause');game.act('depth','2');
  assert.equal(game.state.progress,0);assert.notEqual(game.combat().id,id);assert.equal(game.state.running,false);assert.equal(game.state.pauseReason,'manual');
  game.tick(100);assert.equal(game.state.kills,kills);
  game.act('pause');game.tick(game.stats().huntSeconds*.2);assert.equal(game.state.kills,kills);
  const sameRound=game.combat().id,sameProgress=game.state.progress;
  assert.match(game.act('depth','2'), /已在/);assert.equal(game.combat().id,sameRound);assert.equal(game.state.progress,sameProgress);
  const validDepth=game.state.depth;
  for(const value of ['','02','2.0','5foo','-1',6,NaN,null]){game.act('depth',value);assert.equal(game.state.depth,validDepth);}
  game.act('zone','crypt');assert.equal(game.state.depth,2);
  game.act('activity','fish');game.act('pause');game.act('depth','1');assert.equal(game.state.activity,'hunt');assert.equal(game.state.running,false);
  game.state.pendingLoot=testItem(game,'pending-depth',{rarity:'legendary'});const serial=game.state.encounterSerial;
  game.act('depth','3');assert.equal(game.state.depth,1);assert.equal(game.state.encounterSerial,serial);assert.equal(game.state.pauseReason,'lootProtection');
  const low=createGame(memory());low.act('depth','1');assert.equal(low.state.depth,0);
});

test('deep hunt scales authoritative HP and rewards while preserving drop rolls and rarity', () => {
  const shallow=createGame(memory()),deep=createGame(memory());
  for(const g of [shallow,deep]){g.state.level=50;g.state.rng=1;g.act('zone','marsh');}
  deep.act('depth','5');
  assert.equal(deep.combat().monster.maxHp,shallow.combat().monster.maxHp*27);
  const gold=deep.state.gold;const xp=deep.state.xp;const hp=deep.combat().monster.maxHp;
  for(const g of [shallow,deep])g.tick(g.stats().huntSeconds);
  const hits=deep.eventsSince().filter(e=>e.type==='hit');assert.equal(hits.length,3);
  assert.equal(hits.reduce((sum,e)=>sum+e.damage,0),hp);assert.ok(hits.every(e=>e.maxHp===hp));
  assert.equal(deep.state.gold-gold,45*3.5);assert.equal(deep.state.xp-xp,39*3.5);
  const event=deep.eventsSince().find(e=>e.type==='loot');assert.equal(event.gold,45*3.5);assert.equal(event.xp,39*3.5);
  assert.equal(deep.state.rng,shallow.state.rng);
  const low=shallow.state.inventory.filter(i=>i.id.startsWith('drop-')),high=deep.state.inventory.filter(i=>i.id.startsWith('drop-'));
  assert.equal(low.length,high.length);assert.ok(high.length>0);
  for(let i=0;i<low.length;i++){assert.equal(low[i].rarity,high[i].rarity);assert.equal(low[i].bonus,high[i].bonus);assert.equal(low[i].element,high[i].element);assert.ok(Math.abs(high[i].power-low[i].power-15*({magic:1,rare:1.5,legendary:2.2}[low[i].rarity]))<=1);}
});

test('boss and fishing rewards, RNG and drops do not inherit hunt depth', () => {
  for(const activity of ['boss','fish']){
    const a=createGame(memory()),b=createGame(memory());
    for(const g of [a,b]){g.state.level=50;g.act('zone','marsh');}
    b.act('depth','5');
    for(const g of [a,b]){g.act('activity',activity);assert.equal(g.stats().lootPowerBonus,0);g.tick(400);}
    for(const key of ['gold','xp','rng','fish','boss','inventory','vault'])assert.deepEqual(a.state[key],b.state[key]);
  }
});

test('deep online ticks and offline restoration settle the same rewards without replay', () => {
  const storage=memory(),seed=createGame(storage);seed.state.level=50;seed.act('zone','marsh');seed.act('depth','5');seed.save();
  const raw=JSON.parse(storage.getItem(SAVE_KEY));
  const a=createGame(storage);for(let i=0;i<600;i++)a.tick(1);
  const clock=Date.now;const now=clock();try{
    Date.now=()=>now;raw.savedAt=now-600000;const offlineStorage=memory();offlineStorage.setItem(SAVE_KEY,JSON.stringify(raw));
    const b=createGame(offlineStorage);
    for(const key of ['kills','gold','xp','rng','inventory','vault','depth'])assert.deepEqual(a.state[key],b.state[key]);
    assert.ok(Math.abs(a.state.progress-b.state.progress)<1e-8);assert.deepEqual(b.eventsSince(),[]);
  }finally{Date.now=clock;}
});

test('stronger matching weapon and affinity improve high-depth actual clear efficiency', () => {
  const game=createGame(memory());game.state.level=50;game.act('zone','marsh');game.act('depth','5');
  for(const i of Object.values(game.state.equipment))Object.assign(i,{power:97,bonus:18,element:'physical',rarity:'rare'});
  for(const id of ['whirlwind','weaponMastery','bash'])for(let n=0;n<10;n++)game.act('train',id);
  const base=game.stats();assert.ok(base.huntSeconds>3.5&&base.huntSeconds<30);
  for(const [field,amount]of [['bonus',3],['power',20]]){
    const after=game.stats({...game.state.equipment,weapon:{...game.state.equipment.weapon,[field]:game.state.equipment.weapon[field]+amount}});
    assert.ok(after.huntSeconds<base.huntSeconds);assert.ok(after.huntXpPerHour>base.huntXpPerHour);
  }
});
