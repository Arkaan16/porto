"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { usePerformanceMode } from "./usePerformanceMode";

const ROPE_LENGTH = 128;
const ANCHOR_Y = 22;

const buildRopePath = (centerX: number, offsetX: number, offsetY: number) => {
  const endX = centerX + offsetX;
  const endY = ROPE_LENGTH + offsetY;
  const sag = 26 + Math.abs(offsetX) * 0.12;
  return `M ${centerX} ${ANCHOR_Y} C ${centerX} ${sag}, ${endX} ${sag}, ${endX} ${endY}`;
};

interface LanyardProps {
  imageSrc: string;
  name: string;
  role: string;
  badge?: string;
  idText?: string;
  className?: string;
}

export default function Lanyard({
  imageSrc,
  name,
  role,
  badge = "Fresh Graduate",
  idText = "ID • 2026",
  className = "",
}: LanyardProps) {
  const reduced = useReducedMotion();
  const { lite } = usePerformanceMode();
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const gradientId = `lanyard-gradient-${uid}`;
  const metalId = `lanyard-metal-${uid}`;
  const glowId = `lanyard-glow-${uid}`;
  const pathId = `lanyard-path-${uid}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.15 });
  const pathRef = useRef<SVGPathElement>(null);
  const centerXRef = useRef(0);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, baseX: 0, baseY: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const idleSwing = useMotionValue(0);
  const dragRotation = useMotionValue(0);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 140, damping: 18 });
  const springTiltY = useSpring(tiltY, { stiffness: 140, damping: 18 });

  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.65), rgba(37,99,235,0.18) 38%, transparent 62%)`;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        centerXRef.current = rect.width / 2;
        setSize({ width: rect.width, height: rect.height });
      }
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (event: PointerEvent) => {
      const info = dragRef.current;
      const deltaX = event.clientX - info.startX;
      const deltaY = event.clientY - info.startY;

      x.set(info.baseX + deltaX);
      y.set(info.baseY + deltaY);
      dragRotation.set(Math.max(-14, Math.min(14, deltaX * 0.12)));
    };

    const finish = () => {
      setDragging(false);
      animate(x, 0, { type: "spring", stiffness: 42, damping: 10, mass: 1.1 });
      animate(y, 0, { type: "spring", stiffness: 42, damping: 10, mass: 1.1 });
      animate(dragRotation, 0, { type: "spring", stiffness: 70, damping: 14 });
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [dragging, x, y, dragRotation]);

  useEffect(() => {
    if (reduced || lite || !inView) {
      idleSwing.set(0);
      dragRotation.set(0);
      return;
    }

    if (dragging) return;

    const controls = animate(idleSwing, 2.2, {
      duration: 3.8,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    });

    return () => controls.stop();
  }, [inView, lite, reduced, dragging, idleSwing, dragRotation]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || lite) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.pointerType === "mouse") event.preventDefault();

    x.stop();
    y.stop();
    idleSwing.stop();
    dragRotation.stop();

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: x.get(),
      baseY: y.get(),
    };
    idleSwing.set(0);
    setDragging(true);
  };

  const tiltFrameRef = useRef<number | null>(null);
  const tiltPendingRef = useRef({ nx: 0.5, ny: 0.5 });

  useEffect(
    () => () => {
      if (tiltFrameRef.current !== null) cancelAnimationFrame(tiltFrameRef.current);
    },
    [],
  );

  const handleTiltMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || lite || dragging || event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
    tiltPendingRef.current = {
      nx: (event.clientX - rect.left) / rect.width,
      ny: (event.clientY - rect.top) / rect.height,
    };

    if (tiltFrameRef.current !== null) return;
    tiltFrameRef.current = requestAnimationFrame(() => {
      tiltFrameRef.current = null;
      const { nx, ny } = tiltPendingRef.current;
      tiltY.set((nx - 0.5) * 10);
      tiltX.set((0.5 - ny) * 8);
      glareX.set(nx * 100);
      glareY.set(ny * 100);
    });
  };

  const resetTilt = () => {
    if (tiltFrameRef.current !== null) {
      cancelAnimationFrame(tiltFrameRef.current);
      tiltFrameRef.current = null;
    }
    tiltX.set(0);
    tiltY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  const centerX = size.width > 0 ? size.width / 2 : 0;
  const ropeD = buildRopePath(centerX, x.get(), y.get());

  const updateRope = (offsetX: number, offsetY: number) => {
    pathRef.current?.setAttribute(
      "d",
      buildRopePath(centerXRef.current, offsetX, offsetY),
    );
  };

  useMotionValueEvent(x, "change", (latest) => updateRope(latest, y.get()));
  useMotionValueEvent(y, "change", (latest) => updateRope(x.get(), latest));

  const shadowX = useTransform(x, (latest) => latest * -0.28);
  const shadowY = useTransform(y, (latest) => latest * -0.12 + 10);

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto h-[35rem] w-full max-w-sm sm:h-[41rem] ${className}`}
    >
      {size.width > 0 && (
        <svg
          aria-hidden
          viewBox={`0 0 ${size.width} ${size.height}`}
          fill="none"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2={size.width}
              y2={ROPE_LENGTH}
            >
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="45%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
            <linearGradient id={metalId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fafafa" />
              <stop offset="45%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#3f3f46" />
            </linearGradient>
            <radialGradient id={glowId}>
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path ref={pathRef} id={pathId} d={ropeD} fill="none" />
          <use
            href={`#${pathId}`}
            stroke="rgba(15,23,42,0.16)"
            strokeWidth="19"
            strokeLinecap="round"
          />
          <use
            href={`#${pathId}`}
            stroke={`url(#${gradientId})`}
            strokeWidth="13"
            strokeLinecap="round"
          />
          <use
            href={`#${pathId}`}
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.5"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />

          <g>
            <circle
              cx={centerX}
              cy={ANCHOR_Y}
              r="18"
              fill={`url(#${glowId})`}
            />
            <circle
              cx={centerX}
              cy={ANCHOR_Y}
              r="15"
              fill="none"
              stroke="rgba(96,165,250,0.4)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <rect
              x={centerX - 13}
              y={0}
              width="26"
              height="11"
              rx="5.5"
              fill={`url(#${metalId})`}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1"
            />
            <circle
              cx={centerX - 8}
              cy="5.5"
              r="1.6"
              fill="rgba(24,24,27,0.55)"
            />
            <circle
              cx={centerX + 8}
              cy="5.5"
              r="1.6"
              fill="rgba(24,24,27,0.55)"
            />
            <circle
              cx={centerX}
              cy={ANCHOR_Y}
              r="11"
              fill="#18181b"
              stroke={`url(#${metalId})`}
              strokeWidth="3"
            />
            <circle
              cx={centerX}
              cy={ANCHOR_Y}
              r="6"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2.5"
            />
            <circle cx={centerX} cy={ANCHOR_Y} r="2.2" fill="#dbeafe" />
          </g>

          <text
            fill="rgba(255,255,255,0.85)"
            fontSize="7"
            letterSpacing="2"
            className="font-mono"
          >
            <textPath href={`#${pathId}`} startOffset="12%">
              ARKAAN • PORTFOLIO • ARKAAN • PORTFOLIO •
            </textPath>
          </text>
        </svg>
      )}

      <div
        className="absolute left-1/2 z-10 w-60 -translate-x-1/2 sm:w-72"
        style={{ top: ROPE_LENGTH }}
      >
        <motion.div style={{ x, y }} className="relative origin-top">
          <motion.div
            aria-hidden
            className={`absolute inset-x-10 -bottom-4 h-10 rounded-[50%] bg-zinc-900/25 blur-2xl transition-opacity duration-300 dark:bg-black/60 ${
              dragging ? "opacity-80" : "opacity-50"
            }`}
            style={{ x: shadowX, y: shadowY }}
          />

          <motion.div style={{ rotate: idleSwing }} className="origin-top">
            <motion.div style={{ rotate: dragRotation }} className="origin-top">
              <div className="[perspective:1200px]">
                <motion.div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handleTiltMove}
                  onPointerLeave={resetTilt}
                  style={
                    reduced || lite
                      ? undefined
                      : {
                          rotateX: springTiltX,
                          rotateY: springTiltY,
                          transformStyle: "preserve-3d",
                        }
                  }
                  className={`group relative origin-top touch-pan-y select-none ${
                    dragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 p-3 shadow-[0_28px_65px_-24px_rgba(15,23,42,0.6)] dark:border-white/10 dark:bg-zinc-900/90">
                    <div className="absolute left-1/2 top-2.5 h-2 w-12 -translate-x-1/2 rounded-full bg-zinc-900/80 dark:bg-zinc-100/80">
                      <div className="absolute inset-[2px] rounded-full bg-zinc-700/50 dark:bg-zinc-400/50" />
                    </div>
                    <div className="absolute -top-2 left-1/2 h-5 w-7 -translate-x-1/2 rounded-full border border-white/80 bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-500 shadow-sm dark:border-white/40 dark:from-zinc-500 dark:via-zinc-400 dark:to-zinc-700" />

                    <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-zinc-900/10 dark:ring-white/10">
                      <div className="relative aspect-[4/5] bg-zinc-200 dark:bg-zinc-800">
                        <Image
                          src={imageSrc}
                          alt={name}
                          fill
                          sizes="(max-width: 640px) 15rem, 18rem"
                          className="object-cover"
                          draggable={false}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    </div>

                    <div className="px-1 pb-1 pt-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                            {name}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                            {role}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-blue-600 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm dark:bg-blue-500">
                          {badge}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-mono text-[9px] tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                          {idText}
                        </span>
                        <span className={`relative h-4 w-14 overflow-hidden rounded-sm bg-[linear-gradient(110deg,#1e3a8a,#60a5fa,#bfdbfe,#2563eb,#1e3a8a)] bg-[length:250%_100%] motion-reduce:animate-none ${lite ? "" : "animate-shimmer"}`}>
                          <span className="absolute inset-0 flex items-center justify-center font-mono text-[6px] font-bold tracking-[0.2em] text-white/80">
                            SECURE
                          </span>
                        </span>
                      </div>
                    </div>

                    {!reduced && !lite && (
                      <motion.div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: glareBackground }}
                      />
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
