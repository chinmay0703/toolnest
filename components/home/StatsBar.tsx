"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-bold gradient-text">
      {count}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  const stats = [
    { value: 453, suffix: "+", label: "Tools" },
    { value: 0, suffix: "", label: "Signups Required" },
    { value: 100, suffix: "%", label: "Browser Based" },
    { value: 0, suffix: "", label: "Files Uploaded" },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 border-y border-border bg-bg-card/50">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <AnimatedNumber target={stat.value} suffix={stat.suffix} />
            <div className="mt-2 text-text-muted text-sm">{stat.label}</div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center col-span-2 md:col-span-4 lg:hidden"
        >
          <span className="text-3xl sm:text-4xl font-bold gradient-text">∞</span>
          <div className="mt-2 text-text-muted text-sm">Free Forever</div>
        </motion.div>
      </div>
    </section>
  );
}
