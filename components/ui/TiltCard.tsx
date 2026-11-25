"use client";

import {
  useEffect,
  useRef,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { usePerformanceMode } from "./usePerformanceMode";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  outerClassName?: string;
  max?: number;
  glare?: boolean;
}

export default function TiltCard({
  children,
  className = "",
  outerClassName = "",
  max = 8,
  glare = true,
}: TiltCardProps) {
  const reduced = useReducedMotion();
  const { lite } = usePerformanceMode();
  const ref = useRef<HTMLDivElement>(null);
  const finePointerRef = useRef(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 200, damping: 26 });
  const springY = useSpring(pointerY, { stiffness: 200, damping: 26 });

  const rotateX = useTransform(springY, [0, 1], [max, -max]);
  const rotateY = useTransform(springX, [0, 1], [-max, max]);
  const glareX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(springY, [0, 1], ["0%", "100%"]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(37 99 235 / 0.25), transparent 55%)`;

  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    finePointerRef.current = query.matches;
    const onChange = () => {
      finePointerRef.current = query.matches;
    };
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (lite || reduced || !finePointerRef.current || event.pointerType === "touch") {
      return;
    }

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    pendingRef.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };

    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      pointerX.set(pendingRef.current.x);
      pointerY.set(pendingRef.current.y);
    });
  };

  const handlePointerLeave = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const tiltDisabled = lite || reduced;

  return (
    <div className={`[perspective:1000px] ${outerClassName}`}>
      <motion.div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`group relative ${className}`}
        style={
          tiltDisabled
            ? undefined
            : {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }
        }
      >
        {children}
        {glare && !tiltDisabled && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glareBackground }}
          />
        )}
      </motion.div>
    </div>
  );
}
