"use client";

import { motion } from "framer-motion";
import { ToolCard } from "@/components/tools/ToolCard";
import type { Tool } from "@/lib/tools";

interface ToolGridProps {
  tools: Tool[];
  columns?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ToolGrid({ tools }: ToolGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {tools.map((tool) => (
        <motion.div key={tool.id} variants={item}>
          <ToolCard tool={tool} />
        </motion.div>
      ))}
    </motion.div>
  );
}
