"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { usePerformanceMode } from "./usePerformanceMode";

type RevealVariant = "fade-up" | "fade-left" | "fade-right" | "zoom" | "blur-in";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  once?: boolean;
}

const variants: Record<RevealVariant, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
  "blur-in": {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  },
};

const liteVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion();
  const { lite } = usePerformanceMode();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px", amount: 0.2 }}
      variants={lite ? liteVariants : variants[variant]}
      transition={{ duration: lite ? 0.3 : 0.55, delay: lite ? 0 : delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
