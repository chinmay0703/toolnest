"use client";

import { motion } from "framer-motion";
import { categories } from "@/lib/categories";
import Link from "next/link";

interface CategoryPillsProps {
  activeCategory?: string;
  onSelect?: (id: string | null) => void;
}

export function CategoryPills({ activeCategory, onSelect }: CategoryPillsProps) {
  return (
    <div className="py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-3 overflow-x-auto category-scroll pb-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect?.(null)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              !activeCategory
                ? "text-white"
                : "bg-bg-card border border-border text-text-secondary hover:border-primary"
            }`}
            style={!activeCategory ? { background: "var(--gradient-primary)" } : undefined}
          >
            🌐 All Tools
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect?.(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? "text-white"
                  : "bg-bg-card border border-border text-text-secondary hover:border-primary"
              }`}
              style={activeCategory === cat.id ? { background: "var(--gradient-primary)" } : undefined}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-xs">
                {cat.toolCount}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryPillsLinks() {
  return (
    <div className="py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-3 overflow-x-auto category-scroll pb-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.id}`}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-bg-card border border-border text-text-secondary hover:border-primary transition-all duration-300"
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-xs">
                {cat.toolCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
