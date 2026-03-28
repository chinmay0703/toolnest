"use client";

import { motion } from "framer-motion";
import { Lock, Zap, Shield, Smartphone } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Your Files Stay Private",
    description: "Everything runs in your browser. We never see your files. Ever.",
    color: "#7C3AED",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "No waiting for uploads. No server processing. Just instant.",
    color: "#06B6D4",
  },
  {
    icon: Shield,
    title: "AI Cannot Replace This",
    description: "Real file processing that AI chatbots can simply never do.",
    color: "#10B981",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description: "Desktop, tablet, mobile. Even works offline.",
    color: "#F59E0B",
  },
];

export function WhyToolNest() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-bg-base">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-center mb-12"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          <span className="gradient-text">Why ToolNest?</span>
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glow-card rounded-2xl p-6 text-center"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
