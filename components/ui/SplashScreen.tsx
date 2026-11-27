"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
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
  .join("  ·  ");

/* Timeline ----------------------------------------------------------- */
const MIN_MS = 1700; // counter runs 000 -> 100 over this long
const MIN_S = MIN_MS / 1000;
const MAX_WAIT_MS = 3500; // never wait longer than this for the page to load
const EXIT_S = 0.95; // curtain lift
const HERO_START_MS = 380; // when the Hero entrance starts, while the curtain is still lifting

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.76, 0, 0.24, 1];
const EASE_COUNT: [number, number, number, number] = [0.65, 0, 0.35, 1];

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const pageLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") {
      resolve();
      return;
    }
    window.addEventListener("load", () => resolve(), { once: true });
  });

const fontsReady = () =>
  document.fonts?.ready ? document.fonts.ready.then(() => undefined) : Promise.resolve();

export default function SplashScreen() {
  const reduced = useReducedMotion() ?? false;
  const [show, setShow] = useState(true);
  const [skipped, setSkipped] = useState(false);

  const exitedRef = useRef(false);
  const countRef = useRef<HTMLSpanElement>(null);

  /* Decide skip / run, then exit when (min time elapsed AND page ready). */
  useEffect(() => {
    const root = document.documentElement;
    let seen = root.dataset.splash === "skip";

    if (!seen) {
      try {
        seen = sessionStorage.getItem(SPLASH_FLAG) === "1";
      } catch {}
    }

    if (seen) {
      setSkipped(true);
      window.dispatchEvent(new CustomEvent("splash:done"));
      return;
    }

    root.dataset.splash = "loading";
    let cancelled = false;

    const exit = () => {
      if (cancelled || exitedRef.current) return;
      exitedRef.current = true;

      try {
        sessionStorage.setItem(SPLASH_FLAG, "1");
      } catch {}

      // Reveal the page right away: the curtain still covers it, and the Hero
      // entrance then plays underneath while the curtain lifts.
      root.dataset.splash = "done";
      setShow(false);

      setTimeout(
        () => window.dispatchEvent(new CustomEvent("splash:done")),
        reduced ? 0 : HERO_START_MS,
      );
    };

    const minWait = wait(reduced ? 250 : MIN_MS);
    const ready = Promise.race([
      Promise.all([pageLoaded(), fontsReady()]),
      wait(MAX_WAIT_MS),
    ]);

    Promise.all([minWait, ready]).then(() => {
      if (!cancelled) setTimeout(exit, reduced ? 0 : 120);
    });

    return () => {
      cancelled = true;
    };
  }, [reduced]);

  /* Counter: written straight to the DOM, so it never re-renders React. */
  useEffect(() => {
    if (skipped) return;

    const node = countRef.current;
    if (!node) return;

    if (reduced) {
      node.textContent = "100";
      return;
    }

    const controls = animate(0, 100, {
      duration: MIN_S,
      ease: EASE_COUNT,
      onUpdate: (value) => {
        node.textContent = String(Math.round(value)).padStart(3, "0");
      },
    });

    return () => controls.stop();
  }, [reduced, skipped]);

  const v = useMemo(() => {
    const panel: Variants = reduced
      ? {
          hidden: { opacity: 1 },
          show: { opacity: 1 },
          exit: { opacity: 0, transition: { duration: 0.2 } },
        }
      : {
          hidden: { y: 0 },
          show: { y: 0 },
          // -115% so the curved lip below the panel also leaves the screen.
          exit: { y: "-115%", transition: { duration: EXIT_S, ease: EASE_IN_OUT } },
        };

    const group: Variants = {
      hidden: {},
      show: {
        transition: { staggerChildren: reduced ? 0 : 0.09, delayChildren: 0.1 },
      },
      exit: reduced
        ? {}
        : { opacity: 0, y: -28, transition: { duration: 0.4, ease: "easeIn" } },
    };

    const rise: Variants = reduced
      ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.15 } } }
      : {
          hidden: { opacity: 0, y: 18 },
          show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
        };

    const word: Variants = reduced
      ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.15 } } }
      : {
          hidden: { y: "115%" },
          show: { y: "0%", transition: { duration: 0.85, ease: EASE_OUT } },
        };

    return { panel, group, rise, word };
  }, [reduced]);

  if (skipped) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="splash"
          role="status"
          aria-live="polite"
          variants={v.panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background text-foreground will-change-transform"
        >
          <span className="sr-only">Loading portfolio</span>

          {/* Curved lip: gives the curtain a soft edge as it lifts. */}
          {!reduced && (
            <div
              aria-hidden
              className="absolute inset-x-0 top-full h-[10vh] rounded-b-[50%] bg-background"
            />
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.16),transparent_60%)]"
          />

          {/* Centre: ring + monogram, name, role */}
          <motion.div
            variants={v.group}
            className="relative flex flex-col items-center px-6 text-center"
          >
            <motion.div variants={v.rise} className="relative h-24 w-24 sm:h-28 sm:w-28">
              <svg
                viewBox="0 0 100 100"
                aria-hidden
                className="absolute inset-0 h-full w-full -rotate-90 text-blue-600 dark:text-blue-400"
                fill="none"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="currentColor"
                  strokeOpacity="0.14"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : MIN_S, ease: EASE_COUNT }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {initials}
              </span>
            </motion.div>

            <h1 className="mt-7 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {nameParts.map((part, index) => (
                <span key={`${part}-${index}`}>
                  <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                    <motion.span variants={v.word} className="inline-block will-change-transform">
                      {part}
                    </motion.span>
                  </span>
                  {index < nameParts.length - 1 ? " " : null}
                </span>
              ))}
            </h1>

            <motion.p
              variants={v.rise}
              className="mt-2 max-w-xs font-mono text-[11px] tracking-[0.12em] text-zinc-500 dark:text-zinc-400 sm:max-w-none"
            >
              {roleLabel}
            </motion.p>
          </motion.div>

          {/* Bottom: label, live counter, progress line */}
          <motion.div
            variants={v.rise}
            aria-hidden
            className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-7 sm:px-10 sm:pb-9"
          >
            <span className="font-mono text-[11px] tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
              Portfolio
            </span>
            <span className="font-display text-5xl font-semibold leading-none tabular-nums sm:text-7xl">
              <span ref={countRef}>000</span>
              <span className="ml-1 align-top text-base font-medium text-zinc-400 dark:text-zinc-500 sm:text-xl">
                %
              </span>
            </span>
          </motion.div>

          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[3px] bg-zinc-200/70 dark:bg-zinc-800/70"
          >
            <motion.div
              initial={{ scaleX: reduced ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduced ? 0 : MIN_S, ease: EASE_COUNT }}
              className="h-full w-full origin-left bg-gradient-to-r from-blue-500 to-blue-700 will-change-transform dark:from-blue-400 dark:to-blue-600"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}