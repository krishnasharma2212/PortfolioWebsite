/**
 * Search: page metadata and structured data (schema.org JSON-LD).
 *
 * One Person entity, #person, is defined on every page (by the root layout)
 * and referenced by @id everywhere else, so every page describes the same
 * human: the name, the real photo, the two occupations and the profiles that
 * confirm them. That entity is what name searches ("Krishna Sharma video
 * editor") and AI answer engines resolve to.
 *
 * Shared by server and client components — keep this file free of "use client".
 */
import type { Metadata } from "next";
import { editFaq, education, profile, projects, reels, services, site, type Project, type Reel } from "./content";
import { asset, h264, info, reelMedia } from "./media";

export const abs = (path: string) => (/^https?:/.test(path) ? path : `${site.url}${path}`);

export const ids = {
  person: `${site.url}/#person`,
  website: `${site.url}/#website`,
  headshot: `${site.url}/#headshot`,
  service: `${site.url}/edit#service`,
};

const sameAs = [profile.links.linkedin, profile.links.github, profile.links.instagram, profile.links.youtube].filter(Boolean);

// ──────────────────────────────────────────────────────────────── copy

export const copy = {
  home: {
    title: `${profile.name} — Video Editor & Full-Stack Developer`,
    description:
      "Krishna Sharma is a video editor and full-stack developer in Noida, India: talking-head and educational edits for YouTube and Reels, and AI products that ship.",
  },
  edit: {
    title: `Video Editor for YouTube & Instagram Reels — ${profile.name}`,
    description:
      "Freelance video editor in Noida, India. Krishna Sharma edits talking-head and educational videos: pacing, B-roll, word-timed captions, motion graphics, sound.",
  },
  code: {
    title: `Full-Stack & AI Engineer — ${profile.name}`,
    description:
      "Krishna Sharma builds AI products that survive contact with users — cluemate on the Microsoft Store, coldwire and salonflow. TypeScript, Python, Go and C#.",
  },
} as const;

/** Trim to a search-snippet length: at the last full sentence if that keeps most of it, else at a word. */
export function clamp(text: string, max = 158) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentence = cut.lastIndexOf(". ");
  if (sentence >= max * 0.6) return cut.slice(0, sentence + 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:—–-]+$/, "")}…`;
}

export const reelCopy = (r: Reel) => ({
  title: `${r.title} — Reel Edit by ${profile.name}`,
  description: clamp(`${r.formatLabel} for Instagram Reels, edited by ${profile.name}. ${r.did.join(" ")}`),
});

/**
 * Everything a page's <head> needs. Next replaces (not merges) a parent's
 * openGraph/twitter objects, so each page states them in full.
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  video,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; width: number; height: number; alt: string };
  video?: { url: string; type: string; width: number; height: number };
  type?: "website" | "video.other";
}): Metadata {
  const images = image ? [{ ...image, url: abs(image.url) }] : undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title,
      description,
      siteName: profile.name,
      locale: "en_IN",
      ...(images ? { images } : {}),
      ...(video ? { videos: [{ ...video, url: abs(video.url) }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(images ? { images } : {}) },
  };
}

// ──────────────────────────────────────────────────────── the entity

const school = (s: string) => {
  const i = s.lastIndexOf(",");
  return i === -1 ? { name: s } : { name: s.slice(0, i).trim(), city: s.slice(i + 1).trim() };
};

export function person() {
  return {
    "@type": "Person",
    "@id": ids.person,
    name: profile.name,
    givenName: "Krishna",
    familyName: "Sharma",
    url: `${site.url}/`,
    image: {
      "@type": "ImageObject",
      "@id": ids.headshot,
      url: abs("/krishna-sharma.jpg"),
      contentUrl: abs("/krishna-sharma.jpg"),
      width: 800,
      height: 800,
      caption: profile.name,
    },
    description:
      "Video editor and full-stack developer in Noida, India. Edits story-driven talking-head and educational videos for YouTube and Instagram Reels, and builds AI products — agents, full-stack web apps and automations.",
    jobTitle: ["Video Editor", "Full-Stack Developer"],
    hasOccupation: [
      {
        "@type": "Occupation",
        name: "Video Editor",
        occupationalCategory: "27-4032.00",
        occupationLocation: { "@type": "City", name: "Noida" },
        skills: "Video editing, short-form video, captioning, motion graphics, sound design, colour grading, DaVinci Resolve",
      },
      {
        "@type": "Occupation",
        name: "Full-Stack Developer",
        occupationalCategory: "15-1252.00",
        occupationLocation: { "@type": "City", name: "Noida" },
        skills: "TypeScript, Python, Go, C#, React, Next.js, Node.js, PostgreSQL, AWS, AI agents",
      },
    ],
    knowsAbout: [
      "Video editing",
      "YouTube video editing",
      "Instagram Reels editing",
      "Short-form video",
      "Talking-head video",
      "Motion graphics",
      "Word-timed captions",
      "Sound design",
      "Colour grading",
      "DaVinci Resolve",
      "Full-stack development",
      "TypeScript",
      "Python",
      "Next.js",
      "AI agents",
      "Voice AI",
      "WhatsApp automation",
    ],
    knowsLanguage: ["English", "Hindi"],
    email: `mailto:${profile.email}`,
    telephone: `+${profile.whatsapp}`,
    address: { "@type": "PostalAddress", addressLocality: "Noida", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
    alumniOf: education.map((e) => {
      const s = school(e.school);
      return { "@type": "CollegeOrUniversity", name: s.name, ...(s.city ? { address: { "@type": "PostalAddress", addressLocality: s.city, addressCountry: "IN" } } : {}) };
    }),
    hasCredential: education.map((e) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: e.degree,
      recognizedBy: { "@type": "CollegeOrUniversity", name: school(e.school).name },
    })),
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Video editing for YouTube and Instagram Reels", url: abs("/edit") } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full-stack and AI product development", url: abs("/code") } },
    ],
    sameAs,
  };
}

export function website() {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: `${site.url}/`,
    name: profile.name,
    alternateName: ["Krishna Sharma — Video Editor & Full-Stack Developer", "krishnasharma.online"],
    description: copy.home.description,
    inLanguage: "en",
    publisher: { "@id": ids.person },
    author: { "@id": ids.person },
  };
}

export const breadcrumbs = (trail: [string, string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
});

const webpage = (path: string, name: string, description: string, extra: Record<string, unknown> = {}) => ({
  "@type": "WebPage",
  "@id": `${abs(path)}#webpage`,
  url: abs(path),
  name,
  description,
  isPartOf: { "@id": ids.website },
  inLanguage: "en",
  ...extra,
});

// ──────────────────────────────────────────────────────── per page

export function homeGraph() {
  return [
    {
      "@type": "ProfilePage",
      "@id": `${site.url}/#webpage`,
      url: `${site.url}/`,
      name: copy.home.title,
      description: copy.home.description,
      isPartOf: { "@id": ids.website },
      mainEntity: { "@id": ids.person },
      about: { "@id": ids.person },
      primaryImageOfPage: { "@id": ids.headshot },
      dateModified: site.updated,
      inLanguage: "en",
    },
  ];
}

export function editGraph() {
  return [
    webpage("/edit", copy.edit.title, copy.edit.description, {
      about: { "@id": ids.service },
      mainEntity: { "@id": ids.service },
      primaryImageOfPage: abs(asset("/og/edit.jpg")),
      dateModified: site.updated,
    }),
    {
      "@type": "Service",
      "@id": ids.service,
      name: "Video editing for YouTube and Instagram Reels",
      serviceType: "Video editing",
      description:
        "Story-driven talking-head and educational edits: pacing, B-roll and cutaways, word-timed captions in English, Hindi and Hinglish, motion graphics built in code, sound design, and delivery ready to post.",
      url: abs("/edit"),
      provider: { "@id": ids.person },
      areaServed: [{ "@type": "Country", name: "India" }, "Worldwide"],
      audience: { "@type": "Audience", audienceType: "YouTubers, Instagram creators, educators and founders" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "What the edit includes",
        itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, description: s.body } })),
      },
      subjectOf: reels.map((r) => ({ "@id": `${abs(`/edit/${r.slug}`)}#video` })),
    },
    {
      "@type": "ItemList",
      name: "Reels edited by Krishna Sharma",
      itemListElement: reels.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/edit/${r.slug}`), name: r.title })),
    },
    {
      "@type": "FAQPage",
      "@id": `${abs("/edit")}#faq`,
      mainEntity: editFaq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    breadcrumbs([
      ["Krishna Sharma", "/"],
      ["Video editing", "/edit"],
    ]),
  ];
}

const seconds = (r: Reel) => Math.round((r.frames / r.fps) * 10) / 10;
const lang = (r: Reel) => (/hinglish|hindi/i.test(r.language) ? ["hi", "en"] : ["en"]);

export function reelVideo(r: Reel) {
  const m = reelMedia(r.slug);
  const page = abs(`/edit/${r.slug}`);
  const file = info(`${m.full}.mp4`);
  return {
    "@type": "VideoObject",
    "@id": `${page}#video`,
    name: r.series ? `${r.title} — ${r.series}` : r.title,
    description: clamp(`${r.formatLabel} for Instagram Reels, edited by ${profile.name}. Hook: “${r.hook}” ${r.did.join(" ")}`, 480),
    thumbnailUrl: [abs(m.poster), abs(asset(`/og/reel-${r.slug}.jpg`))],
    uploadDate: r.published,
    duration: `PT${seconds(r)}S`,
    contentUrl: abs(h264(m.full)),
    encodingFormat: "video/mp4",
    width: file?.w ?? 720,
    height: file?.h ?? 1280,
    inLanguage: lang(r),
    genre: r.formatLabel,
    keywords: ["video editing", "Instagram Reels", "talking-head video", r.niche, ...r.tools].join(", "),
    isFamilyFriendly: true,
    creator: { "@id": ids.person },
    author: { "@id": ids.person },
    ...(r.beats.length ? { transcript: r.beats.map((b) => b.line).join(" ") } : {}),
    mainEntityOfPage: { "@id": `${page}#webpage` },
  };
}

export function reelGraph(r: Reel) {
  const c = reelCopy(r);
  const path = `/edit/${r.slug}`;
  return [
    webpage(path, c.title, c.description, {
      mainEntity: { "@id": `${abs(path)}#video` },
      primaryImageOfPage: abs(asset(`/og/reel-${r.slug}.jpg`)),
      datePublished: r.published,
      author: { "@id": ids.person },
    }),
    reelVideo(r),
    breadcrumbs([
      ["Krishna Sharma", "/"],
      ["Video editing", "/edit"],
      [r.title, path],
    ]),
  ];
}

export const projectSlug = (p: Project) => p.name.toLowerCase().replace(/\s+/g, "-");

function project(p: Project) {
  return {
    "@type": p.repo ? "SoftwareSourceCode" : "CreativeWork",
    name: p.name,
    headline: p.tagline,
    description: p.body,
    url: p.demo ?? p.repo ?? `${abs("/code")}#${projectSlug(p)}`,
    ...(p.repo ? { codeRepository: p.repo } : {}),
    ...(p.shot ? { image: abs(asset(p.shot.src)) } : {}),
    keywords: p.stack.join(", "),
    dateCreated: p.year,
    author: { "@id": ids.person },
  };
}

export function codeGraph() {
  return [
    webpage("/code", copy.code.title, copy.code.description, {
      "@type": "CollectionPage",
      about: { "@id": ids.person },
      primaryImageOfPage: abs(asset("/og/code.jpg")),
      dateModified: site.updated,
      mainEntity: {
        "@type": "ItemList",
        name: "Software built by Krishna Sharma",
        itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: project(p) })),
      },
    }),
    breadcrumbs([
      ["Krishna Sharma", "/"],
      ["Engineering", "/code"],
    ]),
  ];
}
