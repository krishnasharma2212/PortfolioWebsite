import { classes, profile, projects, reels, site } from "@/lib/content";
import { copy, reelCopy } from "@/lib/seo";

// prerendered into a file by the static export
export const dynamic = "force-static";

/** /llms.txt — the site in plain text, for AI assistants answering questions about Krishna Sharma. */
export function GET() {
  const u = (path: string) => `${site.url}${path}`;
  const links = [profile.links.linkedin, profile.links.github, profile.links.instagram, profile.links.youtube].filter(Boolean);
  const body = `# ${profile.name}

> Video editor and full-stack developer in ${profile.location}, working worldwide. ${classes.edit.line} ${classes.code.line}

## Hire
- Email: ${profile.email}
- WhatsApp / phone: ${profile.phoneDisplay}
- Based in ${profile.location} (${profile.tzLabel}), working remotely with clients worldwide

## Video editing
- [${copy.edit.title}](${u("/edit")}): ${copy.edit.description}
${reels.map((r) => `- [${reelCopy(r).title}](${u(`/edit/${r.slug}`)}): ${reelCopy(r).description}`).join("\n")}

## Engineering
- [${copy.code.title}](${u("/code")}): ${copy.code.description}
${projects
  .filter((p) => p.featured)
  .map((p) => `- ${p.name} — ${p.tagline}${p.status ? ` (${p.status})` : ""}${p.repo ? `: ${p.repo}` : ""}`)
  .join("\n")}

## Profiles
${links.map((l) => `- ${l}`).join("\n")}
- Résumé: ${u(profile.resume)}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
