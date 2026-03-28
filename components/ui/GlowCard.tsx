"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlowCard({ children, className = "", onClick }: GlowCardProps) {
  return (
    <motion.div
      className={`rounded-xl bg-bg-card border border-border p-6 transition-colors duration-300 cursor-pointer ${className}`}
      whileHover={{
        scale: 1.03,
        borderColor: "#7C3AED",
        boxShadow: "0 8px 32px rgba(124, 58, 237, 0.15)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
