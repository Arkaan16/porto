"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.05 },
  },
};

const wordVariant: Variants = {
  hidden: { opacity: 0, y: "0.65em", rotate: 2 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const descriptionVariant: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.15 },
  },
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const reduced = useReducedMotion();
  const words = title.split(" ");
  const isCenter = align === "center";

  return (
    <motion.div
      initial={reduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={container}
      className={`${isCenter ? "text-center mx-auto items-center" : "text-left items-start"} flex flex-col ${className}`}
    >
      <motion.span
        variants={descriptionVariant}
        className="font-mono text-[11px] sm:text-xs font-medium uppercase tracking-[0.22em] text-blue-700 dark:text-blue-400 mb-3"
      >
        {eyebrow}
      </motion.span>

      <h2
        aria-label={title}
        className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-[1.1] ${
          isCenter ? "max-w-2xl" : ""
        }`}
      >
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              aria-hidden
              variants={wordVariant}
              className="inline-block will-change-transform"
            >
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </h2>

      {description && (
        <motion.p
          variants={descriptionVariant}
          className={`mt-4 text-base text-zinc-600 dark:text-zinc-300 leading-relaxed ${
            isCenter ? "max-w-xl" : "max-w-2xl"
          }`}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
