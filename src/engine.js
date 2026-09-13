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
const ELEMENT_NAMES = { fire: '火焰', frost: '冰霜', lightning: '闪电', physical: '物理', poison: '毒素', shadow: '暗影', magic: '魔法' };
const SLOTS = ['weapon', 'armor', 'ring'];
const ELEMENTS = Object.keys(ELEMENT_NAMES);
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
].map(([id, name, slot, rarity, power, element, bonus, value]) => ({ id, name, slot, rarity, power, element, bonus, value, affixes: [`+${bonus}% ${ELEMENT_NAMES[element]}伤害`, `+${power} ${slot === 'armor' ? '护甲' : '力量'}`] }));

function freshState() {
  const inventory = initialItems();
  return { version: 1, classId: 'barbarian', buildId: 'whirlwind', talents: { barbarian: {}, sorceress: {} }, combatStacks: 0, combatStackProgress: 0, level: 1, xp: 0, gold: 1280, shards: 12, activity: 'hunt', zoneId: 'grave', running: true, progress: 0, kills: 0, fish: 0, boss: { hp: 28000, maxHp: 28000, contribution: 0, kills: 0 }, inventory, equipment: { weapon: inventory[0], armor: inventory[1], ring: inventory[2] }, listings: [
    { id: 'market-1', owner: 'market', price: 720, item: { ...inventory[5], id: 'market-ghost', name: '暮钟指环' } },
    { id: 'market-2', owner: 'market', price: 350, item: { ...inventory[3], id: 'market-frost', name: '冬眠枝杖' } },
    { id: 'market-3', owner: 'market', price: 420, item: { ...inventory[6], id: 'market-storm', name: '碎星长衣' } },
  ], logs: ['灰烬契约已缔结。你的角色开始自动探索遗忘墓园。'], offlineSummary: '', savedAt: Date.now(), rng: 184731, sequence: 20 };
}

function restore(raw) {
  const s = freshState();
  if (!raw || raw.version !== 1 || !Array.isArray(raw.inventory) || raw.inventory.length > 60 || !raw.inventory.every(itemValid)) return s;
  for (const k of ['level', 'xp', 'gold', 'shards', 'kills', 'fish', 'savedAt', 'rng', 'sequence']) if (Number.isFinite(raw[k]) && raw[k] >= 0) s[k] = Math.min(raw[k], Number.MAX_SAFE_INTEGER);
  s.level = Math.max(1, Math.floor(s.level));
  s.rng = s.rng >>> 0;
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
  s.activity = ['hunt', 'fish', 'boss'].includes(raw.activity) ? raw.activity : 'hunt';
  s.running = typeof raw.running === 'boolean' ? raw.running : true;
  s.progress = Number.isFinite(raw.progress) ? Math.max(0, Math.min(0.999999, raw.progress)) : 0;
  s.inventory = raw.inventory;
  for (const slot of SLOTS) s.equipment[slot] = s.inventory.find(i => i.id === raw.equipment?.[slot]?.id && i.slot === slot) || null;
  if (Array.isArray(raw.listings)) s.listings = raw.listings.filter(l => l && typeof l.id === 'string' && ['you', 'market'].includes(l.owner) && itemValid(l.item) && Number.isFinite(l.price) && l.price > 0).slice(0, 80);
  if (raw.boss && ['hp', 'maxHp', 'contribution', 'kills'].every(k => Number.isFinite(raw.boss[k]) && raw.boss[k] >= 0) && raw.boss.maxHp > 0) s.boss = { hp: Math.min(raw.boss.hp, raw.boss.maxHp), maxHp: raw.boss.maxHp, contribution: raw.boss.contribution, kills: raw.boss.kills };
  if (Array.isArray(raw.logs)) s.logs = raw.logs.filter(x => typeof x === 'string').slice(0, 30);
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
  function stats() {
    const profession = CLASSES.find(c => c.id === state.classId);
    const build = profession.builds.find(b => b.id === state.buildId);
    const talents = state.talents[state.classId];
    const rank = id => talents[id] || 0;
    const trainingSpent = Object.values(talents).reduce((sum, n) => sum + n, 0);
    const items = Object.values(state.equipment).filter(Boolean);
    const affinity = items.filter(i => i.element === build.element).reduce((sum, i) => sum + i.bonus, 0);
    const defense = Math.round((10 + state.level * 3 + (state.equipment.armor?.power || 0) * 3) * (1 + rank('ironSkin') * 0.08 + rank('shout') * 0.06));
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
    const dps = Math.round((18 + state.level * 4 + (state.equipment.weapon?.power || 0) * 2 + (state.equipment.ring?.power || 0) + armorDamage) * (1 + affinity / 100) * (1 + damageBonus) * attackSpeed);
    const zone = ZONES.find(z => z.id === state.zoneId);
    const zoneResistance = zone.element === build.element ? Math.max(0, 0.3 - resistancePenetration) : 0;
    const effectiveDps = Math.round(dps * (1 - zoneResistance));
    const bossDps = Math.round(dps * (1 + bossBonus));
    // Defense and reduction lower recovery time; no manual healing or death spiral.
    const recovery = (1.12 - Math.min(0.2, defense / 800)) * (1 - damageReduction * 0.5);
    const huntSeconds = Math.max(3.5, Math.min(14, zone.seconds * (100 + zone.level * 8) / Math.max(35, effectiveDps * (1 + areaBonus)) * recovery));
    return { dps, defense, magicFind: 15 + items.filter(i => i.rarity === 'legendary').length * 20 + Math.floor(state.level / 2) + magicFindBonus, xpNext: 80 + state.level * 35, element: build.element, effectiveDps, zoneResistance, huntSeconds, attackSpeed, areaBonus, bossDps, damageReduction, trainingSpent, skillPoints: Math.max(0, state.level + 2 - trainingSpent), buildEffect: build.id === 'frenzy' ? `狂乱 ${state.combatStacks}/5 层 · 攻速 +${Math.round((attackSpeed - 1) * 100)}%` : build.mechanic };
  }
  function experience(amount) {
    state.xp += amount;
    while (state.xp >= stats().xpNext) { state.xp -= stats().xpNext; state.level++; log(`晋升至 ${state.level} 级，所有基础属性提升。`); }
  }
  function loot(forceLegendary = false) {
    const zone = ZONES.find(z => z.id === state.zoneId);
    const slot = SLOTS[Math.floor(random() * 3)];
    const element = ELEMENTS[Math.floor(random() * ELEMENTS.length)];
    const roll = random();
    const rarity = forceLegendary || roll < 0.025 + stats().magicFind / 1800 ? 'legendary' : roll < 0.42 ? 'rare' : 'magic';
    const tier = { magic: 1, rare: 1.5, legendary: 2.2 }[rarity];
    const power = Math.round((9 + zone.level * 2 + state.level * 0.7 + random() * 9) * tier);
    const bonus = Math.round((7 + random() * 12) * tier);
    const prefix = { fire: '余烬', frost: '霜痕', lightning: '裂星', physical: '铁誓', poison: '疫月', shadow: '暮魂', magic: '回响' }[element];
    const name = `${prefix}${{ weapon: '仪式刃', armor: '守夜衣', ring: '契印' }[slot]}${rarity === 'legendary' ? ' · 永寂' : ''}`;
    const item = { id: `drop-${++state.sequence}`, name, slot, rarity, power, element, bonus, value: Math.round(power * tier * 5), affixes: [`+${bonus}% ${ELEMENT_NAMES[element]}伤害`, `+${power} ${slot === 'armor' ? '护甲' : '力量'}`, ...(rarity === 'legendary' ? ['+20% 魔法寻获'] : [])] };
    if (state.inventory.length >= 60) { state.gold += item.value; log(`背包已满：${name} 已自动出售，获得 ${item.value} 金币。`); }
    else { state.inventory.push(item); log(`获得${{ magic: '魔法', rare: '稀有', legendary: '传奇' }[rarity]}装备：${name}。`); }
  }
  function tick(seconds) {
    if (!state.running || !Number.isFinite(seconds) || seconds <= 0) return;
    let remaining = Math.min(seconds, 8 * 3600);
    while (remaining > 0.000001) {
      const current = stats();
      if (state.activity === 'boss') {
        const rate = current.bossDps + 225;
        const chargingFrenzy = state.buildId === 'frenzy' && state.combatStacks < 5;
        const step = Math.min(remaining, state.boss.hp / rate, chargingFrenzy ? 4 - state.combatStackProgress : Infinity);
        state.boss.hp = Math.max(0, state.boss.hp - step * rate);
        state.boss.contribution += step * current.bossDps;
        if (chargingFrenzy) {
          state.combatStackProgress += step;
          if (state.combatStackProgress >= 4 - 0.0000001) { state.combatStacks++; state.combatStackProgress = 0; }
        }
        remaining -= step;
        state.progress = 1 - state.boss.hp / state.boss.maxHp;
        if (state.boss.hp < 0.00001) {
          state.boss.kills++; state.gold += 420; state.shards += 8; experience(120); loot(true);
          log('世界首领「骸冠君王·莫尔迦斯」已倒下：获得 420 金币、8 余烬与传奇战利品。（同伴为本地模拟）');
          state.boss.hp = state.boss.maxHp; state.boss.contribution = 0; state.progress = 0;
        }
      } else {
        const duration = state.activity === 'fish' ? 8 : current.huntSeconds;
        const step = Math.min(remaining, (1 - state.progress) * duration);
        state.progress += step / duration;
        remaining -= step;
        if (state.progress >= 1 - 0.0000001) {
          state.progress = 0;
          if (state.activity === 'fish') {
            state.fish++; experience(9);
            if (random() < 0.1) { state.shards++; log('钓起一枚水浸的余烬。'); }
            else log('钓获幽光鱼 ×1，可兑换金币与经验。');
            if (random() < 0.04) { log('鱼钩带起一只沉没的宝匣。'); loot(); }
          }
          else {
            const zone = ZONES.find(z => z.id === state.zoneId);
            if (state.buildId === 'frenzy') state.combatStacks = Math.min(5, state.combatStacks + 1);
            state.kills++; state.gold += 13 + zone.level * 4; experience(15 + zone.level * 3);
            if (random() < 0.7) loot(); else log(`击败 ${zone.name} 的游魂，获得金币与经验。`);
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
    if (type === 'class') {
      const cls = CLASSES.find(c => c.id === id); if (!cls) return '职业不存在。';
      if (state.classId !== id) { state.classId = id; state.buildId = cls.builds[0].id; state.combatStacks = 0; state.combatStackProgress = 0; }
      message = `当前职业${cls.name}，各职业独立保留技能分配。`;
    } else if (type === 'build') {
      const build = CLASSES.find(c => c.id === state.classId).builds.find(b => b.id === id); if (!build) return '该职业无法使用此流派。';
      if (state.buildId !== id) { state.buildId = id; state.combatStacks = 0; state.combatStackProgress = 0; }
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
    } else if (type === 'zone') {
      const zone = ZONES.find(z => z.id === id); if (!zone) return '区域不存在。'; if (zone.level > state.level) return `需要达到 ${zone.level} 级才能进入。`;
      if (state.zoneId !== id || state.activity !== 'hunt') state.progress = 0;
      if (state.activity !== 'hunt') { state.combatStacks = 0; state.combatStackProgress = 0; }
      state.zoneId = id; state.activity = 'hunt'; state.running = true; message = `前往${zone.name}自动打宝，留意当地的${ELEMENT_NAMES[zone.element]}抗性。`;
    } else if (type === 'activity') {
      if (!['hunt', 'fish', 'boss'].includes(id)) return '活动不存在。';
      if (state.activity !== id) { state.progress = id === 'boss' ? 1 - state.boss.hp / state.boss.maxHp : 0; state.combatStacks = 0; state.combatStackProgress = 0; }
      state.activity = id; state.running = true;
      message = `已切换至${{ hunt: '自动打宝', fish: '幽潭垂钓', boss: '世界首领（本地模拟）' }[id]}。`;
    } else if (type === 'pause') { state.running = !state.running; message = state.running ? '已恢复自动冒险。' : '已暂停冒险，离线期间也不会推进。';
    } else if (['equip', 'sell', 'list'].includes(type)) {
      const item = state.inventory.find(i => i.id === id); if (!item) return '未找到这件装备。';
      if (type === 'equip') { state.equipment[item.slot] = item; message = `已装备${item.name}。`; }
      else {
        if (equipped(id)) return '请先替换身上装备，再进行出售或上架。';
        if (type === 'list' && state.listings.filter(l => l.owner === 'you').length >= 20) return '最多同时上架 20 件装备。';
        state.inventory = state.inventory.filter(i => i.id !== id);
        if (type === 'sell') { state.gold += item.value; message = `出售${item.name}，获得 ${item.value} 金币。`; }
        else { const price = Math.round(item.value * 1.5); state.listings.push({ id: `listing-${++state.sequence}`, owner: 'you', price, item }); message = `${item.name} 已以 ${price} 金币上架本地交易演示；可随时撤回。`; }
      }
    } else if (type === 'buy' || type === 'cancel') {
      const listing = state.listings.find(l => l.id === id); if (!listing) return '该商品已不存在。';
      if (state.inventory.length >= 60) return '背包已满，请先整理装备。';
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
    log(message); save(); return message;
  }
  const elapsed = Math.max(0, Math.min(8 * 3600, (Date.now() - state.savedAt) / 1000));
  if (elapsed >= 30 && state.running) {
    const before = { gold: state.gold, kills: state.kills, fish: state.fish, level: state.level };
    tick(elapsed);
    state.offlineSummary = `离线 ${Math.floor(elapsed / 60)} 分钟（最多结算 8 小时）：金币 +${state.gold - before.gold}，击败 ${state.kills - before.kills} 个敌人，鱼获 +${state.fish - before.fish}，等级 +${state.level - before.level}。`;
    log(state.offlineSummary);
  } else state.offlineSummary = '';
  save();
  return { state, stats, tick, act, save };
}
