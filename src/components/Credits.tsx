import Link from "next/link";
import { profile, site } from "@/lib/content";
import Mark from "./Mark";

const CREDITS: [string, string][] = [
  ["Directed, edited & engineered by", profile.name],
  ["Edit suite", "DaVinci Resolve Studio · Fusion · Fairlight"],
  ["Built with", "Next.js 16 · React 19 · GSAP · Lenis"],
  ["Type", "Roboto Flex · Mona Sans · JetBrains Mono"],
  ["Reels", "Edited by Krishna, 2026"],
  ["Player character", "Generated with Gemini — Nano Banana Pro & Veo — art-directed by Krishna"],
  ["Colour grade", "Teal & orange, as tradition demands"],
];

/** The footer rolls like the end of a film. */
export default function Credits() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 px-[var(--gutter)] pb-10 pt-24">
      <div className="mx-auto max-w-[1440px]">
        <p className="display text-center text-[clamp(56px,13vw,220px)] text-paper/[0.92]" style={{ fontStretch: "38%" }}>
          Thanks for playing
        </p>

        <dl className="mx-auto mt-16 grid max-w-[780px] gap-y-5">
          {CREDITS.map(([role, who]) => (
            <div key={role} className="grid grid-cols-2 items-baseline gap-6">
              <dt className="label text-right">{role}</dt>
              <dd className="text-[15px] text-paper/90">{who}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-[13px] text-dim md:flex-row">
          <p className="flex items-center gap-3">
            <Mark size={16} />© {site.year} {profile.name} · {profile.location}
          </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/edit" className="hover:text-paper">Edit</Link>
            <Link href="/code" className="hover:text-paper">Code</Link>
            <a href={`mailto:${profile.email}`} className="hover:text-paper">Email</a>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-paper">GitHub</a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-paper">LinkedIn</a>
          </nav>
          <Link href="/#select" className="label flex items-center gap-2 transition-colors hover:text-paper">
            Back to select screen <span>↑</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
