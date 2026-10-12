"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/media";
import { reel07 } from "@/lib/reel07";
import { play } from "@/lib/sfx";
import { warmWhenNear } from "@/lib/video";
import Sources from "./Sources";

type Tok = [string, string?];
const K = "text-code"; // keyword
const S = "text-edit"; // string
const C = "text-faint"; // comment
const N = "text-paper"; // number

// The reel's renderer, formatted and abridged for reading. Lines 3–11 are the
// nine scene branches; they light up as the film reaches them.
const CODE: Tok[][] = [
  [["// reel07/graphics/reel.html — excerpt", C]],
  [["window", N], [".renderFrame = ("], ["t", S], [") => {"]],
  [["  "], ["let", K], [" scene, local;"]],
  [["  "], ["if", K], ["      (t < "], ["1.933", N], [") scene = "], ["'intro'", S]],
  [["  "], ["else if", K], [" (t < "], ["4.800", N], [") scene = "], ["'hook'", S]],
  [["  "], ["else if", K], [" (t < "], ["6.200", N], [") setChapter("], ["1", N], [", "], ["'Napkin AI'", S], [")"]],
  [["  "], ["else if", K], [" (t < "], ["9.200", N], [") scene = "], ["'napkin'", S]],
  [["  "], ["else if", K], [" (t < "], ["10.80", N], [") setChapter("], ["2", N], [", "], ["'Tripo'", S], [")"]],
  [["  "], ["else if", K], [" (t < "], ["14.03", N], [") scene = "], ["'tripo'", S]],
  [["  "], ["else if", K], [" (t < "], ["15.40", N], [") setChapter("], ["3", N], [", "], ["'Upscayl'", S], [")"]],
  [["  "], ["else if", K], [" (t < "], ["18.23", N], [") scene = "], ["'upscayl'", S]],
  [["  "], ["else", K], ["               scene = "], ["'cta'", S]],
  [[""]],
  [["  "], ["const", K], [" cap = DATA.captions.find(c => t >= c.s && t < c.e);"]],
  [["  "], ["caption.innerHTML = cap.words.map(w =>"]],
  [["    `<span class=${"], ["t >= w.s && t < w.e", N], [" ? "], ["'active'", S], [" : "], ["''", S], ["}>${w.w}</span>`);"]],
  [["};"]],
];
const SCENE_LINE0 = 3;

export default function RenderFrame() {
  const video = useRef<HTMLVideoElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLParagraphElement>(null);
  const tRef = useRef<HTMLSpanElement>(null);
  const fRef = useRef<HTMLSpanElement>(null);
  const sRef = useRef<HTMLSpanElement>(null);
  const [muted, setMuted] = useState(true);

  // buffer as it approaches; play only while on screen
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const unwarm = warmWhenNear(v);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => {
      unwarm();
      io.disconnect();
      v.pause();
    };
  }, []);

  // per-frame sync, written straight to the DOM
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let lastScene = -1;
    let lastWord = -2;
    let handle = 0;
    const lines = () => codeRef.current?.querySelectorAll<HTMLElement>("[data-line]") ?? [];
    const words = () => wordsRef.current?.querySelectorAll<HTMLElement>("[data-w]") ?? [];
    const draw = () => {
      const t = v.currentTime;
      if (tRef.current) tRef.current.textContent = t.toFixed(3).padStart(6, "0");
      if (fRef.current) fRef.current.textContent = String(Math.min(reel07.frames - 1, Math.floor(t * reel07.fps))).padStart(3, "0");
      let scene = 0;
      reel07.scenes.forEach(([, at], i) => {
        if (t >= at) scene = i;
      });
      if (scene !== lastScene) {
        lastScene = scene;
        lines().forEach((l) => l.toggleAttribute("data-on", Number(l.dataset.line) === SCENE_LINE0 + scene));
        if (sRef.current) sRef.current.textContent = reel07.scenes[scene][0];
      }
      const wi = reel07.words.findIndex(([, s, e]) => t >= s && t < e + 0.04);
      if (wi !== lastWord) {
        lastWord = wi;
        words().forEach((w, i) => {
          w.dataset.state = i === wi ? "on" : reel07.words[i][1] < t ? "past" : "next";
        });
      }
    };
    const loop = () => {
      draw();
      handle = v.requestVideoFrameCallback ? v.requestVideoFrameCallback(loop) : requestAnimationFrame(loop);
    };
    loop();
    return () => {
      if (v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(handle);
      cancelAnimationFrame(handle);
    };
  }, []);

  const seek = (t: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = t + 0.001;
    void v.play().catch(() => {});
    play("tick");
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(260px,360px)_1fr] lg:gap-12">
      <div className="lg:sticky lg:top-24">
        <div className="reel-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/media/rawfinal/reel07/poster-final.webp")} alt="" loading="lazy" decoding="async" />
          <video
            ref={video}
            muted={muted}
            loop
            playsInline
            preload="none"
            aria-label="Reel 07, “3 secret AI tools”, playing in sync with its source code"
          >
            <Sources base="/media/rawfinal/reel07/final" />
          </video>
          <button
            type="button"
            onClick={() => {
              setMuted((m) => !m);
              play("tick");
            }}
            className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-paper backdrop-blur transition-colors hover:bg-black/80"
          >
            {muted ? "▶ Sound on" : "■ Mute"}
          </button>
        </div>
        <p className="mono mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-dim tabular">
          <span>
            t = <span ref={tRef} className="text-paper">00.000</span> s
          </span>
          <span>
            frame <span ref={fRef} className="text-paper">000</span> / {reel07.frames}
          </span>
          <span>
            scene <span ref={sRef} className="text-code">intro</span>
          </span>
        </p>
      </div>

      <div className="min-w-0">
        <div
          ref={codeRef}
          className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d0d0f] py-4 font-mono text-[12.5px] leading-[1.75] [scrollbar-width:thin]"
          data-lenis-prevent
        >
          {CODE.map((line, i) => {
            const scene = i - SCENE_LINE0;
            const clickable = scene >= 0 && scene < reel07.scenes.length;
            return (
              <div
                key={i}
                data-line={i}
                onClick={clickable ? () => seek(reel07.scenes[scene][1]) : undefined}
                className={`code-line flex whitespace-pre pr-6 ${clickable ? "cursor-pointer" : ""}`}
              >
                <span className="w-11 shrink-0 select-none pr-4 text-right text-faint/60">{i + 1}</span>
                <span>
                  {line.map(([txt, cls], j) => (
                    <span key={j} className={cls ?? "text-dim"}>
                      {txt}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="label mb-3">
            Whisper transcript · {reel07.words.length} words, each with its own start and end
          </p>
          <p ref={wordsRef} className="text-[clamp(17px,1.6vw,22px)] leading-[1.6] tracking-[-0.01em]">
            {reel07.words.map(([w, s], i) => (
              <button
                key={i}
                type="button"
                data-w
                data-state="next"
                onClick={() => seek(s)}
                title={`${s.toFixed(2)} s`}
                className="word mr-[0.28em] rounded-[5px] px-[0.08em] transition-colors duration-150"
              >
                {w}
              </button>
            ))}
          </p>
        </div>
      </div>

      <style>{`
        .code-line[data-on]{background:color-mix(in srgb, var(--color-code) 13%, transparent);box-shadow:inset 2px 0 0 var(--color-code)}
        .code-line[data-on] > span:first-child{color:var(--color-code)}
        .code-line:hover{background:rgb(255 255 255 / .03)}
        .word[data-state="next"]{color:var(--color-faint)}
        .word[data-state="past"]{color:var(--color-paper)}
        .word[data-state="on"]{color:var(--color-ink);background:var(--color-edit)}
      `}</style>
    </div>
  );
}
