"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AdSlot } from "@/components/ui/AdSlot";
import { PrivacyBadge } from "@/components/tools/PrivacyBadge";
import { FAQSection } from "@/components/tools/FAQSection";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { HowToUse } from "@/components/tools/HowToUse";
import type { Tool } from "@/lib/tools";
import type { Category } from "@/lib/categories";
import dynamic from "next/dynamic";

// Dynamically import tool implementations
const TextToolEngine = dynamic(() => import("./engines/TextToolEngine").then((m) => m.default), { ssr: false });
const CalculatorToolEngine = dynamic(() => import("./engines/CalculatorToolEngine").then((m) => m.default), { ssr: false });
const DevToolEngine = dynamic(() => import("./engines/DevToolEngine").then((m) => m.default), { ssr: false });
const FileToolEngine = dynamic(() => import("./engines/FileToolEngine").then((m) => m.default), { ssr: false });
const GeneratorToolEngine = dynamic(() => import("./engines/GeneratorToolEngine").then((m) => m.default), { ssr: false });
const InteractiveToolEngine = dynamic(() => import("./engines/InteractiveToolEngine").then((m) => m.default), { ssr: false });

interface GenericToolPageProps {
  tool: Tool;
  category: Category;
}

function getToolEngine(tool: Tool) {
  // Text tools
  if (tool.category === "text" || ["find-replace", "text-diff", "diff-checker"].includes(tool.id)) {
    return <TextToolEngine tool={tool} />;
  }
  // Calculator tools
  if (tool.category === "calculators" || tool.category === "finance" || ["meeting-cost-calculator", "bmi-calculator-health", "heart-rate-calculator", "due-date-calculator", "sleep-calculator"].includes(tool.id)) {
    return <CalculatorToolEngine tool={tool} />;
  }
  // Developer tools (formatters, encoders, generators)
  if (tool.category === "developer" || tool.category === "security" || tool.category === "writing" || tool.category === "social") {
    return <DevToolEngine tool={tool} />;
  }
  // File tools (PDF, image, data, media)
  if (["pdf", "image", "data", "media", "camera"].includes(tool.category)) {
    return <FileToolEngine tool={tool} />;
  }
  // Interactive tools (productivity, design, fun, health, education)
  if (["productivity", "design", "fun", "health", "education"].includes(tool.category)) {
    return <InteractiveToolEngine tool={tool} />;
  }
  // Fallback
  return <DevToolEngine tool={tool} />;
}

export function GenericToolPage({ tool, category }: GenericToolPageProps) {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: category.name, href: `/${category.id}` },
    { label: tool.name },
  ];

  const defaultFaqs = [
    { question: `Is ${tool.name} really free?`, answer: `Yes, ${tool.name} is 100% free with no hidden limits, no watermarks, and no signup required.` },
    { question: "Is my file safe and private?", answer: "Absolutely. Everything runs in your browser. Your files never leave your device. We never see, store, or upload your data." },
    { question: "Does this work on mobile?", answer: "Yes! This tool works on Chrome, Firefox, Safari, and Edge on desktop, tablet, and mobile devices." },
    { question: "Do I need to create an account?", answer: "No. No signup, no email, no account needed. Just open the tool and start using it immediately." },
    { question: "Why can't I just use ChatGPT for this?", answer: "AI chatbots like ChatGPT or Claude can only tell you about tools — they cannot actually process your files. ToolNest does the real work, 100% in your browser, with complete privacy." },
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={breadcrumbs} />

        {/* Tool Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-8 mb-8"
        >
          <span className="text-6xl block mb-4">{tool.emoji}</span>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            <span className="gradient-text">{tool.name} Free Online</span>
          </h1>
          <p className="text-text-secondary text-lg mb-4">{tool.description}</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-3 py-1.5 rounded-full bg-bg-card border border-border text-text-secondary">
              🔒 Private — files never uploaded
            </span>
            <span className="px-3 py-1.5 rounded-full bg-bg-card border border-border text-text-secondary">
              ⚡ Instant processing
            </span>
            <span className="px-3 py-1.5 rounded-full bg-bg-card border border-border text-text-secondary">
              ✅ 100% Free, no signup
            </span>
          </div>
          {tool.llmCantDo && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary-light" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)" }}>
              🛡️ Unlike AI chatbots — we actually process your file
            </div>
          )}
        </motion.div>

        <AdSlot position="top" />

        <PrivacyBadge />

        {/* Tool Engine */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          {getToolEngine(tool)}
        </motion.div>

        <AdSlot position="middle" className="mt-10" />

        <HowToUse />

        {/* Features */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-text-primary mb-4" style={{ fontFamily: "var(--font-syne)" }}>
            Features of {tool.name}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "100% free, no hidden limits",
              "Your file never leaves your device",
              "Works on Chrome, Firefox, Safari, Edge",
              "No signup or email required",
              "AI chatbots cannot do this — we can",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-text-secondary text-sm">
                <span className="text-success">✅</span> {feature}
              </div>
            ))}
          </div>
        </div>

        <FAQSection faqs={defaultFaqs} />

        <RelatedTools category={tool.category} currentToolId={tool.id} />

        <AdSlot position="bottom" className="mt-10" />
      </div>
    </div>
  );
}
