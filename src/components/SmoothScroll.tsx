"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLenis, reducedMotion, scrollSync, setLenis } from "@/lib/motion";

/**
 * Wheel smoothing for fine pointers. Touch scrolling stays native — momentum
 * on a phone is already right, and fighting it is what makes sites feel broken.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (reducedMotion()) return;
    // Lenis runs its own frame loop; ScrollTrigger, where a page loads it,
    // follows its scroll events (lib/motion.ts scrollSync)
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: -72 } });
    setLenis(lenis);
    return () => {
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Next owns the scroll position across navigations; stop any in-flight
  // smooth scroll and adopt wherever the router put the page.
  useEffect(() => {
    // stop() + start() is the public way to reset Lenis' internal position
    const l = getLenis();
    l?.stop();
    l?.start();
    const id = requestAnimationFrame(() => scrollSync.refresh?.());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
