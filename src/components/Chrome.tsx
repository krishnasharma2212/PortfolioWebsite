"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, profile } from "@/lib/content";
import { setGrade, useGrade } from "@/lib/grade";
import { getLenis, timecode } from "@/lib/motion";
import { play, setSound, useSound } from "@/lib/sfx";
import Mark from "./Mark";

/** Fixed chrome: the nav bar and the scroll HUD in the corner. */
export default function Chrome() {
  return (
    <>
      <NavBar />
      <Hud />
    </>
  );
}

function NavBar() {
  const pathname = usePathname();
  const grade = useGrade();
  const sound = useSound();
  const [hidden, setHidden] = useState(false);
  const [time, setTime] = useState("--:--");

  // Route decides the base grade; sections and the hero refine it from there.
  useEffect(() => {
    setGrade(pathname.startsWith("/edit") ? "edit" : pathname.startsWith("/code") ? "code" : "neutral");
  }, [pathname]);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: profile.timezone });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > 160 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out-expo)]"
      style={{ transform: hidden ? "translateY(-110%)" : "none" }}
    >
      <div className="pointer-events-none absolute inset-0 h-[120%] bg-gradient-to-b from-ink/90 via-ink/50 to-transparent" />
      <nav
        aria-label="Primary"
        className="relative mx-auto flex h-[var(--nav-h)] items-center justify-between gap-4 px-[var(--gutter)]"
      >
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Krishna Sharma — home" onClick={() => play("tick")}>
          <Mark size={20} className="transition-transform duration-500 group-hover:rotate-[-8deg]" />
          <span className="whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em]" style={{ fontStretch: "88%" }}>
            {/* phones get the first name only: with fallback fonts (wider) the full row would overflow */}
            Krishna<span className="max-[440px]:hidden"> Sharma</span>
          </span>
          <span className="label-sm hidden text-faint sm:inline">V3</span>
        </Link>

        <ul className="flex items-center gap-1 sm:gap-1.5">
          {nav.map((item) => {
            const active =
              item.href !== "/#contact" && pathname.startsWith(item.href);
            return (
              <li key={item.href} className={item.href === "/#contact" ? "hidden sm:block" : ""}>
                <Link
                  href={item.href}
                  onClick={() => play("tick")}
                  className="group flex h-9 items-center gap-2 rounded-full px-2.5 text-[13px] transition-colors hover:bg-white/[0.06] sm:px-3"
                  style={{ background: active ? "rgb(255 255 255 / 0.07)" : undefined }}
                >
                  {item.grade !== "neutral" && (
                    <span
                      className="h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-150"
                      style={{ background: item.grade === "edit" ? "var(--color-edit)" : "var(--color-code)" }}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="label hidden tabular lg:inline" suppressHydrationWarning>
            Noida <span className="text-paper">{time}</span> {profile.tzLabel}
          </span>
          <button
            type="button"
            onClick={() => setSound(!sound)}
            className="hidden h-9 items-center gap-2 rounded-full px-3 text-[12px] text-dim transition-colors hover:text-paper md:flex"
            aria-pressed={sound}
            aria-label={sound ? "Turn interface sound off" : "Turn interface sound on"}
          >
            <Bars on={sound} />
            <span className="mono text-[11px] uppercase tracking-[0.12em]">{sound ? "Sound on" : "Sound off"}</span>
          </button>
          <Link
            href="/#contact"
            onClick={() => play("select")}
            className="btn !h-9 !gap-1.5 !px-3.5 !text-[11px] sm:!gap-2.5 sm:!px-4"
            style={{ background: grade === "neutral" ? "var(--color-paper)" : "var(--accent)" }}
          >
            Hire me <span className="arr">→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Bars({ on }: { on: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0.5, 1, 0.7, 0.9].map((h, i) => (
        <i
          key={i}
          className="block w-[2px] rounded-full bg-current"
          style={{
            height: on ? `${h * 100}%` : "25%",
            animation: on ? `eq 0.9s ${i * 0.12}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`@keyframes eq{from{transform:scaleY(.35)}to{transform:scaleY(1)}}`}</style>
    </span>
  );
}

/**
 * Bottom-left readout. In the edit grade the page is footage, so scroll is
 * timecode (one screen = one second); in the code grade it is a file, so
 * scroll is a line number.
 */
function Hud() {
  const grade = useGrade();
  const ref = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const y = getLenis()?.scroll ?? window.scrollY;
      const g = document.documentElement.dataset.grade;
      // stays out of the way of the opening screen
      box.current?.style.setProperty("opacity", y > window.innerHeight * 0.8 ? "0.7" : "0");
      el.textContent =
        g === "code"
          ? `Ln ${Math.floor(y / 26) + 1}, Col 1`
          : timecode((y / window.innerHeight) * 30);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [grade]);

  return (
    <div
      ref={box}
      className="pointer-events-none fixed bottom-4 left-[var(--gutter)] z-40 hidden items-center gap-2.5 rounded-full bg-ink/75 px-3 py-1.5 opacity-0 backdrop-blur-md transition-opacity duration-500 lg:flex"
      aria-hidden
    >
      {grade === "code" ? (
        <span className="mono text-[11px] text-code">●</span>
      ) : (
        <span className="rec" />
      )}
      <span ref={ref} className="mono tabular text-[11px] tracking-[0.08em] text-dim" />
      <span className="label-sm text-faint">{grade === "code" ? "UTF-8 · TSX" : "REC · 30 FPS"}</span>
    </div>
  );
}
