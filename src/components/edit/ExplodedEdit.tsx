"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { breakdown } from "@/lib/content";
import { asset } from "@/lib/media";
import { gsap, loadScrollTrigger } from "@/lib/gsap";

const SRC = (f: string) => asset(`/media/breakdown/julius/${f}.webp`);

/**
 * One finished frame pulled apart into the tracks it was composited from —
 * the real layers of Reel 03, frame 120, exported from the project.
 * Desktop: pinned and scrubbed; while the deck is open, scrolling steps through
 * the tracks one at a time, like soloing them in the timeline.
 * Touch / reduced motion: the same layers as a swipeable list.
 */
export default function ExplodedEdit() {
  const root = useRef<HTMLDivElement>(null);
  const n = breakdown.layers.length;

  useGSAP(
    () => {
      let mm: gsap.MatchMedia | null = null;
      let gone = false;
      void loadScrollTrigger().then(() => {
        if (gone) return;
        mm = gsap.matchMedia(root.current ?? undefined);
        mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
          const layers = gsap.utils.toArray<HTMLElement>(".xp-layer");
          const rings = gsap.utils.toArray<HTMLElement>(".xp-ring");
          const items = gsap.utils.toArray<HTMLElement>(".xp-item");
          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: { trigger: ".xp-pin", start: "top top", end: "+=300%", scrub: 0.8, pin: true },
          });
          tl.to(".xp-final", { opacity: 0, duration: 0.15 }, 0.08)
            .to(".xp-deck", { rotateY: -32, rotateX: 10, duration: 0.4 }, 0.06)
            .to(layers, { z: (i: number) => (i - (n - 1) / 2) * 120, x: (i: number) => (i - (n - 1) / 2) * 40, duration: 0.4 }, 0.06)
            .fromTo(".xp-list", { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.15 }, 0.3);
          // solo each track in turn
          const step = 0.16;
          layers.forEach((_, i) => {
            const at = 0.48 + i * step;
            tl.to(items, { opacity: (k: number) => (k === i ? 1 : 0.32), duration: 0.05 }, at)
              .to(rings, { opacity: (k: number) => (k === i ? 1 : 0), duration: 0.05 }, at)
              .to(layers, { opacity: (k: number) => (k === i || k === 0 ? 1 : 0.38), duration: 0.05 }, at);
          });
          const close = 0.48 + n * step + 0.06;
          tl.to(items, { opacity: 1, duration: 0.05 }, close)
            .to(rings, { opacity: 0, duration: 0.05 }, close)
            .to(layers, { opacity: 1, z: 0, x: 0, duration: 0.28 }, close)
            .to(".xp-deck", { rotateY: 0, rotateX: 0, duration: 0.28 }, close)
            .to(".xp-list", { opacity: 0.0, duration: 0.12 }, close + 0.06)
            .to(".xp-final", { opacity: 1, duration: 0.1 }, close + 0.22);
          return () => tl.scrollTrigger?.kill();
        });
      });
      return () => {
        gone = true;
        mm?.revert();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* desktop: pinned 3D */}
      <div className="xp-pin relative hidden h-[100svh] items-center lg:flex">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-12 items-center gap-6 px-[var(--gutter)]">
          <div className="col-span-3">
            <p className="label">Reel 03 · {breakdown.reel} · frame {breakdown.frame}</p>
            <h3 className="display mt-4 text-[clamp(52px,5.4vw,92px)]" style={{ fontStretch: "44%" }}>
              One frame, five tracks
            </h3>
            <p className="mt-5 max-w-[30ch] text-[16px] leading-relaxed text-dim">
              Keep scrolling. This is the actual frame, pulled apart into the layers it was composited from — including the hair,
              which has its own track so it can cross the panel edge.
            </p>
          </div>

          <div className="col-span-6 flex justify-center" style={{ perspective: "1700px" }}>
            <div className="xp-deck relative aspect-[9/16] h-[min(74svh,720px)]" style={{ transformStyle: "preserve-3d" }}>
              {breakdown.layers.map((l, i) => (
                <figure
                  key={l.file}
                  className="xp-layer absolute inset-0 rounded-[14px]"
                  style={{
                    boxShadow: i ? "inset 0 0 0 1px rgb(255 255 255 / .2)" : "0 40px 80px -30px rgb(0 0 0 / .8)",
                    background: i ? "rgb(255 255 255 / .02)" : undefined,
                    zIndex: i,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={SRC(l.file)} alt="" className="h-full w-full rounded-[14px] object-cover" loading="lazy" />
                  <span className="xp-ring pointer-events-none absolute inset-0 rounded-[14px] opacity-0" style={{ boxShadow: "inset 0 0 0 2px var(--accent), 0 0 40px -6px var(--accent)" }} />
                  <span
                    className="mono absolute -top-3 left-3 rounded px-1.5 py-0.5 text-[10px] text-ink"
                    style={{ background: "var(--accent)", transform: "translateZ(1px)" }}
                  >
                    {l.track}
                  </span>
                </figure>
              ))}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SRC("final")}
                alt={`Reel 03, frame ${breakdown.frame}: the finished composite`}
                className="xp-final absolute inset-0 h-full w-full rounded-[14px] object-cover"
                style={{ transform: `translateZ(${n * 2}px)` }}
                loading="lazy"
              />
            </div>
          </div>

          <ol className="xp-list col-span-3 space-y-5 opacity-0">
            {breakdown.layers.map((l) => (
              <li key={l.file} className="xp-item">
                <p className="flex items-center gap-2">
                  <span className="mono rounded px-1.5 py-0.5 text-[10px] text-ink" style={{ background: "var(--accent)" }}>
                    {l.track}
                  </span>
                  <span className="text-[15px] font-semibold">{l.name}</span>
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-dim">{l.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* touch / narrow: the same layers as a list */}
      <div className="px-[var(--gutter)] lg:hidden">
        <p className="label">Reel 03 · {breakdown.reel} · frame {breakdown.frame}</p>
        <h3 className="display mt-4 text-[clamp(52px,14vw,96px)]" style={{ fontStretch: "44%" }}>
          One frame, five tracks
        </h3>
        <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-dim">
          The real layers of one frame, as composited in DaVinci Resolve. Swipe through them.
        </p>
        <div className="-mx-[var(--gutter)] mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4">
          {[...breakdown.layers, { file: "final", track: "OUT", name: "Final frame", note: "Everything above, composited." }].map((l) => (
            <figure key={l.file} className="w-[62vw] max-w-[280px] shrink-0 snap-start">
              <div
                className="reel-frame !rounded-[14px]"
                style={{
                  backgroundImage: "conic-gradient(#222 25%, #2c2c2c 0 50%, #222 0 75%, #2c2c2c 0)",
                  backgroundSize: "18px 18px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={SRC(l.file)} alt="" loading="lazy" />
              </div>
              <figcaption className="mt-3">
                <span className="mono rounded px-1.5 py-0.5 text-[10px] text-ink" style={{ background: "var(--accent)" }}>
                  {l.track}
                </span>
                <span className="ml-2 text-[14px] font-semibold">{l.name}</span>
                <span className="mt-1 block text-[13px] leading-snug text-dim">{l.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
