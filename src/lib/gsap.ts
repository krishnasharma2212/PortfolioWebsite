"use client";

import { gsap } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { scrollSync } from "./motion";

export { gsap };

let loading: Promise<typeof ScrollTriggerType> | null = null;

/** ScrollTrigger, loaded by the component that pins (and only then), synced to Lenis from then on. */
export function loadScrollTrigger() {
  loading ??= import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
    gsap.registerPlugin(ScrollTrigger);
    scrollSync.update = ScrollTrigger.update;
    scrollSync.refresh = () => ScrollTrigger.refresh();
    return ScrollTrigger;
  });
  return loading;
}
