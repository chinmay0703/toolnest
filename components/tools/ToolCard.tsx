"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Tool } from "@/lib/tools";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={tool.url}>
      <motion.div
        className="group relative rounded-xl bg-bg-card border border-border p-6 transition-colors duration-300 h-full flex flex-col"
        whileHover={{
          scale: 1.03,
          borderColor: "#7C3AED",
          boxShadow: "0 8px 32px rgba(124, 58, 237, 0.15)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex items-start justify-between mb-4">
          <CategoryIcon emoji={tool.emoji} size="lg" />
          <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-2">
          {tool.name}
        </h3>

        <p className="text-sm text-text-secondary mb-4 flex-1">
          {tool.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {tool.popular && <Badge variant="popular">Popular</Badge>}
          {tool.isNew && <Badge variant="new">New</Badge>}
          {tool.llmCantDo && (
            <Badge variant="aiCantDo">AI Can&apos;t Do This</Badge>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
