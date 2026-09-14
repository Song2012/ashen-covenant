const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = value => Math.round(value || 0).toLocaleString('zh-CN');
const elements = { physical: '物理', magic: '魔法', fire: '火焰', frost: '冰霜', lightning: '闪电', poison: '毒素', shadow: '暗影' };

export function forgeMarkup(game, id) {
  const quote = game.forgeQuote(id);
  if (!quote?.item) return '';
  const { item, rank, maxRank, bonusBefore, bonusAfter, costShards, costGold, canForge, reason } = quote;
  const complete = rank >= maxRank;
  return `<details class="ember-forge" data-forge-panel><summary><span class="forge-symbol" aria-hidden="true">✦</span><span><b>余烬精炼</b><small>${complete ? '此物的炉火已至极盛' : '让值得留下的遗物，再燃一次'}</small></span><em>${rank} / ${maxRank}<span aria-hidden="true">⌄</span></em></summary><div class="forge-body"><p>烬灯堡的铁匠以余烬淬炼遗物。每阶固定提高 <strong>3 个百分点</strong>的元素亲和，最多 ${maxRank} 阶。</p><div class="forge-upgrade"><span>${elements[item.element]}亲和</span><b data-forge-before>${bonusBefore}%</b><span aria-hidden="true">→</span><b data-forge-after>${bonusAfter}%</b></div><p class="forge-affinity-note">亲和只强化相同伤害类型的流派；精炼不改变威能、品质或元素。</p>${complete ? '<p class="forge-complete">五道炉印已铭刻，无需再投入材料。</p>' : `<div class="forge-costs"><div><span>所需余烬</span><b data-forge-cost-shards>${fmt(costShards)}</b><small class="${game.state.shards < costShards ? 'short' : ''}">持有 ${fmt(game.state.shards)}</small></div><div><span>所需金币</span><b data-forge-cost-gold>${fmt(costGold)}</b><small class="${game.state.gold < costGold ? 'short' : ''}">持有 ${fmt(game.state.gold)}</small></div></div><button class="primary wide" data-forge="${esc(id)}" ${canForge ? '' : 'disabled'}>消耗材料 · 精炼至 ${rank + 1} 阶</button>`}<p class="forge-status" role="status">${canForge ? '固定提升，不会失败。材料消耗后不退还；装备保持当前穿戴状态。' : esc(reason || '当前无法精炼。')}</p></div></details>`;
}

export function refreshForge(game, id, dialog) {
  const panel = dialog.querySelector('[data-forge-panel]');
  if (!dialog.open || !panel?.open) return;
  const quote = game.forgeQuote(id);
  const stamp = JSON.stringify([game.state.gold, game.state.shards, quote.rank, quote.bonusBefore, quote.canForge, quote.reason]);
  if (panel.dataset.quoteState === stamp) return;
  const hadButtonFocus = dialog.ownerDocument.activeElement === panel.querySelector('[data-forge]');
  const template = dialog.ownerDocument.createElement('template');
  template.innerHTML = forgeMarkup(game, id);
  const body = template.content.querySelector('.forge-body');
  if (!body) return;
  panel.querySelector('.forge-body').replaceWith(body);
  panel.dataset.quoteState = stamp;
  if (hadButtonFocus) {
    const button = panel.querySelector('[data-forge]');
    (button && !button.disabled ? button : panel.querySelector('summary')).focus({ preventScroll: true });
  }
}
