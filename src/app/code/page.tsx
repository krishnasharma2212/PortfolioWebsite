import type { Metadata } from "next";
import Stages from "@/components/code/Stages";
import Contact from "@/components/Contact";
import Credits from "@/components/Credits";
import HireLink from "@/components/HireLink";
import JsonLd from "@/components/JsonLd";
import { GradeZone, Reveal, SectionHead } from "@/components/ui";
import WorldHeader from "@/components/WorldHeader";
import {
  education,
  engineerServices,
  engineerStats,
  experience,
  profile,
  projects,
  stack,
  whatsappLink,
} from "@/lib/content";
import { asset } from "@/lib/media";
import { codeGraph, copy, pageMeta, projectSlug as slug } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  ...copy.code,
  path: "/code",
  image: {
    url: asset("/og/code.jpg"),
    width: 1200,
    height: 630,
    alt: "Krishna Sharma — full-stack and AI engineer: cluemate, coldwire and salonflow.",
  },
});

export default function CodePage() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <main id="main" data-grade="code">
      <WorldHeader
        grade="code"
        word="Engineer"
        kicker="Full-stack & AI engineer · the codebase"
        title="AI products that survive contact with users."
        lede="LLM apps, voice and WhatsApp agents, and the full-stack systems around them — wired into real businesses, deployed, and still running."
        facts={[
          ["Builds", "AI agents · voice & WhatsApp bots · full-stack web apps · Windows apps"],
          ["Stack", "TypeScript, Python, Go, C# · React, Next.js · Node, Flask · PostgreSQL · AWS"],
          ["Track record", `${engineerStats.map((s) => `${s.value} ${s.label}`).join(" · ")}`],
        ]}
        actions={
          <>
            <a href={whatsappLink("Hi Krishna — I need something built: ")} target="_blank" rel="noopener noreferrer" className="btn">
              Tell me what to build <span className="arr">→</span>
            </a>
            <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Résumé (PDF) ↗
            </a>
          </>
        }
      />

      {/* 01 — shipped */}
      <GradeZone grade="code" className="px-[var(--gutter)] pt-28 md:pt-36">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead index="01" kicker="Shipped" title="Three products, live this year" />
          <div className="mt-16 space-y-24 md:space-y-36">
            {featured.map((p, n) => (
              <article key={p.name} id={slug(p)} className="scroll-mt-24 grid gap-10 lg:grid-cols-12 lg:gap-14">
                <Reveal className="lg:col-span-7">
                  {p.stages ? (
                    <Stages stages={p.stages} name={p.name} />
                  ) : p.shot ? (
                    <figure className="overflow-hidden rounded-[18px] border border-white/10 bg-ink-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset(p.shot.src)} alt={p.shot.alt} width={p.shot.w} height={p.shot.h} loading="lazy" decoding="async" className="w-full" />
                    </figure>
                  ) : null}
                </Reveal>
                <Reveal delay={120} className="lg:col-span-5">
                  <p className="label flex items-center gap-3">
                    <span className="mono text-faint">0{n + 1}</span>
                    {p.status && (
                      <span className="flex items-center gap-1.5 text-paper/80">
                        {p.live && <span className="h-1.5 w-1.5 rounded-full bg-code" />}
                        {p.status}
                      </span>
                    )}
                    <span className="text-faint">· {p.year}</span>
                  </p>
                  <h3 className="display mt-4 text-[clamp(64px,7.4vw,124px)]" style={{ fontStretch: "48%", color: "var(--accent)" }}>
                    {p.name}
                  </h3>
                  <p className="mt-4 text-[20px] font-medium leading-snug tracking-[-0.02em]">{p.tagline}</p>
                  <p className="mt-4 text-[15.5px] leading-relaxed text-dim">{p.body}</p>
                  {p.proof && (
                    <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-white/10 py-5">
                      {p.proof.map((f) => (
                        // label first for the dl's semantics, shown under the number
                        <div key={f.label} className="flex flex-col">
                          <dt className="order-2 mt-1 text-[12px] leading-snug text-dim">{f.label}</dt>
                          <dd className="display order-1 text-[clamp(26px,2.4vw,38px)]" style={{ fontStretch: "60%" }}>
                            {f.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <li key={s} className="mono rounded-md border border-white/12 px-2 py-1 text-[11px] text-dim">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex flex-wrap gap-5 text-[14px]">
                    {p.repo && (
                      <a href={p.repo} target="_blank" rel="noopener noreferrer" className="underline decoration-white/25 underline-offset-4 hover:decoration-[var(--accent)]">
                        Source on GitHub ↗
                      </a>
                    )}
                    {p.demo && (
                      <a href={p.demo} target="_blank" rel="noopener noreferrer" className="underline decoration-white/25 underline-offset-4 hover:decoration-[var(--accent)]">
                        {p.demoLabel ?? "Live"} ↗
                      </a>
                    )}
                  </div>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </GradeZone>

      {/* 02 — index */}
      <GradeZone grade="code" className="px-[var(--gutter)] pt-28 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead index="02" kicker="More work" title="The rest of the repo" />
          <Reveal as="ul" className="mt-14 border-t border-white/10">
            {rest.map((p) => {
              const href = p.demo ?? p.repo;
              const Row = href ? "a" : "div";
              return (
                <li key={p.name} id={slug(p)} className="scroll-mt-24 border-b border-white/10">
                  <Row
                    {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group grid gap-2 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)_5rem] md:items-baseline md:gap-8"
                  >
                    <span className="text-[22px] font-semibold tracking-[-0.025em] transition-colors group-hover:text-[var(--accent)]">{p.name}</span>
                    <span className="text-[15px] text-dim">{p.tagline}</span>
                    <span className="mono text-[11.5px] text-faint">{p.stack.join(" · ")}</span>
                    <span className="mono flex items-center justify-between text-[11.5px] text-faint md:justify-end md:gap-3">
                      {p.year}
                      {href && <span className="transition-transform group-hover:-rotate-45">→</span>}
                    </span>
                  </Row>
                </li>
              );
            })}
          </Reveal>
        </div>
      </GradeZone>

      {/* 03 — experience, as a log */}
      <GradeZone grade="code" className="px-[var(--gutter)] pt-28 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead index="03" kicker="Experience" title="git log --career" />
          <Reveal className="mt-14 overflow-hidden rounded-[22px] border border-white/10 bg-[#0c0d0e] font-mono">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-[11px] text-faint">
              <span>
                <span className="text-code">~/krishna</span> $ git log --career --reverse=false
              </span>
              <span className="hidden sm:inline">{experience.length} commits</span>
            </div>
            <ol className="divide-y divide-white/[0.07]">
              {experience.map((r, n) => (
                <li key={r.company} className="grid gap-4 px-5 py-7 md:grid-cols-[14rem_1fr] md:px-7">
                  <div className="text-[12px] leading-relaxed">
                    <p>
                      <span className="text-[#e5c07b]">commit</span> <span className="text-faint">{r.from}…{r.to}</span>
                    </p>
                    {n === 0 && <p className="text-code">(HEAD → main)</p>}
                    <p className="mt-1 text-faint">Author: {profile.name}</p>
                  </div>
                  <div className="font-sans">
                    <p className="text-[20px] font-semibold tracking-[-0.02em]">
                      {r.title} <span className="text-dim">· {r.company}</span>
                    </p>
                    <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-dim">
                      {r.points.map((pt) => (
                        <li key={pt} className="flex gap-2.5">
                          <span className="mono text-code">+</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
            <div className="border-t border-white/10 px-5 py-4 text-[12px] text-faint md:px-7">
              {education.map((e) => (
                <p key={e.degree}>
                  <span className="text-code">init</span> {e.degree} — {e.school} <span className="opacity-70">({e.period})</span>
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </GradeZone>

      {/* 04 — stack */}
      <GradeZone grade="code" className="px-[var(--gutter)] pt-28 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead
            index="04"
            kicker="Stack"
            title="Every tool, with its receipt"
            lede="Not a logo wall. Each tool carries the project or the seat it shipped in."
          />
          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {stack.map((g, n) => (
              <Reveal key={g.label} delay={(n % 3) * 80}>
                <p className="label mb-4">{g.label}</p>
                <ul className="divide-y divide-white/[0.07] border-y border-white/10">
                  {g.items.map((t) => (
                    <li key={t.name} className="flex items-baseline justify-between gap-4 py-3">
                      <span className="text-[15px]" style={{ color: t.key ? "var(--color-paper)" : "var(--color-dim)" }}>
                        {t.name}
                      </span>
                      <span className="text-right text-[12px] text-faint">{t.where}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </GradeZone>

      {/* 05 — engagements */}
      <GradeZone grade="code" className="px-[var(--gutter)] pb-10 pt-28 md:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead index="05" kicker="Hire the engineer" title="What I build for clients" />
          <div className="mt-14 grid gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 md:grid-cols-3">
            {engineerServices.map((s, i) => (
              <Reveal key={s.n} delay={i * 80} className="bg-ink p-7 md:p-9">
                <p className="mono text-[11px] text-faint">{s.n}</p>
                <h3 className="mt-8 text-[22px] font-semibold leading-tight tracking-[-0.025em]">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-dim">{s.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 flex justify-end">
            <HireLink choice="code" className="btn">
              Start a build <span className="arr">→</span>
            </HireLink>
          </Reveal>
        </div>
      </GradeZone>

      <Contact initial="code" />
      <Credits />
      <JsonLd graph={codeGraph()} />
    </main>
  );
}
