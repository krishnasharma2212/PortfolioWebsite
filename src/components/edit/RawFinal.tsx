"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/media";
import { play } from "@/lib/sfx";
import { warmWhenNear } from "@/lib/video";
import Sources from "../Sources";

const BASE = "/media/rawfinal/reel07";

/**
 * The camera original and the delivered edit, frame-aligned (the raw take is
 * the edit's own cut list replayed on the source), behind one wipe. The final
 * leads; the raw follows it, so they can never drift apart.
 */
export default function RawFinal() {
  const box = useRef<HTMLDivElement>(null);
  const raw = useRef<HTMLVideoElement>(null);
  const fin = useRef<HTMLVideoElement>(null);
  const [pos, setPos] = useState(50);
  const [listen, setListen] = useState<"off" | "raw" | "final">("off");
  const [playing, setPlaying] = useState(false);
  const dragging = useRef(false);

  // play while visible; keep the raw locked to the final
  useEffect(() => {
    const r = raw.current;
    const f = fin.current;
    const el = box.current;
    if (!r || !f || !el) return;
    const unwarm = [warmWhenNear(r), warmWhenNear(f)];
    let handle = 0;
    const sync = () => {
      if (Math.abs(r.currentTime - f.currentTime) > 0.06) r.currentTime = f.currentTime;
      if (f.paused !== r.paused) {
        if (f.paused) r.pause();
        else void r.play().catch(() => {});
      }
      handle = requestAnimationFrame(sync);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          void Promise.all([f.play(), r.play()])
            .then(() => setPlaying(true))
            .catch(() => {});
          handle = requestAnimationFrame(sync);
        } else {
          f.pause();
          r.pause();
          setPlaying(false);
          cancelAnimationFrame(handle);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      unwarm.forEach((u) => u());
      io.disconnect();
      cancelAnimationFrame(handle);
    };
  }, []);

  useEffect(() => {
    if (raw.current) raw.current.muted = listen !== "raw";
    if (fin.current) fin.current.muted = listen !== "final";
  }, [listen]);

  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  const toggle = () => {
    const f = fin.current;
    if (!f) return;
    if (f.paused) {
      void f.play().catch(() => {});
      setPlaying(true);
    } else {
      f.pause();
      setPlaying(false);
    }
    play("tick");
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <div className="flex justify-center">
        <div
          ref={box}
          className="reel-frame w-full max-w-[min(420px,48svh)] cursor-ew-resize touch-pan-y select-none"
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            move(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && move(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(`${BASE}/poster-raw.webp`)} alt="" loading="lazy" decoding="async" />
          <video ref={raw} muted loop playsInline preload="none" aria-label="Raw camera take">
            <Sources base={`${BASE}/raw`} />
          </video>
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(`${BASE}/poster-final.webp`)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            <video ref={fin} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover" aria-label="Final edit">
              <Sources base={`${BASE}/final`} />
            </video>
          </div>

          <span className="mono absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] tracking-[0.14em] text-paper">RAW</span>
          <span className="mono absolute right-3 top-3 rounded px-2 py-1 text-[10px] tracking-[0.14em] text-ink" style={{ background: "var(--accent)" }}>
            FINAL
          </span>

          <div className="pointer-events-none absolute inset-y-0 w-px bg-paper shadow-[0_0_16px_rgba(255,255,255,.6)]" style={{ left: `${pos}%` }}>
            <button
              type="button"
              role="slider"
              aria-label="Wipe between raw and final"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
                if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
              }}
              className="pointer-events-auto absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper font-mono text-[13px] text-ink shadow-xl"
            >
              ◂▸
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
          <div className="bg-ink-2 p-5">
            <p className="label-sm text-faint">Raw — as shot</p>
            <ul className="mt-4 space-y-2 text-[14px] text-dim">
              <li>Phone camera colour</li>
              <li>Wide framing</li>
              <li>Room sound only</li>
              <li>No graphics, no captions</li>
            </ul>
          </div>
          <div className="bg-ink-2 p-5">
            <p className="label-sm" style={{ color: "var(--accent)" }}>
              Final — delivered
            </p>
            <ul className="mt-4 space-y-2 text-[14px] text-paper/90">
              <li>22.4 s take cut to 20.6 s</li>
              <li>Graded and re-framed</li>
              <li>Music, effects, −14 LUFS</li>
              <li>Graphics, 3D and captions</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={toggle} className="kbd !h-10 !min-w-10 !text-[13px]" aria-label={playing ? "Pause both" : "Play both"}>
            {playing ? "❚❚" : "▶"}
          </button>
          <div role="radiogroup" aria-label="Listen to" className="flex rounded-full border border-white/15 p-1">
            {(["off", "raw", "final"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={listen === k}
                onClick={() => {
                  setListen(k);
                  play("tick");
                }}
                className="mono rounded-full px-3.5 py-1.5 text-[10.5px] uppercase tracking-[0.12em] transition-colors"
                style={{
                  background: listen === k ? (k === "final" ? "var(--accent)" : "var(--color-paper)") : "transparent",
                  color: listen === k ? "var(--color-ink)" : "var(--color-dim)",
                }}
              >
                {k === "off" ? "Muted" : `Hear ${k}`}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 max-w-[46ch] text-[13px] leading-relaxed text-faint">
          The raw take on the left is the delivered cut list replayed on the camera original, so both sides show the same moment,
          frame for frame. Drag the handle; switch the audio.
        </p>
      </div>
    </div>
  );
}
