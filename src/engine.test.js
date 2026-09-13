import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, SAVE_KEY, CLASSES } from './engine.js';

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
