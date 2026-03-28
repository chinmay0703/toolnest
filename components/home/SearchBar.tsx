"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { searchTools, type Tool } from "@/lib/tools";

const popularSearches = [
  "compress pdf",
  "jpg to pdf",
  "word counter",
  "json formatter",
  "password generator",
  "qr code",
  "image resize",
  "base64",
];

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(searchTools(query).slice(0, 12));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-2xl glass rounded-2xl overflow-hidden z-10"
          >
            <div className="flex items-center gap-3 px-5 border-b border-border">
              <Search className="w-5 h-5 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools..."
                className="flex-1 py-4 bg-transparent text-text-primary text-lg outline-none placeholder:text-text-muted"
              />
              <button onClick={onClose} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((tool) => (
                    <Link
                      key={tool.id + tool.category}
                      href={tool.url}
                      onClick={onClose}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-bg-card-hover transition-colors"
                    >
                      <span className="text-2xl">{tool.emoji}</span>
                      <div className="flex-1">
                        <div className="text-text-primary font-medium">{tool.name}</div>
                        <div className="text-text-muted text-sm">{tool.description}</div>
                      </div>
                      <span className="text-xs text-text-muted capitalize bg-bg-card px-2 py-1 rounded">
                        {tool.category}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : query.trim().length > 0 ? (
                <div className="py-12 text-center text-text-muted">
                  <p>No tools found for &ldquo;{query}&rdquo;</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="p-5">
                  <p className="text-text-muted text-sm mb-3">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-bg-card border border-border text-text-secondary hover:border-primary transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
