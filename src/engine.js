import { getMonster } from './encounters.js';

const HIT_FRACTIONS = [0.25, 0.52, 0.8];
const HP_FRACTIONS = [1, 0.7, 0.38, 0];
const hitCount = progress => HIT_FRACTIONS.filter(p => progress >= p - 1e-10).length;
const monsterHp = (maxHp, attackIndex) => Math.round(maxHp * HP_FRACTIONS[attackIndex]);
const skill = (id, name, desc) => ({ id, name, desc, maxRank: 10 });
export const CLASSES = [
  { id: 'barbarian', name: '野蛮人', subtitle: '战斗技能 · 战斗专家 · 呐喊',
    builds: [
      { id: 'whirlwind', name: '旋风', desc: '自动旋转清剿成群敌人，以物理装备与武器支配强化近战。', element: 'physical', role: '群体清场', skills: ['大叫', '旋风', '重击'], mechanic: '基础范围效率 +40%；范围效率提高打宝速度，不提高首领伤害。' },
      { id: 'frenzy', name: '狂乱', desc: '持续战斗积蓄狂乱，越战越快，适合长时间自动讨伐。', element: 'physical', role: '持续单体', skills: ['战斗体制', '狂乱', '重击'], mechanic: '每轮打宝或每 4 秒首领战获得 1 层狂乱，每层攻速 +10%，最多 5 层；切换流派或活动清空。' },
      { id: 'warcry', name: '战吼', desc: '以护甲支持自动战吼，造成魔法伤害，兼顾休整效率与寻宝。', element: 'magic', role: '防御寻宝', skills: ['大叫', '战斗体制', '战吼'], mechanic: '防御值的 45% 加入基础伤害，寻宝加成额外 +25 个百分点；魔法亲和强化输出，物理支配不强化战吼。' },
    ],
    trees: [
      { id: 'combat', name: '战斗技能', desc: '选择主攻技能，塑造清场与首领效率。', skills: [skill('whirlwind', '旋风', '每级：旋风流派伤害 +8%，范围效率 +3 个百分点。'), skill('frenzy', '狂乱', '每级：狂乱流派伤害 +6%，攻速 +2 个百分点。'), skill('bash', '重击', '每级：旋风、狂乱流派物理伤害 +4%；不强化魔法战吼。')] },
      { id: 'mastery', name: '战斗专家', desc: '物理攻击、防御与抗性的常驻被动。', skills: [skill('weaponMastery', '武器支配', '每级：旋风、狂乱流派物理伤害 +5%；不强化魔法战吼。'), skill('ironSkin', '铁布衫', '每级：所有野蛮人流派防御 +8%。'), skill('naturalResistance', '自然抵抗', '每级：所有野蛮人流派减伤 +2 个百分点；减伤减少清剿休整时间。')] },
      { id: 'warcries', name: '呐喊', desc: '增益自动维持，战吼以护甲支持输出。', skills: [skill('shout', '大叫', '每级：所有野蛮人流派防御 +6%。'), skill('battleOrders', '战斗体制', '每级：所有野蛮人流派减伤 +2 个百分点；减伤减少清剿休整时间。'), skill('warCry', '战吼', '每级：战吼流派伤害 +8%，寻宝加成 +1 个百分点。')] },
    ],
  },
  { id: 'sorceress', name: '法师', subtitle: '火焰法术 · 冰冷法术 · 闪电法术',
    builds: [
      { id: 'fireball', name: '火球', desc: '火弹协同火球，由火焰支配强化对首领的持续轰击。', element: 'fire', role: '首领爆发', skills: ['火弹', '火球', '火焰支配'], mechanic: '对首领伤害额外 +35%；仅火焰系技能强化此流派。' },
      { id: 'blizzard', name: '暴风雪', desc: '自动铺设寒霜领域，削弱冰抗并降低战斗中的休整损耗。', element: 'frost', role: '抗性穿透', skills: ['冰弹', '暴风雪', '冰冷支配'], mechanic: '基础范围效率 +15%，减伤 +10 个百分点，冰抗穿透 10 个百分点；冰冷支配进一步削弱冰抗。' },
      { id: 'chainlightning', name: '连锁闪电', desc: '闪电在敌群间自动跃迁，以范围效率换取更快的打宝循环。', element: 'lightning', role: '连锁清场', skills: ['充能弹', '连锁闪电', '闪电支配'], mechanic: '基础范围效率 +50%；连锁范围只提高打宝速度，不增加首领伤害。' },
    ],
    trees: [
      { id: 'fire', name: '火焰法术', desc: '强化火球伤害与首领输出。', skills: [skill('fireBolt', '火弹', '每级：火球流派伤害 +4%。'), skill('fireBall', '火球', '每级：火球流派伤害 +8%。'), skill('fireMastery', '火焰支配', '每级：火球流派伤害 +6%，首领伤害加成 +1 个百分点。')] },
      { id: 'cold', name: '冰冷法术', desc: '寒霜协同与冰冷抗性穿透。', skills: [skill('iceBolt', '冰弹', '每级：暴风雪流派伤害 +4%。'), skill('blizzard', '暴风雪', '每级：暴风雪流派伤害 +8%，范围效率 +2 个百分点。'), skill('coldMastery', '冰冷支配', '每级：暴风雪流派伤害 +3%，冰抗穿透 +2 个百分点；抗性最低降至 0%。')] },
      { id: 'lightning', name: '闪电法术', desc: '链式打击与大范围寻宝。', skills: [skill('chargedBolt', '充能弹', '每级：连锁闪电流派伤害 +4%。'), skill('chainLightning', '连锁闪电', '每级：连锁闪电流派伤害 +8%，范围效率 +3 个百分点。'), skill('lightningMastery', '闪电支配', '每级：连锁闪电流派伤害 +6%。')] },
    ],
  },
];

export const ZONES = [
  { id: 'grave', name: '遗忘墓园', subtitle: '断碑下，旧日仍在低语', level: 1, element: 'shadow', seconds: 8 },
  { id: 'crypt', name: '霜痕地窖', subtitle: '永冻长廊藏着失落秘宝', level: 3, element: 'frost', seconds: 9 },
  { id: 'furnace', name: '余烬熔炉', subtitle: '以烈火守望黄金时代', level: 5, element: 'fire', seconds: 10 },
  { id: 'marsh', name: '腐月沼泽', subtitle: '幽绿水面映出另一轮月', level: 8, element: 'poison', seconds: 12 },
];

export const SAVE_KEY = 'ashen-covenant-save-v1';
export const DEPTHS = Object.freeze([1, 2.6, 6.76, 12, 18, 27].map((budget, id) => Object.freeze({ id, name: id === 0 ? '表层' : `深层 ${id}`, level: [1, 10, 20, 30, 40, 50][id], budget, rewardMultiplier: 1 + 0.5 * id, powerBonus: 3 * id })));
export const BALANCE = Object.freeze({ version: 1, xpQuadratic: 24, bossLegendaryChance: 0.08, bossXp: 180, normalLegendaryBase: 0.006, magicFindDivisor: 6000, normalLegendaryCap: 0.015 });
const levelExperience = level => 80 + level * 35 + BALANCE.xpQuadratic * level ** 2;
export const INVENTORY_CAPACITY = 60;
export const VAULT_CAPACITY = 120;
const ELEMENT_NAMES = { fire: '火焰', frost: '冰霜', lightning: '闪电', physical: '物理', poison: '毒素', shadow: '暗影', magic: '魔法' };
const SLOTS = ['weapon', 'armor', 'ring'];
const ELEMENTS = Object.keys(ELEMENT_NAMES);
const cloneItem = item => item ? { ...item, locked: item.locked === true, forgeRank: Number.isInteger(item.forgeRank) ? Math.max(0, Math.min(5, item.forgeRank)) : 0, affixes: [...item.affixes] } : null;
const itemValid = (i) => i && typeof i.id === 'string' && typeof i.name === 'string' && SLOTS.includes(i.slot) && ['magic', 'rare', 'legendary'].includes(i.rarity) && ELEMENTS.includes(i.element) && ['power', 'bonus', 'value'].every(k => Number.isFinite(i[k]) && i[k] >= 0 && i[k] <= 1e7) && Array.isArray(i.affixes) && i.affixes.every(x => typeof x === 'string');
const initialItems = () => [
  ['ember-blade', '山脊战斧', 'weapon', 'rare', 22, 'physical', 18, 160],
  ['iron-mail', '守墓者锁甲', 'armor', 'magic', 15, 'physical', 8, 80],
  ['cinder-ring', '铁誓指环', 'ring', 'magic', 5, 'physical', 12, 70],
  ['frost-wand', '霜语之杖', 'weapon', 'rare', 25, 'frost', 22, 190],
  ['bone-scythe', '疫骨镰', 'weapon', 'rare', 26, 'poison', 24, 210],
  ['ghost-ring', '亡者的回信', 'ring', 'legendary', 10, 'shadow', 30, 480],
  ['storm-coat', '风暴遗衣', 'armor', 'rare', 21, 'lightning', 20, 170],
  ['iron-maul', '破晓重锤', 'weapon', 'rare', 28, 'physical', 18, 180],
].map(([id, name, slot, rarity, power, element, bonus, value]) => ({ id, name, slot, rarity, power, element, bonus, value, locked: false, forgeRank: 0, affixes: [`+${bonus}% ${ELEMENT_NAMES[element]}伤害`, `+${power} ${slot === 'armor' ? '护甲' : '力量'}`] }));

function freshState() {
  const inventory = initialItems();
  return { version: 1, balanceVersion: BALANCE.version, classId: 'barbarian', buildId: 'whirlwind', talents: { barbarian: {}, sorceress: {} }, combatStacks: 0, combatStackProgress: 0, simTime: 0, eventSequence: 0, encounterSerial: 0, bossPulseProgress: 0, bossPulseDamage: 0, bossPulseAllyDamage: 0, bossAttackIndex: 0, level: 1, xp: 0, gold: 1280, shards: 12, activity: 'hunt', depth: 0, zoneId: 'grave', running: true, pauseReason: null, progress: 0, kills: 0, fish: 0, boss: { hp: 28000, maxHp: 28000, contribution: 0, kills: 0 }, inventory, vault: [], pendingLoot: null, equipment: { weapon: inventory[0], armor: inventory[1], ring: inventory[2] }, listings: [
    { id: 'market-1', owner: 'market', price: 720, item: { ...inventory[5], id: 'market-ghost', name: '暮钟指环' } },
    { id: 'market-2', owner: 'market', price: 350, item: { ...inventory[3], id: 'market-frost', name: '冬眠枝杖' } },
    { id: 'market-3', owner: 'market', price: 420, item: { ...inventory[6], id: 'market-storm', name: '碎星长衣' } },
  ], logs: ['灰烬契约已缔结。你的角色开始自动探索遗忘墓园。'], balanceMigrationNotice: '', offlineSummary: '', savedAt: Date.now(), rng: 184731, sequence: 20 };
}

function restore(raw) {
  const s = freshState();
  if (!raw || raw.version !== 1 || !Array.isArray(raw.inventory) || raw.inventory.length > INVENTORY_CAPACITY || !raw.inventory.every(itemValid)) return s;
  for (const k of ['level', 'xp', 'gold', 'shards', 'kills', 'fish', 'savedAt', 'rng', 'sequence']) if (Number.isFinite(raw[k]) && raw[k] >= 0) s[k] = Math.min(raw[k], Number.MAX_SAFE_INTEGER);
  s.level = Math.max(1, Math.floor(s.level));
  const migrateBalance = !Number.isInteger(raw.balanceVersion) || raw.balanceVersion < BALANCE.version;
  if (migrateBalance) s.xp = Math.min(levelExperience(s.level) - 1, Math.floor(Math.max(0, Math.min(1, s.xp / (80 + s.level * 35))) * levelExperience(s.level)));
  s.rng = s.rng >>> 0;
  for (const key of ['simTime', 'eventSequence', 'encounterSerial', 'bossPulseDamage', 'bossPulseAllyDamage', 'bossAttackIndex']) if (Number.isFinite(raw[key]) && raw[key] >= 0) s[key] = Math.min(raw[key], Number.MAX_SAFE_INTEGER);
  for (const key of ['eventSequence', 'encounterSerial', 'bossAttackIndex']) s[key] = Math.floor(s[key]);
  s.bossPulseProgress = Number.isFinite(raw.bossPulseProgress) ? Math.max(0, Math.min(0.999999999, raw.bossPulseProgress)) : 0;
  const legacy = { knight: { classId: 'barbarian', buildId: raw.buildId === 'steel' ? 'warcry' : 'whirlwind' }, witch: { classId: 'sorceress', buildId: raw.buildId === 'storm' ? 'chainlightning' : 'blizzard' }, reaper: { classId: 'sorceress', buildId: 'fireball' } }[raw.classId];
  s.classId = legacy?.classId || (CLASSES.some(c => c.id === raw.classId) ? raw.classId : s.classId);
  const cls = CLASSES.find(c => c.id === s.classId);
  s.buildId = legacy?.buildId || (cls.builds.some(b => b.id === raw.buildId) ? raw.buildId : cls.builds[0].id);
  for (const profession of CLASSES) {
    let remaining = s.level + 2;
    for (const talent of profession.trees.flatMap(t => t.skills)) {
      const stored = raw.talents?.[profession.id]?.[talent.id];
      if (!Number.isInteger(stored) || stored <= 0) continue;
      const rank = Math.min(talent.maxRank, stored, remaining);
      if (rank > 0) s.talents[profession.id][talent.id] = rank;
      remaining -= rank;
    }
  }
  if (s.buildId === 'frenzy') {
    s.combatStacks = Number.isInteger(raw.combatStacks) ? Math.max(0, Math.min(5, raw.combatStacks)) : 0;
    s.combatStackProgress = Number.isFinite(raw.combatStackProgress) ? Math.max(0, Math.min(3.999999, raw.combatStackProgress)) : 0;
  }
  s.zoneId = ZONES.some(z => z.id === raw.zoneId && z.level <= s.level) ? raw.zoneId : 'grave';
  s.depth = Number.isInteger(raw.depth) && DEPTHS.some(d => d.id === raw.depth && d.level <= s.level) ? raw.depth : 0;
  s.activity = ['hunt', 'fish', 'boss'].includes(raw.activity) ? raw.activity : 'hunt';
  s.running = typeof raw.running === 'boolean' ? raw.running : true;
  s.progress = Number.isFinite(raw.progress) ? Math.max(0, Math.min(0.999999, raw.progress)) : 0;
  const seen = new Set(), listingIds = new Set();
  let repaired = 0;
  const candidates = [...raw.inventory, ...(Array.isArray(raw.vault) ? raw.vault : []), raw.pendingLoot, ...(Array.isArray(raw.listings) ? raw.listings.map(l => l?.item) : [])];
  const lockedIds = new Set(candidates.filter(i => itemValid(i) && i.locked === true).map(i => i.id));
  const take = item => {
    if (!itemValid(item) || seen.has(item.id)) { repaired++; return null; }
    seen.add(item.id);
    return { ...cloneItem(item), locked: lockedIds.has(item.id) };
  };
  s.inventory = raw.inventory.map(take).filter(Boolean);
  s.pendingLoot = raw.pendingLoot ? take(raw.pendingLoot) : null;
  if (Array.isArray(raw.vault)) for (const entry of raw.vault) {
    const item = take(entry); if (!item) continue;
    if (s.vault.length < VAULT_CAPACITY) s.vault.push(item);
    else if (s.inventory.length < INVENTORY_CAPACITY) s.inventory.push(item);
    else if (!s.pendingLoot) s.pendingLoot = item;
    else repaired++;
  }
  for (const slot of SLOTS) s.equipment[slot] = s.inventory.find(i => i.id === raw.equipment?.[slot]?.id && i.slot === slot) || null;
  s.listings = (Array.isArray(raw.listings) ? raw.listings : s.listings).filter(l => l && typeof l.id === 'string' && ['you', 'market'].includes(l.owner) && itemValid(l.item) && Number.isFinite(l.price) && l.price > 0).slice(0, 80).flatMap(l => {
    if (listingIds.has(l.id)) { repaired++; return []; }
    const item = take(l.item); if (!item) return [];
    listingIds.add(l.id); return [{ ...l, item }];
  });
  for (const item of [...s.inventory, ...s.vault, ...(s.pendingLoot ? [s.pendingLoot] : []), ...s.listings.map(l => l.item)]) {
    const match = /^drop-(\d+)$/.exec(item.id);
    if (match) s.sequence = Math.max(s.sequence, Number(match[1]));
  }
  for (const listing of s.listings) {
    const match = /^listing-(\d+)$/.exec(listing.id);
    if (match) s.sequence = Math.max(s.sequence, Number(match[1]));
  }
  if (s.pendingLoot) { s.running = false; s.pauseReason = 'lootProtection'; }
  else s.pauseReason = s.running ? null : 'manual';
  if (raw.boss && ['hp', 'maxHp', 'contribution', 'kills'].every(k => Number.isFinite(raw.boss[k]) && raw.boss[k] >= 0) && raw.boss.maxHp > 0) s.boss = { hp: Math.min(raw.boss.hp, raw.boss.maxHp), maxHp: raw.boss.maxHp, contribution: raw.boss.contribution, kills: raw.boss.kills };
  if (Array.isArray(raw.logs)) s.logs = raw.logs.filter(x => typeof x === 'string').slice(0, 30);
  if (migrateBalance) {
    s.balanceMigrationNotice = `成长节奏已更新：保留 ${s.level} 级，当前等级经验按原完成比例换算；财富、装备与技能分配保持不变。`;
    s.logs = [s.balanceMigrationNotice, ...s.logs].slice(0, 30);
  }
  if (repaired) s.logs = [`已校验存档装备：合并重复物品，忽略 ${repaired} 条重复或无效记录；超出合法容量的异常记录未载入。`, ...s.logs].slice(0, 30);
  if (legacy) s.logs = [`旧契约已迁移为${cls.name}·${cls.builds.find(b => b.id === s.buildId).name}；等级、装备、货币与挂单完整保留，可免费分配技能点。`, ...s.logs].slice(0, 30);
  return s;
}

export function createGame(storage) {
  if (storage === undefined) {
    try { storage = globalThis.localStorage; } catch { storage = null; }
  }
  let state = freshState();
  try { const raw = storage?.getItem(SAVE_KEY); if (raw) state = restore(JSON.parse(raw)); } catch { state.logs.unshift('本地存档无法读取，已安全建立新的旅程。'); }
  const random = () => { state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0; return state.rng / 4294967296; };
  const log = message => { state.logs.unshift(message); state.logs.length = Math.min(30, state.logs.length); return message; };
  const equipped = id => SLOTS.some(slot => state.equipment[slot]?.id === id);
  function findOwned(id) {
    const bag = state.inventory.find(item => item.id === id);
    if (bag) return { item: bag, location: 'inventory' };
    const stored = state.vault.find(item => item.id === id);
    if (stored) return { item: stored, location: 'vault' };
    return state.pendingLoot?.id === id ? { item: state.pendingLoot, location: 'pending' } : null;
  }
  function removeOwned(found) {
    if (found.location === 'pending') state.pendingLoot = null;
    else state[found.location] = state[found.location].filter(item => item.id !== found.item.id);
  }
  function protectionMessage() { return '传奇战利品等待处理：请先在行囊中安置、出售或上架待处理装备，再恢复挂机。'; }
  const events = [];
  let suppressEvents = false, lastReward = null;
  const encounterId = () => `${state.activity}:${state.zoneId}:${state.encounterSerial}:${state.activity === 'boss' ? state.boss.kills : state.activity === 'fish' ? state.fish : state.kills}`;
  function emit(type, data = {}) {
    const event = { id: ++state.eventSequence, type, time: state.simTime, encounterId: encounterId(), activity: state.activity, buildId: state.buildId, ...data, ...(data.item ? { item: cloneItem(data.item) } : {}) };
    if (!suppressEvents) { events.push(event); if (events.length > 32) events.shift(); }
    return event;
  }
  function eventsSince(id = 0) {
    // Callers receive detached snapshots and cannot mutate authoritative state.
    return events.filter(event => event.id > id).map(event => ({ ...event, ...(event.item ? { item: { ...event.item, affixes: [...event.item.affixes] } } : {}) }));
  }
  function huntMonster() {
    const monster = getMonster(state.zoneId, state.kills);
    monster.maxHp = Math.round(monster.maxHp * DEPTHS[state.depth].budget);
    return monster;
  }
  function combat() {
    const id = encounterId();
    const progress = state.activity === 'boss' ? 1 - state.boss.hp / state.boss.maxHp : state.progress;
    const attackIndex = state.activity === 'hunt' ? hitCount(progress) : state.activity === 'boss' ? state.bossAttackIndex : 0;
    const monster = state.activity === 'hunt' ? huntMonster() : state.activity === 'boss' ? { id: 'boss-morlgas', name: '骸冠君王·莫尔迦斯', family: 'brute', lore: '无名者将熄灭的王冠戴回了头上。', trait: '世界首领 · 同伴为本地模拟', color: '#c19170', maxHp: state.boss.maxHp, elite: true } : null;
    if (monster) monster.hp = state.activity === 'boss' ? state.boss.hp : monsterHp(monster.maxHp, attackIndex);
    let phase = state.activity === 'fish' ? 'fishing' : state.activity === 'boss' ? 'attack' : progress < 0.15 ? 'approach' : progress < 0.8 - 1e-10 ? 'attack' : progress < 0.9 ? 'defeat' : 'loot';
    if (!state.running) phase = 'paused';
    const start = attackIndex === 0 ? 0 : HIT_FRACTIONS[attackIndex - 1];
    const attackProgress = state.activity === 'hunt' && attackIndex < 3 ? Math.max(0, Math.min(1, (progress - start) / (HIT_FRACTIONS[attackIndex] - start))) : state.activity === 'boss' ? state.bossPulseProgress : 0;
    return { id, activity: state.activity, phase, progress, monster, attackIndex, attackProgress, killCount: state.kills, bossKills: state.boss.kills, lastReward: lastReward ? { ...lastReward, ...(lastReward.item ? { item: { ...lastReward.item, affixes: [...lastReward.item.affixes] } } : {}) } : null };
  }
  function rewardEvent(data) {
    const event = emit('loot', data);
    if (!suppressEvents) lastReward = event;
  }
  function flushBossHit() {
    if (state.bossPulseDamage + state.bossPulseAllyDamage > 0) {
      state.bossAttackIndex++;
      emit('bossHit', { monsterId: 'boss-morlgas', target: '骸冠君王·莫尔迦斯', damage: state.bossPulseDamage, allyDamage: state.bossPulseAllyDamage, hp: state.boss.hp, maxHp: state.boss.maxHp, attackIndex: state.bossAttackIndex });
    }
    state.bossPulseProgress = 0; state.bossPulseDamage = 0; state.bossPulseAllyDamage = 0;
  }
  function stats(equipment = state.equipment, expedition = {}) {
    const profession = CLASSES.find(c => c.id === state.classId);
    const build = profession.builds.find(b => b.id === state.buildId);
    const talents = state.talents[state.classId];
    const rank = id => talents[id] || 0;
    const trainingSpent = Object.values(talents).reduce((sum, n) => sum + n, 0);
    const items = Object.values(equipment).filter(Boolean);
    const affinity = items.filter(i => i.element === build.element).reduce((sum, i) => sum + i.bonus, 0);
    const defense = Math.round((10 + state.level * 3 + (equipment.armor?.power || 0) * 3) * (1 + rank('ironSkin') * 0.08 + rank('shout') * 0.06));
    let damageBonus = build.element === 'physical' ? rank('weaponMastery') * 0.05 + rank('bash') * 0.04 : 0;
    let areaBonus = 0, attackSpeed = 1, bossBonus = 0, armorDamage = 0, magicFindBonus = 0;
    let resistancePenetration = 0;
    let damageReduction = rank('naturalResistance') * 0.02 + rank('battleOrders') * 0.02;
    if (build.id === 'whirlwind') { damageBonus += rank('whirlwind') * 0.08; areaBonus = 0.4 + rank('whirlwind') * 0.03; }
    if (build.id === 'frenzy') { damageBonus += rank('frenzy') * 0.06; attackSpeed = 1 + state.combatStacks * 0.1 + rank('frenzy') * 0.02; }
    if (build.id === 'warcry') { damageBonus += rank('warCry') * 0.08; armorDamage = defense * 0.45; magicFindBonus = 25 + rank('warCry'); }
    if (build.id === 'fireball') { damageBonus = rank('fireBolt') * 0.04 + rank('fireBall') * 0.08 + rank('fireMastery') * 0.06; bossBonus = 0.35 + rank('fireMastery') * 0.01; }
    if (build.id === 'blizzard') { damageBonus = rank('iceBolt') * 0.04 + rank('blizzard') * 0.08 + rank('coldMastery') * 0.03; areaBonus = 0.15 + rank('blizzard') * 0.02; damageReduction = 0.1; resistancePenetration = 0.1 + rank('coldMastery') * 0.02; }
    if (build.id === 'chainlightning') { damageBonus = rank('chargedBolt') * 0.04 + rank('chainLightning') * 0.08 + rank('lightningMastery') * 0.06; areaBonus = 0.5 + rank('chainLightning') * 0.03; }
    damageReduction = Math.min(0.6, damageReduction);
    const dps = Math.round((18 + state.level * 4 + (equipment.weapon?.power || 0) * 2 + (equipment.ring?.power || 0) + armorDamage) * (1 + affinity / 100) * (1 + damageBonus) * attackSpeed);
    const zone = ZONES.find(z => z.id === (expedition.zoneId ?? state.zoneId));
    const depth = DEPTHS[expedition.depth ?? state.depth];
    if (!zone || !depth) throw new RangeError('Invalid expedition');
    const zoneResistance = zone.element === build.element ? Math.max(0, 0.3 - resistancePenetration) : 0;
    const effectiveDps = Math.round(dps * (1 - zoneResistance));
    const bossDps = Math.round(dps * (1 + bossBonus));
    // Defense and reduction lower recovery time; no manual healing or death spiral.
    const recovery = (1.12 - Math.min(0.2, defense / 800)) * (1 - damageReduction * 0.5);
    const huntSeconds = Math.max(3.5, Math.min(depth.id === 0 ? 14 : 30, zone.seconds * (100 + zone.level * 8) / Math.max(35, effectiveDps * (1 + areaBonus)) * recovery * depth.budget));
    const huntBaseXp = (15 + zone.level * 3) * depth.rewardMultiplier;
    const huntBaseGold = (13 + zone.level * 4) * depth.rewardMultiplier;
    return { depth: depth.id, lootPowerBonus: state.activity === 'hunt' ? depth.powerBonus : 0, huntBaseXp, huntBaseGold, huntXpPerHour: huntBaseXp * 3600 / huntSeconds, huntGoldPerHour: huntBaseGold * 3600 / huntSeconds, dps, defense, magicFind: 15 + items.filter(i => i.rarity === 'legendary').length * 20 + Math.floor(state.level / 2) + magicFindBonus, xpNext: levelExperience(state.level), element: build.element, effectiveDps, zoneResistance, huntSeconds, attackSpeed, areaBonus, bossDps, damageReduction, trainingSpent, skillPoints: Math.max(0, state.level + 2 - trainingSpent), buildEffect: build.id === 'frenzy' ? `狂乱 ${state.combatStacks}/5 层 · 攻速 +${Math.round((attackSpeed - 1) * 100)}%` : build.mechanic };
  }
  function expeditionQuote(depth, zoneId = state.zoneId) {
    const entry = Number.isInteger(depth) ? DEPTHS.find(d => d.id === depth) : null;
    const zone = ZONES.find(z => z.id === zoneId);
    const reason = !entry ? '深度不存在。' : !zone ? '区域不存在。' : entry.level > state.level ? `需要达到 ${entry.level} 级才能进入。` : zone.level > state.level ? `需要达到 ${zone.level} 级才能进入。` : '';
    if (!entry || !zone) return { depth, zoneId, unlocked: false, reason, huntSeconds: null, huntXpPerHour: null, huntGoldPerHour: null, powerBonus: null, budget: null, rewardMultiplier: null };
    const preview = stats(state.equipment, { depth, zoneId });
    return { depth, zoneId, unlocked: reason === '', reason, huntSeconds: preview.huntSeconds, huntXpPerHour: preview.huntXpPerHour, huntGoldPerHour: preview.huntGoldPerHour, powerBonus: entry.powerBonus, budget: entry.budget, rewardMultiplier: entry.rewardMultiplier };
  }
  function compareItem(id) {
    const item = findOwned(id)?.item || state.listings.find(l => l.item.id === id)?.item;
    if (!item) return null;
    const before = stats(), after = stats({ ...state.equipment, [item.slot]: item });
    const differences = Object.fromEntries(['dps', 'defense', 'magicFind', 'bossDps', 'huntSeconds'].map(key => [key, after[key] - before[key]]));
    return { before, after, differences, currentItem: cloneItem(state.equipment[item.slot]), item: cloneItem(item) };
  }
  function forgeQuote(id) {
    const found = findOwned(id);
    const item = found?.item || state.listings.find(listing => listing.item.id === id)?.item || null;
    const rank = item ? cloneItem(item).forgeRank : 0;
    const costShards = 20 * 2 ** rank, costGold = Math.max(100, item?.value || 0) * 2 ** (rank + 1);
    let reason = '';
    if (!item) reason = '未找到这件装备。';
    else if (!found) reason = '挂单装备不能精炼，请先撤回。';
    else if (found.location === 'pending') reason = '请先安置待处理装备，再进行精炼。';
    else if (item.locked) reason = '这件装备已锁定，请先解锁。';
    else if (rank >= 5) reason = '已达到五阶精炼上限。';
    else if (item.bonus > 1e7 - 3) reason = '该装备亲和已达到可精炼上限。';
    else if (state.shards < costShards) reason = '余烬不足。';
    else if (state.gold < costGold) reason = '金币不足。';
    return { item: cloneItem(item), rank, maxRank: 5, bonusBefore: item?.bonus || 0, bonusAfter: (item?.bonus || 0) + (rank < 5 && item ? 3 : 0), costShards, costGold, canForge: reason === '', reason };
  }
  function experience(amount) {
    state.xp += amount;
    while (state.xp >= stats().xpNext) { state.xp -= stats().xpNext; state.level++; log(`晋升至 ${state.level} 级，所有基础属性提升。`); }
  }
  function loot(bossReward = false) {
    const zone = ZONES.find(z => z.id === state.zoneId);
    const slot = SLOTS[Math.floor(random() * 3)];
    const element = ELEMENTS[Math.floor(random() * ELEMENTS.length)];
    const roll = random();
    const legendaryChance = Math.min(BALANCE.normalLegendaryCap, BALANCE.normalLegendaryBase + stats().magicFind / BALANCE.magicFindDivisor);
    const rarity = (bossReward ? state.boss.kills === 1 || roll < BALANCE.bossLegendaryChance : roll < legendaryChance) ? 'legendary' : bossReward || roll < 0.42 ? 'rare' : 'magic';
    const tier = { magic: 1, rare: 1.5, legendary: 2.2 }[rarity];
    const power = Math.round((9 + zone.level * 2 + state.level * 0.7 + (state.activity === 'hunt' && !bossReward ? DEPTHS[state.depth].powerBonus : 0) + random() * 9) * tier);
    const bonus = Math.round((7 + random() * 12) * tier);
    const prefix = { fire: '余烬', frost: '霜痕', lightning: '裂星', physical: '铁誓', poison: '疫月', shadow: '暮魂', magic: '回响' }[element];
    const name = `${prefix}${{ weapon: '仪式刃', armor: '守夜衣', ring: '契印' }[slot]}${rarity === 'legendary' ? ' · 永寂' : ''}`;
    const item = { id: `drop-${++state.sequence}`, name, slot, rarity, power, element, bonus, value: Math.round(power * tier * 5), locked: false, forgeRank: 0, affixes: [`+${bonus}% ${ELEMENT_NAMES[element]}伤害`, `+${power} ${slot === 'armor' ? '护甲' : '力量'}`, ...(rarity === 'legendary' ? ['+20% 魔法寻获'] : [])] };
    let destination;
    if (state.inventory.length < INVENTORY_CAPACITY) { state.inventory.push(item); destination = 'inventory'; log(`获得${{ magic: '魔法', rare: '稀有', legendary: '传奇' }[rarity]}装备：${name}。`); }
    else if (rarity !== 'legendary') { state.gold += item.value; destination = 'sold'; log(`背包已满：非传奇装备${name} 已自动出售，获得 ${item.value} 金币。`); }
    else if (state.vault.length < VAULT_CAPACITY) { state.vault.push(item); destination = 'vault'; log(`传奇保护：${name} 已安全存入保护仓库，未出售。`); }
    else { state.pendingLoot = item; state.running = false; state.pauseReason = 'lootProtection'; destination = 'pending'; log(`传奇保护暂停：行囊与保护仓库已满，${name} 已保留为待处理装备。处理后才能继续挂机。`); }
    return { item, autoSold: destination === 'sold', destination };
  }
  function tick(seconds) {
    if (state.pendingLoot) { state.running = false; state.pauseReason = 'lootProtection'; return; }
    if (!state.running || !Number.isFinite(seconds) || seconds <= 0) return;
    let remaining = Math.min(seconds, 8 * 3600);
    while (remaining > 0.000001 && state.running && !state.pendingLoot) {
      const current = stats();
      if (state.activity === 'boss') {
        const id = encounterId();
        const rate = current.bossDps + 225;
        const chargingFrenzy = state.buildId === 'frenzy' && state.combatStacks < 5;
        const step = Math.min(remaining, state.boss.hp / rate, chargingFrenzy ? 4 - state.combatStackProgress : Infinity, 1 - state.bossPulseProgress);
        state.boss.hp = Math.max(0, state.boss.hp - step * rate);
        state.boss.contribution += step * current.bossDps;
        state.bossPulseProgress += step;
        state.bossPulseDamage += step * current.bossDps;
        state.bossPulseAllyDamage += step * 225;
        state.simTime += step;
        if (state.bossPulseProgress >= 1 - 1e-10 || state.boss.hp < 0.00001) {
          flushBossHit();
        }
        if (chargingFrenzy) {
          state.combatStackProgress += step;
          if (state.combatStackProgress >= 4 - 0.0000001) { state.combatStacks++; state.combatStackProgress = 0; }
        }
        remaining -= step;
        state.progress = 1 - state.boss.hp / state.boss.maxHp;
        if (state.boss.hp < 0.00001) {
          emit('bossDefeat', { encounterId: id, monsterId: 'boss-morlgas', target: '骸冠君王·莫尔迦斯', hp: 0, maxHp: state.boss.maxHp, contribution: state.boss.contribution });
          state.boss.kills++; state.gold += 420; state.shards += 8; experience(BALANCE.bossXp);
          const drop = loot(true);
          rewardEvent({ encounterId: id, monsterId: 'boss-morlgas', target: '骸冠君王·莫尔迦斯', gold: 420 + (drop.autoSold ? drop.item.value : 0), xp: BALANCE.bossXp, shards: 8, ...drop });
          log(`世界首领「骸冠君王·莫尔迦斯」已倒下：获得 420 金币、8 余烬与${drop.item.rarity === 'legendary' ? '传奇' : '稀有'}战利品。${state.boss.kills === 1 ? '首次击败保证传奇。' : ''}（同伴为本地模拟）`);
          state.boss.hp = state.boss.maxHp; state.boss.contribution = 0; state.progress = 0; state.bossAttackIndex = 0;
        }
      } else {
        const id = encounterId();
        const monster = state.activity === 'hunt' ? huntMonster() : null;
        const duration = state.activity === 'fish' ? 8 : current.huntSeconds;
        const previousProgress = state.progress;
        const previousTime = state.simTime;
        const step = Math.min(remaining, (1 - state.progress) * duration);
        state.progress += step / duration;
        state.simTime += step;
        if (monster) {
          for (let index = hitCount(previousProgress); index < hitCount(state.progress); index++) {
            const time = previousTime + (HIT_FRACTIONS[index] - previousProgress) * duration;
            const hp = monsterHp(monster.maxHp, index + 1);
            emit('hit', { encounterId: id, monsterId: monster.id, target: monster.name, time, damage: monsterHp(monster.maxHp, index) - hp, hp, maxHp: monster.maxHp, attackIndex: index + 1, elite: monster.elite });
            if (index === 2) emit('defeat', { encounterId: id, monsterId: monster.id, target: monster.name, time, hp: 0, maxHp: monster.maxHp, elite: monster.elite });
          }
        }
        remaining -= step;
        if (state.progress >= 1 - 0.0000001) {
          state.progress = 0;
          if (state.activity === 'fish') {
            state.fish++; experience(9);
            const shards = random() < 0.1 ? 1 : 0;
            if (shards) { state.shards++; log('钓起一枚水浸的余烬。'); }
            else log('钓获幽光鱼 ×1，可兑换金币与经验。');
            const caught = emit('fish', { encounterId: id, target: '幽光鱼', count: 1, xp: 9, shards });
            if (!suppressEvents) lastReward = caught;
            if (random() < 0.04) { log('鱼钩带起一只沉没的宝匣。'); const drop = loot(); rewardEvent({ encounterId: id, target: '沉没的宝匣', gold: drop.autoSold ? drop.item.value : 0, ...drop }); }
          }
          else {
            const zone = ZONES.find(z => z.id === state.zoneId);
            if (state.buildId === 'frenzy') state.combatStacks = Math.min(5, state.combatStacks + 1);
            state.kills++; state.gold += current.huntBaseGold; experience(current.huntBaseXp);
            let drop = {};
            if (random() < 0.7) drop = loot(); else log(`击败 ${zone.name} 的游魂，获得金币与经验。`);
            rewardEvent({ encounterId: id, monsterId: monster.id, target: monster.name, gold: current.huntBaseGold + (drop.autoSold ? drop.item.value : 0), xp: current.huntBaseXp, ...drop });
          }
        }
      }
    }
  }
  function save() {
    state.savedAt = Date.now();
    const previouslyAvailable = state.storageAvailable;
    try {
      if (!storage || typeof storage.setItem !== 'function') throw new Error('Storage unavailable');
      state.storageAvailable = true;
      storage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    } catch {
      state.storageAvailable = false;
      if (previouslyAvailable !== false) log('本地存储不可用，本次进度暂未保存。');
      return false;
    }
  }
  function act(type, payload) {
    const id = typeof payload === 'object' && payload !== null ? payload.id : payload;
    let message;
    if (state.pendingLoot && ['pause', 'activity', 'zone', 'depth'].includes(type)) { state.running = false; state.pauseReason = 'lootProtection'; return protectionMessage(); }
    if (type === 'class') {
      const cls = CLASSES.find(c => c.id === id); if (!cls) return '职业不存在。';
      if (state.classId !== id) { if (state.activity === 'boss') flushBossHit(); state.classId = id; state.buildId = cls.builds[0].id; state.combatStacks = 0; state.combatStackProgress = 0; }
      message = `当前职业${cls.name}，各职业独立保留技能分配。`;
    } else if (type === 'build') {
      const build = CLASSES.find(c => c.id === state.classId).builds.find(b => b.id === id); if (!build) return '该职业无法使用此流派。';
      if (state.buildId !== id) { if (state.activity === 'boss') flushBossHit(); state.buildId = id; state.combatStacks = 0; state.combatStackProgress = 0; }
      message = `已启用${build.name}：技能自动施放，同属性词缀将提高伤害。`;
    } else if (type === 'train') {
      const cls = CLASSES.find(c => c.id === state.classId);
      const talent = cls.trees.flatMap(t => t.skills).find(s => s.id === id);
      if (!talent) return '当前职业没有这项技能。';
      const allocated = state.talents[state.classId];
      if ((allocated[id] || 0) >= talent.maxRank) return `${talent.name}已达到 ${talent.maxRank} 级上限。`;
      if (stats().skillPoints < 1) return '技能点不足；升级获得新点数，或免费重置当前职业技能。';
      allocated[id] = (allocated[id] || 0) + 1;
      message = `${talent.name}提升至 ${allocated[id]} 级。${talent.desc}`;
    } else if (type === 'resetTalents') {
      state.talents[state.classId] = {};
      message = `当前职业技能已免费重置，${state.level + 2} 点技能点可重新分配。`;
    } else if (type === 'depth') {
      const depth = typeof id === 'number' ? id : typeof id === 'string' && /^[0-5]$/.test(id) ? Number(id) : NaN;
      const quote = expeditionQuote(depth);
      if (!quote.unlocked) return quote.reason;
      if (state.depth === depth && state.activity === 'hunt') return `已在${DEPTHS[depth].name}，当前清剿继续。`;
      if (state.depth !== depth || state.activity !== 'hunt') {
        if (state.activity === 'boss') flushBossHit();
        state.progress = 0; state.encounterSerial++;
      }
      if (state.activity !== 'hunt') { state.combatStacks = 0; state.combatStackProgress = 0; }
      state.depth = depth; state.activity = 'hunt';
      message = `已选择${DEPTHS[depth].name}，自动打宝采用该深度；首领与钓鱼不受影响。`;
    } else if (type === 'zone') {
      const zone = ZONES.find(z => z.id === id); if (!zone) return '区域不存在。'; if (zone.level > state.level) return `需要达到 ${zone.level} 级才能进入。`;
      if (state.zoneId !== id || state.activity !== 'hunt') { if (state.activity === 'boss') flushBossHit(); state.progress = 0; state.encounterSerial++; }
      if (state.activity !== 'hunt') { state.combatStacks = 0; state.combatStackProgress = 0; }
      state.zoneId = id; state.activity = 'hunt'; state.running = true; state.pauseReason = null; message = `前往${zone.name}自动打宝，留意当地的${ELEMENT_NAMES[zone.element]}抗性。`;
    } else if (type === 'activity') {
      if (!['hunt', 'fish', 'boss'].includes(id)) return '活动不存在。';
      if (state.activity !== id) { if (state.activity === 'boss') flushBossHit(); state.progress = id === 'boss' ? 1 - state.boss.hp / state.boss.maxHp : 0; state.combatStacks = 0; state.combatStackProgress = 0; state.encounterSerial++; }
      state.activity = id; state.running = true; state.pauseReason = null;
      message = `已切换至${{ hunt: '自动打宝', fish: '幽潭垂钓', boss: '世界首领（本地模拟）' }[id]}。`;
    } else if (type === 'pause') { state.running = !state.running; state.pauseReason = state.running ? null : 'manual'; message = state.running ? '已恢复自动冒险。' : '已暂停冒险，离线期间也不会推进。';
    } else if (type === 'forge') {
      const quote = forgeQuote(id);
      if (!quote.canForge) return quote.reason;
      const item = findOwned(id).item;
      state.shards -= quote.costShards; state.gold -= quote.costGold;
      item.bonus = quote.bonusAfter; item.forgeRank = quote.rank + 1;
      const elementAffix = `+${item.bonus}% ${ELEMENT_NAMES[item.element]}伤害`;
      const index = item.affixes.findIndex(affix => affix.includes(`${ELEMENT_NAMES[item.element]}伤害`));
      if (index >= 0) item.affixes[index] = elementAffix; else item.affixes.unshift(elementAffix);
      message = `${item.name}精炼至 ${item.forgeRank} 阶，${ELEMENT_NAMES[item.element]}加成提升至 ${item.bonus}%。消耗 ${quote.costShards} 余烬、${quote.costGold} 金币。`;
    } else if (type === 'sellMagic') {
      const eligible = state.inventory.filter(item => item.rarity === 'magic' && !item.locked && !equipped(item.id));
      const ids = new Set(eligible.map(item => item.id));
      const proceeds = eligible.reduce((sum, item) => sum + item.value, 0);
      state.inventory = state.inventory.filter(item => !ids.has(item.id)); state.gold += proceeds;
      message = `出售 ${eligible.length} 件未锁定、未装备的魔法装备，获得 ${proceeds} 金币。`;
    } else if (['equip', 'sell', 'list', 'claim', 'lock'].includes(type)) {
      const found = findOwned(id); if (!found) return '未找到这件装备。';
      const { item, location } = found;
      if (type === 'lock') { item.locked = !item.locked; message = `${item.name}已${item.locked ? '锁定，禁止出售与上架' : '解锁'}。`; }
      else if (type === 'claim') {
        if (location === 'inventory') return '这件装备已经在行囊中。';
        if (state.inventory.length < INVENTORY_CAPACITY) { removeOwned(found); state.inventory.push(item); message = `${item.name}已领取到行囊。`; }
        else if (location === 'pending' && state.vault.length < VAULT_CAPACITY) { removeOwned(found); state.vault.push(item); message = `${item.name}已安全存入保护仓库。`; }
        else return '行囊已满，请先腾出空间；装备仍安全保留，未被移动或出售。';
      } else if (type === 'equip') {
        if (location !== 'inventory') {
          if (state.inventory.length >= INVENTORY_CAPACITY) {
            const old = state.equipment[item.slot];
            if (!old || !state.inventory.some(i => i.id === old.id)) return '行囊已满且该装备位为空，请先腾出一格再装备。';
            state.inventory = state.inventory.filter(i => i.id !== old.id);
            removeOwned(found);
            if (location === 'vault') state.vault.push(old); else state.pendingLoot = old;
            message = `已装备${item.name}；旧装备${old.name}转入${location === 'vault' ? '保护仓库' : '待处理位置，仍需安置后才能恢复挂机'}。`;
          } else removeOwned(found);
          state.inventory.push(item);
        }
        state.equipment[item.slot] = item; message ||= `已装备${item.name}。`;
      }
      else {
        if (item.locked) return '这件装备已锁定，请先解锁后再出售或上架。';
        if (equipped(id)) return '请先替换身上装备，再进行出售或上架。';
        if (type === 'list' && state.listings.filter(l => l.owner === 'you').length >= 20) return '最多同时上架 20 件装备。';
        removeOwned(found);
        if (type === 'sell') { state.gold += item.value; message = `出售${item.name}，获得 ${item.value} 金币。`; }
        else { const price = Math.round(item.value * 1.5); state.listings.push({ id: `listing-${++state.sequence}`, owner: 'you', price, item }); message = `${item.name} 已以 ${price} 金币上架本地交易演示；可随时撤回。`; }
      }
    } else if (type === 'buy' || type === 'cancel') {
      const listing = state.listings.find(l => l.id === id); if (!listing) return '该商品已不存在。';
      if (state.inventory.length >= INVENTORY_CAPACITY) return '背包已满，请先整理装备。';
      if (type === 'cancel' && listing.owner !== 'you') return '只能撤回自己的商品。';
      if (type === 'buy' && listing.owner === 'you') return '这是你的商品，请使用撤回。';
      if (type === 'buy' && state.gold < listing.price) return '金币不足。';
      if (type === 'buy') state.gold -= listing.price;
      state.inventory.push(listing.item); state.listings = state.listings.filter(l => l.id !== id);
      message = `${type === 'buy' ? '已购入' : '已撤回'}${listing.item.name}。`;
    } else if (type === 'consumeFish') {
      if (state.fish < 1) return '还没有鱼获，先去幽潭垂钓吧。';
      const count = state.fish; state.fish = 0; state.gold += count * 35; experience(count * 12); message = `交付 ${count} 条幽光鱼，获得 ${count * 35} 金币、${count * 12} 经验。`;
    } else return '未知操作。';
    if (state.pauseReason === 'lootProtection' && !state.pendingLoot) { state.pauseReason = 'manual'; state.running = false; message += '待处理装备已安置，可点击继续挂机。'; }
    log(message); save(); return message;
  }
  const elapsed = Math.max(0, Math.min(8 * 3600, (Date.now() - state.savedAt) / 1000));
  if (elapsed >= 30 && state.running) {
    const before = { gold: state.gold, kills: state.kills, fish: state.fish, level: state.level, simTime: state.simTime, vault: state.vault.length };
    suppressEvents = true;
    tick(elapsed);
    suppressEvents = false;
    state.bossPulseDamage = 0; state.bossPulseAllyDamage = 0;
    state.offlineSummary = `离线 ${Math.floor(elapsed / 60)} 分钟（最多结算 8 小时）：金币 +${state.gold - before.gold}，击败 ${state.kills - before.kills} 个敌人，鱼获 +${state.fish - before.fish}，等级 +${state.level - before.level}，保护仓库 +${state.vault.length - before.vault} 件。${state.pendingLoot ? `实际结算 ${Math.floor((state.simTime - before.simTime) / 60)} 分钟后触发传奇保护暂停；待处理装备已保留，后续离线时间未继续战斗。` : ''}`;
    log(state.offlineSummary);
  } else state.offlineSummary = '';
  save();
  return { state, stats, tick, act, save, combat, eventsSince, compareItem, forgeQuote, expeditionQuote };
}
