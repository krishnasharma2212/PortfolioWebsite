import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

// prerendered into a file by the static export
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${site.url}/sitemap.xml` };
}
