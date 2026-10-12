"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { mailLink, profile, whatsappLink } from "@/lib/content";
import { play } from "@/lib/sfx";
import { Reveal, Rise } from "./ui";

type Choice = "edit" | "code" | "both";

const CHOICES: Record<Choice, { tag: string; title: string; ask: string; wa: string; subject: string; color: string }> = {
  edit: {
    tag: "P1",
    title: "Hire the editor",
    ask: "Send one raw take and a reel you love the feel of. I'll tell you how I'd cut it.",
    wa: "Hi Krishna — I make videos and I'm looking for an editor. My channel/page: ",
    subject: "Editing — ",
    color: "var(--color-edit)",
  },
  code: {
    tag: "P2",
    title: "Hire the engineer",
    ask: "Tell me what has to work, by when, and what it costs you that it doesn't yet.",
    wa: "Hi Krishna — I need something built: ",
    subject: "Build — ",
    color: "var(--color-code)",
  },
  both: {
    tag: "CO-OP",
    title: "Both, together",
    ask: "Launching something? I'll build the product and cut the video that launches it.",
    wa: "Hi Krishna — I need a product built and a launch video cut: ",
    subject: "Product + launch video — ",
    color: "linear-gradient(90deg, var(--color-edit), var(--color-code))",
  },
};

/** Fired by any "hire" link elsewhere on the page to preselect a choice. */
export const HIRE_EVENT = "ks:hire";

// A hire link on another page arrives as /?hire=edit#contact. The query never
// changes while this page is open, so there is nothing to subscribe to.
const noSubscribe = () => () => {};
const hireFromUrl = (): Choice | null => {
  const h = new URLSearchParams(window.location.search).get("hire");
  return h && h in CHOICES ? (h as Choice) : null;
};

export default function Contact({ initial = "edit" }: { initial?: Choice }) {
  const fromUrl = useSyncExternalStore(noSubscribe, hireFromUrl, () => null);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [copied, setCopied] = useState(false);
  const choice = picked ?? fromUrl ?? initial;
  const c = CHOICES[choice];

  useEffect(() => {
    const on = (e: Event) => setPicked((e as CustomEvent<Choice>).detail);
    window.addEventListener(HIRE_EVENT, on);
    return () => window.removeEventListener(HIRE_EVENT, on);
  }, []);

  const pick = (k: Choice) => {
    setPicked(k);
    play("select");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      play("tick");
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <section id="contact" className="relative scroll-mt-20 border-t border-white/10 px-[var(--gutter)] pb-24 pt-28 md:pt-36" aria-labelledby="contact-title">
      <div className="mx-auto max-w-[1440px]">
        <Reveal>
          <p className="label flex items-center gap-3">
            <span className="mono rounded-[4px] bg-paper px-1.5 py-0.5 text-[10px] text-ink">05</span>
            Continue?
          </p>
        </Reveal>
        <Rise
          as="h2"
          text="Ready, player?"
          className="display mt-6 text-[clamp(72px,15vw,260px)]"
          style={{ fontStretch: "40%" }}
        />
        <span id="contact-title" className="sr-only">
          Contact
        </span>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div role="radiogroup" aria-label="What do you need?" className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(CHOICES) as Choice[]).map((k) => {
                const on = choice === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pick(k)}
                    className="group relative overflow-hidden rounded-2xl border p-5 text-left transition-colors"
                    style={{ borderColor: on ? "transparent" : "rgb(255 255 255 / .1)", background: on ? "rgb(255 255 255 / .05)" : "transparent" }}
                  >
                    {on && <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: CHOICES[k].color }} />}
                    <span className="label-sm" style={{ color: k === "both" ? "var(--color-paper)" : CHOICES[k].color }}>
                      {CHOICES[k].tag}
                    </span>
                    <span className="mt-6 block text-[19px] font-semibold leading-tight tracking-[-0.02em]">{CHOICES[k].title}</span>
                    <span className="mt-3 block h-4 w-4 rounded-full border border-white/25 transition-all" style={{ background: on ? "var(--color-paper)" : "transparent", boxShadow: on ? "inset 0 0 0 4px var(--color-ink)" : undefined }} />
                  </button>
                );
              })}
            </div>

            <p key={choice} className="lede mt-8 max-w-[40ch] animate-[fadeUp_.5s_var(--ease-out-expo)]">
              {c.ask}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink(c.wa)} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: "#25d366" }} onClick={() => play("select")}>
                WhatsApp me <span className="arr">→</span>
              </a>
              <a href={mailLink(c.subject)} className="btn btn-ghost" onClick={() => play("select")}>
                Email me <span className="arr">→</span>
              </a>
            </div>
          </div>

          <dl className="grid content-start gap-6 border-white/10 lg:col-span-4 lg:col-start-9 lg:border-l lg:pl-10">
            <div>
              <dt className="label">Email</dt>
              <dd className="mt-1.5 flex items-center gap-3">
                <a href={`mailto:${profile.email}`} className="text-[17px] underline decoration-white/20 underline-offset-4 hover:decoration-[var(--accent)]">
                  {profile.email}
                </a>
                <button type="button" onClick={copy} className="label-sm text-faint transition-colors hover:text-paper">
                  {copied ? "copied ✓" : "copy"}
                </button>
              </dd>
            </div>
            <div>
              <dt className="label">WhatsApp / phone</dt>
              <dd className="mt-1.5 text-[17px]">
                <a href={`tel:+${profile.whatsapp}`}>{profile.phoneDisplay}</a>
              </dd>
            </div>
            <div>
              <dt className="label">Based in</dt>
              <dd className="mt-1.5 text-[17px]">{profile.location} · working worldwide</dd>
            </div>
            <div>
              <dt className="label">Elsewhere</dt>
              <dd className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-dim">
                <a className="hover:text-paper" href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                <a className="hover:text-paper" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
                {profile.links.instagram && (
                  <a className="hover:text-paper" href={profile.links.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                )}
                {profile.links.youtube && (
                  <a className="hover:text-paper" href={profile.links.youtube} target="_blank" rel="noopener noreferrer">YouTube ↗</a>
                )}
                <a className="hover:text-paper" href={profile.resume} target="_blank" rel="noopener noreferrer">Résumé ↗</a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
