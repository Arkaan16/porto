"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { designProjects, projects } from "@/data/profile";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { usePerformanceMode } from "@/components/ui/usePerformanceMode";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type TabKey = "web" | "design";
type Project = (typeof projects)[number];
type DesignItem = (typeof designProjects)[number];
type ActionIconName = "arrow" | "code" | "close" | "left" | "right" | "expand";

const GALLERY_PAGE_SIZE = 12;
const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const tabs: { key: TabKey; label: string; count: number }[] = [
  { key: "web", label: "Web", count: projects.length },
  { key: "design", label: "Design", count: designProjects.length },
];

const panelVariants: Variants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

// Optional field: add `liveUrl` to a project in data/profile to show a "Live" button.
const getLiveUrl = (project: Project) =>
  (project as { liveUrl?: string }).liveUrl;

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Dialog behaviour (focus trap, scroll lock, keyboard)                */
/* ------------------------------------------------------------------ */

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
  // Keep the latest handlers in refs so the effect below only re-runs when
  // the dialog opens/closes (no listener churn on every navigation).
  const handlers = useRef({ onClose, onPrev, onNext });
  handlers.current = { onClose, onPrev, onNext };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    (getFocusable(dialog)[0] ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      const { onClose, onPrev, onNext } = handlers.current;

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
  }, [open, dialogRef, triggerRef]);
}

/* ------------------------------------------------------------------ */
/* Background: static gradients + two GPU-only blobs (paused offscreen)*/
/* ------------------------------------------------------------------ */

const SectionBackground = memo(function SectionBackground({
  lite,
  active,
}: {
  lite: boolean;
  active: boolean;
}) {
  const reduced = useReducedMotion();
  const animate = !lite && !reduced && active;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-zinc-50 to-white dark:from-[#0b1220] dark:via-zinc-950 dark:to-[#081426]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.14),transparent_40%),radial-gradient(circle_at_88%_28%,rgba(30,64,175,0.12),transparent_44%)] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.24),transparent_42%),radial-gradient(circle_at_88%_28%,rgba(59,130,246,0.18),transparent_46%)]" />

      {!lite && (
        <>
          <motion.div
            className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.32),transparent_70%)] will-change-transform dark:bg-[radial-gradient(circle,rgba(37,99,235,0.26),transparent_70%)]"
            animate={animate ? { x: [0, 60, 0], y: [0, 30, 0] } : { x: 0, y: 0 }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-24 bottom-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28),transparent_70%)] will-change-transform dark:bg-[radial-gradient(circle,rgba(29,78,216,0.24),transparent_70%)]"
            animate={
              animate ? { x: [0, -50, 0], y: [0, -40, 0] } : { x: 0, y: 0 }
            }
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 blue-dots opacity-50 dark:opacity-30" />
        </>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Image that fades in once decoded (handles cached images)            */
/* ------------------------------------------------------------------ */

function FadeImage({
  className = "",
  ...props
}: React.ComponentProps<typeof Image>) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      ref={(el) => {
        // Cached images can finish before hydration, so onLoad never fires.
        if (el?.complete && !loaded) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Web project card: spotlight follows the cursor (CSS vars, no state) */
/* ------------------------------------------------------------------ */

const WebProjectCard = memo(function WebProjectCard({
  project,
  featured,
  variants,
  onDetail,
}: {
  project: Project;
  featured: boolean;
  variants: Variants;
  onDetail: (project: Project, trigger: HTMLButtonElement) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const frame = useRef(0);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;

    const el = cardRef.current;
    if (!el) return;

    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - rect.left}px`);
      el.style.setProperty("--my", `${clientY - rect.top}px`);
    });
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const liveUrl = getLiveUrl(project);

  return (
    <motion.div
      variants={variants}
      className={featured ? "sm:col-span-2 lg:h-full" : "h-full"}
    >
      <article
        ref={cardRef}
        onPointerMove={handlePointerMove}
        className={`group/card relative w-full overflow-hidden rounded-[1.75rem] border border-zinc-200/80 bg-zinc-900 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)] dark:border-zinc-700/60 ${
          featured
            ? "aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:h-full"
            : "aspect-[4/3]"
        }`}
      >
        <Image
          src={project.thumbnail}
          alt=""
          fill
          sizes={
            featured
              ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          quality={70}
          loading="lazy"
          className="object-cover [@media(hover:hover)]:transition-transform [@media(hover:hover)]:duration-700 [@media(hover:hover)]:ease-out [@media(hover:hover)]:group-hover/card:scale-[1.05] motion-reduce:transform-none"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/5"
        />

        {/* Cursor spotlight: only on devices that can hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:duration-300 [@media(hover:hover)]:group-hover/card:opacity-100"
          style={{
            background:
              "radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(96,165,250,0.28), transparent 65%)",
          }}
        />

        {/* Whole card is the primary action */}
        <button
          type="button"
          onClick={(event) => onDetail(project, event.currentTarget)}
          aria-label={`Lihat detail ${project.title}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-transform duration-300 group-hover/card:rotate-[-45deg] sm:right-5 sm:top-5"
        >
          <ActionIcon name="arrow" />
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, featured ? 4 : 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-zinc-950/35 px-2.5 py-1 text-[11px] font-medium text-white/85"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3
            className={`mt-3 font-display font-bold leading-tight text-white ${
              featured ? "text-xl sm:text-2xl lg:text-3xl" : "text-lg sm:text-xl"
            }`}
          >
            {project.title}
          </h3>
          <p
            className={`mt-2 text-sm leading-relaxed text-zinc-300/85 ${
              featured ? "line-clamp-2 max-w-xl lg:line-clamp-3" : "line-clamp-2"
            }`}
          >
            {project.description}
          </p>

          {/* Secondary links reveal on hover/focus (always visible on touch) */}
          <div className="pointer-events-auto mt-4 flex flex-wrap gap-2 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-all [@media(hover:hover)]:duration-300 [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100 [@media(hover:hover)]:group-focus-within/card:translate-y-0 [@media(hover:hover)]:group-focus-within/card:opacity-100">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                Live demo
                <ActionIcon name="arrow" className="h-3.5 w-3.5" />
              </a>
            )}
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                Source
                <ActionIcon name="code" className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </article>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/* Web grid: one observer, one orchestrated stagger                    */
/* ------------------------------------------------------------------ */

function WebGrid({
  reduced,
  onDetail,
}: {
  reduced: boolean;
  onDetail: (project: Project, trigger: HTMLButtonElement) => void;
}) {
  const containerVariants = useMemo<Variants>(
    () => ({
      hidden: {},
      show: { transition: { staggerChildren: reduced ? 0 : 0.08 } },
    }),
    [reduced],
  );

  const cardVariants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: reduced ? 0 : 28 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: reduced ? 0 : 0.7, ease: EASE_OUT_EXPO },
      },
    }),
    [reduced],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
    >
      {projects.map((project, index) => (
        <WebProjectCard
          key={project.id}
          project={project}
          featured={index === 0 && projects.length > 2}
          variants={cardVariants}
          onDetail={onDetail}
        />
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Project detail dialog: bottom sheet on mobile, centered on desktop  */
/* ------------------------------------------------------------------ */

function ProjectDialog({
  project,
  position,
  total,
  titleId,
  dialogRef,
  onClose,
  onPrev,
  onNext,
}: {
  project: Project;
  position: number;
  total: number;
  titleId: string;
  dialogRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const liveUrl = getLiveUrl(project);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-zinc-950/80 sm:items-center sm:p-6"
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.97 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 340, damping: 32, mass: 0.9 }
        }
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-t-3xl border border-zinc-200/80 bg-white shadow-2xl outline-none dark:border-zinc-700/70 dark:bg-zinc-900 sm:rounded-3xl"
      >
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={onPrev}
                aria-label="Proyek sebelumnya"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-zinc-950/60 text-white transition-colors hover:bg-zinc-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <ActionIcon name="left" />
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="Proyek berikutnya"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-zinc-950/60 text-white transition-colors hover:bg-zinc-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <ActionIcon name="right" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail proyek"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-zinc-950/60 text-white transition-colors hover:bg-zinc-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <ActionIcon name="close" />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={project.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
            className="max-h-[88vh] overflow-y-auto"
          >
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
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {position} dari {total}
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
                    className="rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/live inline-flex items-center gap-2 rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    Buka live demo
                    <ActionIcon
                      name="arrow"
                      className="transition-transform duration-300 group-hover/live:translate-x-1"
                    />
                  </a>
                )}
                {project.sourceUrl && (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/source inline-flex items-center gap-2 rounded-full border border-zinc-300/80 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Source code
                    <ActionIcon
                      name="code"
                      className="transition-transform duration-300 group-hover/source:-translate-y-0.5 group-hover/source:translate-x-0.5"
                    />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Design gallery: stable JS masonry (no reshuffle on "Load more")     */
/* ------------------------------------------------------------------ */

function useColumnCount() {
  const [count, setCount] = useState(2);

  useEffect(() => {
    const queries: [MediaQueryList, number][] = [
      [window.matchMedia("(min-width: 1280px)"), 4],
      [window.matchMedia("(min-width: 1024px)"), 3],
    ];
    const update = () =>
      setCount(queries.find(([query]) => query.matches)?.[1] ?? 2);

    update();
    queries.forEach(([query]) => query.addEventListener("change", update));
    return () =>
      queries.forEach(([query]) =>
        query.removeEventListener("change", update),
      );
  }, []);

  return count;
}

const GalleryTile = memo(function GalleryTile({
  item,
  index,
  onOpen,
}: {
  item: DesignItem;
  index: number;
  onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0 : 0.5,
        ease: EASE_OUT_EXPO,
        delay: reduced ? 0 : (index % GALLERY_PAGE_SIZE) * 0.035,
      }}
    >
      <button
        type="button"
        onClick={(event) => onOpen(index, event.currentTarget)}
        aria-label={`Buka ${item.title}`}
        className="group relative block w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-200/60 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700/70 dark:bg-zinc-800/60"
        // Reserve space up front so tiles never jump when images load.
        style={{ aspectRatio: `${item.width} / ${item.height}` }}
      >
        <FadeImage
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={70}
          loading="lazy"
          className="object-cover [@media(hover:hover)]:transition-transform [@media(hover:hover)]:duration-700 [@media(hover:hover)]:ease-out [@media(hover:hover)]:group-hover:scale-[1.05]"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-zinc-950/80 to-transparent p-3 text-white [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-all [@media(hover:hover)]:duration-300 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:translate-y-0 [@media(hover:hover)]:group-focus-visible:opacity-100"
        >
          <span className="line-clamp-1 text-xs font-medium">{item.title}</span>
          <ActionIcon name="expand" className="h-4 w-4 shrink-0" />
        </span>
      </button>
    </motion.div>
  );
});

const DesignGallery = memo(function DesignGallery({
  onOpen,
}: {
  onOpen: (index: number, trigger: HTMLButtonElement) => void;
}) {
  const [visible, setVisible] = useState(GALLERY_PAGE_SIZE);
  const columnCount = useColumnCount();
  const hasMore = visible < designProjects.length;

  // Greedy "shortest column first": adding items never moves existing ones.
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => ({
      height: 0,
      entries: [] as { item: DesignItem; index: number }[],
    }));

    designProjects.slice(0, visible).forEach((item, index) => {
      const target = cols.reduce((a, b) => (b.height < a.height ? b : a));
      target.entries.push({ item, index });
      target.height += item.height / item.width;
    });

    return cols;
  }, [columnCount, visible]);

  return (
    <>
      <div className="flex items-start gap-3 lg:gap-5">
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex min-w-0 flex-1 flex-col gap-3 lg:gap-5"
          >
            {column.entries.map(({ item, index }) => (
              <GalleryTile
                key={item.id}
                item={item}
                index={index}
                onOpen={onOpen}
              />
            ))}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Show {Math.min(visible, designProjects.length)} From{" "}
            {designProjects.length} Project
          </p>
          <button
            type="button"
            onClick={() =>
              setVisible((v) =>
                Math.min(v + GALLERY_PAGE_SIZE, designProjects.length),
              )
            }
            className="rounded-full border border-zinc-300/80 bg-white/70 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.97] dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
});

/* ------------------------------------------------------------------ */
/* Lightbox: direction-aware slide, swipe to navigate, preloading      */
/* ------------------------------------------------------------------ */

const slideVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 80 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -80 }),
};

function DesignLightbox({
  index,
  direction,
  dialogRef,
  onClose,
  onPrev,
  onNext,
}: {
  index: number | null;
  direction: number;
  dialogRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const activeIndex = index ?? 0;
  const item = index === null ? null : designProjects[index];

  // Warm the cache for the neighbouring images.
  useEffect(() => {
    if (index === null) return;

    const total = designProjects.length;
    [(index + 1) % total, (index - 1 + total) % total].forEach((i) => {
      const img = new window.Image();
      img.src = designProjects[i].image;
    });
  }, [index]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const power = Math.abs(info.offset.x) * 0.6 + Math.abs(info.velocity.x) * 0.2;
    if (power < 60) return;

    if (info.offset.x > 0) onPrev();
    else onNext();
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau desain: ${item.title}`}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/95 p-4 outline-none sm:p-8"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-6"
          >
            <p className="truncate text-xs text-white/70">
              <span className="tabular-nums text-white">
                {activeIndex + 1} / {designProjects.length}
              </span>
              <span className="ml-3">{item.title}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau desain"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <ActionIcon name="close" />
            </button>
          </div>

          <div
            onClick={(event) => event.stopPropagation()}
            className="relative h-[76vh] w-full max-w-6xl"
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={item.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduced ? 0 : 0.35, ease: EASE_OUT_EXPO }}
                drag={reduced ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  quality={70}
                  priority
                  draggable={false}
                  className="select-none rounded-2xl object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 p-4 sm:p-6"
          >
            <button
              type="button"
              onClick={onPrev}
              aria-label="Desain sebelumnya"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:scale-90"
            >
              <ActionIcon name="left" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Desain berikutnya"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:scale-90"
            >
              <ActionIcon name="right" className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Projects() {
  const reduced = useReducedMotion() ?? false;
  const { lite } = usePerformanceMode();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "200px 0px 200px 0px" });

  const detailTitleId = useId();
  const detailDialogRef = useRef<HTMLDivElement>(null);
  const lightboxDialogRef = useRef<HTMLDivElement>(null);
  const detailTriggerRef = useRef<HTMLElement | null>(null);
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("web");
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxDirection, setLightboxDirection] = useState(1);

  const closeDetail = useCallback(() => setDetailIndex(null), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrevDetail = useCallback(() => {
    setDetailIndex((c) =>
      c === null ? null : (c - 1 + projects.length) % projects.length,
    );
  }, []);
  const showNextDetail = useCallback(() => {
    setDetailIndex((c) => (c === null ? null : (c + 1) % projects.length));
  }, []);

  const showPrev = useCallback(() => {
    setLightboxDirection(-1);
    setLightboxIndex((c) =>
      c === null ? null : (c - 1 + designProjects.length) % designProjects.length,
    );
  }, []);
  const showNext = useCallback(() => {
    setLightboxDirection(1);
    setLightboxIndex((c) =>
      c === null ? null : (c + 1) % designProjects.length,
    );
  }, []);

  useDialogBehavior(
    detailIndex !== null,
    detailDialogRef,
    detailTriggerRef,
    closeDetail,
    showPrevDetail,
    showNextDetail,
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
    setDetailIndex(null);
    setLightboxIndex(null);
  };

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const currentIndex = tabs.findIndex((tab) => tab.key === activeTab);
    const nextIndex =
      (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
      tabs.length;

    selectTab(tabs[nextIndex].key);
    event.currentTarget
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  };

  const openDetail = useCallback(
    (project: Project, trigger: HTMLButtonElement) => {
      detailTriggerRef.current = trigger;
      setDetailIndex(projects.findIndex((p) => p.id === project.id));
    },
    [],
  );

  const openLightbox = useCallback(
    (index: number, trigger: HTMLButtonElement) => {
      lightboxTriggerRef.current = trigger;
      setLightboxDirection(1);
      setLightboxIndex(index);
    },
    [],
  );

  const selectedProject = detailIndex === null ? null : projects[detailIndex];

  return (
    <>
      <section
        ref={sectionRef}
        id="projects"
        className="relative isolate overflow-hidden px-4 py-24"
      >
        <SectionBackground lite={lite} active={inView} />

        <div className="relative mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="03 / Portfolio"
            title="Projects"
            description="Selected web applications and visual work, built with curiosity and a lot of coffee."
          />

          <Reveal variant="fade-up" className="mt-10 flex justify-center">
            <LayoutGroup id="projects-tabs">
              <div
                role="tablist"
                aria-label="Kategori proyek"
                onKeyDown={handleTabKeyDown}
                className="glass relative flex w-full max-w-xs items-center rounded-full p-1.5"
              >
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
                      className={`relative flex-1 rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-950 sm:text-sm ${
                        active
                          ? "text-white"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="projects-tab-pill"
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-blue-900 shadow-lg shadow-blue-900/20 dark:bg-blue-600"
                          transition={
                            reduced
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 420, damping: 34 }
                          }
                        />
                      )}
                      <span className="relative z-10 inline-flex items-center justify-center gap-2">
                        {tab.label}
                        <span
                          className={`rounded-full px-1.5 py-px text-[10px] tabular-nums transition-colors ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-zinc-900/5 text-zinc-500 dark:bg-white/10 dark:text-zinc-400"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              id="projects-panel"
              role="tabpanel"
              aria-labelledby={`projects-tab-${activeTab}`}
              variants={panelVariants}
              initial={reduced ? false : "enter"}
              animate="center"
              exit="exit"
              transition={{ duration: reduced ? 0 : 0.22, ease: "easeOut" }}
              className="mt-10"
            >
              {activeTab === "web" ? (
                <WebGrid reduced={reduced} onDetail={openDetail} />
              ) : (
                <DesignGallery onOpen={openLightbox} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {selectedProject && detailIndex !== null && (
          <ProjectDialog
            project={selectedProject}
            position={detailIndex + 1}
            total={projects.length}
            titleId={detailTitleId}
            dialogRef={detailDialogRef}
            onClose={closeDetail}
            onPrev={showPrevDetail}
            onNext={showNextDetail}
          />
        )}
      </AnimatePresence>

      <DesignLightbox
        index={lightboxIndex}
        direction={lightboxDirection}
        dialogRef={lightboxDialogRef}
        onClose={closeLightbox}
        onPrev={showPrev}
        onNext={showNext}
      />
    </>
  );
}