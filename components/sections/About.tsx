"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { profile } from "@/data/profile";

export default function About() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-12 text-center"
        >
          About Me
        </motion.h2>

        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="shrink-0"
          >
            <div className="relative w-56 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden ring-4 ring-blue-900/20 dark:ring-blue-400/30">
              <Image
                src={profile.aboutImage}
                alt={profile.name}
                fill
                className="object-cover"
                preload
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-3 px-3">
                <span className="text-white text-xs font-bold uppercase tracking-wider bg-blue-600 px-2.5 py-1 rounded-md">
                  Fresh Graduate
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex-1"
          >
            <p className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2">
              {profile.role}
            </p>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 leading-tight">
              Hi, I&apos;m {profile.name.split(" ")[0]}!
            </h3>
            <p className="text-base text-zinc-600 dark:text-zinc-400 font-medium italic border-l-4 border-blue-700 dark:border-blue-400 pl-4 mb-4">
              &ldquo;{profile.tagline}&rdquo;
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {profile.description}
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">2026</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Graduated</p>
              </div>
              <div className="w-px bg-zinc-300 dark:bg-zinc-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">Computer Science</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Major</p>
              </div>
              <div className="w-px bg-zinc-300 dark:bg-zinc-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">GPA 3.91/4.00</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Cumulative</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
