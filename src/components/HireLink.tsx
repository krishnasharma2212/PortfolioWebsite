"use client";

import type { CSSProperties, ReactNode } from "react";
import { HIRE_EVENT } from "./Contact";
import { scrollToTarget } from "@/lib/motion";
import { play } from "@/lib/sfx";

/** Jumps to the contact block with a choice already made. */
export default function HireLink({
  choice,
  className,
  style,
  children,
}: {
  choice: "edit" | "code" | "both";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <a
      href={`/?hire=${choice}#contact`}
      className={className}
      style={style}
      onClick={(e) => {
        if (!document.getElementById("contact")) return; // other pages: follow the link
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(HIRE_EVENT, { detail: choice }));
        play("select");
        scrollToTarget("#contact", -20);
      }}
    >
      {children}
    </a>
  );
}
