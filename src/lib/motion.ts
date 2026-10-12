"use client";

import type Lenis from "lenis";

let lenis: Lenis | null = null;

/**
 * GSAP isn't part of every page: only /edit's pinned breakdown uses it
 * (lib/gsap.ts). When ScrollTrigger loads it registers here, so it follows
 * Lenis' smoothed scroll and refreshes when the route changes.
 */
export const scrollSync: { update: (() => void) | null; refresh: (() => void) | null } = { update: null, refresh: null };

export const setLenis = (l: Lenis | null) => {
  lenis = l;
  l?.on("scroll", () => scrollSync.update?.());
};
export const getLenis = () => lenis;

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Scroll to an element or y, through Lenis when it is running. */
export function scrollToTarget(target: string | number | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4 });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  const y = typeof el === "number" ? el : el ? el.getBoundingClientRect().top + window.scrollY : 0;
  window.scrollTo({ top: y + offset, behavior: reducedMotion() ? "auto" : "smooth" });
}

/** HH:MM:SS:FF for a frame count. */
export function timecode(frame: number, fps = 30) {
  const f = Math.max(0, Math.floor(frame));
  const ff = f % fps;
  const s = Math.floor(f / fps);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(ff)}`;
}

/** SS:FF — short form for clips under a minute. */
export function shortTC(seconds: number, fps = 30) {
  const f = Math.max(0, Math.round(seconds * fps));
  return `${String(Math.floor(f / fps)).padStart(2, "0")}:${String(f % fps).padStart(2, "0")}`;
}
