import type { Reel } from "./content";

/** Shared by server and client components — keep this file free of "use client". */
export const reelSeconds = (r: Reel) => r.frames / r.fps;

/** m:ss */
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
