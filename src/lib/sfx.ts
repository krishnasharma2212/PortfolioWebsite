"use client";

import { useSyncExternalStore } from "react";

/**
 * Interface sound, synthesised — no files to download. Off until the visitor
 * turns it on; the choice is remembered. Every sound is under 200 ms and
 * quiet, the way a good edit uses SFX: felt more than heard.
 */
type Kind = "tick" | "select" | "whoosh" | "cut";

const KEY = "ks-sound";
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;
let enabled: boolean | null = null;

const isOn = () => {
  if (enabled === null) enabled = typeof localStorage !== "undefined" && localStorage.getItem(KEY) === "1";
  return enabled;
};

export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  if (on) {
    ctx ??= new AudioContext();
    void ctx.resume();
    play("select");
  }
  listeners.forEach((l) => l());
}

export function useSound() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    isOn,
    () => false,
  );
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

export function play(kind: Kind) {
  if (!isOn()) return;
  ctx ??= new AudioContext();
  const c = ctx;
  const t = c.currentTime;
  const out = c.createGain();
  out.connect(c.destination);

  if (kind === "tick") {
    const o = c.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(2400, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.03);
    out.gain.setValueAtTime(0.035, t);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    o.connect(out);
    o.start(t);
    o.stop(t + 0.05);
  } else if (kind === "select") {
    [660, 990].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, t + i * 0.06);
      g.gain.setValueAtTime(0.0001, t + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.06, t + i * 0.06 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.16);
      o.connect(g).connect(out);
      o.start(t + i * 0.06);
      o.stop(t + i * 0.06 + 0.18);
    });
    out.gain.value = 1;
  } else if (kind === "whoosh" || kind === "cut") {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 0.35);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = kind === "cut" ? 4 : 1.2;
    bp.frequency.setValueAtTime(kind === "cut" ? 3200 : 400, t);
    bp.frequency.exponentialRampToValueAtTime(kind === "cut" ? 900 : 2600, t + 0.22);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(kind === "cut" ? 0.09 : 0.07, t + 0.05);
    out.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "cut" ? 0.12 : 0.3));
    src.connect(bp).connect(out);
    src.start(t);
    src.stop(t + 0.34);
  }
}
