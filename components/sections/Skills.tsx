"use client";

import {
  useEffect,
  useId,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { hardSkills, softSkills, tools } from "@/data/profile";
import Marquee from "@/components/ui/Marquee";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

type Tool = (typeof tools)[number];

const toolIcons: Record<string, ReactNode> = {
  vscode: (
    <>
      <path d="M16 3 21 6v12l-5 3-7-6-4 3-2-1 6-5-6-5 2-1 4 3z" />
      <path d="m15 8-4 4 4 4" />
    </>
  ),
  git: (
    <>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M6 8.2v4.3a4 4 0 0 0 4 4h5.8" />
      <path d="M6 18h6" />
    </>
  ),
  github: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
    />
  ),
  gitlab: <path fill="currentColor" stroke="none" d="M12 21 4.6 7.4 8 9l4-6 4 6 3.4-1.6z" />,
  postman: (
    <>
      <rect x="3.5" y="6" width="17" height="13" rx="4" />
      <path d="m8.5 12 7-3-2.5 7-2-2z" />
    </>
  ),
  figma: (
    <>
      <circle cx="9" cy="6" r="3" />
      <circle cx="15" cy="6" r="3" />
      <circle cx="9" cy="12" r="3" />
      <circle cx="15" cy="12" r="3" />
      <path d="M9 15v3a3 3 0 0 0 6 0v-3z" />
    </>
  ),
  adobephotoshop: (
    <text
      x="12"
      y="16"
      fill="currentColor"
      stroke="none"
      textAnchor="middle"
      fontSize="10"
      fontWeight="700"
      fontFamily="sans-serif"
    >
      Ps
    </text>
  ),
  canva: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15 8.5a4.5 4.5 0 1 0 0 7" />
    </>
  ),
  laragon: (
    <>
      <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" />
      <text
        x="12"
        y="16"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        L
      </text>
    </>
  ),
  vercel: <path fill="currentColor" stroke="none" d="M12 3 22 20H2z" />,
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function hueFromIcon(icon: string) {
  return [...icon].reduce((total, char) => total + char.charCodeAt(0), 0) % 360;
}

function SectionLabel({ index, title, hint }: { index: string; title: string; hint: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
          {index}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
          {title}
        </h3>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{hint}</p>
    </div>
  );
}

function SkillRing({
  skill,
  index,
}: {
  skill: (typeof hardSkills)[number];
  index: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const progress = useMotionValue(0);
  const rawId = useId();
  const gradientId = `ring-${rawId.replace(/:/g, "")}`;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = useTransform(
    progress,
    (value) => circumference * (1 - value / 100),
  );
  const label = useTransform(progress, (value) => `${Math.round(value)}%`);

  useEffect(() => {
    if (reduced) {
      progress.set(skill.level);
      return;
    }

    if (!inView) return;

    const controls = animate(progress, skill.level, {
      duration: 1.05,
      delay: index * 0.04,
      ease: [0.22, 1, 0.36, 1] as const,
    });

    return () => controls.stop();
  }, [inView, index, progress, reduced, skill.level]);

  return (
    <Reveal
      variant="zoom"
      delay={Math.min(index * 0.05, 0.28)}
      className="h-full"
    >
      <motion.div
        ref={ref}
        whileHover={reduced ? undefined : { y: -6 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="glass group/skill relative flex h-full min-h-[13rem] flex-col items-center justify-center overflow-hidden rounded-3xl p-5 text-center shadow-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-blue-500/10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/20 opacity-0 transition-opacity duration-500 group-hover/skill:opacity-100"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover/skill:opacity-100"
        />

        <div className="relative transition-transform duration-500 group-hover/skill:rotate-6 motion-reduce:transition-none">
          <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90" aria-hidden>
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="55%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="8"
              className="stroke-zinc-200 dark:stroke-zinc-700"
            />
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              stroke={`url(#${gradientId})`}
              strokeDasharray={circumference}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          <motion.span className="absolute inset-0 grid place-items-center font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {label}
          </motion.span>
        </div>

        <p className="relative mt-3 font-display text-sm font-bold leading-snug text-zinc-800 dark:text-zinc-100 sm:text-base">
          {skill.name}
        </p>
        <p className="relative mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600 dark:text-zinc-300">
          Proficiency
        </p>
      </motion.div>
    </Reveal>
  );
}

function SoftSkillChip({ skill }: { skill: string }) {
  return (
    <span className="glass inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm dark:text-zinc-200">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
      {skill}
    </span>
  );
}

function ToolGlyph({ tool }: { tool: Tool }) {
  const glyph = toolIcons[tool.icon];

  if (glyph) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="h-7 w-7 text-blue-800 dark:text-blue-300"
      >
        {glyph}
      </svg>
    );
  }

  const hue = hueFromIcon(tool.icon);

  return (
    <span
      aria-hidden
      className="grid h-9 w-9 place-items-center rounded-full font-display text-xs font-bold text-white shadow-md"
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 78% 55%), hsl(${(hue + 48) % 360} 82% 42%))`,
      }}
    >
      {getInitials(tool.name)}
    </span>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 18 });
  const springY = useSpring(y, { stiffness: 240, damping: 18 });
  const springRotateX = useSpring(rotateX, { stiffness: 220, damping: 18 });
  const springRotateY = useSpring(rotateY, { stiffness: 220, damping: 18 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    x.set(px * 12);
    y.set(py * 12);
    rotateY.set(px * 10);
    rotateX.set(-py * 10);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div className="shrink-0 [perspective:800px]">
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={reset}
        style={
          reduced
            ? undefined
            : {
                x: springX,
                y: springY,
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformStyle: "preserve-3d" as const,
              }
        }
        className="glass group/tool flex w-40 shrink-0 items-center gap-3 rounded-2xl px-4 py-3 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 sm:w-44 dark:hover:border-blue-500/40 dark:hover:shadow-blue-500/10"
      >
        <ToolGlyph tool={tool} />
        <span className="text-xs font-semibold leading-tight text-zinc-700 dark:text-zinc-200">
          {tool.name}
        </span>
      </motion.div>
    </div>
  );
}

function ToolOrbit() {
  return (
    <div className="pointer-events-none absolute -right-40 top-10 hidden h-[34rem] w-[34rem] lg:block">
      <div className="absolute inset-0 rounded-full border border-blue-200/50 dark:border-blue-400/10" />
      <div className="absolute inset-16 rounded-full border border-dashed border-blue-300/50 dark:border-blue-400/10" />
      <div className="absolute inset-32 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-700/10 blur-2xl" />
      <div className="absolute inset-0 animate-spin-slow motion-reduce:animate-none">
        {tools.slice(0, 6).map((tool, index) => (
          <div
            key={tool.name}
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{
              transform: `rotate(${(index * 360) / 6}deg) translateY(-15rem)`,
            }}
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
              <div className="w-max animate-spin-slow [animation-direction:reverse] motion-reduce:animate-none">
                <span className="glass block rounded-full px-3 py-1.5 font-mono text-[10px] font-medium text-zinc-600 shadow-sm dark:text-zinc-300">
                  {getInitials(tool.name)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="relative isolate overflow-hidden px-4 py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-zinc-50 to-white dark:from-[#0b1220] dark:via-zinc-950 dark:to-[#081426]" />
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle at 82% 12%, rgba(37,99,235,0.14), transparent 42%), radial-gradient(circle at 10% 86%, rgba(59,130,246,0.12), transparent 46%)",
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage:
              "radial-gradient(circle at 82% 12%, rgba(37,99,235,0.22), transparent 44%), radial-gradient(circle at 10% 86%, rgba(59,130,246,0.18), transparent 48%)",
          }}
        />
        <div className="absolute inset-0 blue-dots opacity-50 dark:opacity-30" />
        <div className="absolute inset-0 grid-bg opacity-15 dark:opacity-10" />
        <div className="absolute inset-0">
          <div className="noise h-full w-full" />
        </div>
        <ToolOrbit />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="04 / Skills"
          title="Skills"
          description="The tools, technologies, and habits I bring into every build."
        />

        <div className="mt-14">
          <Reveal variant="fade-up">
            <SectionLabel
              index="01 / Core"
              title="Hard Skills"
              hint="A snapshot of where I feel most confident."
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {hardSkills.map((skill, index) => (
              <SkillRing key={skill.name} skill={skill} index={index} />
            ))}
          </div>
        </div>

        <div className="mt-16 space-y-4">
          <Reveal variant="fade-up">
            <SectionLabel
              index="02 / People"
              title="Soft Skills"
              hint="The way I work with people and problems."
            />
          </Reveal>
          <Reveal variant="fade-up" delay={0.06}>
            <Marquee direction="left" speed={30} pauseOnHover className="py-1">
              {softSkills.map((skill) => (
                <SoftSkillChip key={skill} skill={skill} />
              ))}
            </Marquee>
          </Reveal>
        </div>

        <div className="mt-16 space-y-4">
          <Reveal variant="fade-up">
            <SectionLabel
              index="03 / Workspace"
              title="Tools"
              hint="The everyday kit I reach for first."
            />
          </Reveal>
          <Reveal variant="fade-up" delay={0.06}>
            <Marquee direction="right" speed={38} pauseOnHover className="py-3">
              {tools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </Marquee>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
