"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePerformanceMode } from "./usePerformanceMode";

interface MarqueeProps {
  children: ReactNode;
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export default function Marquee({
  children,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  className = "",
}: MarqueeProps) {
  const { lite } = usePerformanceMode();
  const style = { "--marquee-duration": `${speed}s` } as CSSProperties;

  if (lite) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] ${className}`}
      style={style}
    >
      <div
        className={`flex w-max animate-marquee motion-reduce:animate-none ${
          direction === "right" ? "[animation-direction:reverse]" : ""
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
      >
        <div className="flex shrink-0 items-center gap-8 pr-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
