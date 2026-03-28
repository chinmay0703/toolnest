"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs?: FAQ[];
}

const defaultFAQs: FAQ[] = [
  {
    question: "Why can't I just use ChatGPT for this?",
    answer:
      "ChatGPT can describe how to do it, but it can't actually process your files. ToolNest runs everything directly in your browser with real file processing — no AI hallucinations, no uploads, just results.",
  },
];

export function FAQSection({ faqs = [] }: FAQSectionProps) {
  const allFaqs = [
    ...faqs,
    ...defaultFAQs.filter(
      (d) => !faqs.some((f) => f.question === d.question)
    ),
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold font-heading text-text-primary mb-6">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {allFaqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl bg-bg-card border border-border overflow-hidden"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
            >
              <span className="font-medium text-text-primary pr-4">
                {faq.question}
              </span>
              {openIndex === index ? (
                <Minus className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <Plus className="w-5 h-5 text-text-muted shrink-0" />
              )}
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
