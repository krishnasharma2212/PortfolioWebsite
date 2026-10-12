import Link from "next/link";
import ProjectRows from "@/components/code/ProjectRows";
import Contact from "@/components/Contact";
import Credits from "@/components/Credits";
import ReelCard from "@/components/edit/ReelCard";
import CharacterSelect from "@/components/hero/CharacterSelect";
import HireLink from "@/components/HireLink";
import HumanCard from "@/components/HumanCard";
import JsonLd from "@/components/JsonLd";
import RenderFrame from "@/components/RenderFrame";
import { GradeZone, Reveal, Rise, SectionHead } from "@/components/ui";
import { projects, reels } from "@/lib/content";
import { asset, srcSet } from "@/lib/media";
import { homeGraph } from "@/lib/seo";

const STATS = [
  { value: "4+", label: "years shipping software" },
  { value: "50+", label: "projects delivered" },
  { value: "111", label: "sound effects in one 26-second reel" },
  { value: "1:1", label: "every caption timed to its word" },
];

export default function Home() {
  return (
    <main id="main">
      <CharacterSelect
        portrait={{
          neutral: {
            src: asset("/media/hero/avatar-neutral-864.webp"),
            avif: srcSet([["/media/hero/avatar-neutral-864.avif", 864]]),
          },
          edit: {
            src: asset("/media/hero/avatar-edit-1532.webp"),
            srcSet: srcSet([
              ["/media/hero/avatar-edit-766.webp", 766],
              ["/media/hero/avatar-edit-1532.webp", 1532],
            ]),
            avif: srcSet([
              ["/media/hero/avatar-edit-766.avif", 766],
              ["/media/hero/avatar-edit-1532.avif", 1532],
            ]),
          },
          code: {
            src: asset("/media/hero/avatar-code-1532.webp"),
            srcSet: srcSet([
              ["/media/hero/avatar-code-766.webp", 766],
              ["/media/hero/avatar-code-1532.webp", 1532],
            ]),
            avif: srcSet([
              ["/media/hero/avatar-code-766.avif", 766],
              ["/media/hero/avatar-code-1532.avif", 1532],
            ]),
          },
          idle: { base: "/media/hero/avatar-idle", w: 864, h: 1298 },
          w: 1532,
          h: 2300,
          alt: "Krishna as a 3D character — dark wavy hair, short beard, black henley, hands clasped.",
        }}
      />

      {/* 00 — both */}
      <GradeZone grade="neutral" id="both" className="relative scroll-mt-16 px-[var(--gutter)] pb-28 pt-32 md:pb-40 md:pt-44">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 md:grid-cols-12 md:gap-10">
          <Reveal className="mx-auto w-full max-w-[400px] md:col-span-5 md:max-w-none lg:col-span-4">
            <HumanCard
              src={asset("/media/hero/krishna-1259.webp")}
              srcSet={srcSet([
                ["/media/hero/krishna-630.webp", 630],
                ["/media/hero/krishna-1259.webp", 1259],
              ])}
              avif={srcSet([
                ["/media/hero/krishna-630.avif", 630],
                ["/media/hero/krishna-1259.avif", 1259],
              ])}
              w={1259}
              h={2300}
              alt="Krishna Sharma — the real photo: blue plaid shirt, one hand in his pocket, smiling at the camera."
            />
          </Reveal>
          <div className="md:col-span-7 lg:col-span-7 lg:col-start-6">
            <Reveal>
              <p className="label mb-8 flex items-center gap-3">
                <span className="mono rounded-[4px] bg-paper px-1.5 py-0.5 text-[10px] text-ink">00</span>
                One human, two classes
              </p>
            </Reveal>
            <Rise
              as="p"
              text="I edit video and I write software. Each one makes me better at the other."
              className="max-w-[18ch] text-[clamp(34px,4.2vw,66px)] font-medium leading-[1.02] tracking-[-0.035em]"
              stagger={35}
            />
            <Reveal delay={200} className="mt-10 grid max-w-[64ch] gap-5 text-[17px] leading-relaxed text-dim md:grid-cols-2 md:gap-8">
              <p>
                Editing taught me pacing — what to cut so the point lands, and where the sound should hit so you feel it.
              </p>
              <p>
                Engineering taught me systems. The reels I edit come out of a pipeline I wrote — transcripts, mattes, graphics, renders —
                so every one gets the same care. Most clients need one of those skills. Some need both.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal delay={150} className="mx-auto mt-20 grid max-w-[1440px] grid-cols-2 border-t border-white/10 md:mt-28 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className={`py-7 pr-6 ${i ? "md:border-l md:border-white/10 md:pl-6" : ""} ${i % 2 ? "border-l border-white/10 pl-6 md:pl-6" : ""}`}>
              <p className="display text-[clamp(52px,6vw,96px)]" style={{ fontStretch: "46%" }}>
                {s.value}
              </p>
              <p className="mt-3 max-w-[22ch] text-[14px] leading-snug text-dim">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </GradeZone>

      {/* 01 — the editor */}
      <GradeZone grade="edit" id="editor" className="relative px-[var(--gutter)] pb-28 md:pb-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead
            index="01"
            kicker="Player 1 · The editor"
            title="Edits that hold attention"
            lede="Talking-head and educational edits for YouTube and Reels — pacing, B-roll, captions, motion graphics and sound, in the style your audience already knows."
          />

          <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-24 md:grid-cols-4 md:gap-x-6">
            {reels.map((r, i) => (
              <Reveal key={r.slug} delay={i * 90} className={i % 2 ? "md:translate-y-16" : ""}>
                <ReelCard reel={r} index={i} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:mt-36 md:flex-row md:items-center">
            <p className="max-w-[52ch] text-[15px] text-dim">
              Every reel opens into a breakdown — the beat map, the layers, the raw take next to the final. That is where you can
              see how I think.
            </p>
            <Link href="/edit" className="btn" transitionTypes={["cut"]}>
              Enter the edit suite <span className="arr">→</span>
            </Link>
          </Reveal>
        </div>
      </GradeZone>

      {/* 02 — the engineer */}
      <GradeZone grade="code" id="engineer" className="relative px-[var(--gutter)] pb-28 md:pb-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead
            index="02"
            kicker="Player 2 · The engineer"
            title="Products that survive contact with users"
            lede="AI products, agents and full-stack apps, wired into real businesses. Four years, 50+ projects, three products live this year."
          />
          <Reveal className="mt-16 md:mt-24">
            <ProjectRows items={projects.filter((p) => p.featured)} />
          </Reveal>
          <Reveal className="mt-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <p className="max-w-[52ch] text-[15px] text-dim">
              cluemate is on the Microsoft Store. coldwire runs outbound end to end with no operator. salonflow takes bookings and
              payments inside WhatsApp.
            </p>
            <Link href="/code" className="btn" transitionTypes={["cut"]}>
              Open the codebase <span className="arr">→</span>
            </Link>
          </Reveal>
        </div>
      </GradeZone>

      {/* 03 — co-op */}
      <GradeZone grade="neutral" id="coop" className="relative border-t border-white/10 px-[var(--gutter)] pb-28 pt-28 md:pb-40 md:pt-36">
        <div className="mx-auto max-w-[1440px]">
          <header className="grid gap-6 md:grid-cols-12">
            <Reveal className="md:col-span-3">
              <p className="label flex items-center gap-3">
                <span className="mono rounded-[4px] px-1.5 py-0.5 text-[10px] text-ink" style={{ background: "linear-gradient(90deg,var(--color-edit),var(--color-code))" }}>
                  03
                </span>
                Co-op mode
              </p>
            </Reveal>
            <div className="md:col-span-9">
              <h2 className="display text-[clamp(56px,9vw,148px)]" style={{ fontStretch: "44%" }}>
                <Rise as="span" text="An edit is a" className="block" />
                <span className="block">
                  <Rise as="span" text="function of" />{" "}
                  <span className="mono normal-case tracking-[-0.04em] text-code" style={{ fontSize: "0.62em" }}>
                    t
                  </span>
                </span>
              </h2>
              <Reveal delay={150}>
                <p className="lede mt-6 max-w-[48ch] text-dim">
                  Every graphic in the reels I edit is code — one page that can draw any frame it is asked for. Whisper times the words, a
                  renderer steps through all 617 frames, Resolve composites the layers. Press a word or a line below to scrub the
                  real thing.
                </p>
              </Reveal>
            </div>
          </header>

          <Reveal className="mt-16 md:mt-20">
            <RenderFrame />
          </Reveal>

          <Reveal className="mt-20 grid gap-8 rounded-[28px] border border-white/10 p-7 md:mt-28 md:grid-cols-[1fr_auto] md:items-center md:p-10" style={{ background: "linear-gradient(110deg, rgb(255 106 61 / .09), transparent 40%, transparent 60%, rgb(63 216 201 / .08))" }}>
            <div>
              <p className="label">The co-op offer</p>
              <p className="mt-3 max-w-[30ch] text-[clamp(24px,2.6vw,36px)] font-medium leading-[1.1] tracking-[-0.03em]">
                Launching something? I&apos;ll build the product and cut the video that launches it.
              </p>
            </div>
            <HireLink choice="both" className="btn" style={{ background: "var(--color-paper)" }}>
              Start a co-op project <span className="arr">→</span>
            </HireLink>
          </Reveal>
        </div>
      </GradeZone>

      <Contact />
      <Credits />
      <JsonLd graph={homeGraph()} />
    </main>
  );
}
