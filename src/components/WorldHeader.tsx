import type { ReactNode } from "react";
import type { Grade } from "@/lib/content";
import GiantWord from "./hero/GiantWord";

/** The opening of /edit and /code: the class word, fitted edge to edge, then the pitch. */
export default function WorldHeader({
  grade,
  word,
  kicker,
  title,
  lede,
  facts,
  actions,
}: {
  grade: Exclude<Grade, "neutral">;
  word: string;
  kicker: string;
  title: string;
  lede: string;
  facts: [string, string][];
  actions: ReactNode;
}) {
  return (
    <header className="relative px-[var(--gutter)] pt-[calc(var(--nav-h)+5svh)]" data-grade={grade}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[90svh]" style={{ background: `radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--color-${grade}) 16%, transparent), transparent)` }} />
      <p className="label flex items-center gap-3">
        <span className="mono rounded-[4px] px-1.5 py-0.5 text-[10px] text-ink" style={{ background: `var(--color-${grade})` }}>
          {grade === "edit" ? "P1" : "P2"}
        </span>
        {kicker}
      </p>
      <div className="mt-6 text-[min(42svh,30vw)]">
        <GiantWord words={[{ key: grade, text: word, color: `var(--color-${grade})` }]} active={grade} />
      </div>
      <div className="mx-auto mt-10 grid max-w-[1440px] gap-10 border-t border-white/10 pt-10 md:grid-cols-12 md:pt-14">
        {/* first screen: enters on CSS, not on a scroll reveal that waits for JavaScript */}
        <div className="enter md:col-span-7">
          <h1 className="max-w-[18ch] text-[clamp(30px,3.6vw,56px)] font-medium leading-[1.04] tracking-[-0.035em]">{title}</h1>
          <p className="lede mt-6 max-w-[48ch] text-dim">{lede}</p>
          <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
        </div>
        <dl className="enter grid content-start gap-5 md:col-span-4 md:col-start-9" style={{ "--d": "120ms" } as React.CSSProperties}>
          {facts.map(([k, v]) => (
            <div key={k} className="border-b border-white/10 pb-4">
              <dt className="label">{k}</dt>
              <dd className="mt-1.5 text-[15px] text-paper/90">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
