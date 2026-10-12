/**
 * Media URLs. Every file under public/media, /work and /og carries a content
 * hash (?v=…, from scripts/media-manifest.mjs), so the edge and the browser can
 * cache it for a year and still pick up a new export the moment it changes.
 *
 * Shared by server and client components — keep this file free of "use client".
 */
import manifest from "./media-manifest.json";

type Entry = { v: string; type?: string; w?: number; h?: number; duration?: number; size?: number };
const files = manifest as Record<string, Entry>;

/** A public file's URL with its content hash. */
export const asset = (path: string) => (files[path] ? `${path}?v=${files[path].v}` : path);

/** Width descriptors for srcSet: [[path, width], …]. */
export const srcSet = (list: [string, number][]) => list.map(([p, w]) => `${asset(p)} ${w}w`).join(", ");

export type Source = { src: string; type: string; w?: number; h?: number; bitrate?: number };

/**
 * Every encode of one video, best first: AV1 (about half the bytes at a higher
 * VMAF) for browsers that can decode it, H.264 for everyone else. `base` is the
 * path without extension, e.g. "/media/reels/copilot-day-1/full".
 */
export function sources(base: string): Source[] {
  return [`${base}.av1.mp4`, `${base}.mp4`].flatMap((p) => {
    const f = files[p];
    if (!f) return [];
    const bitrate = f.size && f.duration ? Math.round((f.size * 8) / f.duration) : undefined;
    return [{ src: asset(p), type: f.type ?? "video/mp4", w: f.w, h: f.h, bitrate }];
  });
}

/** The universally playable encode — what crawlers and structured data get. */
export const h264 = (base: string) => asset(`${base}.mp4`);

/** Measured facts about a file, for structured data. */
export const info = (path: string): Entry | undefined => files[path];

/** For a video whose src is set from script: the first encode this browser can play. */
export function pick(video: HTMLVideoElement, list: Source[]) {
  return list.find((s) => video.canPlayType(s.type) === "probably") ?? list.find((s) => video.canPlayType(s.type)) ?? list[list.length - 1];
}

/**
 * Like pick(), but asks MediaCapabilities whether each encode decodes smoothly
 * and power-efficiently at its real size and bitrate — so a phone without an
 * AV1 decoder block gets the H.264 file instead of burning battery on software
 * decode. Falls back to pick() where the API is missing.
 */
export async function pickSmooth(video: HTMLVideoElement, list: Source[], fps = 30, skipAv1 = false): Promise<Source> {
  if (skipAv1) list = list.filter((s) => !s.src.includes(".av1.mp4"));
  const mc = typeof navigator !== "undefined" ? navigator.mediaCapabilities : undefined;
  if (!mc?.decodingInfo) return pick(video, list);
  for (const s of list.slice(0, -1)) {
    if (!video.canPlayType(s.type) || !s.w || !s.h || !s.bitrate) continue;
    try {
      const r = await mc.decodingInfo({
        type: "file",
        video: { contentType: s.type.replace(/,\s*(opus|mp4a[^"]*)/, ""), width: s.w, height: s.h, bitrate: s.bitrate, framerate: fps },
      });
      if (r.supported && r.smooth && r.powerEfficient) return s;
    } catch {}
  }
  return list[list.length - 1];
}

export const reelMedia = (slug: string) => {
  const dir = `/media/reels/${slug}`;
  return {
    full: `${dir}/full`,
    preview: `${dir}/preview`,
    poster: asset(`${dir}/poster.webp`),
    posterSm: asset(`${dir}/poster-sm.webp`),
    posterSet: srcSet([
      [`${dir}/poster-sm.webp`, 360],
      [`${dir}/poster.webp`, 720],
    ]),
  };
};
