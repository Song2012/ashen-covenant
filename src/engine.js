export const CLASSES = [
  { id: 'knight', name: '灰烬骑士', subtitle: '钢铁与余火的誓约', builds: [
    { id: 'ember', name: '焚誓旋斩', desc: '以烈焰淬炼重刃，火焰装备提高持续伤害。', element: 'fire' },
    { id: 'steel', name: '裂甲重击', desc: '护甲转化为力量：防御值的 35% 计入基础伤害。', element: 'physical' },
  ] },
  { id: 'witch', name: '霜棘秘术师', subtitle: '禁忌星火的继承者', builds: [
    { id: 'frost', name: '凛冬回响', desc: '冰霜法术层层回响，寒霜词缀形成共鸣。', element: 'frost' },
    { id: 'storm', name: '雷狱连锁', desc: '引导连锁雷电，以闪电词缀强化清场效率。', element: 'lightning' },
  ] },
  { id: 'reaper', name: '葬骨行者', subtitle: '与亡者同行的旅人', builds: [
    { id: 'plague', name: '疫骨蔓延', desc: '使疫毒侵染战场，毒素装备增幅每次收割。', element: 'poison' },
    { id: 'shadow', name: '幽魂军团', desc: '驱使幽魂自动征战，暗影词缀强化亡者。', element: 'shadow' },
  ] },
];

export const ZONES = [
  { id: 'grave', name: '遗忘墓园', subtitle: '断碑下，旧日仍在低语', level: 1, element: 'shadow', seconds: 8 },
  { id: 'crypt', name: '霜痕地窖', subtitle: '永冻长廊藏着失落秘宝', level: 3, element: 'frost', seconds: 9 },
  { id: 'furnace', name: '余烬熔炉', subtitle: '以烈火守望黄金时代', level: 5, element: 'fire', seconds: 10 },
  { id: 'marsh', name: '腐月沼泽', subtitle: '幽绿水面映出另一轮月', level: 8, element: 'poison', seconds: 12 },
];

export const SAVE_KEY = 'ashen-covenant-save-v1';
const ELEMENT_NAMES = { fire: '火焰', frost: '冰霜', lightning: '闪电', physical: '物理', poison: '毒素', shadow: '暗影' };
const SLOTS = ['weapon', 'armor', 'ring'];
const ELEMENTS = Object.keys(ELEMENT_NAMES);
const itemValid = (i) => i && typeof i.id === 'string' && typeof i.name === 'string' && SLOTS.includes(i.slot) && ['magic', 'rare', 'legendary'].includes(i.rarity) && ELEMENTS.includes(i.element) && ['power', 'bonus', 'value'].every(k => Number.isFinite(i[k]) && i[k] >= 0 && i[k] <= 1e7) && Array.isArray(i.affixes) && i.affixes.every(x => typeof x === 'string');
const initialItems = () => [
  ['ember-blade', '余烬誓剑', 'weapon', 'rare', 22, 'fire', 18, 160],
  ['iron-mail', '守墓者锁甲', 'armor', 'magic', 15, 'physical', 8, 80],
  ['cinder-ring', '微光灰戒', 'ring', 'magic', 5, 'fire', 12, 70],
  ['frost-wand', '霜语之杖', 'weapon', 'rare', 25, 'frost', 22, 190],
  ['bone-scythe', '疫骨镰', 'weapon', 'rare', 26, 'poison', 24, 210],
  ['ghost-ring', '亡者的回信', 'ring', 'legendary', 10, 'shadow', 30, 480],
  ['storm-coat', '风暴遗衣', 'armor', 'rare', 21, 'lightning', 20, 170],
  ['iron-maul', '破晓重锤', 'weapon', 'rare', 28, 'physical', 18, 180],
].map(([id, name, slot, rarity, power, element, bonus, value]) => ({ id, name, slot, rarity, power, element, bonus, value, affixes: [`+${bonus}% ${ELEMENT_NAMES[element]}伤害`, `+${power} ${slot === 'armor' ? '护甲' : '力量'}`] }));

function freshState() {
  const inventory = initialItems();
  return { version: 1, classId: 'knight', buildId: 'ember', level: 1, xp: 0, gold: 1280, shards: 12, activity: 'hunt', zoneId: 'grave', running: true, progress: 0, kills: 0, fish: 0, boss: { hp: 28000, maxHp: 28000, contribution: 0, kills: 0 }, inventory, equipment: { weapon: inventory[0], armor: inventory[1], ring: inventory[2] }, listings: [
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
  s.classId = CLASSES.some(c => c.id === raw.classId) ? raw.classId : s.classId;
  const cls = CLASSES.find(c => c.id === s.classId);
  s.buildId = cls.builds.some(b => b.id === raw.buildId) ? raw.buildId : cls.builds[0].id;
  s.zoneId = ZONES.some(z => z.id === raw.zoneId && z.level <= s.level) ? raw.zoneId : 'grave';
  s.activity = ['hunt', 'fish', 'boss'].includes(raw.activity) ? raw.activity : 'hunt';
  s.running = typeof raw.running === 'boolean' ? raw.running : true;
  s.progress = Number.isFinite(raw.progress) ? Math.max(0, Math.min(0.999999, raw.progress)) : 0;
  s.inventory = raw.inventory;
  for (const slot of SLOTS) s.equipment[slot] = s.inventory.find(i => i.id === raw.equipment?.[slot]?.id && i.slot === slot) || null;
  if (Array.isArray(raw.listings)) s.listings = raw.listings.filter(l => l && typeof l.id === 'string' && ['you', 'market'].includes(l.owner) && itemValid(l.item) && Number.isFinite(l.price) && l.price > 0).slice(0, 80);
  if (raw.boss && ['hp', 'maxHp', 'contribution', 'kills'].every(k => Number.isFinite(raw.boss[k]) && raw.boss[k] >= 0) && raw.boss.maxHp > 0) s.boss = { hp: Math.min(raw.boss.hp, raw.boss.maxHp), maxHp: raw.boss.maxHp, contribution: raw.boss.contribution, kills: raw.boss.kills };
  if (Array.isArray(raw.logs)) s.logs = raw.logs.filter(x => typeof x === 'string').slice(0, 30);
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
    const build = CLASSES.find(c => c.id === state.classId).builds.find(b => b.id === state.buildId);
    const items = Object.values(state.equipment).filter(Boolean);
    const affinity = items.filter(i => i.element === build.element).reduce((sum, i) => sum + i.bonus, 0);
    const defense = 10 + state.level * 3 + (state.equipment.armor?.power || 0) * 3;
    const armorDamage = build.id === 'steel' ? defense * 0.35 : 0;
    const dps = Math.round((18 + state.level * 4 + (state.equipment.weapon?.power || 0) * 2 + (state.equipment.ring?.power || 0) + armorDamage) * (1 + affinity / 100));
    const zone = ZONES.find(z => z.id === state.zoneId);
    const zoneResistance = zone.element === build.element ? 0.3 : 0;
    const effectiveDps = Math.round(dps * (1 - zoneResistance));
    const huntSeconds = Math.max(6, Math.min(12, zone.seconds * (100 + zone.level * 8) / Math.max(35, effectiveDps) * (1.12 - Math.min(0.2, defense / 800))));
    return { dps, defense, magicFind: 15 + items.filter(i => i.rarity === 'legendary').length * 20 + Math.floor(state.level / 2), xpNext: 80 + state.level * 35, element: build.element, effectiveDps, zoneResistance, huntSeconds };
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
    const prefix = { fire: '余烬', frost: '霜痕', lightning: '裂星', physical: '铁誓', poison: '疫月', shadow: '暮魂' }[element];
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
        const rate = current.dps + 225;
        const step = Math.min(remaining, state.boss.hp / rate);
        state.boss.hp = Math.max(0, state.boss.hp - step * rate);
        state.boss.contribution += step * current.dps;
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
      state.classId = id; state.buildId = cls.builds[0].id; message = `切换为${cls.name}，启用${cls.builds[0].name}。`;
    } else if (type === 'build') {
      const build = CLASSES.find(c => c.id === state.classId).builds.find(b => b.id === id); if (!build) return '该职业无法使用此流派。';
      state.buildId = id; message = `已启用${build.name}：同属性词缀将提高伤害。`;
    } else if (type === 'zone') {
      const zone = ZONES.find(z => z.id === id); if (!zone) return '区域不存在。'; if (zone.level > state.level) return `需要达到 ${zone.level} 级才能进入。`;
      if (state.zoneId !== id || state.activity !== 'hunt') state.progress = 0;
      state.zoneId = id; state.activity = 'hunt'; state.running = true; message = `前往${zone.name}自动打宝，留意当地的${ELEMENT_NAMES[zone.element]}抗性。`;
    } else if (type === 'activity') {
      if (!['hunt', 'fish', 'boss'].includes(id)) return '活动不存在。';
      if (state.activity !== id) state.progress = id === 'boss' ? 1 - state.boss.hp / state.boss.maxHp : 0;
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
