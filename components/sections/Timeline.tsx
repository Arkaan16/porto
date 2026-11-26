"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { education, experience, organizations } from "@/data/profile";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";

type TabKey = "education" | "organization" | "experience";

const tabs: { key: TabKey; label: string }[] = [
  { key: "education", label: "Education" },
  { key: "organization", label: "Organization" },
  { key: "experience", label: "Experience" },
];

const panelVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

interface TimelineEntryData {
  id: number;
  title: string;
  subtitle?: string;
  period: string;
  description?: string;
  points?: string[];
  badge?: string;
}

function buildEntries(tab: TabKey): TimelineEntryData[] {
  if (tab === "education") {
    return education.map((item) => ({
      id: item.id,
      title: item.institution,
      subtitle: `${item.degree} · ${item.field}`,
      period: item.period.trim(),
      badge:
        "gpa" in item && item.gpa
          ? `GPA: ${item.gpa}/4.00`
          : "score" in item && item.score
            ? `Graduation: ${item.score}/100`
            : undefined,
    }));
  }

  if (tab === "organization") {
    return organizations.map((item) => ({
      id: item.id,
      title: item.name,
      period: item.period.trim(),
      description: item.description,
      badge: item.role,
    }));
  }

  return experience.map((item) => ({
    id: item.id,
    title: item.company,
    period: item.period.trim(),
    points: item.points,
    badge: item.role,
  }));
}

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

interface TimelineEntryProps {
  item: TimelineEntryData;
  type: TabKey;
  index: number;
  side: "left" | "right";
  isLast: boolean;
}

function TimelineEntry({
  item,
  type,
  index,
  side,
  isLast,
}: TimelineEntryProps) {
  return (
    <article
      className={`relative pl-12 md:grid md:grid-cols-2 md:gap-x-16 md:pl-0 lg:gap-x-20 ${
        isLast ? "pb-0" : "pb-10 md:pb-14"
      }`}
    >
      {!isLast && (
        <div
          aria-hidden
          className="absolute left-5 top-7 -bottom-7 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-700 via-blue-500 to-blue-300 dark:from-blue-300 dark:via-blue-400 dark:to-blue-700 md:left-1/2"
        />
      )}

      <span
        aria-hidden
        className="absolute left-5 top-7 z-20 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full md:left-1/2"
      >
        <span className="absolute inset-1 rounded-full border border-blue-400/40 bg-blue-500/10 dark:border-blue-300/30 dark:bg-blue-400/10" />
        <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-700 shadow-[0_0_0_4px_rgba(37,99,235,0.12)] dark:border-zinc-950 dark:bg-blue-400" />
      </span>

      <span
        aria-hidden
        className={`absolute top-7 z-0 hidden h-px w-8 md:block ${
          side === "left"
            ? "right-1/2 bg-gradient-to-l from-blue-500/70 via-blue-400/40 to-transparent"
            : "left-1/2 bg-gradient-to-r from-blue-500/70 via-blue-400/40 to-transparent"
        }`}
      />

      <span
        aria-hidden
        className="absolute left-5 top-7 z-0 h-px w-7 bg-gradient-to-r from-blue-400/60 to-transparent md:hidden"
      />

      <div
        className={`relative z-10 min-w-0 ${
          side === "left" ? "md:col-start-1" : "md:col-start-2"
        }`}
      >
        <Reveal variant="fade-up" delay={Math.min(index * 0.06, 0.24)}>
          <TiltCard
            max={4}
            glare={false}
            className="glass relative overflow-hidden rounded-2xl p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.55)] sm:p-6"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200/80 bg-blue-50/80 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                <TypeIcon type={type} />
              </span>
              <span className="inline-flex max-w-full items-center rounded-full border border-blue-200/80 bg-blue-50/80 px-2.5 py-1 font-mono text-[9px] font-medium tracking-[0.08em] text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200 sm:text-[10px]">
                {item.period}
              </span>
            </div>

            <h3 className="mt-4 font-display text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-100">
              {item.title}
            </h3>

            {item.subtitle && (
              <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {item.subtitle}
              </p>
            )}

            {item.badge && (
              <span className="mt-3 inline-flex w-fit max-w-full items-center rounded-full border border-blue-900/10 bg-blue-900/5 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-blue-900 dark:border-blue-300/15 dark:bg-blue-300/10 dark:text-blue-200">
                {item.badge}
              </span>
            )}

            {item.points && item.points.length > 0 ? (
              <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex gap-2.5">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              item.description && (
                <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </p>
              )
            )}
          </TiltCard>
        </Reveal>
      </div>
    </article>
  );
}

export default function Timeline() {
  const reduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabKey>("education");

  const selectTab = (next: TabKey) => {
    if (next === activeTab) return;
    setActiveTab(next);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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

  const entries = buildEntries(activeTab);

  return (
    <section
      id="timeline"
      className="relative isolate overflow-hidden px-4 py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-zinc-50 to-blue-100/80 dark:from-[#0b1220] dark:via-zinc-950 dark:to-[#0b1a33]" />

        <div
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 14%, rgba(37,99,235,0.15), transparent 42%), radial-gradient(circle at 84% 24%, rgba(30,64,175,0.12), transparent 46%), radial-gradient(circle at 52% 92%, rgba(59,130,246,0.14), transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 14%, rgba(37,99,235,0.28), transparent 45%), radial-gradient(circle at 84% 24%, rgba(59,130,246,0.2), transparent 48%), radial-gradient(circle at 52% 92%, rgba(30,64,175,0.26), transparent 52%)",
          }}
        />

        <div className="absolute inset-0 blue-dots opacity-70 dark:opacity-50" />
        <div className="absolute inset-0 grid-bg opacity-15 dark:opacity-10" />

        <div className="absolute bottom-20 right-7 grid grid-cols-5 gap-2 opacity-50 sm:right-14">
          {Array.from({ length: 20 }).map((_, index) => (
            <span
              key={index}
              className="h-1 w-1 rounded-full bg-blue-500/70 dark:bg-blue-300/40"
            />
          ))}
        </div>

        <div className="absolute left-1/2 top-24 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full border border-blue-500/10 dark:border-blue-400/10" />
        <div className="absolute left-1/2 top-24 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full border border-dashed border-blue-500/10 dark:border-blue-400/10" />

        <div className="absolute inset-0">
          <div className="noise h-full w-full" />
        </div>
      </div>

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
          <div
            role="tablist"
            aria-label="Journey categories"
            onKeyDown={handleTabKeyDown}
            className="glass flex w-full max-w-md items-center gap-1 rounded-full p-1.5"
          >
            {tabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  id={`timeline-tab-${tab.key}`}
                  aria-selected={active}
                  aria-controls="timeline-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectTab(tab.key)}
                  className={`relative flex-1 whitespace-nowrap rounded-full px-2 py-2.5 text-[10px] font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-950 sm:px-3 sm:text-xs ${
                    active
                      ? "text-white"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="timeline-tab-pill"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-blue-900 shadow-lg shadow-blue-900/20 dark:bg-blue-600"
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 340, damping: 30 }
                      }
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="relative mx-auto mt-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              id="timeline-panel"
              role="tabpanel"
              aria-labelledby={`timeline-tab-${activeTab}`}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
            >
              {entries.map((item, index) => (
                <TimelineEntry
                  key={`${activeTab}-${item.id}`}
                  item={item}
                  type={activeTab}
                  index={index}
                  side={index % 2 === 0 ? "left" : "right"}
                  isLast={index === entries.length - 1}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
