import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Lost frame — 404 · Krishna Sharma" },
  description: "This clip isn't in the timeline.",
  // replaces the layout's index/follow (and its canonical, which would point a 404 at the home page)
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-[100svh] place-items-center px-[var(--gutter)] text-center">
      <div>
        <p className="label">Error 404 · media offline</p>
        <h1 className="display mt-6 text-[clamp(96px,22vw,320px)]" style={{ fontStretch: "40%" }}>
          Lost frame
        </h1>
        <p className="mx-auto mt-6 max-w-[36ch] text-dim">This clip isn&apos;t in the timeline. It may have been moved, or the link has a typo.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn" style={{ background: "var(--color-paper)" }}>
            Back to select screen <span className="arr">→</span>
          </Link>
          <Link href="/edit" className="btn btn-ghost">
            Edit suite
          </Link>
          <Link href="/code" className="btn btn-ghost">
            Codebase
          </Link>
        </div>
      </div>
    </main>
  );
}
