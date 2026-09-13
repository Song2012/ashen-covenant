import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, SAVE_KEY } from './engine.js';

const memory = () => { const data = new Map(); return { getItem: k => data.get(k) || null, setItem: (k, v) => data.set(k, v) }; };

test('automatic combat grants loot, experience and levels; equipment changes build damage', () => {
  const game = createGame(memory());
  const initial = game.stats().dps;
  game.tick(240);
  assert.ok(game.state.kills >= 10);
  assert.ok(game.state.level > 1);
  assert.ok(game.state.gold > 1280);
  assert.ok(game.state.inventory.length > 8);
  game.act('class', 'witch');
  const unaligned = game.stats().dps;
  game.act('equip', 'frost-wand');
  assert.ok(game.stats().dps > unaligned);
  assert.ok(initial > 0);
  game.act('zone', 'crypt');
  assert.equal(game.stats().zoneResistance, 0.3);
  assert.ok(game.stats().effectiveDps < game.stats().dps);
  game.act('build', 'storm');
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

test('steel build converts defense into damage; other builds do not', () => {
  const game = createGame(memory());
  game.act('equip', 'storm-coat');
  const emberWithArmor = game.stats().dps;
  const armor = game.state.equipment.armor;
  game.state.equipment.armor = null;
  assert.equal(game.stats().dps, emberWithArmor);
  game.act('build', 'steel');
  const steelWithoutArmor = game.stats().dps;
  const defenseWithoutArmor = game.stats().defense;
  game.state.equipment.armor = armor;
  assert.ok(game.stats().dps > steelWithoutArmor);
  assert.equal(game.stats().defense - defenseWithoutArmor, armor.power * 3);
  assert.ok(Math.abs(game.stats().dps - steelWithoutArmor - armor.power * 3 * 0.35) <= 1);
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
