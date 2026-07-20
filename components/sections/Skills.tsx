"use client";

import { motion } from "framer-motion";
import { tools, hardSkills, softSkills } from "@/data/profile";

function ProgressBar({ name, level }: { name: string; level: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{name}</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-500">{level}%</span>
      </div>
      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-blue-900 dark:bg-blue-500 rounded-full"
        />
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-12 text-center"
        >
          Skills
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Hard Skills</h3>
            <div className="space-y-4">
              {hardSkills.map((skill) => (
                <ProgressBar key={skill.name} name={skill.name} level={skill.level} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Soft Skills</h3>
            <div className="flex flex-wrap gap-2">
              {softSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-8 mb-4">Tools</h3>
            <div className="flex flex-wrap gap-3">
              {tools.map((tool) => (
                <span
                  key={tool.name}
                  className="px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-sm font-medium text-blue-800 dark:text-blue-300"
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
