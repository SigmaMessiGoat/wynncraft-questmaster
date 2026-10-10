/**
 * WebAudio sound effects — synthesized, so no audio assets are needed.
 * All sounds are opt-out via the toggle in the header.
 */

let ctx = null;

function ac() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq, start = 0, dur = 0.18, type = 'triangle', gain = 0.14, dest }) {
  const t0 = dest.currentTime + start;
  const osc = dest.createOscillator();
  const g = dest.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(dest.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** UI click — a dry wooden tick. */
export function playTick() {
  const c = ac();
  if (!c) return;
  tone({ freq: 660, dur: 0.06, type: 'square', gain: 0.05, dest: c });
}

/** Quest turn-in fanfare — ascending major arpeggio + octave shimmer. */
export function playVictory() {
  const c = ac();
  if (!c) return;
  const seq = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  seq.forEach((f, i) => tone({ freq: f, start: i * 0.09, dur: 0.35, type: 'triangle', gain: 0.16, dest: c }));
  tone({ freq: 1568, start: 0.5, dur: 0.7, type: 'sine', gain: 0.1, dest: c });
}

/** Level-up — a brighter, longer flourish. */
export function playLevelUp() {
  const c = ac();
  if (!c) return;
  const seq = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
  seq.forEach((f, i) => tone({ freq: f, start: i * 0.07, dur: 0.4, type: 'triangle', gain: 0.15, dest: c }));
  tone({ freq: 2093, start: 0.55, dur: 0.9, type: 'sine', gain: 0.09, dest: c });
}

/** Stage tick — soft ascending blip. */
export function playStageDone() {
  const c = ac();
  if (!c) return;
  tone({ freq: 880, dur: 0.1, type: 'triangle', gain: 0.1, dest: c });
  tone({ freq: 1174.66, start: 0.07, dur: 0.14, type: 'triangle', gain: 0.1, dest: c });
}
