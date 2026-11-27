"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { education, experience, organizations } from "@/data/profile";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { usePerformanceMode } from "@/components/ui/usePerformanceMode";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type TabKey = "education" | "organization" | "experience";
type Side = "left" | "right";

interface TimelineEntryData {
  id: number;
  title: string;
  subtitle?: string;
  period: string;
  description?: string;
  points?: string[];
  badge?: string;
  current: boolean;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Scroll line the timeline "fills" up to, as a fraction of the viewport height. */
const FILL_LINE = "70%";

const CURRENT_PATTERN = /present|now|current|sekarang|saat ini/i;

const tabs: { key: TabKey; label: string; count: number }[] = [
  { key: "education", label: "Education", count: education.length },
  { key: "organization", label: "Organization", count: organizations.length },
  { key: "experience", label: "Experience", count: experience.length },
];

/* Static class maps: Tailwind needs full class names at build time. */
const SIDE_CLASSES: Record<Side, { card: string; date: string; stub: string }> = {
  left: {
    card: "md:col-start-1",
    date: "md:col-start-3 md:text-left",
    stub: "md:left-auto md:-right-6",
  },
  right: {
    card: "md:col-start-3",
    date: "md:col-start-1 md:text-right",
    stub: "md:-left-6",
  },
};

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

function buildEntries(tab: TabKey): TimelineEntryData[] {
  switch (tab) {
    case "education":
      return education.map((item) => ({
        id: item.id,
        title: item.institution,
        subtitle: `${item.degree} · ${item.field}`,
        period: item.period.trim(),
        current: CURRENT_PATTERN.test(item.period),
        badge:
          "gpa" in item && item.gpa
            ? `GPA ${item.gpa} / 4.00`
            : "score" in item && item.score
              ? `Graduation score ${item.score} / 100`
              : undefined,
      }));

    case "organization":
      return organizations.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: item.role,
        period: item.period.trim(),
        description: item.description,
        current: CURRENT_PATTERN.test(item.period),
      }));

    case "experience":
      return experience.map((item) => ({
        id: item.id,
        title: item.company,
        subtitle: item.role,
        period: item.period.trim(),
        points: item.points,
        current: CURRENT_PATTERN.test(item.period),
      }));
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function SvgIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-[18px] w-[18px]"
    >
      {children}
    </svg>
  );
}

function TypeIcon({ type }: { type: TabKey }) {
  if (type === "education") {
    return (
      <SvgIcon>
        <path d="M2.75 9.25 12 5l9.25 4.25L12 13.5 2.75 9.25Z" />
        <path d="M6.5 11.25v3.9c0 1.55 2.46 2.85 5.5 2.85s5.5-1.3 5.5-2.85v-3.9" />
        <path d="M21.25 9.25v5.5" />
      </SvgIcon>
    );
  }

  if (type === "organization") {
    return (
      <SvgIcon>
        <circle cx="9" cy="8" r="2.5" />
        <path d="M4.25 18c.2-2.2 2.13-3.8 4.75-3.8s4.55 1.6 4.75 3.8" />
        <circle cx="16.75" cy="9.25" r="2" />
        <path d="M15.5 14.75c2.1.2 3.8 1.65 4 3.55" />
      </SvgIcon>
    );
  }

  return (
    <SvgIcon>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
      <path d="M10 12.5V14h4v-1.5" />
    </SvgIcon>
  );
}

/* ------------------------------------------------------------------ */
/* Background                                                          */
/* ------------------------------------------------------------------ */

function SectionBackground({ lite }: { lite: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-zinc-50 to-blue-100/80 dark:from-[#0b1220] dark:via-zinc-950 dark:to-[#0b1a33]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(37,99,235,0.15),transparent_42%),radial-gradient(circle_at_84%_24%,rgba(30,64,175,0.12),transparent_46%),radial-gradient(circle_at_52%_92%,rgba(59,130,246,0.14),transparent_50%)] dark:bg-[radial-gradient(circle_at_18%_14%,rgba(37,99,235,0.28),transparent_45%),radial-gradient(circle_at_84%_24%,rgba(59,130,246,0.2),transparent_48%),radial-gradient(circle_at_52%_92%,rgba(30,64,175,0.26),transparent_52%)]" />

      {!lite && (
        <>
          <div className="absolute inset-0 blue-dots opacity-60 dark:opacity-40" />
          <div className="absolute inset-0 grid-bg opacity-15 dark:opacity-10" />
          <div className="absolute left-1/2 top-24 hidden h-[30rem] w-[30rem] -translate-x-1/2 rounded-full border border-blue-500/10 dark:border-blue-400/10 md:block" />
          <div className="absolute left-1/2 top-24 hidden h-[44rem] w-[44rem] -translate-x-1/2 rounded-full border border-dashed border-blue-500/10 dark:border-blue-400/10 md:block" />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab bar                                                             */
/* ------------------------------------------------------------------ */

function TabBar({
  active,
  onChange,
  reduced,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  reduced: boolean;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const current = tabs.findIndex((tab) => tab.key === active);
    const next =
      (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
      tabs.length;

    onChange(tabs[next].key);
    event.currentTarget
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Journey categories"
      onKeyDown={handleKeyDown}
      className="relative flex w-full max-w-md items-center gap-1 rounded-full border border-zinc-200/80 bg-white/70 p-1.5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/60"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`timeline-tab-${tab.key}`}
            aria-selected={isActive}
            aria-controls="timeline-panel"
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={cx(
              "relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 py-2.5 text-xs font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 sm:px-3 sm:text-sm",
              isActive
                ? "text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="timeline-tab-pill"
                aria-hidden
                className="absolute inset-0 rounded-full bg-blue-900 shadow-lg shadow-blue-900/20 dark:bg-blue-600"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 32 }
                }
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            <span
              className={cx(
                "relative z-10 hidden rounded-full px-1.5 font-mono text-[10px] tabular-nums sm:inline",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-zinc-900/5 text-zinc-500 dark:bg-white/10 dark:text-zinc-400",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline rail: node + scroll-filled segment                         */
/* ------------------------------------------------------------------ */

function Rail({
  entryRef,
  isLast,
  current,
  reduced,
}: {
  entryRef: RefObject<HTMLElement | null>;
  isLast: boolean;
  current: boolean;
  reduced: boolean;
}) {
  // 0 when the entry's top reaches the fill line, 1 when its bottom does.
  const { scrollYProgress } = useScroll({
    target: entryRef,
    offset: [`start ${FILL_LINE}`, `end ${FILL_LINE}`],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.35,
  });

  // The node lights up the moment the fill line reaches it.
  const lit = useTransform(scrollYProgress, [0, 0.04], [0, 1]);
  const nodeScale = useTransform(lit, [0, 1], [0.35, 1]);

  return (
    <div className="relative col-start-1 row-start-1 flex justify-center md:col-start-2">
      {!isLast && (
        <>
          {/* Track */}
          <span
            aria-hidden
            className="absolute left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-blue-500/15 dark:bg-blue-400/15"
            style={{
              top: "var(--node-y)",
              bottom: "calc(-1 * (var(--gap) + var(--node-y)))",
            }}
          />
          {/* Fill */}
          <motion.span
            aria-hidden
            className="absolute left-1/2 w-0.5 origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-700 via-blue-500 to-blue-300 will-change-transform dark:from-blue-300 dark:via-blue-400 dark:to-blue-600"
            style={{
              top: "var(--node-y)",
              bottom: "calc(-1 * (var(--gap) + var(--node-y)))",
              scaleY: reduced ? 1 : smooth,
            }}
          />
        </>
      )}

      <span
        aria-hidden
        className="relative z-10 mt-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-300/70 bg-zinc-50 dark:border-blue-400/40 dark:bg-zinc-950"
      >
        {current && (
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/50 motion-reduce:animate-none" />
        )}
        <motion.span
          className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.15)] dark:bg-blue-400"
          style={{
            opacity: reduced ? 1 : lit,
            scale: reduced ? 1 : nodeScale,
          }}
        />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const pointVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
};

function EntryCard({
  item,
  type,
}: {
  item: TimelineEntryData;
  type: TabKey;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.5)] transition-[transform,box-shadow,border-color] duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/70 sm:p-6 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-blue-400/50 [@media(hover:hover)]:hover:shadow-[0_24px_55px_-28px_rgba(37,99,235,0.45)]">
      {/* top hairline + hover glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_70%)] opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
      />

      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200/80 bg-blue-50/80 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
          <TypeIcon type={type} />
        </span>
        {/* On desktop the period lives on the opposite side of the rail. */}
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.06em] text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200 md:hidden">
          {item.current && (
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
            />
          )}
          {item.period}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-100 sm:text-xl">
        {item.title}
      </h3>

      {item.subtitle && (
        <p className="mt-1 text-sm font-medium text-blue-800 dark:text-blue-300">
          {item.subtitle}
        </p>
      )}

      {item.badge && (
        <span className="mt-3 inline-flex w-fit max-w-full items-center rounded-full border border-blue-900/10 bg-blue-900/5 px-2.5 py-1 text-[11px] font-semibold text-blue-900 dark:border-blue-300/15 dark:bg-blue-300/10 dark:text-blue-200">
          {item.badge}
        </span>
      )}

      {item.points && item.points.length > 0 ? (
        <motion.ul
          variants={listVariants}
          className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
        >
          {item.points.map((point, index) => (
            <motion.li
              key={index}
              variants={pointVariants}
              className="flex gap-2.5"
            >
              <span
                aria-hidden
                className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
              />
              <span className="min-w-0">{point}</span>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        item.description && (
          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {item.description}
          </p>
        )
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Entry                                                               */
/* ------------------------------------------------------------------ */

interface TimelineEntryProps {
  item: TimelineEntryData;
  type: TabKey;
  side: Side;
  isLast: boolean;
  wide: boolean;
  reduced: boolean;
}

function TimelineEntry({
  item,
  type,
  side,
  isLast,
  wide,
  reduced,
}: TimelineEntryProps) {
  const ref = useRef<HTMLElement>(null);
  const classes = SIDE_CLASSES[side];

  // Desktop: cards slide in from their own side. Mobile: simple rise.
  const direction = side === "left" ? -1 : 1;
  const offsetX = reduced || !wide ? 0 : direction * 48;
  const offsetY = reduced ? 0 : 28;

  const cardVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, x: offsetX, y: offsetY },
      show: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: reduced ? 0.2 : 0.75, ease: EASE },
      },
    }),
    [offsetX, offsetY, reduced],
  );

  const dateVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, x: reduced ? 0 : -direction * 24 },
      show: {
        opacity: 1,
        x: 0,
        transition: { duration: reduced ? 0.2 : 0.7, ease: EASE, delay: 0.1 },
      },
    }),
    [direction, reduced],
  );

  const viewport = { once: true, amount: 0.2 } as const;

  return (
    <article
      ref={ref}
      className={cx(
        "grid grid-cols-[2.5rem_minmax(0,1fr)] [--gap:2.5rem] [--node-y:2.125rem] md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] md:[--gap:3.5rem]",
        !isLast && "pb-[var(--gap)]",
      )}
    >
      <Rail
        entryRef={ref}
        isLast={isLast}
        current={item.current}
        reduced={reduced}
      />

      {/* Card */}
      <div
        className={cx(
          "relative col-start-2 row-start-1 min-w-0",
          classes.card,
        )}
      >
        <span
          aria-hidden
          className={cx(
            "pointer-events-none absolute top-[var(--node-y)] h-px w-5 -translate-y-1/2 -left-5 bg-gradient-to-r from-blue-500/50 to-blue-400/10 md:w-6",
            classes.stub,
            side === "left" &&
              "md:bg-gradient-to-l md:from-blue-500/50 md:to-blue-400/10",
          )}
        />
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="will-change-transform"
        >
          <EntryCard item={item} type={type} />
        </motion.div>
      </div>

      {/* Period label on the empty side (desktop only) */}
      <motion.div
        variants={dateVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className={cx(
          "row-start-1 hidden pt-5 md:block",
          classes.date,
        )}
      >
        <p className="font-display text-lg font-semibold tracking-tight text-blue-900/75 dark:text-blue-200/80">
          {item.period}
        </p>
        {item.current && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            />
            Ongoing
          </p>
        )}
      </motion.div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Timeline() {
  const reduced = useReducedMotion() ?? false;
  const { lite } = usePerformanceMode();
  const wide = useMediaQuery("(min-width: 768px)");
  const [activeTab, setActiveTab] = useState<TabKey>("education");

  const entries = useMemo(() => buildEntries(activeTab), [activeTab]);

  return (
    <section
      id="timeline"
      className="relative isolate overflow-hidden px-4 py-16 sm:py-24"
    >
      <SectionBackground lite={lite} />

      <div className="relative mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="02 / Journey"
          title="Journey"
          description="My journey through education, organizations, and professional experience."
        />

        <Reveal
          variant="fade-up"
          delay={0.08}
          className="mt-10 flex justify-center"
        >
          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            reduced={reduced}
          />
        </Reveal>

        <div className="relative mx-auto mt-12 sm:mt-14">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              id="timeline-panel"
              role="tabpanel"
              aria-labelledby={`timeline-tab-${activeTab}`}
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
            >
              {entries.map((item, index) => (
                <TimelineEntry
                  key={`${activeTab}-${item.id}`}
                  item={item}
                  type={activeTab}
                  side={index % 2 === 0 ? "left" : "right"}
                  isLast={index === entries.length - 1}
                  wide={wide}
                  reduced={reduced}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}