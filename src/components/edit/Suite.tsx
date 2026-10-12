"use client";

import { ViewTransition, useCallback, useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/content";
import { clock } from "@/lib/format";
import { reelMedia } from "@/lib/media";
import { timecode } from "@/lib/motion";
import { play } from "@/lib/sfx";
import { warmWhenNear } from "@/lib/video";
import { waves } from "@/lib/waves";
import Sources from "../Sources";

/**
 * A miniature NLE. The program monitor plays the real reel; the V1 track is
 * that reel's beat map from its build notes, the A1 track its real waveform.
 * The playhead follows the video, and every clip seeks to its first frame.
 */
export default function Suite({ reels, initial = 0, bin = true, morph = false }: { reels: Reel[]; initial?: number; bin?: boolean; morph?: boolean }) {
  const [idx, setIdx] = useState(initial);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [beat, setBeat] = useState(0);
  const reel = reels[idx];
  const media = reelMedia(reel.slug);
  const dur = reel.frames / reel.fps;

  const video = useRef<HTMLVideoElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const inView = useRef(false);

  // buffer as the suite approaches; play only while it is on screen
  useEffect(() => {
    const v = video.current;
    return v ? warmWhenNear(v) : undefined;
  }, [reel.slug]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        if (e.isIntersecting && !paused) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.3 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [paused, reel.slug]);

  // playhead + timecode, straight to the DOM every frame
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let handle = 0;
    let last = -1;
    const tick = () => {
      const t = v.currentTime;
      const f = Math.min(reel.frames - 1, Math.floor(t * reel.fps));
      if (head.current) head.current.style.transform = `translateX(${(t / dur) * 100}cqw)`;
      if (tc.current) tc.current.textContent = timecode(f, reel.fps);
      const b = reel.beats.findIndex((x) => f >= x.from && f < x.to);
      if (b !== last) {
        last = b;
        setBeat(Math.max(0, b));
      }
      handle = v.requestVideoFrameCallback ? v.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
    };
    tick();
    return () => {
      if (v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(handle);
      cancelAnimationFrame(handle);
    };
  }, [reel, dur]);

  const seek = useCallback(
    (t: number) => {
      const v = video.current;
      if (!v) return;
      v.currentTime = Math.max(0, Math.min(dur - 0.05, t));
      if (!paused) void v.play().catch(() => {});
    },
    [dur, paused],
  );

  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * dur);
  };

  const choose = (i: number) => {
    if (i === idx) return;
    play("tick");
    setIdx(i);
    setBeat(0);
  };

  const togglePlay = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      void v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
    play("tick");
  };

  const active = reel.beats[beat];
  // under /edit's section heading this is an h3; on a reel page it sits right under the h1
  const Title = bin ? "h3" : "h2";
  const wave = waves[reel.slug] ?? [];
  const seconds = Array.from({ length: Math.floor(dur) + 1 }, (_, i) => i);

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0c0c0e]">
      {/* title bar */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
        <span className="flex items-center gap-2">
          <span className="rec !h-1.5 !w-1.5" /> Edit suite · {reel.title}
        </span>
        <span className="hidden sm:inline">
          {reel.delivery} · {reel.fps} fps
        </span>
      </div>

      <div className={`grid grid-cols-[minmax(0,1fr)] gap-px bg-white/[0.06] ${bin ? "lg:grid-cols-[230px_minmax(0,1fr)_minmax(0,1.05fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"}`}>
        {/* media bin */}
        {bin && (
          <div className="bg-[#0c0c0e] p-3">
            <p className="label-sm mb-3 px-1 text-faint">Media bin · {reels.length} reels</p>
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {reels.map((r, i) => (
                <li key={r.slug} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    className="group flex w-[210px] items-center gap-3 rounded-xl p-1.5 text-left transition-colors lg:w-full"
                    style={{ background: i === idx ? "rgb(255 255 255 / .07)" : undefined }}
                    aria-pressed={i === idx}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={reelMedia(r.slug).posterSm} alt="" width={34} height={60} loading="lazy" decoding="async" className="h-[60px] w-[34px] shrink-0 rounded-[6px] object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium" style={{ color: i === idx ? "var(--color-paper)" : "var(--color-dim)" }}>
                        {r.title}
                      </span>
                      <span className="mono block text-[10px] text-faint tabular">
                        {clock(r.frames / r.fps)} · {r.beats.length ? `${r.beats.length} beats` : "single take"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* program monitor */}
        <div className="flex flex-col items-center justify-center bg-[#08080a] px-4 py-6">
          <ViewTransition name={morph ? `reel-${reel.slug}` : undefined} share={morph ? "reel-morph" : undefined} default="none">
          <div className="reel-frame w-full max-w-[min(330px,46svh)] !rounded-[14px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.poster} alt="" decoding="async" />
            <video
              ref={video}
              key={reel.slug}
              poster={media.poster}
              muted={muted}
              loop
              playsInline
              preload="none"
              aria-label={`${reel.title} — full reel`}
              onClick={togglePlay}
            >
              <Sources base={media.full} />
            </video>
          </div>
          </ViewTransition>
          <div className="mt-4 flex w-full max-w-[min(330px,46svh)] items-center justify-between gap-2">
            <button type="button" onClick={togglePlay} className="kbd !h-8 !min-w-8 !text-[12px]" aria-label={paused ? "Play" : "Pause"}>
              {paused ? "▶" : "❚❚"}
            </button>
            <span ref={tc} className="mono text-[13px] text-paper tabular">
              00:00:00:00
            </span>
            <button
              type="button"
              onClick={() => {
                setMuted((m) => !m);
                play("tick");
              }}
              className="mono rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-paper transition-colors hover:border-[var(--accent)]"
            >
              {muted ? "Sound on" : "Mute"}
            </button>
          </div>
        </div>

        {/* inspector */}
        <div className="flex flex-col bg-[#0c0c0e] p-5 md:p-7">
          {reel.series && <p className="label-sm text-faint">{reel.series}</p>}
          <Title className="mt-2 text-[28px] font-semibold leading-[1.05] tracking-[-0.03em]" style={{ fontStretch: "90%" }}>
            {reel.title}
          </Title>
          <p className="mt-2 text-[14px] text-dim">
            {reel.formatLabel} · {reel.language}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/10 py-5">
            {reel.facts.map((f) => (
              <div key={f.label}>
                <p className="display text-[40px]" style={{ fontStretch: "48%", color: "var(--accent)" }}>
                  {f.value}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-dim">{f.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 min-h-[112px]">
            {active ? (
              <div key={`${reel.slug}-${active.id}`} className="animate-[fadeUp_.45s_var(--ease-out-expo)]">
                <p className="label-sm flex items-center gap-2 text-faint">
                  <span className="rounded px-1.5 py-0.5 text-ink" style={{ background: "var(--accent)" }}>
                    {active.id}
                  </span>
                  frames {active.from}–{active.to}
                </p>
                <p className="mt-3 text-[15px] italic leading-snug text-paper/90">“{active.line}”</p>
                <p className="mt-2 text-[14px] leading-snug text-dim">{active.visual}</p>
              </div>
            ) : (
              <ul className="space-y-2 text-[14px] leading-snug text-dim">
                {reel.did.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span style={{ color: "var(--accent)" }}>▸</span>
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* timeline */}
      <div className="overflow-x-auto border-t border-white/10 bg-[#0a0a0c] px-3 pb-4 pt-2 [scrollbar-width:thin] sm:px-4">
        {/* below ~600px the track would squeeze short beats under a 24px tap target; it scrolls instead */}
        <div className="grid min-w-[600px] grid-cols-[34px_minmax(0,1fr)] gap-x-2">
          <span />
          <div className="relative h-6 select-none" style={{ containerType: "inline-size" }}>
            {seconds.map((s) => (
              <span
                key={s}
                className="absolute bottom-0 h-2 w-px bg-white/20"
                style={{ left: `${(s / dur) * 100}%`, height: s % 5 === 0 ? 10 : 5 }}
              >
                {s % 5 === 0 && <span className="mono absolute -top-3.5 left-1 text-[9px] text-faint">{String(s).padStart(2, "0")}s</span>}
              </span>
            ))}
          </div>

          <span className="mono self-center text-[10px] text-faint">V1</span>
          <div ref={track} className="relative h-12 cursor-pointer" onPointerDown={scrub} style={{ containerType: "inline-size" }}>
            {(reel.beats.length ? reel.beats : [{ id: "S1", from: 0, to: reel.frames, line: reel.hook, visual: "Single take, hook to call to action" }]).map((b, i) => {
              const on = reel.beats.length > 0 && i === beat;
              return (
                <button
                  key={b.id}
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    seek(b.from / reel.fps + 0.001);
                    play("tick");
                  }}
                  className="absolute inset-y-0.5 overflow-hidden rounded-[6px] border px-1.5 text-left transition-colors"
                  style={{
                    left: `${(b.from / reel.frames) * 100}%`,
                    width: `calc(${((b.to - b.from) / reel.frames) * 100}% - 2px)`,
                    background: on ? "color-mix(in srgb, var(--accent) 34%, #141416)" : i % 2 ? "#1c1c20" : "#18181b",
                    borderColor: on ? "var(--accent)" : "rgb(255 255 255 / .08)",
                  }}
                  title={`${b.id} — ${b.visual}`}
                >
                  <span className="mono block truncate pt-1 text-[9.5px] text-paper/80">{b.id}</span>
                  <span className={`block truncate text-[10.5px] ${on ? "text-paper/90" : "text-dim"}`}>{b.visual}</span>
                </button>
              );
            })}
            <div ref={head} className="pointer-events-none absolute -top-7 bottom-[-58px] left-0 z-10 w-px bg-[var(--accent)]">
              <span className="absolute -left-[5px] -top-0.5 h-0 w-0 border-x-[5px] border-t-[7px] border-x-transparent" style={{ borderTopColor: "var(--accent)" }} />
            </div>
          </div>

          <span className="mono mt-1.5 self-center text-[10px] text-faint">A1</span>
          <div className="relative mt-1.5 flex h-10 cursor-pointer items-center gap-px rounded-[6px] bg-[#121215] px-px" onPointerDown={scrub}>
            {wave.map((v, i) => (
              <span key={i} className="flex-1 rounded-full bg-[color-mix(in_srgb,var(--accent)_55%,#3a3a40)]" style={{ height: `${Math.max(6, v * 92)}%` }} />
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
