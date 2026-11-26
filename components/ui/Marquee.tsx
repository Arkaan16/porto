import type { CSSProperties, ReactNode } from "react";

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
  const style = { "--marquee-duration": `${speed}s` } as CSSProperties;
  const rowClassName = "flex shrink-0 items-center gap-8 whitespace-nowrap pr-8";

  return (
    <div
      className={`group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] ${className}`}
      style={style}
    >
      <div
        className={`flex w-max flex-nowrap animate-marquee motion-reduce:animate-none ${
          direction === "right" ? "[animation-direction:reverse]" : ""
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
      >
        <div className={rowClassName}>{children}</div>
        <div className={rowClassName} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
