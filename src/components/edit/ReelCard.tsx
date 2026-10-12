"use client";

import Link from "next/link";
import { ViewTransition, useEffect, useRef } from "react";
import type { Reel } from "@/lib/content";
import { clock, reelSeconds } from "@/lib/format";
import { reelMedia } from "@/lib/media";
import { play } from "@/lib/sfx";
import { warmWhenNear } from "@/lib/video";
import Sources from "../Sources";

/**
 * A reel as a vertical card. The poster paints first; the 480p preview loop
 * starts buffering as the card approaches, plays once it is on screen, and
 * pauses when it leaves.
 */
export default function ReelCard({ reel, index, priority = false }: { reel: Reel; index: number; priority?: boolean }) {
  const v = useRef<HTMLVideoElement>(null);
  const m = reelMedia(reel.slug);

  useEffect(() => {
    const el = v.current;
    if (!el) return;
    const unwarm = warmWhenNear(el);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      unwarm();
      io.disconnect();
      el.pause();
    };
  }, []);

  return (
    <Link
      href={`/edit/${reel.slug}`}
      prefetch={true}
      transitionTypes={["open-reel"]}
      onClick={() => play("select")}
      onPointerEnter={() => play("tick")}
      className="group block focus-visible:outline-none"
    >
      <ViewTransition name={`reel-${reel.slug}`} share="reel-morph" default="none">
        <div className="reel-frame transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5 group-focus-visible:ring-2 group-focus-visible:ring-[var(--accent)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.posterSm}
            srcSet={m.posterSet}
            // two columns below md, four above, inside a 1440px container
            sizes="(min-width: 1520px) 342px, (min-width: 768px) calc(25vw - 28px), calc(50vw - 24px)"
            alt=""
            width={360}
            height={640}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
          <video ref={v} muted loop playsInline preload="none" aria-hidden>
            <Sources base={m.preview} />
          </video>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
          <div className="absolute inset-x-3 top-3 flex items-center justify-between font-mono text-[10px] tracking-[0.12em] text-paper/90">
            <span className="flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: reel.ink }} />
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm tabular">{clock(reelSeconds(reel))}</span>
          </div>
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-[13px] font-medium leading-snug text-paper">“{reel.hook}”</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/70">Open breakdown →</p>
          </div>
        </div>
      </ViewTransition>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {reel.series && <p className="label-sm truncate text-faint">{reel.series}</p>}
          <h3 className="mt-1 text-[19px] font-semibold leading-tight tracking-[-0.02em]" style={{ fontStretch: "92%" }}>
            {reel.title}
          </h3>
        </div>
      </div>
      <p className="mt-1.5 text-[13px] text-dim">
        {reel.formatLabel} · {reel.language}
      </p>
    </Link>
  );
}
