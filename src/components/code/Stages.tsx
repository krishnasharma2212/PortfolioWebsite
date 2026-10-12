"use client";

import { useEffect, useRef, useState } from "react";
import type { Stage } from "@/lib/content";
import { asset } from "@/lib/media";
import { play } from "@/lib/sfx";

/** A pipeline, stepped through stage by stage with its own screenshots. Auto-advances while on screen. */
export default function Stages({ stages, name }: { stages: Stage[]; name: string }) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const visible = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const id = setInterval(() => {
      if (auto && visible.current) setI((n) => (n + 1) % stages.length);
    }, 3600);
    return () => {
      io.disconnect();
      clearInterval(id);
    };
  }, [auto, stages.length]);

  return (
    <div ref={root} className="grid gap-5">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] border border-white/10 bg-ink-2">
        {stages.map((s, n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={asset(s.src)}
            alt={`${name}, stage ${n + 1} — ${s.label}: ${s.caption}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-700"
            style={{ opacity: n === i ? 1 : 0, transform: n === i ? "scale(1)" : "scale(1.02)" }}
          />
        ))}
        <span className="mono absolute left-3 top-3 rounded bg-black/65 px-2 py-1 text-[10px] tracking-[0.12em] text-paper">
          STEP {i + 1} / {stages.length}
        </span>
      </div>
      <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-6" aria-label={`${name} pipeline`}>
        {stages.map((s, n) => (
          <li key={s.label}>
            <button
              type="button"
              onClick={() => {
                setI(n);
                setAuto(false);
                play("tick");
              }}
              aria-current={n === i ? "step" : undefined}
              className="relative w-full overflow-hidden rounded-lg border px-2.5 py-2 text-left transition-colors"
              style={{ borderColor: n === i ? "var(--color-code)" : "rgb(255 255 255 / .1)", background: n === i ? "rgb(63 216 201 / .08)" : "transparent" }}
            >
              <span className="mono block text-[10px] text-faint">0{n + 1}</span>
              <span className="block truncate text-[12.5px]" style={{ color: n === i ? "var(--color-paper)" : "var(--color-dim)" }}>
                {s.label}
              </span>
              {n === i && auto && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[var(--color-code)]" style={{ animation: "stageBar 3.6s linear forwards" }} />
              )}
            </button>
          </li>
        ))}
      </ol>
      <p key={i} className="min-h-[3.2em] text-[15px] leading-relaxed text-dim animate-[fadeUp_.45s_var(--ease-out-expo)]">
        {stages[i].caption}
      </p>
      <style>{`@keyframes stageBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
