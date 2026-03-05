function makeCtx() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

function tone(ac, freq, start, duration, volume = 0.25, type = "sine") {
  const osc  = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  gain.gain.setValueAtTime(volume, ac.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + duration);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

/** 100分：C大调上行琶音 + 终止和弦 */
export function playPerfect() {
  try {
    const ac = makeCtx();
    tone(ac, 523,  0.00, 0.14);        // C5
    tone(ac, 659,  0.12, 0.14);        // E5
    tone(ac, 784,  0.24, 0.14);        // G5
    tone(ac, 1047, 0.36, 0.55, 0.35); // C6 hold
    tone(ac, 784,  0.36, 0.55, 0.18); // G5 chord
    tone(ac, 523,  0.36, 0.55, 0.12); // C5 chord
    setTimeout(() => ac.close(), 2000);
  } catch {}
}

/** 80分以上：两音上升 */
export function playGood() {
  try {
    const ac = makeCtx();
    tone(ac, 523, 0.00, 0.14);
    tone(ac, 659, 0.13, 0.28);
    setTimeout(() => ac.close(), 1000);
  } catch {}
}

/** 60分：轻柔提示音 */
export function playEncourage() {
  try {
    const ac = makeCtx();
    tone(ac, 440, 0.00, 0.22, 0.18);
    tone(ac, 392, 0.20, 0.28, 0.12);
    setTimeout(() => ac.close(), 1000);
  } catch {}
}

/** Combo：电子游戏风格号角 */
export function playCombo() {
  try {
    const ac = makeCtx();
    [
      [659,  0.00, 0.08, 0.30],
      [784,  0.08, 0.08, 0.30],
      [988,  0.16, 0.08, 0.30],
      [1319, 0.24, 0.50, 0.40],
      [1047, 0.24, 0.50, 0.25],
      [784,  0.24, 0.50, 0.15],
    ].forEach(([f, s, d, v]) => tone(ac, f, s, d, v, "triangle"));
    setTimeout(() => ac.close(), 2000);
  } catch {}
}

/** Combo x3+：叮叮叮 三音上升音阶 */
export function playComboScale() {
  try {
    const ac = makeCtx();
    [
      [523,  0.00, 0.18, 0.32],   // 叮  C5
      [659,  0.17, 0.18, 0.38],   // 叮  E5
      [784,  0.34, 0.18, 0.42],   // 叮  G5
      [1047, 0.52, 0.55, 0.42],   // 叮! C6 hold
    ].forEach(([f, s, d, v]) => tone(ac, f, s, d, v));
    setTimeout(() => ac.close(), 2500);
  } catch {}
}

/** 录音成功惊喜：3 种随机音效 */
export function playSurprise() {
  try {
    const ac   = makeCtx();
    const type = Math.floor(Math.random() * 3);

    if (type === 0) {
      // 0 — 礼花爆裂：急速上行 + 散落余音
      [
        [659,  0.00, 0.04, 0.45, "square"],
        [880,  0.03, 0.04, 0.40, "square"],
        [1108, 0.06, 0.04, 0.40, "square"],
        [1568, 0.10, 0.07, 0.38],
        [1318, 0.17, 0.09, 0.28],
        [1047, 0.25, 0.12, 0.20],
        [784,  0.36, 0.16, 0.13],
      ].forEach(([f, s, d, v = 0.3, t = "sine"]) => tone(ac, f, s, d, v, t));

    } else if (type === 1) {
      // 1 — 卡通欢呼：滑音上升 + 高音叮
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(280, ac.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, ac.currentTime + 0.28);
      gain.gain.setValueAtTime(0.28, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.52);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.54);
      tone(ac, 1047, 0.30, 0.42, 0.30);

    } else {
      // 2 — 金币掉落：高频 triangle 多重叮击
      [
        [1568, 0.00, 0.06, 0.48, "triangle"],
        [1319, 0.05, 0.06, 0.38, "triangle"],
        [1568, 0.11, 0.05, 0.32, "triangle"],
        [1047, 0.16, 0.05, 0.26, "triangle"],
        [1319, 0.21, 0.06, 0.30, "triangle"],
        [1568, 0.27, 0.08, 0.18, "triangle"],
      ].forEach(([f, s, d, v, t]) => tone(ac, f, s, d, v, t));
    }

    setTimeout(() => ac.close(), 2200);
  } catch {}
}

/** 通关获得贴纸：快乐叮当声 */
export function playSticker() {
  try {
    const ac = makeCtx();
    [
      [523,  0.00, 0.10],
      [659,  0.10, 0.10],
      [784,  0.20, 0.10],
      [1047, 0.30, 0.45, 0.30],
    ].forEach(([f, s, d, v = 0.25]) => tone(ac, f, s, d, v));
    setTimeout(() => ac.close(), 2000);
  } catch {}
}
