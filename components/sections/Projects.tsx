"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { projects, designProjects } from "@/data/profile";

const tabs = [
  { key: "web", label: "Web" },
  { key: "design", label: "Design" },
];

export default function Projects() {
  const [activeTab, setActiveTab] = useState<"web" | "design">("web");

  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 text-center"
        >
          Projects
        </motion.h2>

        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "web" | "design")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-900 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "web" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{project.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        Demo &rarr;
                      </a>
                    )}
                    {project.sourceUrl && (
                      <a
                        href={project.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:underline"
                      >
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap -m-1.5 md:-m-2">
            {designProjects.map((item) => {
              const isWide = item.span === "col-span-2";
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={`p-1.5 md:p-2 shrink-0 ${
                    isWide
                      ? "w-full sm:w-2/3 md:w-1/2"
                      : "w-1/2 sm:w-1/3 md:w-1/4"
                  }`}
                >
                  <div className="rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 group cursor-pointer">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={0}
                      height={0}
                      sizes={
                        isWide
                          ? "(max-width: 640px) 100vw, (max-width: 768px) 66vw, 50vw"
                          : "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      }
                      className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
