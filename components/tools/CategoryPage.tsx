"use client";

import { motion } from "framer-motion";
import { ToolCard } from "@/components/tools/ToolCard";
import { AdSlot } from "@/components/ui/AdSlot";
import { getToolsByCategory, type Tool } from "@/lib/tools";
import type { Category } from "@/lib/categories";

interface CategoryPageProps {
  category: Category;
}

export function CategoryPageContent({ category }: CategoryPageProps) {
  const tools = getToolsByCategory(category.id);

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-6xl mb-4 block">{category.emoji}</span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            <span className="gradient-text">Free {category.name} Online</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {category.description}. No signup required. Runs 100% in your browser.
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm text-text-muted">
            <span>🔒 100% Private</span>
            <span>⚡ Instant</span>
            <span>✅ Free Forever</span>
          </div>
        </motion.div>

        <AdSlot position="top" />

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
            >
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </div>

        <AdSlot position="middle" className="mt-12" />

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2
            className="text-2xl font-bold text-text-primary mb-6"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `Are these ${category.name.toLowerCase()} really free?`,
                a: `Yes, all ${tools.length} ${category.name.toLowerCase()} are 100% free with no hidden limits, no watermarks, and no signup required.`,
              },
              {
                q: "Are my files safe and private?",
                a: "Absolutely. Everything runs in your browser. Your files never leave your device. We never see, store, or upload your data.",
              },
              {
                q: "Do these work on mobile?",
                a: "Yes! All tools work on Chrome, Firefox, Safari, and Edge on desktop, tablet, and mobile devices.",
              },
              {
                q: "Why can't I just use ChatGPT for this?",
                a: "AI chatbots like ChatGPT or Claude can only tell you about tools — they cannot actually process your files. ToolNest does the real work, 100% in your browser, with complete privacy.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group glow-card rounded-xl p-4 cursor-pointer"
              >
                <summary className="flex justify-between items-center font-semibold text-text-primary list-none">
                  {faq.q}
                  <span className="text-text-muted group-open:rotate-45 transition-transform text-xl">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-text-secondary text-sm leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <AdSlot position="bottom" className="mt-12" />
      </div>
    </div>
  );
}
