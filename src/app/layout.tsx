import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Mona_Sans } from "next/font/google";
import localFont from "next/font/local";
import Chrome from "@/components/Chrome";
import JsonLd from "@/components/JsonLd";
import SmoothScroll from "@/components/SmoothScroll";
import { profile, site } from "@/lib/content";
import { copy, person, website } from "@/lib/seo";
import { AV1_FALLBACK_SCRIPT } from "@/lib/video";
import "./globals.css";

// Roboto Flex, instanced to the display range (opsz 144, wght 500–1000,
// wdth 25–151) and subset to Latin — 42 KB. See _source/build_media.py's
// sibling notes in README for how it was cut.
const display = localFont({
  src: "./fonts/roboto-flex-display.woff2",
  variable: "--font-display-flex",
  weight: "500 1000",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "25% 151%" }],
  fallback: ["Arial Narrow", "Impact", "sans-serif"],
});

const sans = Mona_Sans({ subsets: ["latin"], variable: "--font-mona", axes: ["wdth"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const { title, description } = copy.home;

// Search Console / Bing Webmaster verification, if done by meta tag rather than DNS.
const verification = {
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } } : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: `${site.url}/` }],
  creator: profile.name,
  publisher: profile.name,
  keywords: [
    "Krishna Sharma",
    "video editor",
    "video editor in Noida",
    "freelance video editor India",
    "Instagram Reels editor",
    "YouTube video editor",
    "talking-head video editing",
    "Hinglish captions",
    "motion graphics",
    "full-stack developer",
    "AI engineer",
  ],
  openGraph: {
    type: "profile",
    url: "/",
    title,
    description,
    siteName: profile.name,
    locale: "en_IN",
    firstName: "Krishna",
    lastName: "Sharma",
  },
  twitter: { card: "summary_large_image", title, description },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
  ...(Object.keys(verification).length ? { verification } : {}),
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-grade="neutral"
      className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // First load only: hold the hero's entrance start states before first paint.
          dangerouslySetInnerHTML={{
            __html:
              "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro')",
          }}
        />
        {/* before any video loads: an AV1 file that fails to decode falls back to H.264 */}
        <script dangerouslySetInnerHTML={{ __html: AV1_FALLBACK_SCRIPT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-paper px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Chrome />
        <SmoothScroll />
        {children}
        <div className="grain" aria-hidden />
        {/* the entity every page refers to by @id */}
        <JsonLd graph={[website(), person()]} />
      </body>
    </html>
  );
}
