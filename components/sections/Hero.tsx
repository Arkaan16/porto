"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { profile } from "@/data/profile";
import SocialLinks from "@/components/ui/SocialLinks";
import TiltCard from "@/components/ui/TiltCard";
import { Icon } from "@/components/ui/Icon";
import { usePerformanceMode } from "@/components/ui/usePerformanceMode";

/* Smooth "expo-out" curve used by every entrance. */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const roles = profile.role
  .split("|")
  .map((role) => role.trim())
  .filter(Boolean);

const floatingChips = [
  { label: "Laravel", position: "left-0 top-2 sm:-left-4", delay: "0s", duration: "6s" },
  { label: "Next.js", position: "-right-1 top-1/4 sm:-right-6", delay: "1.4s", duration: "7s" },
  { label: "Fullstack", position: "-left-2 bottom-1/4 sm:-left-7", delay: "2.6s", duration: "6.5s" },
  { label: "IT Support", position: "bottom-2 right-0 sm:-right-3", delay: "0.7s", duration: "7.5s" },
];

/* ------------------------------------------------------------------ */
/* Magnetic button                                                     */
/* ------------------------------------------------------------------ */

interface MagneticLinkProps {
  href: string;
  children: ReactNode;
  variant: "primary" | "secondary";
  icon: "arrow-right" | "download";
  download?: boolean;
  className?: string;
}

function MagneticLink({
  href,
  children,
  variant,
  icon,
  download,
  className = "",
}: MagneticLinkProps) {
  const reduced = useReducedMotion();
  const { lite } = usePerformanceMode();
  const ref = useRef<HTMLAnchorElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 220, damping: 22 });
  const y = useSpring(pointerY, { stiffness: 220, damping: 22 });
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef({ x: 0, y: 0 });

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const handlePointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (reduced || lite || event.pointerType === "touch") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    pendingRef.current = {
      x: (event.clientX - (rect.left + rect.width / 2)) * 0.18,
      y: (event.clientY - (rect.top + rect.height / 2)) * 0.3,
    };
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      pointerX.set(pendingRef.current.x);
      pointerY.set(pendingRef.current.y);
    });
  };

  const reset = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    pointerX.set(0);
    pointerY.set(0);
  };

  const isPrimary = variant === "primary";
  const shimmer = isPrimary
    ? "bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.45)_50%,transparent_65%)]"
    : "bg-[linear-gradient(110deg,transparent_35%,rgba(37,99,235,0.18)_50%,transparent_65%)]";

  return (
    <motion.a
      ref={ref}
      href={href}
      download={download}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={reduced || lite ? undefined : { x, y }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      className={`group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition-colors sm:w-auto ${
        isPrimary
          ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-800 dark:bg-blue-600 dark:shadow-blue-950/40 dark:hover:bg-blue-500"
          : "border border-zinc-300/80 bg-white/80 text-zinc-800 hover:bg-white dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
      } ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <Icon
        name={icon}
        className={`relative z-10 h-4 w-4 transition-transform duration-300 ${
          icon === "arrow-right" ? "group-hover:translate-x-1" : "group-hover:translate-y-0.5"
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 bg-[length:250%_100%] opacity-70 motion-reduce:animate-none ${lite ? "" : "animate-shimmer"} ${shimmer}`}
      />
    </motion.a>
  );
}

/* ------------------------------------------------------------------ */
/* Role rotator: isolated so its 2s timer never re-renders the Hero     */
/* ------------------------------------------------------------------ */

function RoleRotator({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || reduced || roles.length < 2) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % roles.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [active, reduced]);

  if (reduced) {
    return (
      <p className="text-base font-semibold text-zinc-800 dark:text-blue-200 sm:text-lg">
        {roles.join(" · ")}
      </p>
    );
  }

  return (
    <div className="flex h-7 items-center overflow-hidden sm:h-8">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={roles[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="text-base font-semibold text-zinc-800 dark:text-blue-200 sm:text-lg"
        >
          {roles[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export default function Hero() {
  const reduced = useReducedMotion();
  const { lite } = usePerformanceMode();
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { amount: 0.05 });
  const fullName = profile.name;
  const words = fullName.split(" ");
  const lastWordIndex = words.length - 1;

  const [splashReady, setSplashReady] = useState(false);

  /* Start the entrance the moment the splash is gone. */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => setSplashReady(true);
    const status = document.documentElement.dataset.splash;

    if (status === "skip" || status === "done") {
      timer = setTimeout(start, 0);
    } else {
      window.addEventListener("splash:done", start, { once: true });
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("splash:done", start);
    };
  }, []);

  /* ---- entrance choreography (transform + opacity only = GPU) ------ */
  const v = useMemo(() => {
    const fade = { duration: 0.2 };

    const column: Variants = {
      hidden: {},
      show: {
        transition: reduced
          ? { staggerChildren: 0.04 }
          : { staggerChildren: 0.09, delayChildren: 0.05 },
      },
    };

    const item: Variants = reduced
      ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: fade } }
      : {
          hidden: { opacity: 0, y: 24 },
          show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
        };

    const title: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: reduced ? 0 : 0.12 } },
    };

    const word: Variants = reduced
      ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: fade } }
      : {
          hidden: { y: "115%" },
          show: { y: "0%", transition: { duration: 0.85, ease: EASE } },
        };

    const avatar: Variants = reduced
      ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: fade } }
      : {
          hidden: { opacity: 0, scale: 0.86 },
          show: {
            opacity: 1,
            scale: 1,
            transition: { duration: 1, ease: EASE, delay: 0.1 },
          },
        };

    const chip: Variants = reduced
      ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: fade } }
      : {
          hidden: { opacity: 0, scale: 0.6 },
          show: (i: number) => ({
            opacity: 1,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 18,
              delay: 0.7 + i * 0.12,
            },
          }),
        };

    return { column, item, title, word, avatar, chip };
  }, [reduced]);

  /* ---- pointer parallax ------------------------------------------- */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 60, damping: 18 });
  const springY = useSpring(pointerY, { stiffness: 60, damping: 18 });

  const slowX = useTransform(springX, [-0.5, 0.5], [-14, 14]);
  const slowY = useTransform(springY, [-0.5, 0.5], [-10, 10]);
  const midX = useTransform(springX, [-0.5, 0.5], [-26, 26]);
  const midY = useTransform(springY, [-0.5, 0.5], [-18, 18]);
  const fastX = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const fastY = useTransform(springY, [-0.5, 0.5], [-28, 28]);
  const avatarX = useTransform(springX, [-0.5, 0.5], [-9, 9]);
  const avatarY = useTransform(springY, [-0.5, 0.5], [-7, 7]);
  const chipX = useTransform(springX, [-0.5, 0.5], [-11, 11]);
  const chipY = useTransform(springY, [-0.5, 0.5], [-9, 9]);

  const parallaxFrameRef = useRef<number | null>(null);
  const parallaxPendingRef = useRef({ x: 0, y: 0 });

  useEffect(
    () => () => {
      if (parallaxFrameRef.current !== null) {
        cancelAnimationFrame(parallaxFrameRef.current);
      }
    },
    [],
  );

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduced || lite || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    parallaxPendingRef.current = {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    };
    if (parallaxFrameRef.current !== null) return;
    parallaxFrameRef.current = requestAnimationFrame(() => {
      parallaxFrameRef.current = null;
      pointerX.set(parallaxPendingRef.current.x);
      pointerY.set(parallaxPendingRef.current.y);
    });
  };

  const resetParallax = () => {
    if (parallaxFrameRef.current !== null) {
      cancelAnimationFrame(parallaxFrameRef.current);
      parallaxFrameRef.current = null;
    }
    pointerX.set(0);
    pointerY.set(0);
  };

  const state = splashReady ? "show" : "hidden";

  return (
    <section
      id="hero"
      ref={heroRef}
      data-inview={heroInView ? "on" : "off"}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
      className="relative isolate flex min-h-screen items-center overflow-hidden px-4 pb-28 pt-28 sm:px-6 lg:pt-32"
    >
      {/* Background fades in with the content instead of popping in. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: splashReady ? 1 : 0 }}
        transition={{ duration: reduced ? 0.2 : 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-zinc-50 to-blue-100 dark:from-[#0f172a] dark:via-[#09090b] dark:to-[#1e3a8a]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.22),transparent_42%),radial-gradient(circle_at_82%_26%,rgba(30,64,175,0.18),transparent_48%),radial-gradient(circle_at_52%_88%,rgba(59,130,246,0.16),transparent_52%)] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.38),transparent_45%),radial-gradient(circle_at_82%_26%,rgba(37,99,235,0.28),transparent_50%),radial-gradient(circle_at_52%_88%,rgba(30,64,175,0.32),transparent_55%)]" />

        {/* Blobs use radial gradients (no blur filter): same look, far cheaper. */}
        {!lite && (
          <>
            <motion.div
              style={reduced ? undefined : { x: slowX, y: slowY }}
              className="absolute -left-24 -top-20"
            >
              <div
                className="h-72 w-72 animate-float rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.42),transparent_70%)] motion-reduce:animate-none sm:h-96 sm:w-96 dark:bg-[radial-gradient(circle,rgba(37,99,235,0.3),transparent_70%)]"
                style={{ animationDelay: "0s", animationDuration: "7s" }}
              />
            </motion.div>

            <motion.div
              style={reduced ? undefined : { x: midX, y: midY }}
              className="absolute -right-24 top-1/4"
            >
              <div
                className="h-80 w-80 animate-float rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.36),transparent_70%)] motion-reduce:animate-none dark:bg-[radial-gradient(circle,rgba(59,130,246,0.22),transparent_70%)]"
                style={{ animationDelay: "1.6s", animationDuration: "8s" }}
              />
            </motion.div>

            <motion.div
              style={reduced ? undefined : { x: fastX, y: fastY }}
              className="absolute -bottom-28 left-1/3"
            >
              <div
                className="h-80 w-80 animate-float rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.3),transparent_70%)] motion-reduce:animate-none sm:h-[26rem] sm:w-[26rem] dark:bg-[radial-gradient(circle,rgba(29,78,216,0.3),transparent_70%)]"
                style={{ animationDelay: "3s", animationDuration: "9s" }}
              />
            </motion.div>
          </>
        )}

        <div className="absolute inset-0 grid-bg opacity-70 dark:opacity-40" />
        {!lite && (
          <div className="absolute inset-0">
            <div className="noise h-full w-full" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#fafafa] dark:to-[#09090b]" />
      </motion.div>

      {/* One parent drives the whole choreography via variants. */}
      <motion.div
        initial="hidden"
        animate={state}
        className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8"
      >
        {/* ---------------- text column ---------------- */}
        <motion.div
          variants={v.column}
          className="order-2 text-center lg:order-1 lg:text-left"
        >
          <motion.div
            variants={v.item}
            className="flex flex-col items-center gap-2 lg:items-start"
          >
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-blue-700 dark:text-blue-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-60 motion-reduce:animate-none dark:bg-blue-400" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              </span>
              Open to opportunities
            </span>

            <RoleRotator active={splashReady && heroInView} />
          </motion.div>

          {/* Name: each word slides up out of a mask. No per-letter state, no re-renders. */}
          <motion.h1
            variants={v.title}
            aria-label={fullName}
            className="mt-3 text-4xl font-bold leading-[1.05] text-zinc-900 dark:text-white sm:text-5xl xl:text-6xl"
          >
            {words.map((w, i) => (
              <span key={`${w}-${i}`} aria-hidden>
                <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                  <motion.span
                    variants={v.word}
                    className={`inline-block will-change-transform ${
                      i === lastWordIndex ? "text-gradient" : ""
                    }`}
                  >
                    {w}
                  </motion.span>
                </span>
                {i < lastWordIndex ? " " : null}
              </span>
            ))}
          </motion.h1>

          <motion.p
            variants={v.item}
            className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base lg:mx-0"
          >
            {profile.tagline}
          </motion.p>

          <motion.div variants={v.item} className="mt-7">
            <SocialLinks className="justify-center lg:justify-start" />
          </motion.div>

          <motion.div
            variants={v.item}
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start"
          >
            <MagneticLink href="#projects" variant="primary" icon="arrow-right">
              View Projects
            </MagneticLink>
            {profile.resumeUrl && (
              <MagneticLink
                href={profile.resumeUrl}
                variant="secondary"
                icon="download"
                download
              >
                Download CV
              </MagneticLink>
            )}
          </motion.div>
        </motion.div>

        {/* ---------------- avatar column ---------------- */}
        <motion.div
          variants={v.avatar}
          style={reduced || lite ? undefined : { x: avatarX, y: avatarY }}
          className="order-1 relative mx-auto mt-2 h-60 w-60 will-change-transform sm:h-72 sm:w-72 lg:order-2 lg:mt-0 lg:h-[21rem] lg:w-[21rem]"
        >
          <div className="absolute -inset-12 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.3),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_70%)]" />
          {!lite && (
            <div className="absolute -inset-[10px] animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#1e3a8a,#2563eb,#bfdbfe,#1e40af,#1e3a8a)] motion-reduce:animate-none" />
          )}
          <div className="absolute -inset-[5px] rounded-full bg-[#fafafa] dark:bg-[#09090b]" />

          <div className="relative z-10 h-full w-full">
            <TiltCard
              outerClassName="h-full w-full"
              className="h-full w-full overflow-hidden rounded-full ring-1 ring-blue-900/10 dark:ring-blue-300/20"
            >
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                fill
                sizes="(max-width: 640px) 15rem, (max-width: 1024px) 18rem, 21rem"
                className="object-cover"
                quality={70}
                preload
              />
            </TiltCard>
          </div>

          {floatingChips.map((chip, i) => (
            <motion.div
              key={chip.label}
              custom={i}
              variants={v.chip}
              style={reduced || lite ? undefined : { x: chipX, y: chipY }}
              className={`absolute z-20 ${chip.position}`}
            >
              <div
                className="animate-float rounded-full border border-blue-200/80 bg-white/85 px-3 py-1.5 font-mono text-[10px] font-medium text-blue-800 shadow-sm shadow-blue-900/5 motion-reduce:animate-none sm:text-xs dark:border-blue-400/20 dark:bg-zinc-900/80 dark:text-blue-200"
                style={{ animationDelay: chip.delay, animationDuration: chip.duration }}
              >
                {chip.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll cue appears last, after everything has settled. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: splashReady ? 1 : 0 }}
        transition={{ duration: 0.6, delay: reduced ? 0 : 1.6, ease: "easeOut" }}
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
          Scroll
        </span>
        <div className="flex h-8 w-5 items-start justify-center rounded-full border border-zinc-400/70 pt-1.5 dark:border-zinc-500/60">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-blue-700 dark:bg-blue-300"
            animate={
              !splashReady || !heroInView || reduced
                ? undefined
                : { y: [0, 9, 0], opacity: [1, 0.35, 1] }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}