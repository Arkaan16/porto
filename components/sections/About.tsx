"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { education, profile } from "@/data/profile";
import Lanyard from "@/components/ui/Lanyard";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import { useInViewPause } from "@/components/ui/useInView";

interface CountUpProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

function CountUp({ value, decimals = 0, suffix = "", className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || reduced) return;

    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => {
        node.textContent = `${latest.toFixed(decimals)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [inView, reduced, value, decimals, suffix]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {`${value.toFixed(decimals)}${suffix}`}
    </span>
  );
}

function useIsTouch() {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return touch;
}

/* Tilt is pointless on touch screens, and its wrapper can inset the card.
   On touch devices render a plain block so every card aligns with the text. */
function StatCard({
  touch,
  className,
  outerClassName = "",
  children,
}: {
  touch: boolean;
  className: string;
  outerClassName?: string;
  children: ReactNode;
}) {
  if (touch) {
    return <div className={`${outerClassName} ${className}`}>{children}</div>;
  }

  return (
    <TiltCard max={6} outerClassName={outerClassName} className={className}>
      {children}
    </TiltCard>
  );
}

const statCard =
  "h-full rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm shadow-blue-950/5 dark:border-zinc-700/60 dark:bg-zinc-900/70";
const statLabel =
  "font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 sm:text-[9px] sm:tracking-[0.22em]";

export default function About() {
  const primaryEducation = education[0];
  const graduationYear =
    primaryEducation.period.split(" - ").at(-1) ?? primaryEducation.period;
  const graduationYearValue = Number.parseInt(graduationYear, 10);
  const gpa = "gpa" in primaryEducation ? primaryEducation.gpa : undefined;
  const gpaValue = gpa ? Number.parseFloat(gpa) : undefined;
  const sectionRef = useInViewPause<HTMLElement>();
  const touch = useIsTouch();

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-zinc-50 px-4 py-16 dark:bg-zinc-900/50 sm:py-24"
    >
      {/* decorative: desktop only so nothing overlaps content on mobile */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-12 hidden h-72 w-72 animate-spin-slow rounded-full border border-blue-300/50 motion-reduce:animate-none dark:border-blue-500/10 md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-12 right-8 hidden grid-cols-4 gap-2 opacity-50 md:grid"
      >
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            className="h-1 w-1 rounded-full bg-blue-400/70 dark:bg-blue-300/30"
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-10">
        <div className="relative flex min-w-0 justify-center lg:-mt-12 lg:justify-start">
          <Lanyard
            imageSrc={profile.aboutImage}
            name={profile.name}
            role={profile.role}
            idText={`ID • ${graduationYear}`}
          />
        </div>

        <div className="min-w-0 lg:pt-6">
          <Reveal variant="fade-up">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-blue-700 dark:text-blue-400">
              01 / About
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl md:text-5xl">
              Hi, I&apos;m{" "}
              <span className="text-gradient">{profile.nickname}</span>!
            </h2>
          </Reveal>

          {/* Tagline removed: it already appears in the Hero section. */}
          <Reveal variant="fade-up" delay={0.08}>
            <p className="mt-5 w-full break-words pb-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
              {profile.description}
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={0.14}>
            <div className="mt-8 grid grid-cols-2 items-stretch gap-3 sm:gap-4">
              <StatCard touch={touch} outerClassName="h-full" className={statCard}>
                <p className={statLabel}>Graduated</p>
                <p className="mt-2 text-2xl font-bold leading-none text-blue-800 dark:text-blue-300 sm:text-3xl">
                  {Number.isFinite(graduationYearValue) ? (
                    <CountUp value={graduationYearValue} />
                  ) : (
                    graduationYear
                  )}
                </p>
              </StatCard>

              <StatCard touch={touch} outerClassName="h-full" className={statCard}>
                <p className={statLabel}>Major</p>
                <p className="mt-2 break-words text-base font-bold leading-tight text-blue-800 dark:text-blue-300 sm:text-2xl">
                  {primaryEducation.field}
                </p>
              </StatCard>

              <StatCard touch={touch} outerClassName="col-span-2" className={statCard}>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className={statLabel}>Cumulative GPA</p>
                    <p className="mt-2 text-2xl font-bold leading-none text-blue-800 dark:text-blue-300 sm:text-3xl">
                      {gpaValue !== undefined ? (
                        <CountUp value={gpaValue} decimals={2} suffix="/4.00" />
                      ) : (
                        gpa ?? "-"
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 sm:text-[9px]">
                    {graduationYear}
                  </span>
                </div>
                {gpaValue !== undefined && (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-900 to-blue-500"
                      style={{ width: `${Math.min(100, (gpaValue / 4) * 100)}%` }}
                    />
                  </div>
                )}
              </StatCard>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}