"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { contactEmail, navLinks } from "@/data/profile";
import ThemeToggle from "./ThemeToggle";

const sectionIds = navLinks.map((link) => link.href.replace("#", ""));

const menuVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut" as const,
      when: "beforeChildren" as const,
      staggerChildren: 0.055,
    },
  },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18 } },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

function MagneticCTA({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 220, damping: 16 });
  const y = useSpring(pointerY, { stiffness: 220, damping: 16 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (reduced || event.pointerType === "touch") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((event.clientX - (rect.left + rect.width / 2)) * 0.18);
    pointerY.set((event.clientY - (rect.top + rect.height / 2)) * 0.28);
  };

  const reset = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={`mailto:${contactEmail}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={reduced ? undefined : { x, y }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 ${className}`}
    >
      <span className="relative z-10 whitespace-nowrap">Let&apos;s Talk</span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 animate-shimmer bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.45)_50%,transparent_65%)] bg-[length:250%_100%] opacity-70 motion-reduce:animate-none"
      />
    </motion.a>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const reduced = useReducedMotion();

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <nav
          aria-label="Primary"
          className="glass pointer-events-auto relative z-50 flex w-full max-w-3xl items-center justify-between gap-2 rounded-full px-3 py-2 shadow-lg shadow-blue-950/5 sm:px-4 dark:shadow-black/40"
        >
          <a
            href="#hero"
            className="group flex shrink-0 items-center gap-2 rounded-full px-1.5 py-1"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            </span>
            <span className="font-display text-sm font-bold text-zinc-900 transition-transform duration-300 group-hover:-translate-y-0.5 dark:text-zinc-100 sm:text-base">
              Faruq Arkaan
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeSection === id;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className="group relative rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-full bg-blue-100 ring-1 ring-blue-900/10 dark:bg-blue-500/20 dark:ring-blue-300/20"
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 36 }
                      }
                    />
                  )}
                  <span
                    className={`relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-0.5 ${
                      isActive ? "text-blue-900 dark:text-blue-200" : ""
                    }`}
                  >
                    {link.label}
                  </span>
                  <span className="absolute bottom-1 left-1/2 z-10 h-px w-0 -translate-x-1/2 bg-blue-700 transition-all duration-300 group-hover:w-5 dark:bg-blue-300" />
                </a>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <MagneticCTA className="hidden md:inline-flex" />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="nav-menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 md:hidden dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                {open ? (
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 17.25z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <>
              <motion.button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
                className="fixed inset-0 z-30 cursor-default bg-zinc-950/30 backdrop-blur-sm md:hidden"
              />

              <motion.div
                id="nav-menu"
                variants={menuVariants}
                initial={reduced ? false : "hidden"}
                animate="visible"
                exit={reduced ? undefined : "exit"}
                className="fixed inset-x-4 top-[5.25rem] z-40 md:hidden"
              >
                <div className="glass overflow-hidden rounded-3xl p-3 shadow-2xl shadow-blue-950/10 dark:shadow-black/50">
                  <div className="flex flex-col">
                    {navLinks.map((link) => {
                      const isActive = activeSection === link.href.replace("#", "");

                      return (
                        <motion.a
                          key={link.href}
                          href={link.href}
                          variants={menuItemVariants}
                          onClick={() => setOpen(false)}
                          className={`rounded-2xl px-4 py-3 text-base font-medium transition-colors ${
                            isActive
                              ? "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200"
                              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70"
                          }`}
                        >
                          {link.label}
                        </motion.a>
                      );
                    })}
                  </div>

                  <motion.div
                    variants={menuItemVariants}
                    className="mt-2 border-t border-zinc-200/80 pt-3 dark:border-zinc-700/70"
                  >
                    <a
                      href={`mailto:${contactEmail}`}
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center rounded-2xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                      Let&apos;s Talk
                    </a>
                    <p className="mt-2 break-all px-2 text-center font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {contactEmail}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
}
