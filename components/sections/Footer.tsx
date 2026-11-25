"use client";

import { motion, useReducedMotion } from "framer-motion";
import { profile } from "@/data/profile";
import { Icon } from "@/components/ui/Icon";
import SocialLinks from "@/components/ui/SocialLinks";

export default function Footer() {
  const reduced = useReducedMotion();

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer className="relative isolate overflow-hidden border-t border-blue-800/60 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 px-4 py-10 text-blue-100">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 blue-dots opacity-20" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-white">{profile.name}</p>
          <p className="mt-1 text-sm text-blue-200">
            &copy; {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end sm:gap-4">
          <SocialLinks size="sm" tone="onDark" />
          <span aria-hidden className="text-sm text-white/25">|</span>
          <motion.button
            type="button"
            onClick={backToTop}
            whileHover={reduced ? undefined : { y: -3 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Back to top
            <motion.span
              aria-hidden
              animate={reduced ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
              className="inline-flex"
            >
              <Icon name="arrow-up" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </motion.span>
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
