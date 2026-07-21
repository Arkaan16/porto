"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { education, organizations, experience } from "@/data/profile";

const tabs = [
  { key: "education", label: "Education" },
  { key: "organization", label: "Organization" },
  { key: "experience", label: "Experience" },
];

const data = {
  education,
  organization: organizations,
  experience,
} as const;

type TabKey = keyof typeof data;

function TimelineItem({
  title,
  subtitle,
  period,
  description,
  badge,
  index,
}: {
  title: string;
  subtitle: string;
  period: string;
  description?: string;
  badge?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12 }}
      className="flex gap-5 pb-8 last:pb-0"
    >
      {/* Left: timeline line + dot */}
      <div className="relative flex flex-col items-center shrink-0">
        <div className="w-[3px] flex-1 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-200 dark:from-blue-600 dark:via-blue-500 dark:to-blue-900 rounded-full last:hidden" />
        <div className="absolute top-1 w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 ring-[6px] ring-white dark:ring-zinc-950" />
      </div>

      {/* Right: card */}
      <div className="flex-1 min-w-0 bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl p-5 transition-all hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-md">
        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
          {period}
        </span>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">
          {title}
        </h3>

        {badge && (
          <span className="inline-block text-xs font-bold text-white bg-blue-600 px-2.5 py-0.5 rounded-md mt-1.5">
            {badge}
          </span>
        )}

        {subtitle && (
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1.5">
            {subtitle}
          </p>
        )}

        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-2.5">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function Timeline() {
  const [activeTab, setActiveTab] = useState<TabKey>("education");

  const items = data[activeTab].map((item) => {
    if ("institution" in item) {
      const badge =
        "gpa" in item && item.gpa
          ? `GPA: ${item.gpa}/4.00`
          : "score" in item && item.score
            ? `Graduation: ${item.score}/100`
            : undefined;
      return {
        title: item.institution,
        subtitle: `${item.degree} - ${item.field}`,
        period: item.period,
        badge,
      };
    }
    if ("company" in item) {
      return {
        title: item.company,
        subtitle: "",
        period: item.period,
        description: item.description,
        badge: item.role,
      };
    }
    return {
      title: item.name,
      subtitle: "",
      period: item.period,
      description: item.description,
      badge: item.role,
    };
  });

  return (
    <section id="timeline" className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 text-center"
        >
          Journey
        </motion.h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-xl mx-auto mb-8">
          My journey through education, organizations, and professional experience.
        </p>

        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-900 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          {items.map((item, i) => (
            <TimelineItem key={i} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
