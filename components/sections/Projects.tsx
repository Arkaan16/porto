"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
  type TouchEvent as ReactTouchEvent,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { designProjects, projects } from "@/data/profile";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { useInViewPause } from "@/components/ui/useInView";
import { usePerformanceMode } from "@/components/ui/usePerformanceMode";

type TabKey = "web" | "design";
type Project = (typeof projects)[number];
type ActionIconName = "arrow" | "code" | "close" | "left" | "right" | "expand";

const tabs: { key: TabKey; label: string }[] = [
  { key: "web", label: "Web" },
  { key: "design", label: "Design" },
];

const panelVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const actionIconPaths: Record<ActionIconName, ReactNode> = {
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  code: (
    <>
      <path d="m9 8-4 4 4 4" />
      <path d="m15 8 4 4-4 4" />
    </>
  ),
  close: (
    <>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </>
  ),
  left: <path d="m15 6-6 6 6 6" />,
  right: <path d="m9 6 6 6-6 6" />,
  expand: (
    <>
      <path d="M9 4H4v5" />
      <path d="m4 4 6 6" />
      <path d="M15 20h5v-5" />
      <path d="m20 20-6-6" />
    </>
  ),
};

const designRevealVariants = [
  "fade-up",
  "zoom",
  "blur-in",
  "fade-right",
] as const;

function ActionIcon({
  name,
  className = "",
}: {
  name: ActionIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-4 w-4 ${className}`}
    >
      {actionIconPaths[name]}
    </svg>
  );
}

function getFocusable(container: HTMLElement | null) {
  if (!container) return [] as HTMLElement[];

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function useDialogBehavior<T extends HTMLElement>(
  open: boolean,
  dialogRef: RefObject<T | null>,
  triggerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  onPrev?: () => void,
  onNext?: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const focusables = getFocusable(dialog);
    (focusables[0] ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const items = getFocusable(dialog);

        if (!items.length) {
          event.preventDefault();
          dialog?.focus();
          return;
        }

        const first = items[0];
        const last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }

        return;
      }

      if (event.key === "ArrowLeft" && onPrev) {
        event.preventDefault();
        onPrev();
      }

      if (event.key === "ArrowRight" && onNext) {
        event.preventDefault();
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [open, dialogRef, triggerRef, onClose, onPrev, onNext]);
}

function WebProjectCard({
  project,
  index,
  onDetail,
}: {
  project: Project;
  index: number;
  onDetail: (project: Project, trigger: HTMLButtonElement) => void;
}) {
  const number = String(index + 1).padStart(2, "0");
  const reduced = useReducedMotion();

  return (
    <Reveal
      variant="fade-up"
      delay={Math.min(index * 0.08, 0.32)}
      className="h-full"
    >
      <motion.article
        whileHover={reduced ? undefined : { y: -8 }}
        whileTap={reduced ? undefined : { scale: 0.99 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="group/card relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-zinc-200/80 bg-zinc-900 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)] transition-[box-shadow,border-color] duration-500 hover:border-blue-400/50 hover:shadow-[0_40px_80px_-36px_rgba(37,99,235,0.6)] dark:border-zinc-700/60 dark:hover:border-blue-400/30"
      >
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={70}
          loading="lazy"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover/card:scale-[1.08]"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/5"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_32%,rgba(255,255,255,0.16)_50%,transparent_68%)] transition-transform duration-[1100ms] ease-out group-hover/card:translate-x-full"
        />

        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-5">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {number}
          </span>
          <button
            type="button"
            onClick={(event) => onDetail(project, event.currentTarget)}
            aria-label={`View ${project.title} details`}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-300 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 group-hover/card:-rotate-45 group-hover/card:border-blue-300/60 group-hover/card:bg-blue-600"
          >
            <ActionIcon name="arrow" className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-[9px] font-medium text-white/85 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="mt-3 font-display text-lg font-bold leading-tight text-white sm:text-xl">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-300/85">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(event) => onDetail(project, event.currentTarget)}
              className="group/detail inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <span>Detail</span>
              <ActionIcon
                name="arrow"
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover/detail:translate-x-1"
              />
            </button>
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/source inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <span>Source</span>
                <ActionIcon
                  name="code"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover/source:-translate-y-0.5 group-hover/source:translate-x-0.5"
                />
              </a>
            )}
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

function ProjectDialog({
  project,
  titleId,
  dialogRef,
  onClose,
}: {
  project: Project;
  titleId: string;
  dialogRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-zinc-950/70 p-4 backdrop-blur-md sm:p-6"
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 18 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        className="glass-blur relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-200/80 shadow-2xl outline-none dark:border-zinc-700/70"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-zinc-950/60 text-white transition-colors hover:bg-zinc-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <ActionIcon name="close" className="h-4 w-4" />
        </button>

        <div className="relative h-56 bg-zinc-900 sm:h-72">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 48rem"
            quality={70}
            className="object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent"
          />
        </div>

        <div className="p-6 sm:p-8">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
            Project detail
          </p>
          <h3
            id={titleId}
            className="mt-2 font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl"
          >
            {project.title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
            {project.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 font-mono text-[10px] font-medium text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              className="group/detail inline-flex items-center gap-2 rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              <span>Close</span>
              <ActionIcon
                name="arrow"
                className="h-4 w-4 transition-transform duration-300 group-hover/detail:translate-x-1"
              />
            </button>
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/source inline-flex items-center gap-2 rounded-full border border-zinc-300/80 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <span>Source code</span>
                <ActionIcon
                  name="code"
                  className="h-4 w-4 transition-transform duration-300 group-hover/source:-translate-y-0.5 group-hover/source:translate-x-0.5"
                />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DesignGallery({
  onOpen,
}: {
  onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
  return (
    <div className="columns-2 gap-3 lg:columns-3 lg:gap-5 xl:columns-4">
      {designProjects.map((item, index) => (
        <Reveal
          key={item.id}
          variant={designRevealVariants[index % designRevealVariants.length]}
          delay={(index % 4) * 0.06}
          className="mb-3 break-inside-avoid lg:mb-5"
        >
          <button
            type="button"
            onClick={(event) => onOpen(index, event.currentTarget)}
            aria-label={`Open ${item.title}`}
            className="group relative block w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-200/60 text-left shadow-sm transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700/70 dark:bg-zinc-800/60"
          >
            <motion.div
              layoutId={`design-image-${item.id}`}
              className="relative w-full overflow-hidden rounded-2xl"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={item.width}
                height={item.height}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={70}
              loading="lazy"
              className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
            </motion.div>
          </button>
        </Reveal>
      ))}
    </div>
  );
}

function DesignLightbox({
  index,
  dialogRef,
  onClose,
  onPrev,
  onNext,
}: {
  index: number | null;
  dialogRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const touchStartX = useRef(0);
  const activeIndex = index ?? 0;
  const item = index === null ? null : designProjects[index];

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = endX - touchStartX.current;

    if (Math.abs(delta) < 50) return;

    if (delta > 0) {
      onPrev();
    } else {
      onNext();
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Design preview: ${item.title}`}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/90 p-4 outline-none backdrop-blur-md sm:p-8"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-6"
          >
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(designProjects.length).padStart(2, "0")} · {item.title}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close design preview"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <ActionIcon name="close" className="h-4 w-4" />
            </button>
          </div>

          <motion.div
            layoutId={`design-image-${item.id}`}
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 30 }
            }
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl"
          >
            <Image
              src={item.image}
              alt={item.title}
              width={item.width}
              height={item.height}
              sizes="(max-width: 768px) 100vw, 90vw"
              quality={70}
              loading="eager"
              className="mx-auto h-auto max-h-[76vh] w-full object-contain"
            />
          </motion.div>

          <div
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 p-4 sm:p-6"
          >
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous design"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <ActionIcon name="left" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next design"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <ActionIcon name="right" className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProjectsLoader({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[16rem] flex-col items-center justify-center gap-4 pt-10 sm:min-h-[20rem]"
    >
      <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600 motion-reduce:animate-none dark:border-blue-500/25 dark:border-t-blue-400" />
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
    </div>
  );
}

export default function Projects() {
  const reduced = useReducedMotion();
  const { lite } = usePerformanceMode();
  const sectionRef = useInViewPause<HTMLElement>();
  const detailTitleId = useId();
  const detailDialogRef = useRef<HTMLDivElement>(null);
  const lightboxDialogRef = useRef<HTMLDivElement>(null);
  const detailTriggerRef = useRef<HTMLElement | null>(null);
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (loadingTimerRef.current !== null) {
        clearTimeout(loadingTimerRef.current);
      }
    },
    [],
  );

  const [activeTab, setActiveTab] = useState<TabKey>("web");
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeDetail = useCallback(() => setSelectedProject(null), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(() => {
    setLightboxIndex((current) =>
      current === null
        ? null
        : (current - 1 + designProjects.length) % designProjects.length,
    );
  }, []);
  const showNext = useCallback(() => {
    setLightboxIndex((current) =>
      current === null
        ? null
        : (current + 1) % designProjects.length,
    );
  }, []);

  useDialogBehavior(
    Boolean(selectedProject),
    detailDialogRef,
    detailTriggerRef,
    closeDetail,
  );
  useDialogBehavior(
    lightboxIndex !== null,
    lightboxDialogRef,
    lightboxTriggerRef,
    closeLightbox,
    showPrev,
    showNext,
  );

  const selectTab = (next: TabKey) => {
    if (next === activeTab) return;

    setActiveTab(next);
    setSelectedProject(null);
    setLightboxIndex(null);

    if (loadingTimerRef.current !== null) {
      clearTimeout(loadingTimerRef.current);
    }
    setLoading(true);
    loadingTimerRef.current = setTimeout(
      () => setLoading(false),
      reduced ? 150 : 900,
    );
  };

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const currentIndex = tabs.findIndex((tab) => tab.key === activeTab);
    const nextIndex =
      (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
      tabs.length;

    selectTab(tabs[nextIndex].key);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]',
    );
    buttons[nextIndex]?.focus();
  };

  const openDetail = (project: Project, trigger: HTMLButtonElement) => {
    detailTriggerRef.current = trigger;
    setSelectedProject(project);
  };

  const openLightbox = (index: number, trigger: HTMLButtonElement) => {
    lightboxTriggerRef.current = trigger;
    setLightboxIndex(index);
  };

  return (
    <LayoutGroup>
      <section id="projects" ref={sectionRef} className="cv-auto relative isolate overflow-hidden px-4 py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-zinc-50 to-white dark:from-[#0b1220] dark:via-zinc-950 dark:to-[#081426]" />
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 18%, rgba(37,99,235,0.14), transparent 40%), radial-gradient(circle at 88% 28%, rgba(30,64,175,0.12), transparent 44%), radial-gradient(circle at 50% 90%, rgba(59,130,246,0.12), transparent 48%)",
            }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 18%, rgba(37,99,235,0.24), transparent 42%), radial-gradient(circle at 88% 28%, rgba(59,130,246,0.18), transparent 46%), radial-gradient(circle at 50% 90%, rgba(30,64,175,0.24), transparent 50%)",
            }}
          />
          {!lite && (
            <>
              <div
                className="absolute -left-28 top-20 h-72 w-72 animate-float rounded-full bg-blue-400/25 blur-2xl motion-reduce:animate-none dark:bg-blue-600/15"
                style={{ animationDelay: "1s", animationDuration: "10s" }}
              />
              <div
                className="absolute -right-24 bottom-24 h-80 w-80 animate-float rounded-full bg-blue-500/20 blur-2xl motion-reduce:animate-none dark:bg-blue-700/15"
                style={{ animationDelay: "3s", animationDuration: "11s" }}
              />
            </>
          )}
          <div className="absolute inset-0 blue-dots opacity-60 dark:opacity-40" />
          <div className="absolute inset-0 grid-bg opacity-15 dark:opacity-10" />
          <div className="absolute inset-0">
            <div className="noise h-full w-full" />
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="03 / Portfolio"
            title="Projects"
            description="Selected web applications and visual work, built with curiosity and a lot of coffee."
          />

          <Reveal
            variant="fade-up"
            className="mt-10 flex justify-center"
          >
            <div
              role="tablist"
              aria-label="Project categories"
              onKeyDown={handleTabKeyDown}
              className="glass relative flex w-full max-w-xs items-center rounded-full p-1.5"
            >
              <motion.span
                aria-hidden
                className="absolute inset-y-1.5 left-1.5 z-0 w-[calc(50%_-_0.375rem)] rounded-full bg-blue-900 shadow-lg shadow-blue-900/20 dark:bg-blue-600"
                animate={{ x: activeTab === "web" ? "0%" : "100%" }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
              {tabs.map((tab) => {
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    id={`projects-tab-${tab.key}`}
                    aria-selected={active}
                    aria-controls="projects-panel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => selectTab(tab.key)}
                    className={`relative z-10 flex-1 rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-950 sm:text-sm ${
                      active
                        ? "text-white"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                  >
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              id="projects-panel"
              role="tabpanel"
              aria-labelledby={`projects-tab-${activeTab}`}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduced ? 0 : 0.22, ease: "easeOut" }}
              className="mt-10"
            >
              <div className="relative">
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-x-0 top-0 z-10"
                    >
                      <ProjectsLoader
                        label={
                          activeTab === "web"
                            ? "Loading web projects"
                            : "Loading design work"
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className={`transition-opacity duration-300 ${
                    loading ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
                >
                  {activeTab === "web" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                      {projects.map((project, index) => (
                        <WebProjectCard
                          key={project.id}
                          project={project}
                          index={index}
                          onDetail={openDetail}
                        />
                      ))}
                    </div>
                  ) : (
                    <DesignGallery onOpen={openLightbox} />
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </section>

      <AnimatePresence>
        {selectedProject && (
          <ProjectDialog
            project={selectedProject}
            titleId={detailTitleId}
            dialogRef={detailDialogRef}
            onClose={closeDetail}
          />
        )}
      </AnimatePresence>

      <DesignLightbox
        index={lightboxIndex}
        dialogRef={lightboxDialogRef}
        onClose={closeLightbox}
        onPrev={showPrev}
        onNext={showNext}
      />
    </LayoutGroup>
  );
}
