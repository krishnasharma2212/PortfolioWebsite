import type { NextConfig } from "next";

// A fully static export: every route is prerendered at build time and served
// from Cloudflare's edge as plain files (worker/index.ts only handles video,
// which lives in R2). Cache Components is off because nothing here renders per
// request, and static export needs `dynamic = "force-static"` on robots/sitemap,
// which Cache Components forbids.
const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  images: { unoptimized: true },
  // Not experimental.inlineCss: in 16.4 it also copies the stylesheet into the
  // RSC payload, so every page and every client navigation carries it twice
  // (index.html went from 26 to 65 KB gzipped). One cached 13 KB file is cheaper.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
