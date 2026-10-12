"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef } from "react";
import type { Grade } from "@/lib/content";

type Word = { key: Grade; text: string; color: string };

const ORDER: Record<Grade, number> = { edit: 0, neutral: 1, code: 2 };
const DUR = 720;

/**
 * Poster-scale words stacked in one box. Each is fitted to the full width by
 * solving for its own font-stretch (Roboto Flex's wdth axis, 25–151%), so
 * KRISHNA, EDITOR and ENGINEER all span edge to edge at the same height.
 * Changing word is a wipe, travelling toward the side that was chosen.
 */
export default function GiantWord({
  words,
  active,
  className = "",
  onFit,
}: {
  words: Word[];
  active: Grade;
  className?: string;
  onFit?: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const prev = useRef<Grade>(active);
  const fitted = useEffectEvent(() => onFit?.());

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let raf = 0;
    const fit = () => {
      const W = el.clientWidth;
      const spans = [...el.querySelectorAll<HTMLElement>("[data-word]")];
      el.style.fontSize = "";
      const base = parseFloat(getComputedStyle(el).fontSize);
      // If even the narrowest cut of any word overflows, shrink them all together.
      let scale = 1;
      for (const s of spans) {
        s.style.fontStretch = "25%";
        scale = Math.min(scale, W / s.offsetWidth);
      }
      if (scale < 1) el.style.fontSize = `${base * scale * 0.995}px`;
      for (const s of spans) {
        let lo = 25;
        let hi = 151;
        for (let i = 0; i < 10; i++) {
          const mid = (lo + hi) / 2;
          s.style.fontStretch = `${mid}%`;
          if (s.offsetWidth > W) hi = mid;
          else lo = mid;
        }
        s.style.fontStretch = `${lo}%`;
      }
      el.dataset.fit = "1";
      fitted();
    };
    // Fit only with the display face itself: the fallback is a different width,
    // and a fit made with it would visibly re-fit (and shift) when the font lands.
    let ready = false;
    const family = getComputedStyle(el.querySelector("[data-word]") ?? el).fontFamily;
    void document.fonts
      .load(`900 100px ${family}`)
      .catch(() => {})
      .then(() => {
        ready = true;
        fit();
      });
    const ro = new ResizeObserver(() => {
      if (!ready) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  useLayoutEffect(() => {
    const from = prev.current;
    if (from === active || !box.current) return;
    prev.current = active;
    const leftward = ORDER[active] < ORDER[from]; // edge travels toward the chosen side
    const incoming = box.current.querySelector<HTMLElement>(`[data-word="${active}"]`);
    const outgoing = box.current.querySelector<HTMLElement>(`[data-word="${from}"]`);
    const ease = "cubic-bezier(0.76, 0, 0.24, 1)";
    const full = "inset(0 0 0 0)";
    const hideR = "inset(0 100% 0 0)"; // edge parked at the left
    const hideL = "inset(0 0 0 100%)"; // edge parked at the right
    incoming?.animate([{ clipPath: leftward ? hideL : hideR }, { clipPath: full }], { duration: DUR, easing: ease, fill: "forwards" });
    outgoing?.animate([{ clipPath: full }, { clipPath: leftward ? hideR : hideL }], { duration: DUR, easing: ease, fill: "forwards" });
    line.current?.animate(
      [
        { left: leftward ? "100%" : "0%", opacity: 1 },
        { left: leftward ? "0%" : "100%", opacity: 1 },
      ],
      { duration: DUR, easing: ease, fill: "none" },
    );
  }, [active]);

  return (
    <div ref={box} className={`gw relative select-none ${className}`} aria-hidden>
      {words.map((w) => (
        <span
          key={w.key}
          data-word={w.key}
          className="display absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap"
          style={{
            color: w.color,
            clipPath: w.key === active ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            fontStretch: "42%",
          }}
        >
          {w.text}
        </span>
      ))}
      {/* sizing ghost: gives the box its height */}
      <span className="display invisible block whitespace-nowrap" style={{ fontStretch: "42%" }}>
        K
      </span>
      <div
        ref={line}
        className="pointer-events-none absolute -top-[6%] bottom-[-6%] w-px opacity-0"
        style={{ background: "linear-gradient(transparent, var(--color-paper), transparent)", boxShadow: "0 0 18px 2px rgb(255 255 255 / .35)" }}
      />
    </div>
  );
}
