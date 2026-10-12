import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Credits from "@/components/Credits";
import Suite from "@/components/edit/Suite";
import JsonLd from "@/components/JsonLd";
import { Reveal } from "@/components/ui";
import { mailLink, reels, whatsappLink } from "@/lib/content";
import { clock } from "@/lib/format";
import { asset, h264, reelMedia } from "@/lib/media";
import { pageMeta, reelCopy, reelGraph } from "@/lib/seo";

// Every reel page is prerendered from generateStaticParams (and only those —
// the export has no server to render an unknown slug); reel cards prefetch
// their page, so the card-to-player morph has the content it needs.
export const dynamicParams = false;

export function generateStaticParams() {
  return reels.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/edit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const reel = reels.find((r) => r.slug === slug);
  if (!reel) return {};
  return pageMeta({
    ...reelCopy(reel),
    path: `/edit/${reel.slug}`,
    type: "video.other",
    image: {
      url: asset(`/og/reel-${reel.slug}.jpg`),
      width: 1200,
      height: 630,
      alt: `${reel.title} — ${reel.formatLabel.toLowerCase()} edited by Krishna Sharma`,
    },
    video: { url: h264(reelMedia(reel.slug).full), type: "video/mp4", width: 720, height: 1280 },
  });
}

export default async function ReelPage({ params }: PageProps<"/edit/[slug]">) {
  const { slug } = await params;
  const i = reels.findIndex((r) => r.slug === slug);
  if (i === -1) notFound();
  const reel = reels[i];
  const next = reels[(i + 1) % reels.length];
  const meta: [string, string][] = [
    ["Format", reel.formatLabel],
    ["Niche", reel.niche],
    ["Platform", reel.platform === "instagram" ? "Instagram Reels" : reel.platform],
    ["Language", reel.language],
    ["Length", clock(reel.frames / reel.fps)],
    ["Delivery", reel.delivery],
  ];

  return (
    <main id="main" data-grade="edit" className="pt-[calc(var(--nav-h)+4svh)]">
      <div className="mx-auto max-w-[1440px] px-[var(--gutter)]">
        <Link href="/edit#suite" className="label inline-flex items-center gap-2 transition-colors hover:text-paper">
          ← The edit suite
        </Link>

        <header className="mt-8 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="label">{reel.series ?? `Reel edit · ${reel.formatLabel}`}</p>
            <h1 className="display mt-4 text-[clamp(64px,10vw,168px)]" style={{ fontStretch: "42%", color: "var(--accent)" }}>
              {reel.title}
            </h1>
            <p className="mt-6 max-w-[34ch] text-[clamp(20px,2vw,28px)] italic leading-snug text-paper/90">“{reel.hook}”</p>
          </div>
          <dl className="grid grid-cols-2 content-end gap-x-6 gap-y-4 md:col-span-4">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="label-sm text-faint">{k}</dt>
                <dd className="mt-1 text-[14px] text-paper/90">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section className="mt-14" aria-label="Reel and beat map">
          <Suite reels={[reel]} bin={false} morph />
        </section>

        <section className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <p className="label">What I did</p>
            <ul className="mt-6 space-y-4">
              {reel.did.map((d) => (
                <li key={d} className="flex gap-3 text-[17px] leading-relaxed text-paper/90">
                  <span className="mt-[0.35em] text-[12px]" style={{ color: "var(--accent)" }}>
                    ▶
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="md:col-span-5 md:col-start-8" delay={120}>
            <p className="label">Made with</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {reel.tools.map((t) => (
                <li key={t} className="rounded-full border border-white/15 px-3.5 py-1.5 text-[13px] text-dim">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-[22px] border border-white/10 p-6" style={{ background: "linear-gradient(140deg, rgb(255 106 61 / .1), transparent 60%)" }}>
              <p className="text-[20px] font-medium leading-snug tracking-[-0.02em]">Want this for your channel?</p>
              <p className="mt-2 text-[14px] text-dim">Send one raw take — I&apos;ll tell you how I&apos;d cut it.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={whatsappLink(`Hi Krishna — I saw "${reel.title}" on your site. I'd like something like it for my channel: `)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                >
                  WhatsApp <span className="arr">→</span>
                </a>
                <a href={mailLink(`Edit like "${reel.title}"`)} className="btn btn-ghost">
                  Email
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        {reel.beats.length > 0 && (
          <section className="mt-16 md:mt-24" aria-labelledby="beats">
            <Reveal>
              <h2 id="beats" className="label">
                Beat map · {reel.beats.length} beats, {clock(reel.frames / reel.fps)}
              </h2>
            </Reveal>
            <Reveal as="ol" className="mt-6 border-t border-white/10">
              {reel.beats.map((b) => (
                <li key={b.id} className="grid gap-1.5 border-b border-white/10 py-4 md:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
                  <span className="mono text-[12px] tabular" style={{ color: "var(--accent)" }}>
                    {b.id} · {clock(b.from / reel.fps)}
                  </span>
                  <span className="text-[15px] italic leading-snug text-paper/90">“{b.line}”</span>
                  <span className="text-[14px] leading-snug text-dim">{b.visual}</span>
                </li>
              ))}
            </Reveal>
          </section>
        )}

        <Link
          href={`/edit/${next.slug}`}
          className="group mt-24 flex items-center justify-between gap-6 border-y border-white/10 py-8 md:mt-32"
        >
          <span>
            <span className="label">Next reel</span>
            <span className="display mt-2 block text-[clamp(44px,6vw,96px)] transition-colors group-hover:text-[var(--accent)]" style={{ fontStretch: "44%" }}>
              {next.title}
            </span>
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reelMedia(next.slug).posterSm} alt="" width={90} height={160} loading="lazy" decoding="async" className="h-28 w-16 rounded-[10px] object-cover transition-transform duration-500 group-hover:-rotate-3 md:h-40 md:w-[90px]" />
        </Link>
      </div>
      <div className="mt-24">
        <Credits />
      </div>
      <JsonLd graph={reelGraph(reel)} />
    </main>
  );
}
