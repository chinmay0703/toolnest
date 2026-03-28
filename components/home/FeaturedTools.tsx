"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { getToolsByCategory, type Tool } from "@/lib/tools";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { CategoryPills } from "./CategoryPills";

function ToolCardCompact({ tool }: { tool: Tool }) {
  return (
    <Link href={tool.url}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="glow-card rounded-xl p-4 flex items-center gap-4 cursor-pointer group"
      >
        <span className="text-3xl shrink-0">{tool.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-text-primary font-semibold truncate">{tool.name}</h3>
            {tool.popular && (
              <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                🔥
              </span>
            )}
            {tool.isNew && (
              <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                ✨
              </span>
            )}
          </div>
          <p className="text-text-muted text-sm truncate">{tool.description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
      </motion.div>
    </Link>
  );
}

export function FeaturedTools() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoriesToShow = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories;

  return (
    <section id="tools" className="py-16 px-4 sm:px-6 bg-bg-base">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          <span className="gradient-text">All Tools</span>
        </motion.h2>
        <p className="text-text-secondary text-center mb-8">
          453+ tools organized by category. Click any tool to get started.
        </p>

        <CategoryPills activeCategory={activeCategory ?? undefined} onSelect={setActiveCategory} />

        <div className="mt-8 space-y-12">
          {categoriesToShow.map((cat) => {
            const catTools = getToolsByCategory(cat.id);
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <span className="text-2xl">{cat.emoji}</span>
                    {cat.name}
                    <span className="text-sm text-text-muted font-normal">({catTools.length})</span>
                  </h3>
                  <Link
                    href={`/${cat.id}`}
                    className="text-sm text-primary-light hover:text-primary transition-colors flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {catTools.slice(0, 8).map((tool, i) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ToolCardCompact tool={tool} />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
