"use client";

import { useSyncExternalStore } from "react";
import type { Grade } from "./content";

/**
 * The page-wide grade. It lives on <html data-grade> so plain CSS can follow
 * it; this module only keeps React components that need the value in step.
 */
const listeners = new Set<() => void>();

const read = (): Grade => {
  if (typeof document === "undefined") return "neutral";
  const g = document.documentElement.dataset.grade;
  return g === "edit" || g === "code" ? g : "neutral";
};

export function setGrade(g: Grade) {
  if (typeof document === "undefined") return;
  if (document.documentElement.dataset.grade === g) return;
  document.documentElement.dataset.grade = g;
  listeners.forEach((l) => l());
}

export function useGrade(): Grade {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "neutral",
  );
}
