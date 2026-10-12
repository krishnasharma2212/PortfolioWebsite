import type { MetadataRoute } from "next";
import { profile, reels, site } from "@/lib/content";
import { h264, reelMedia } from "@/lib/media";
import { abs, reelCopy } from "@/lib/seo";

// prerendered into a file by the static export
export const dynamic = "force-static";

/** Every page, with each reel page's video and poster, so Google can index the reels as videos. */
export default function sitemap(): MetadataRoute.Sitemap {
  const latestReel = reels.map((r) => r.published.slice(0, 10)).sort().at(-1) ?? site.updated;
  return [
    {
      url: `${site.url}/`,
      lastModified: site.updated,
      changeFrequency: "monthly",
      priority: 1,
      images: [abs("/krishna-sharma.jpg")],
    },
    {
      url: `${site.url}/edit`,
      lastModified: latestReel > site.updated ? latestReel : site.updated,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: `${site.url}/code`, lastModified: site.updated, changeFrequency: "monthly", priority: 0.8 },
    ...reels.map((r) => {
      const m = reelMedia(r.slug);
      return {
        url: `${site.url}/edit/${r.slug}`,
        lastModified: r.published,
        changeFrequency: "yearly" as const,
        priority: 0.7,
        images: [abs(m.poster)],
        videos: [
          {
            title: r.series ? `${r.title} — ${r.series}` : r.title,
            description: reelCopy(r).description,
            thumbnail_loc: abs(m.poster),
            content_loc: abs(h264(m.full)),
            duration: Math.round(r.frames / r.fps),
            publication_date: r.published,
            family_friendly: "yes" as const,
            uploader: { info: `${site.url}/`, content: profile.name },
          },
        ],
      };
    }),
  ];
}
