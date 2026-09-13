const KEY = 'ashen-covenant-settings-v1';
export function createSettings(storage) {
  const state = { muted: true, volume: 0.35, reducedMotion: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false };
  try {
    storage ??= globalThis.localStorage;
    const raw = JSON.parse(storage.getItem(KEY) || '{}');
    if (typeof raw.muted === 'boolean') state.muted = raw.muted;
    if (typeof raw.reducedMotion === 'boolean') state.reducedMotion = raw.reducedMotion;
    if (Number.isFinite(raw.volume)) state.volume = Math.max(0, Math.min(1, raw.volume));
  } catch { /* Settings failure must not prevent the game from opening. */ }
  return { state, update(key, value) {
    if (['muted', 'reducedMotion'].includes(key) && typeof value === 'boolean') state[key] = value;
    if (key === 'volume' && Number.isFinite(value)) state.volume = Math.max(0, Math.min(1, value));
    try { storage?.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
  } };
}

// Original synthesized feedback for the combat slice. No external audio assets.
export function createAudio(getSettings) {
  let context, master, lastPlayed = -Infinity, active = true, unavailable = false;
  const voices = new Set();
  function stop() { for (const source of voices) { try { source.stop(); } catch {} } voices.clear(); }
  function sync(running = active) {
    active = running;
    if (master && context) master.gain.setTargetAtTime(getSettings().muted || !active || document.hidden ? 0 : getSettings().volume * 0.22, context.currentTime, 0.03);
    if (!active || getSettings().muted || document.hidden) stop();
  }
  async function unlock() {
    if (getSettings().muted) return;
    try {
      if (!context) { const Audio = globalThis.AudioContext || globalThis.webkitAudioContext; if (!Audio) { unavailable = true; return; } context = new Audio(); master = context.createGain(); master.connect(context.destination); }
      await context.resume(); sync();
    } catch { unavailable = true; }
  }
  function tone(frequency, end, length, type = 'triangle', level = 0.3, delay = 0) {
    if (!context || context.state !== 'running' || voices.size >= 12) return;
    const t = context.currentTime + delay, oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, t); oscillator.frequency.exponentialRampToValueAtTime(end, t + length);
    gain.gain.setValueAtTime(0.001, t); gain.gain.exponentialRampToValueAtTime(level, t + 0.008); gain.gain.exponentialRampToValueAtTime(0.001, t + length);
    oscillator.connect(gain); gain.connect(master); voices.add(oscillator);
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(t); oscillator.stop(t + length + 0.02);
  }
  function play(event) {
    if (!active || document.hidden || getSettings().muted || !context || context.currentTime - lastPlayed < 0.045) return;
    const type = typeof event === 'string' ? event : event.type;
    if (type === 'hit' || type === 'bossHit') {
      const build = event.buildId;
      if (build === 'fireball') { tone(130, 38, 0.2, 'sawtooth', 0.21); tone(420, 90, 0.16, 'triangle', 0.12); }
      else if (build === 'blizzard') { tone(1350, 640, 0.15, 'sine', 0.18); tone(1800, 1000, 0.2, 'sine', 0.1, 0.045); }
      else if (build === 'chainlightning') tone(760, 85, 0.12, 'sawtooth', 0.16);
      else if (build === 'warcry') { tone(160, 65, 0.28, 'triangle', 0.4); tone(240, 96, 0.25, 'sine', 0.17); }
      else { tone(240, 44, 0.13, 'triangle', 0.6); tone(680, 160, 0.07, 'square', 0.08); }
    } else if (type === 'bossDefeat') { tone(100, 34, 0.42, 'triangle', 0.4); tone(440, 440, 0.3, 'sine', 0.16, 0.2); tone(660, 660, 0.4, 'sine', 0.12, 0.32); }
    else if (type === 'defeat') tone(140, 34, 0.32, 'triangle', 0.4);
    else if (type === 'loot' && event.item) { tone(660, 660, 0.14, 'sine', 0.18); tone(990, 990, 0.22, 'sine', 0.12, 0.08); }
    else if (type === 'fish') { tone(280, 610, 0.13, 'sine', 0.23); tone(400, 230, 0.13, 'sine', 0.1, 0.11); }
    else if (type === 'ui') tone(360, 180, 0.05, 'triangle', 0.15);
    else return;
    lastPlayed = context.currentTime;
  }
  const visibility = () => sync(); document.addEventListener('visibilitychange', visibility);
  function playBatch(events) {
    const priority = event => event.type === 'bossDefeat' ? 6 : event.type === 'loot' && event.item ? 5 : event.type === 'defeat' ? 4 : event.type === 'fish' ? 3 : ['hit', 'bossHit'].includes(event.type) ? 2 : 0;
    const event = events.reduce((best, next) => !best || priority(next) > priority(best) ? next : best, null);
    if (event) play(event);
  }
  return { unlock, sync, play, playBatch, diagnostics: () => ({ available: !unavailable, state: context?.state || 'locked', voices: voices.size }), dispose() { stop(); document.removeEventListener('visibilitychange', visibility); context?.close(); } };
}
