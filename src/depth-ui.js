import { DEPTHS } from './engine.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = value => Math.round(value || 0).toLocaleString('zh-CN');

export function depthMarkup(game) {
  const state = game.state;
  const depth = state.depth || 0;
  const selected = game.expeditionQuote(depth);
  return `<section class="panel expedition-depth"><div class="depth-heading"><div><span class="eyebrow">BENEATH THE ASHES</span><h2>选择远征深度</h2></div><span class="small-tag">${depth ? `深层 ${depth}` : '地表巡猎'}</span></div><p>熟悉的猎场之下，仍有未被带回的遗物。深层敌人更耐久，装备威能上限更高；可以随时回到地表。</p><div class="depth-options">${DEPTHS.map(entry => {
    const quote = game.expeditionQuote(entry.id);
    const blocked = !quote.unlocked || Boolean(state.pendingLoot);
    return `<button data-depth="${entry.id}" class="${depth === entry.id ? 'selected' : ''}" aria-pressed="${depth === entry.id}" ${blocked ? 'disabled' : ''} title="${esc(state.pendingLoot ? '请先安置待处理宝物' : quote.reason || '切换深度会重新开始本轮清剿')}"><b>${entry.id === 0 ? '地表' : `深层 ${entry.id}`}</b><small>${quote.unlocked ? `${quote.huntSeconds.toFixed(2)} 秒 / 轮` : `Lv.${entry.level} 解锁`}</small></button>`;
  }).join('')}</div><div class="depth-readout"><div><span>预计每轮</span><b data-depth-seconds>${selected.huntSeconds.toFixed(2)} <small>秒</small></b></div><div><span>基础经验 / 小时</span><b data-depth-xp>${fmt(selected.huntXpPerHour)}</b></div><div><span>掉落底材威能</span><b data-depth-power>${selected.powerBonus ? `+${selected.powerBonus}` : '标准'}${selected.powerBonus ? '<small>再按品质放大</small>' : ''}</b></div></div><p class="depth-note">${state.activity !== 'hunt' ? '当前在进行其他挂机活动，以上是清剿预估；选择深度会切回清剿。' : !state.running ? '远征已暂停。调整深度后仍保持暂停，请点击继续挂机。' : '按当前装备、技能与猎场预估；升级或换装会改变效率。'}<br>深层不提高传奇概率。切换会重新开始本轮，不自动提升难度；首领与钓鱼不获得深层奖励。</p></section>`;
}
