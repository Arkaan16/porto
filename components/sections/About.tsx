"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { education, profile } from "@/data/profile";
import Lanyard from "@/components/ui/Lanyard";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";

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
    <span ref={ref} className={className}>
      {`${value.toFixed(decimals)}${suffix}`}
    </span>
  );
}

export default function About() {
  const primaryEducation = education[0];
  const graduationYear =
    primaryEducation.period.split(" - ").at(-1) ?? primaryEducation.period;
  const graduationYearValue = Number.parseInt(graduationYear, 10);
  const gpa = "gpa" in primaryEducation ? primaryEducation.gpa : undefined;
  const gpaValue = gpa ? Number.parseFloat(gpa) : undefined;

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-zinc-50 px-4 py-24 dark:bg-zinc-900/50"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-12 h-72 w-72 animate-spin-slow rounded-full border border-blue-300/50 motion-reduce:animate-none dark:border-blue-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-12 right-8 grid grid-cols-4 gap-2 opacity-50"
      >
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            className="h-1 w-1 rounded-full bg-blue-400/70 dark:bg-blue-300/30"
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-10">
        <div className="relative flex justify-center lg:-mt-12 lg:justify-start">
          <Lanyard
            imageSrc={profile.aboutImage}
            name={profile.name}
            role={profile.role}
            idText={`ID • ${graduationYear}`}
          />
        </div>

        <div className="lg:pt-6">
          <Reveal variant="fade-right">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-blue-700 dark:text-blue-400">
              01 / About
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl md:text-5xl">
              Hi, I&apos;m{" "}
              <span className="text-gradient">{profile.nickname}</span>!
            </h2>
          </Reveal>

          <Reveal variant="fade-right" delay={0.08}>
            <blockquote className="mt-5 border-l-4 border-blue-700 pl-4 text-sm italic text-zinc-600 dark:border-blue-400 dark:text-zinc-300 sm:text-base">
              &ldquo;{profile.tagline}&rdquo;
            </blockquote>

            <p className="mt-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
              {profile.description}
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={0.14}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              <TiltCard
                max={6}
                className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm shadow-blue-950/5 dark:border-zinc-700/60 dark:bg-zinc-900/70"
              >
                <p className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                  Graduated
                </p>
                <p className="mt-2 text-2xl font-bold leading-none text-blue-800 dark:text-blue-300 sm:text-3xl">
                  {Number.isFinite(graduationYearValue) ? (
                    <CountUp value={graduationYearValue} />
                  ) : (
                    graduationYear
                  )}
                </p>
              </TiltCard>

              <TiltCard
                max={6}
                className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm shadow-blue-950/5 dark:border-zinc-700/60 dark:bg-zinc-900/70"
              >
                <p className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                  Major
                </p>
                <p className="mt-2 text-lg font-bold leading-tight text-blue-800 dark:text-blue-300 sm:text-2xl">
                  {primaryEducation.field}
                </p>
              </TiltCard>

              <TiltCard
                max={6}
                outerClassName="col-span-2"
                className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm shadow-blue-950/5 dark:border-zinc-700/60 dark:bg-zinc-900/70"
              >
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                      Cumulative GPA
                    </p>
                    <p className="mt-2 text-2xl font-bold leading-none text-blue-800 dark:text-blue-300 sm:text-3xl">
                      {gpaValue !== undefined ? (
                        <CountUp value={gpaValue} decimals={2} suffix="/4.00" />
                      ) : (
                        gpa ?? "-"
                      )}
                    </p>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
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
              </TiltCard>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
