/**
 * Tiny synthesized-sound utility for the optional Matrix terminal audio
 * (keyboard ticks + beeps). No audio files are bundled — everything is
 * generated on the fly with the Web Audio API, which keeps the bundle
 * light and avoids any licensing/asset concerns.
 *
 * Mute state persists across visits via localStorage and is readable
 * synchronously (needed before the first user gesture unlocks audio).
 */

const STORAGE_KEY = "matrix-portfolio:muted";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioCtx = new Ctor();
  return audioCtx;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function setMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  window.dispatchEvent(new CustomEvent("matrix:mute-changed", { detail: { muted } }));
}

function playTone(freq: number, durationMs: number, type: OscillatorType, gainPeak: number) {
  if (isMuted()) return;
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.0001;

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
}

/** Short, quiet click for terminal typing animations. */
export function playTypingTick(): void {
  const freq = 620 + Math.random() * 220;
  playTone(freq, 28, "square", 0.02);
}

/** Confirmation beep for command execution / boot milestones. */
export function playBeep(): void {
  playTone(880, 120, "sine", 0.05);
}

/** Lower, longer tone used for easter-egg reveals. */
export function playEasterEggChime(): void {
  playTone(440, 90, "triangle", 0.05);
  setTimeout(() => playTone(660, 140, "triangle", 0.05), 90);
}
