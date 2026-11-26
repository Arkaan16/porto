"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { profile } from "@/data/profile";

const SPLASH_FLAG = "porto:splash-seen";

const nameParts = profile.name.trim().split(/\s+/).filter(Boolean);
const initials = (nameParts.length > 1 ? nameParts.slice(-2) : nameParts)
  .map((part) => part[0] ?? "")
  .join("")
  .toUpperCase();
const roleLabel = profile.role
  .split("|")
  .map((role) => role.trim())
  .filter(Boolean)
  .join(" • ");

const HOLD_MS = 2200;
const HOLD_S = HOLD_MS / 1000;
const FADE_IN_S = 0.4;
const FADE_OUT_S = 0.45;

export default function SplashScreen() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(true);

  const finishedRef = useRef(false);
  const skipRef = useRef(false);

  const finish = useCallback((preserveSkip = false) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const root = document.documentElement;
    if (!preserveSkip && root.dataset.splash !== "skip") {
      root.dataset.splash = "done";
    }

    window.dispatchEvent(new CustomEvent("splash:done"));
    setShow(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let alreadySeen = root.dataset.splash === "skip";

    if (!alreadySeen) {
      try {
        alreadySeen = sessionStorage.getItem(SPLASH_FLAG) === "1";
      } catch {}
    }

    if (alreadySeen) {
      skipRef.current = true;
      finish(true);
      return;
    }

    root.dataset.splash = "loading";
    try {
      sessionStorage.setItem(SPLASH_FLAG, "1");
    } catch {}

    const timer = setTimeout(() => setShow(false), reduced ? 250 : HOLD_MS);
    return () => clearTimeout(timer);
  }, [finish, reduced]);

  useEffect(() => {
    if (!show || skipRef.current) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [show]);

  return (
    <AnimatePresence onExitComplete={() => finish()}>
      {show && (
        <motion.div
          id="splash"
          role="status"
          aria-live="polite"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: reduced ? 0 : FADE_OUT_S, ease: "easeIn" },
          }}
          transition={{
            duration: reduced ? 0 : FADE_IN_S,
            ease: "easeOut",
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background text-foreground"
        >
          <span className="sr-only">Loading portfolio</span>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.16),transparent_60%)]"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduced ? 0 : 0.5,
              delay: reduced ? 0 : 0.1,
              ease: "easeOut",
            }}
            className="relative flex flex-col items-center px-6"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900 text-2xl font-bold text-white shadow-lg shadow-blue-900/20 sm:h-20 sm:w-20 sm:text-3xl dark:bg-blue-600">
              {initials}
            </div>

            <p className="mt-6 font-display text-xl font-semibold tracking-tight sm:text-2xl">
              {profile.name}
            </p>

            <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              {roleLabel}
            </p>

            <div className="mt-7 h-1 w-40 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <motion.div
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: reduced ? 0 : HOLD_S,
                  ease: "easeInOut",
                }}
                className="h-full w-full origin-left rounded-full bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
