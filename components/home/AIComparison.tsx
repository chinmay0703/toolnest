"use client";

import { motion } from "framer-motion";
import { X, Check, FileDown, MessageSquare } from "lucide-react";

export function AIComparison() {
  const aiCantDo = [
    "AI cannot touch your real files",
    "AI cannot access your camera",
    "AI cannot run in real-time",
    "AI cannot generate downloadable files",
    "AI cannot keep your data private",
  ];

  return (
    <section className="py-20 px-4 sm:px-6 bg-bg-base">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          <span className="gradient-text">Why Not Just Use ChatGPT or Claude?</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* AI Says */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 sm:p-8 border border-danger/30 bg-danger/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-danger" />
              <h3 className="text-xl font-bold text-danger">What AI Says</h3>
            </div>
            <div className="bg-bg-card rounded-xl p-5 mb-4 border border-border">
              <p className="text-text-secondary italic">
                &ldquo;I can help you compress your PDF! Here are some websites you can use...&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-2 text-danger">
              <X className="w-5 h-5" />
              <span className="font-semibold">AI can only give advice</span>
            </div>
          </motion.div>

          {/* ToolNest Does */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 sm:p-8 border border-success/30 bg-success/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileDown className="w-6 h-6 text-success" />
              <h3 className="text-xl font-bold text-success">What ToolNest Does</h3>
            </div>
            <div className="bg-bg-card rounded-xl p-5 mb-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-text-primary font-medium">Your PDF is compressed.</p>
                  <p className="text-success text-sm">⬇ Download Now — 68% smaller</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-success">
              <Check className="w-5 h-5" />
              <span className="font-semibold">We actually do it</span>
            </div>
          </motion.div>
        </div>

        {/* AI limitations list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {aiCantDo.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-card border border-border"
            >
              <X className="w-4 h-4 text-danger shrink-0" />
              <span className="text-text-secondary text-sm">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
