import type { Metadata } from "next";
import Contact from "@/components/Contact";
import Credits from "@/components/Credits";
import ExplodedEdit from "@/components/edit/ExplodedEdit";
import RawFinal from "@/components/edit/RawFinal";
import ReelCard from "@/components/edit/ReelCard";
import Suite from "@/components/edit/Suite";
import HireLink from "@/components/HireLink";
import JsonLd from "@/components/JsonLd";
import { GradeZone, Reveal, SectionHead } from "@/components/ui";
import WorldHeader from "@/components/WorldHeader";
import { editFaq, editToolkit, reels, services, whatsappLink, workflow } from "@/lib/content";
import { asset } from "@/lib/media";
import { copy, editGraph, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  ...copy.edit,
  path: "/edit",
  image: {
    url: asset("/og/edit.jpg"),
    width: 1200,
    height: 630,
    alt: "Krishna Sharma — video editor: talking-head and educational edits for YouTube and Instagram Reels.",
  },
});

export default function EditPage() {
  return (
    <main id="main" data-grade="edit">
      <WorldHeader
        grade="edit"
        word="Editor"
        kicker="Video editor · the edit suite"
        title="Talking-head and educational video edits that hold attention."
        lede="I take the cutting, B-roll, captions, motion graphics and sound off your plate — and keep the style your audience already knows. Every reel below opens into how it was built."
        facts={[
          ["Formats", "Talking head · Educational · Podcast clips · Long-form to short"],
          ["Languages", "English, Hindi and Hinglish — captions romanised or translated"],
          ["Delivery", "4K vertical or 16:9 · loudness at −14 LUFS · .srt captions · cover frame"],
        ]}
        actions={
          <>
            <a href={whatsappLink("Hi Krishna — I make videos and I'm looking for an editor. My channel/page: ")} target="_blank" rel="noopener noreferrer" className="btn">
              Send me a video <span className="arr">→</span>
            </a>
            <a href="#suite" className="btn btn-ghost">
              Open the suite ↓
            </a>
          </>
        }
      />

      {/* 01 — suite */}
      <GradeZone grade="edit" id="suite" className="scroll-mt-20 px-[var(--gutter)] pt-28 md:pt-36">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead
            index="01"
            kicker="The suite"
            title="Every beat has a job"
            lede="Pick a reel. The top track is its real beat map — each clip is a line of the script and the visual I gave it. Click one to jump there."
          />
          <Reveal className="mt-14">
            <Suite reels={reels} />
          </Reveal>
        </div>
      </GradeZone>

      {/* 02 — exploded */}
      <GradeZone grade="edit" className="pt-28 md:pt-40">
        <div className="mx-auto max-w-[1440px] px-[var(--gutter)] pb-10">
          <SectionHead index="02" kicker="Breakdown" title="Layers, not filters" />
        </div>
        <ExplodedEdit />
      </GradeZone>

      {/* 03 — raw vs final */}
      <GradeZone grade="edit" id="before-after" className="scroll-mt-16 px-[var(--gutter)] pt-28 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead
            index="03"
            kicker="Before / after"
            title="What you send, what you get"
            lede="Reel 07: the phone take on one side of the wipe, the delivered edit on the other — same moment, frame for frame."
          />
          <Reveal className="mt-14">
            <RawFinal />
          </Reveal>
        </div>
      </GradeZone>

      {/* 04 — reels */}
      <GradeZone grade="edit" className="px-[var(--gutter)] pt-28 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead index="04" kicker="Reels" title="Open any of them" lede="Each one has its own page — the brief, the beat map, the numbers. Linkable, so I can send you the one closest to your format." />
          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
            {reels.map((r, i) => (
              <Reveal key={r.slug} delay={i * 80}>
                <ReelCard reel={r} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </GradeZone>

      {/* 05 — services */}
      <GradeZone grade="edit" className="px-[var(--gutter)] pt-28 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead index="05" kicker="What I take off your plate" title="The whole post, not just the cut" />
          <div className="mt-14 grid gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.n} delay={(i % 3) * 80} className="bg-ink p-7 md:p-9">
                <p className="mono text-[11px] text-faint">{s.n}</p>
                <h3 className="mt-8 text-[22px] font-semibold leading-tight tracking-[-0.025em]">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-dim">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </GradeZone>

      {/* 06 — process + toolkit */}
      <GradeZone grade="edit" className="px-[var(--gutter)] pt-28 md:pt-40">
        <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead index="06" kicker="How we work" title="Five steps" className="!block" />
            <ol className="mt-12">
              {workflow.map((s, i) => (
                <Reveal as="li" key={s.n} delay={i * 60} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-white/10 py-6">
                  <span className="mono text-[12px] tabular" style={{ color: "var(--accent)" }}>
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-[19px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-dim">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={150}>
            <p className="label">Toolkit</p>
            <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {editToolkit.map((t) => (
                <li key={t.name} className="flex items-baseline justify-between gap-4 py-3.5">
                  <span className="text-[15px]">{t.name}</span>
                  <span className="text-right text-[12.5px] text-faint">{t.use}</span>
                </li>
              ))}
            </ul>
            <HireLink choice="edit" className="btn mt-8">
              Start an edit <span className="arr">→</span>
            </HireLink>
          </Reveal>
        </div>
      </GradeZone>

      {/* 07 — questions */}
      <GradeZone grade="edit" id="faq" className="scroll-mt-20 px-[var(--gutter)] pb-10 pt-28 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead index="07" kicker="Questions" title="Before you send a video" />
          <dl className="mt-14 grid gap-x-10 md:grid-cols-2">
            {editFaq.map((f, i) => (
              <Reveal key={f.q} delay={(i % 2) * 80} className="border-t border-white/10 py-7">
                <dt className="text-[19px] font-semibold leading-snug tracking-[-0.02em]">{f.q}</dt>
                <dd className="mt-2 max-w-[58ch] text-[15px] leading-relaxed text-dim">{f.a}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </GradeZone>

      <Contact />
      <Credits />
      <JsonLd graph={editGraph()} />
    </main>
  );
}
