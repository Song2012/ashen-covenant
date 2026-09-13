import { itemPortraitDataUrl } from './item-art.js';
import { INVENTORY_CAPACITY, VAULT_CAPACITY } from './engine.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rarity = { magic: '魔法', rare: '稀有', legendary: '传奇' };
const slots = { weapon: '武器', armor: '护甲', ring: '戒指' };
const elements = { physical: '物理', magic: '魔法', fire: '火焰', frost: '冰霜', lightning: '闪电', poison: '毒素', shadow: '暗影' };
const fmt = value => Math.round(value || 0).toLocaleString('zh-CN');
export const itemImage = item => `<img class="pixel-item" src="${itemPortraitDataUrl(item)}" alt="" aria-hidden="true">`;
export function itemRows(items, state) {
  return items.map(item => {
    const worn = state.equipment[item.slot]?.id === item.id;
    return `<button class="loot-row treasure-row ${item.rarity}" data-item="${esc(item.id)}"><span class="item-square">${itemImage(item)}</span><span class="treasure-name"><b>${esc(item.name)}</b><small>${slots[item.slot]} · ${elements[item.element]}${worn ? ' · 已装备' : ''}${item.locked ? ' · 已锁定' : ''}</small></span><em>${rarity[item.rarity]}</em><span class="power">${fmt(item.power)}<small>威能</small></span><span class="treasure-arrow" aria-hidden="true">›</span></button>`;
  }).join('') || '<div class="empty">这里暂时没有符合条件的装备。</div>';
}

export function protectionBanner(state) {
  if (state.pendingLoot) return `<aside class="loot-protection-banner"><span class="item-square legendary">${itemImage(state.pendingLoot)}</span><div><b>宝物已保留，远征暂歇</b><p>${esc(state.pendingLoot.name)}正等待安置。${state.inventory.length >= INVENTORY_CAPACITY && state.vault.length >= VAULT_CAPACITY ? '请先整理一个空位，或直接处理这件宝物。' : '已有可用空间，可以领取后继续。'}</p></div><button class="outline" data-page="inventory">整理宝物</button></aside>`;
  if (state.vault?.length) return `<aside class="vault-reminder"><span>守灯人替你保管了 <b>${state.vault.length}</b> 件宝物。</span><button data-open-vault>查看保管箱 →</button></aside>`;
  return '';
}

export function inventoryMarkup(game, options) {
  const s = game.state, vault = s.vault || [];
  const source = options.container === 'vault' ? vault : s.inventory;
  const items = source.filter(item => options.filter === 'all' || (options.filter === 'locked' ? item.locked : item.rarity === options.filter));
  if (options.sort === 'power') items.sort((a, b) => b.power - a.power || b.bonus - a.bonus);
  else items.reverse();
  const pages = Math.max(1, Math.ceil(items.length / 24));
  options.page = Math.max(0, Math.min(pages - 1, options.page));
  const expendable = s.inventory.filter(item => item.rarity === 'magic' && !item.locked && s.equipment[item.slot]?.id !== item.id);
  const value = expendable.reduce((sum, item) => sum + item.value, 0);
  return `<section class="panel treasure-intro"><span class="eyebrow">THE KEEPER'S CHEST</span><h2>每一件遗物，都值得再看一眼</h2><p>把适合流派的装备留下，把不需要的换成下一段旅费。点击宝物，先看真实换装收益。</p><div class="storage-tabs"><button data-storage="bag" class="${options.container === 'bag' ? 'active' : ''}" aria-pressed="${options.container === 'bag'}"><span>旅人行囊</span><b>${s.inventory.length}<small> / ${INVENTORY_CAPACITY}</small></b></button><button data-storage="vault" class="${options.container === 'vault' ? 'active' : ''}" aria-pressed="${options.container === 'vault'}"><span>传奇保管箱</span><b>${vault.length}<small> / ${VAULT_CAPACITY}</small></b></button></div><p class="treasure-rule">传奇掉落在行囊满时自动进入保管箱；两处都满则保留最后一件并暂停，不会自动卖掉传奇。非传奇溢出仍折算金币。</p></section>
  ${s.pendingLoot ? `<section class="panel pending-loot"><span class="eyebrow">SAFE IN THE KEEPER'S HANDS</span><h2>待处理宝物 · 1 件</h2><p>腾出空间后可领取，也可直接装备、出售或上架。处理完成后，请回冒险页继续挂机。</p>${itemRows([s.pendingLoot], s)}</section>` : ''}
  <section class="panel treasure-list"><div class="panel-title"><h2>${options.container === 'vault' ? '守灯人的保管箱' : '旅人的行囊'}</h2><span class="muted">${items.length} 件符合条件</span></div><div class="treasure-filters"><div class="tabs">${['all', 'magic', 'rare', 'legendary', 'locked'].map(value => `<button data-filter="${value}" class="${options.filter === value ? 'active' : ''}">${rarity[value] || (value === 'locked' ? '已锁定' : '全部')}</button>`).join('')}</div><div class="treasure-sort"><button data-sort="newest" aria-pressed="${options.sort === 'newest'}">最近获得</button><button data-sort="power" aria-pressed="${options.sort === 'power'}">威能排序</button></div></div><div class="inventory-list">${itemRows(items.slice(options.page * 24, (options.page + 1) * 24), s)}</div>${pages > 1 ? `<div class="treasure-pagination"><button class="outline" data-bag-page="${options.page - 1}" ${options.page === 0 ? 'disabled' : ''}>上一页</button><span>${options.page + 1} / ${pages}</span><button class="outline" data-bag-page="${options.page + 1}" ${options.page === pages - 1 ? 'disabled' : ''}>下一页</button></div>` : ''}${options.container === 'bag' ? `<div class="bulk-sale"><div><b>出售未锁定的魔法装备</b><p>仅整理行囊，跳过已装备、已锁定、稀有和传奇物品。</p><small>当前 ${expendable.length} 件 · 约 ${fmt(value)} 金币</small></div><button class="outline" data-act="sellMagic" ${expendable.length ? '' : 'disabled'}>出售魔法装备</button></div>` : '<p class="note">可直接在详情里装备、上架或出售；领取到行囊需要空位。锁定不会影响装备和领取。</p>'}</section>`;
}

export function itemDetailMarkup(game, id) {
  const comparison = game.compareItem(id);
  if (!comparison) return '';
  const { item, before, after, currentItem } = comparison;
  const s = game.state, worn = currentItem?.id === id;
  const place = s.inventory.some(i => i.id === id) ? '行囊' : s.pendingLoot?.id === id ? '待处理' : '保管箱';
  const measures = [
    ['dps', '面板伤害', false, ''], ['bossDps', '首领伤害 / 秒', false, ''],
    ['defense', '防御', false, ''], ['magicFind', '寻宝加成', false, '%'], ['huntSeconds', '每轮清剿用时', true, ' 秒'],
  ];
  const canClaim = place !== '行囊' && (s.inventory.length < INVENTORY_CAPACITY || place === '待处理' && s.vault.length < VAULT_CAPACITY);
  const blockedEquip = !currentItem && place !== '行囊' && s.inventory.length >= INVENTORY_CAPACITY;
  return `<button class="close" data-close aria-label="关闭">×</button><span class="eyebrow">${rarity[item.rarity]} · ${slots[item.slot]} · ${place}</span><div class="treasure-detail ${item.rarity}"><span class="treasure-art">${itemImage(item)}</span><div><h2>${esc(item.name)}</h2><p>${elements[item.element]}亲和 · ${item.bonus}%</p><b>${fmt(item.power)} <small>装备威能</small></b></div></div><button class="item-lock" data-lock="${esc(id)}" aria-pressed="${Boolean(item.locked)}">${item.locked ? '◆ 已锁定 · 点击解锁' : '◇ 锁定这件装备'}</button><ul class="affixes">${item.affixes.map(affix => `<li>✧ ${esc(affix)}</li>`).join('')}</ul><section class="equipment-comparison"><div class="comparison-title"><b>${worn ? '当前正在装备' : '换装后的实际变化'}</b><small>按当前流派、技能与猎场计算</small></div><div class="comparison-columns"><span>属性</span><span>现在</span><span>换上后</span><span>变化</span></div>${measures.map(([key, name, inverse, unit]) => {
    const delta = after[key] - before[key], unchanged = Math.abs(delta) < 0.005;
    const quality = unchanged ? 'same' : (inverse ? delta < 0 : delta > 0) ? 'better' : 'worse';
    const format = value => key === 'huntSeconds' ? value.toFixed(2) : fmt(value);
    return `<div class="comparison-row" data-compare="${key}"><span>${name}</span><span>${format(before[key])}${unit}</span><b>${format(after[key])}${unit}</b><em class="${quality}">${unchanged ? '—' : `${delta > 0 ? '+' : '−'}${format(Math.abs(delta))}${unit}`}</em></div>`;
  }).join('')}<p>清剿用时越短越好；寻宝变化按百分点计。<br>${worn ? '此物品正在使用。' : currentItem ? `将替换：${esc(currentItem.name)}` : '当前槽位为空。'}${blockedEquip ? ' 此槽位为空，请先腾出一个行囊空位再装备。' : place !== '行囊' && s.inventory.length >= INVENTORY_CAPACITY ? ' 行囊已满时，原装备会交换回此位置；不会丢弃。' : ''}</p></section><div class="treasure-actions"><button class="primary" data-equip="${esc(id)}" ${worn || blockedEquip ? 'disabled' : ''}>${worn ? '正在装备' : blockedEquip ? '先整理一个空位' : '装备这件遗物'}</button><button class="outline" data-sell="${esc(id)}" ${worn || item.locked ? 'disabled' : ''}>出售 · ${fmt(item.value)} 金币</button><button class="outline" data-list="${esc(id)}" ${worn || item.locked ? 'disabled' : ''}>上架 · ${fmt(Math.round(item.value * 1.5))} 金币</button>${place !== '行囊' ? `<button class="outline" data-claim="${esc(id)}" ${canClaim ? '' : 'disabled'}>${place === '待处理' && s.inventory.length >= INVENTORY_CAPACITY ? '收入保管箱' : '领取到行囊'}</button>` : ''}</div><p class="note">${item.locked ? '已锁定：不会被出售、批量整理或上架。' : '珍惜的宝物可以锁定；已装备物品也不会被出售。'}${place !== '行囊' && !canClaim ? ' 领取前请先整理一个空位。' : ''}</p>`;
}
