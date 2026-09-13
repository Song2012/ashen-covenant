// Encounter variety is deterministic and never consumes the equipment RNG.
// HP is a fixed encounter budget; existing hunt duration still controls efficiency.
const monster = (id, name, family, lore, trait, color, maxHp) => Object.freeze({ id, name, family, lore, trait, color, maxHp });
export const MONSTERS = Object.freeze({
  grave: Object.freeze([
    monster('grave-bellkeeper', '断钟守墓人', 'skeleton', '它依旧为无人到来的葬礼敲钟。', '锈骨守望', '#a7ab8c', 270),
    monster('grave-candle', '盗烛祭徒', 'acolyte', '偷来的烛火，照不亮祭袍里空缺的面孔。', '盗火仪式', '#b59a70', 270),
    monster('grave-hound', '碑影猎犬', 'hound', '墓碑下的影子沿着血迹聚成兽形。', '墓间潜行', '#879b86', 270),
  ]),
  crypt: Object.freeze([
    monster('crypt-chain', '霜链囚骸', 'skeleton', '铁链冻结在骨缝里，刑期却尚未结束。', '冻结枷锁', '#9bbbc5', 390),
    monster('crypt-veil', '白纱哀魂', 'wraith', '冰棺里遗落的名字，在寒雾中反复回响。', '寒雾游荡', '#b4c6db', 390),
    monster('crypt-warden', '冰窖狱卒', 'brute', '它将一扇牢门当作盾牌，不许任何人离开。', '沉重冰甲', '#8da6b5', 390),
  ]),
  furnace: Object.freeze([
    monster('furnace-votary', '焦冠祭司', 'acolyte', '焚毁的王冠融进颅骨，仍命令熔炉继续燃烧。', '灰火祈祷', '#ce9564', 540),
    monster('furnace-hauler', '炉渣搬尸者', 'brute', '它把入侵者当作最后一批燃料。', '熔渣重甲', '#ad7964', 540),
    monster('furnace-hound', '煤心獒', 'hound', '每一次呼吸，都有未熄的碎炭从牙间跌落。', '余温追猎', '#bd805b', 540),
  ]),
  marsh: Object.freeze([
    monster('marsh-lantern', '腐灯引魂者', 'wraith', '绿灯将迷路的人带向没有归途的水面。', '腐光诱引', '#9eb786', 720),
    monster('marsh-root', '苔骨拾荒者', 'skeleton', '根须穿过眼眶，代替它搜寻沉没的遗物。', '苔骨寄生', '#91a377', 720),
    monster('marsh-mire', '泥棺负尸人', 'brute', '背上的棺木空着，沼泽已为下一位客人留好位置。', '泥棺重负', '#92a08a', 720),
  ]),
});

export function getMonster(zoneId, kills = 0) {
  const roster = MONSTERS[zoneId] || MONSTERS.grave;
  const count = Number.isFinite(kills) ? Math.max(0, Math.floor(kills)) : 0;
  const base = roster[count % roster.length];
  const elite = (count + 1) % 5 === 0;
  return { ...base, elite, name: elite ? `${base.name} · 精英` : base.name, trait: elite ? `${base.trait} · 精英外观（奖励不变）` : base.trait };
}
