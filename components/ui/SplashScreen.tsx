"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
const nameLetters = Array.from(profile.name);
const roleLabel = profile.role
  .split("|")
  .map((role) => role.trim())
  .filter(Boolean)
  .join(" • ");

type Phase = "intro" | "exit" | "done";

export default function SplashScreen() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("intro");
  const [progress, setProgress] = useState(0);
  const [atNinety, setAtNinety] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const skipRef = useRef(false);
  const finishedRef = useRef(false);
  const ninetyRef = useRef(false);
  const hundredRef = useRef(false);

  const finish = useCallback((preserveSkip = false) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const root = document.documentElement;
    if (!preserveSkip && root.dataset.splash !== "skip") {
      root.dataset.splash = "done";
    }

    window.dispatchEvent(new CustomEvent("splash:done"));
    setPhase("done");
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
      const timer = setTimeout(() => finish(true), 0);
      return () => clearTimeout(timer);
    }

    root.dataset.splash = "loading";
    try {
      sessionStorage.setItem(SPLASH_FLAG, "1");
    } catch {}

    if (reduced) return;

    const timer = setTimeout(() => setShowSkip(true), 800);
    return () => clearTimeout(timer);
  }, [finish, reduced]);

  useEffect(() => {
    if (skipRef.current || phase === "done") return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  useEffect(() => {
    if (skipRef.current || reduced) return;

    if (document.readyState === "complete") {
      const timer = setTimeout(() => setPageLoaded(true), 0);
      return () => clearTimeout(timer);
    }

    const onLoad = () => setPageLoaded(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, [reduced]);

  useEffect(() => {
    if (skipRef.current || reduced || phase !== "intro" || ninetyRef.current) return;
    ninetyRef.current = true;

    const controls = animate(0, 90, {
      duration: 1.35,
      ease: "easeInOut",
      onUpdate: (value) => setProgress(Math.round(value)),
      onComplete: () => setAtNinety(true),
    });

    return () => controls.stop();
  }, [phase, reduced]);

  useEffect(() => {
    if (
      skipRef.current ||
      reduced ||
      phase !== "intro" ||
      !atNinety ||
      !pageLoaded ||
      hundredRef.current
    ) {
      return;
    }
    hundredRef.current = true;

    const controls = animate(90, 100, {
      duration: 0.35,
      ease: "easeOut",
      onUpdate: (value) => setProgress(Math.round(value)),
      onComplete: () => setPhase("exit"),
    });

    return () => controls.stop();
  }, [atNinety, pageLoaded, phase, reduced]);

  useEffect(() => {
    if (skipRef.current || !reduced || phase !== "intro") return;

    const timer = setTimeout(() => setPhase("exit"), 450);
    return () => clearTimeout(timer);
  }, [phase, reduced]);

  const handleSkip = () => {
    if (finishedRef.current) return;
    setPhase("exit");
  };

  const instantExit = { opacity: 0, transition: { duration: 0 } };
  const overlayVariants: Variants = {
    visible: { opacity: 1, transition: { duration: reduced ? 0.25 : 0.12 } },
    exit: reduced
      ? { opacity: 0, transition: { duration: 0.15 } }
      : {
          y: "-102%",
          borderBottomLeftRadius: "46% 96px",
          borderBottomRightRadius: "46% 96px",
          transition: { duration: 0.62, ease: "easeInOut", delay: 0.18 },
        },
  };

  return (
    <AnimatePresence onExitComplete={() => finish()}>
      {phase === "intro" && (
        <motion.div
          id="splash"
          role="status"
          aria-live="polite"
          variants={overlayVariants}
          initial="visible"
          animate="visible"
          exit={skipRef.current && finishedRef.current ? instantExit : "exit"}
          className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#2563eb] bg-[length:200%_200%] text-white animate-gradient-shift motion-reduce:animate-none"
        >
          <span className="sr-only">Loading portfolio</span>

          {!reduced && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute -left-24 top-1/5 h-72 w-72 animate-float rounded-full bg-blue-400/30 blur-3xl"
                style={{ animationDelay: "0s", animationDuration: "5.5s" }}
              />
              <div
                className="absolute -right-20 top-1/3 h-80 w-80 animate-float rounded-full bg-blue-300/20 blur-3xl"
                style={{ animationDelay: "1.4s", animationDuration: "6.5s" }}
              />
              <div
                className="absolute -bottom-28 left-1/3 h-96 w-96 animate-float rounded-full bg-blue-600/30 blur-3xl"
                style={{ animationDelay: "2.4s", animationDuration: "7.5s" }}
              />
            </div>
          )}

          <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="noise h-full w-full opacity-70" />
          </div>

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
            <motion.div
              aria-hidden
              variants={{
                hidden: reduced
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92, y: 12, filter: "blur(10px)" },
                visible: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: reduced
                    ? { duration: 0 }
                    : { delay: 0.12, duration: 0.6, ease: "easeOut" },
                },
                exit: {
                  opacity: 0,
                  scale: 0.82,
                  transition: { duration: reduced ? 0.15 : 0.26, ease: "easeIn" },
                },
              }}
              className="relative flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48"
            >
              <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
                <defs>
                  <linearGradient id="splash-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#bfdbfe" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="url(#splash-ring-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  initial={reduced ? false : { strokeDashoffset: 1 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: reduced ? 0 : 1.05, ease: "easeInOut" }}
                />
              </svg>
              <span className="font-display text-6xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(147,197,253,0.55)] sm:text-7xl">
                {initials}
              </span>
            </motion.div>

            <p className="mt-8 flex flex-wrap justify-center font-display text-lg font-semibold tracking-tight sm:text-xl">
              {nameLetters.map((letter, index) => (
                <motion.span
                  key={`${letter}-${index}`}
                  aria-hidden
                  className="inline-block whitespace-pre"
                  variants={{
                    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: reduced
                        ? { duration: 0 }
                        : { delay: 0.42 + index * 0.035, duration: 0.36 },
                    },
                    exit: { opacity: 0, transition: { duration: reduced ? 0.15 : 0.2 } },
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </p>

            <motion.p
              aria-hidden
              variants={{
                hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 6 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: reduced ? { duration: 0 } : { delay: 0.95, duration: 0.4 },
                },
                exit: { opacity: 0, transition: { duration: reduced ? 0.15 : 0.2 } },
              }}
              className="mt-3 text-center font-mono text-[11px] tracking-[0.14em] text-blue-100/85"
            >
              {roleLabel}
            </motion.p>
          </div>

          {!reduced && (
            <div className="absolute bottom-7 right-6 z-20 font-mono text-xs tabular-nums text-blue-100/90">
              {String(progress).padStart(3, "0")}
            </div>
          )}

          <AnimatePresence>
            {showSkip && phase === "intro" && !reduced && (
              <motion.button
                type="button"
                onClick={handleSkip}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-14 right-6 z-30 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                Skip
              </motion.button>
            )}
          </AnimatePresence>

          {!reduced && (
            <div aria-hidden className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/10">
              <motion.div
                style={{ scaleX: progress / 100 }}
                className="h-full w-full origin-left bg-gradient-to-r from-blue-300 via-blue-400 to-blue-600"
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
