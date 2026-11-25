"use client";

import { motion, useReducedMotion } from "framer-motion";
import { profile } from "@/data/profile";
import { Icon } from "./Icon";

interface SocialLinksProps {
  className?: string;
  size?: "sm" | "md";
  tone?: "default" | "onDark";
}

export default function SocialLinks({
  className = "",
  size = "md",
  tone = "default",
}: SocialLinksProps) {
  const reduced = useReducedMotion();
  const onDark = tone === "onDark";
  const boxClass = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const linkClass = onDark
    ? "border-white/20 bg-white/10 text-blue-100 hover:border-white/50 hover:bg-white/20 hover:text-white hover:shadow-[0_10px_30px_-8px_rgba(255,255,255,0.45)]"
    : "border-zinc-300/70 bg-white/70 text-zinc-600 hover:border-blue-400 hover:text-blue-700 hover:shadow-[0_10px_30px_-8px_rgba(37,99,235,0.55)] dark:border-zinc-700/70 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:text-blue-300";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {profile.socials.map((social) => (
        <motion.a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          whileHover={reduced ? undefined : { y: -4 }}
          whileTap={reduced ? undefined : { scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className={`group relative inline-flex ${boxClass} items-center justify-center rounded-full border backdrop-blur-sm transition-colors ${linkClass}`}
        >
          <span
            aria-hidden
            className={`absolute inset-0 rounded-full blur-md transition-colors ${
              onDark ? "bg-white/0 group-hover:bg-white/15" : "bg-blue-500/0 group-hover:bg-blue-500/20"
            }`}
          />
          <Icon name={social.icon} className={`relative z-10 ${iconClass}`} />
        </motion.a>
      ))}
    </div>
  );
}
