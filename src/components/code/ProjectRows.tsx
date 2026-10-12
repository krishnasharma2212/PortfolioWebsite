"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/content";
import { asset, info } from "@/lib/media";
import { finePointer } from "@/lib/motion";
import { play } from "@/lib/sfx";

const still = (p: Project) => {
  const src = p.shot?.src ?? p.stages?.[0]?.src;
  return src ? { src: asset(src), w: info(src)?.w, h: info(src)?.h } : undefined;
};

/**
 * Shipped work as an index: big names, one line each. On a mouse, the
 * product's own screenshot follows the cursor; on touch it sits inline.
 */
export default function ProjectRows({ items, href = "/code" }: { items: Project[]; href?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const float = useRef<HTMLDivElement>(null);

  // the screenshot trails the cursor, easing out over ~0.6 s
  useEffect(() => {
    const el = float.current;
    if (!el || !finePointer()) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let last = 0;
    const step = (now: number) => {
      const k = 1 - Math.exp(-(now - (last || now - 16)) / 120); // frame-rate independent
      last = now;
      x += (tx - x) * k;
      y += (ty - y) * k;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(step) : 0;
      if (!raf) last = 0;
    };
    const move = (e: PointerEvent) => {
      tx = e.clientX + 28;
      ty = e.clientY - 120;
      if (!raf) raf = requestAnimationFrame(step);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative" onPointerLeave={() => setHover(null)}>
      <ol className="border-t border-white/10">
        {items.map((p, i) => (
          <li key={p.name} className="border-b border-white/10">
            <Link
              href={`${href}#${p.name.toLowerCase().replace(/\s+/g, "-")}`}
              onPointerEnter={() => {
                setHover(i);
                play("tick");
              }}
              className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2 py-7 transition-colors md:grid-cols-[3rem_minmax(0,1.1fr)_minmax(0,1.4fr)_auto] md:gap-x-8 md:py-9"
            >
              <span className="mono text-[11px] text-faint tabular">{String(i + 1).padStart(2, "0")}</span>
              <span
                className="display text-[clamp(48px,7vw,104px)] transition-[color,transform] duration-500 group-hover:translate-x-2"
                style={{ fontStretch: "50%", color: hover === i ? "var(--accent)" : undefined }}
              >
                {p.name}
              </span>
              <span className="col-span-2 max-w-[44ch] text-[15px] leading-snug text-dim md:col-span-1">{p.tagline}</span>
              <span className="col-span-2 flex items-center gap-3 md:col-span-1 md:justify-self-end">
                {p.status && (
                  <span className="label-sm flex items-center gap-1.5 whitespace-nowrap text-paper/80">
                    {p.live && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
                    {p.status}
                  </span>
                )}
                <span className="text-xl text-faint transition-all duration-500 group-hover:-rotate-45 group-hover:text-paper">→</span>
              </span>
              {still(p) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={still(p)!.src}
                  width={still(p)!.w}
                  height={still(p)!.h}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="col-span-2 mt-3 h-auto w-full rounded-xl border border-white/10 md:hidden"
                />
              )}
            </Link>
          </li>
        ))}
      </ol>

      <div
        ref={float}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 hidden w-[340px] md:block"
        style={{ opacity: hover === null ? 0 : 1, transition: "opacity .3s" }}
      >
        {items.map((p, i) =>
          still(p) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.name}
              src={still(p)!.src}
              alt=""
              loading="lazy"
              className="absolute left-0 top-0 w-full rounded-xl border border-white/15 bg-ink-2 shadow-2xl shadow-black/60 transition-all duration-500"
              style={{
                opacity: hover === i ? 1 : 0,
                transform: hover === i ? "scale(1) rotate(-2deg)" : "scale(.94) rotate(0deg)",
              }}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}
