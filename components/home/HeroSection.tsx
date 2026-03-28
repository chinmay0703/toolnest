"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { searchTools, type Tool } from "@/lib/tools";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowResults(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(searchTools(query).slice(0, 8));
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  return (
    <section className="relative overflow-hidden gradient-mesh grid-pattern min-h-[90vh] flex items-center">
      {/* Floating orbs */}
      <div className="orb orb-purple w-[300px] h-[300px] top-[10%] left-[10%]" />
      <div className="orb orb-cyan w-[200px] h-[200px] top-[60%] right-[15%]" style={{ animationDelay: "2s" }} />
      <div className="orb orb-purple w-[150px] h-[150px] bottom-[20%] left-[40%]" style={{ animationDelay: "4s" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-text-secondary bg-bg-card/80 border border-purple-500/30">
            🚀 453+ Tools • No Signup • 100% Free • Your Files Stay Private
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 text-4xl sm:text-5xl md:text-7xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          <span className="gradient-text">What AI Can Only Talk About</span>
          <br />
          <span className="text-text-primary">We Actually Do It.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          453+ free tools for PDF, Image, Video, Code & more.
          <br className="hidden sm:block" />
          No signup. No uploads. Runs 100% in your browser.
          <br className="hidden sm:block" />
          Your files never leave your device — ever.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 relative max-w-2xl mx-auto"
        >
          <div className="relative glass rounded-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length > 0 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder='Search 453+ tools... (Press "/" to focus)'
              className="w-full bg-transparent pl-14 pr-20 py-4 sm:py-5 text-lg text-text-primary placeholder:text-text-muted outline-none"
            />
            <kbd className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-text-muted bg-bg-card px-2 py-1 rounded border border-border">
              /
            </kbd>
          </div>

          {/* Search results dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute w-full mt-2 glass rounded-xl overflow-hidden z-50">
              {results.map((tool) => (
                <Link
                  key={tool.id + tool.category}
                  href={tool.url}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-bg-card-hover transition-colors"
                >
                  <span className="text-2xl">{tool.emoji}</span>
                  <div>
                    <div className="text-text-primary font-medium">{tool.name}</div>
                    <div className="text-text-muted text-sm">{tool.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="#tools"
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ background: "var(--gradient-primary)" }}
          >
            Explore All Tools
          </Link>
          <Link
            href="/pdf"
            className="px-8 py-3 rounded-xl font-semibold text-text-primary border border-border hover:border-primary transition-all duration-300 hover:scale-105"
          >
            PDF Tools →
          </Link>
          <Link
            href="/developer"
            className="px-8 py-3 rounded-xl font-semibold text-text-primary border border-border hover:border-primary transition-all duration-300 hover:scale-105"
          >
            Developer Tools →
          </Link>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-text-muted"
        >
          <span>🔒 Files Never Uploaded</span>
          <span className="hidden sm:inline">|</span>
          <span>⚡ Instant Results</span>
          <span className="hidden sm:inline">|</span>
          <span>✅ No Signup Ever</span>
          <span className="hidden sm:inline">|</span>
          <span>📱 Works on Mobile</span>
        </motion.div>
      </div>
    </section>
  );
}
