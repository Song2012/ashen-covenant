import { MONSTERS } from './encounters.js';
import { monsterPortraitDataUrl } from './monster-art.js';
import { WORLD, chapterFor } from './world.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const number = value => Math.max(0, Math.round(value || 0)).toLocaleString('zh-CN');

export function journalMarkup(state) {
  const unlocked = WORLD.chapters.filter(c => c.level <= state.level).length;
  return `<section class="panel journal-intro"><span class="eyebrow">THE EMBER ARCHIVE · ${WORLD.era}</span><h2>${WORLD.title}</h2><p>${WORLD.premise}</p><div class="journal-progress"><b>${unlocked} / 4</b><span>已开放的地区档案<br><small>抵达地区推荐等级后，自动开放故事与敌人档案。</small></span></div></section>${WORLD.chapters.map(chapter => {
    if (chapter.level > state.level) return `<section class="panel locked-chapter"><span class="chapter-index">${chapter.numeral}</span><div><b>${chapter.title}</b><p>等级 ${chapter.level} · 档案尚未开放</p></div></section>`;
    return `<section class="panel lore-chapter" data-chapter="${chapter.id}"><div class="lore-heading"><span class="chapter-index">${chapter.numeral}</span><div><h2>${chapter.title}</h2><small>档案遗物 · ${chapter.relic}</small></div></div><p class="lore-body">${chapter.text}</p><blockquote class="lore-quote">“${chapter.quote}”<cite>— ${chapter.speaker}</cite></blockquote><div class="lore-revelation"><small>记录中的线索</small>${chapter.revelation}</div><div class="bestiary">${MONSTERS[chapter.id].map(monster => `<article class="bestiary-card" data-monster="${monster.id}"><img src="${monsterPortraitDataUrl(monster)}" alt="${esc(monster.name)}像素图鉴"><h3>${monster.name}</h3><small>${monster.trait} · 遭遇生命 ${monster.maxHp}</small><p>${monster.lore}</p></article>`).join('')}</div></section>`;
  }).join('')}<section class="panel"><div class="panel-title"><h2>${WORLD.boss.title}</h2><span class="small-tag">${state.boss.kills ? '王座记录已开放' : '击败首领后开放'}</span></div><p class="lore-body">${state.boss.kills ? WORLD.boss.text : '有一位君王仍在等待天亮。档案中有关他的那一页，被人撕去了。'}</p><p class="note">档案为世界背景。敌人的不同称号与精英冠饰在本版用于辨识外观；地区抗性和等级决定当前作战效率。</p></section>`;
}

export function settingsMarkup(settings, audio) {
  return `<section class="panel settings-panel"><span class="eyebrow">MAKE THE NIGHT YOUR OWN</span><h2 style="margin:14px 0">旅途设置</h2><p>让长夜保持你喜欢的节奏。设置自动保存，切换页面和重新打开游戏后仍会保留。</p><div class="setting-row"><div><b>战斗与界面音效</b><small>轻声记录命中与收获。默认关闭，随时可静音。</small></div><button class="setting-toggle" data-setting="muted" aria-pressed="${!settings.muted}">${settings.muted ? '开启音效' : '音效已开启'}</button></div><label class="setting-row"><span><b>音效音量</b><small>调整战斗、拾取和界面的整体音量。</small></span><span class="setting-controls"><input aria-label="音效音量" id="volume-slider" type="range" min="0" max="100" step="5" value="${Math.round(settings.volume * 100)}"><output id="volume-output">${Math.round(settings.volume * 100)}%</output></span></label><div class="setting-row"><div><b>减少动态效果</b><small>关闭位移、击退和闪动，保留战况与静态技能提示。</small></div><button class="setting-toggle" data-setting="reducedMotion" aria-pressed="${settings.reducedMotion}">${settings.reducedMotion ? '已减少动效' : '标准动效'}</button></div><div class="journey-outlook"><b>离开也在成长</b><br>关闭页面后最多结算八小时的离线收益；暂停挂机后，离线期间也会暂停。世界首领与市场目前是本地模拟。</div><p class="settings-fineprint">${audio.diagnostics().available ? '开启音效后即可播放；页面在后台或挂机暂停时保持安静。' : '当前浏览器无法播放音效，挂机与存档仍可正常使用。'}<br>本机存档只属于当前浏览器与网址。当前尚不提供账号同步。</p></section>`;
}

export function adventureStory(state) {
  const chapter = chapterFor(state.zoneId);
  const next = WORLD.chapters.find(c => c.level > state.level);
  return `<p class="chapter-story">“${chapter.quote}” <button data-page="journal">阅读地区档案 →</button></p><p class="note">${next ? `下一段征途：等级 ${next.level} · ${next.title}` : '四处猎场均已开放。调整流派与元素亲和，寻找适合自己的宝物。'}</p>`;
}

export function updateCombatHud(game) {
  const view = game.combat(), state = game.state;
  const progressLabel = document.querySelector('#run-progress'), progressMeter = document.querySelector('#run-meter span');
  if (progressLabel) progressLabel.textContent = `${Math.floor(view.progress * 100)}%`;
  if (progressMeter) progressMeter.style.width = `${Math.min(100, Math.max(0, view.progress * 100))}%`;
  const root = document.querySelector('#encounter-hud');
  if (!root) return;
  const phases = { approach: '追猎接敌', attack: '自动交战', defeat: '敌人倒下', loot: '收集战利品', fishing: '静候咬钩', paused: '远征暂停' };
  root.dataset.elite = Boolean(view.monster?.elite); root.dataset.activity = view.activity;
  document.querySelector('#encounter-name').textContent = view.monster?.name || '幽潭 · 无声的水面';
  document.querySelector('#encounter-phase').textContent = phases[view.phase] || '远征';
  const percent = view.monster ? view.monster.hp / view.monster.maxHp * 100 : view.progress * 100;
  const meter = document.querySelector('#enemy-meter');
  meter.setAttribute('aria-label', view.monster ? '当前敌人生命' : '垂钓进度'); meter.setAttribute('aria-valuenow', Math.round(percent));
  document.querySelector('#enemy-health').style.width = `${Math.max(0, Math.min(100, percent))}%`;
  document.querySelector('#encounter-trait').textContent = view.activity === 'boss' ? '你的伤害与模拟同伴共同结算' : view.monster?.trait || '鱼获与偶得的宝物自动入账';
  document.querySelector('#encounter-hp').textContent = view.monster ? `${number(view.monster.hp)} / ${number(view.monster.maxHp)}` : `${Math.floor(view.progress * 100)}% · ${number(state.fish)} 尾`;
  document.querySelector('#scene-caption').textContent = !state.running ? '远征已暂停' : ['defeat', 'loot'].includes(view.phase) ? `${view.monster.name}已倒下 · ${view.phase === 'loot' ? '正在拾取战利品' : '即将收集战利品'}` : view.lastReward?.item ? `最近拾取：${view.lastReward.item.name}${view.lastReward.autoSold ? '（行囊已满，自动出售）' : ''}` : view.activity === 'hunt' ? `本轮第 ${Math.min(3, view.attackIndex + 1)} 次出手 · 战斗与拾取全自动` : phases[view.phase];
}
