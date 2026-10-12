"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import type { Grade } from "@/lib/content";
import { setGrade } from "@/lib/grade";

// One observer for every reveal on the page.
let io: IntersectionObserver | null = null;
const observe = (el: Element) => {
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io?.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );
  io.observe(el);
  return () => io?.unobserve(el);
};

/** Fades and lifts its children in the first time they enter the viewport. */
export function Reveal({
  as = "div",
  delay = 0,
  className = "",
  children,
  ...rest
}: { as?: ElementType; delay?: number; className?: string; children: ReactNode } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => (ref.current ? observe(ref.current) : undefined), []);
  const Tag = as;
  return (
    <Tag ref={ref} data-reveal="" className={className} style={{ "--d": `${delay}ms` } as React.CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}

/** A headline whose words rise out of their own line boxes, staggered. */
export function Rise({
  text,
  as = "h2",
  className = "",
  stagger = 55,
  style,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  stagger?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => (ref.current ? observe(ref.current) : undefined), []);
  const words = text.split(" ");
  const Tag = as;
  // A heading can carry its text as a label (read once, not word by word);
  // ARIA forbids aria-label on a plain <p> or <span>, so those expose the words themselves.
  const labelled = typeof Tag === "string" && /^h[1-6]$/.test(Tag);
  return (
    <Tag ref={ref} className={className} style={style} aria-label={labelled ? text : undefined}>
      {words.map((w, i) => (
        <span key={i} className="rise" aria-hidden={labelled || undefined}>
          <span style={{ "--d": `${i * stagger}ms` } as React.CSSProperties}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * Sets the page grade while this block holds the middle of the screen —
 * scrolling from the editor's chapter into the engineer's re-grades the page
 * the way a colourist swaps a look between two scenes.
 */
export function GradeZone({
  grade,
  as = "section",
  className = "",
  children,
  ...rest
}: { grade: Grade; as?: ElementType; className?: string; children: ReactNode } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setGrade(grade), {
      rootMargin: "-48% 0px -48% 0px",
    });
    o.observe(el);
    return () => o.disconnect();
  }, [grade]);
  const Tag = as;
  return (
    <Tag ref={ref} className={className} data-grade={grade === "neutral" ? undefined : grade} {...rest}>
      {children}
    </Tag>
  );
}

/** Chapter heading: a slate-style index, a title and a short standfirst. */
export function SectionHead({
  index,
  kicker,
  title,
  lede,
  className = "",
}: {
  index: string;
  kicker: string;
  title: string;
  lede?: string;
  className?: string;
}) {
  return (
    <header className={`grid gap-6 md:grid-cols-12 ${className}`}>
      <Reveal className="md:col-span-3">
        <p className="label flex items-center gap-3">
          <span className="mono rounded-[4px] px-1.5 py-0.5 text-[10px] text-ink" style={{ background: "var(--accent)" }}>
            {index}
          </span>
          {kicker}
        </p>
      </Reveal>
      <div className="md:col-span-9">
        <Rise text={title} className="display text-[clamp(56px,9vw,148px)]" style={{ fontStretch: "44%" }} />
        {lede && (
          <Reveal delay={150}>
            <p className="lede mt-6 max-w-[46ch] text-dim">{lede}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
