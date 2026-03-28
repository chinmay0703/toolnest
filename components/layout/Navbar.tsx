'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Search, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '@/lib/categories';
import { SearchModal } from '@/components/home/SearchBar';

const navGroups = [
  {
    label: 'PDF',
    categoryIds: ['pdf'],
  },
  {
    label: 'Image',
    categoryIds: ['image'],
  },
  {
    label: 'Developer',
    categoryIds: ['developer', 'data'],
  },
  {
    label: 'More',
    categoryIds: ['text', 'calculators', 'security', 'media', 'camera', 'productivity', 'design', 'health', 'fun', 'writing', 'social', 'education', 'finance'],
  },
];

function DropdownMenu({
  categoryIds,
  onClose,
}: {
  categoryIds: string[];
  onClose: () => void;
}) {
  const matched = categories.filter((c) => categoryIds.includes(c.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[240px] rounded-xl border border-border bg-bg-card/95 backdrop-blur-xl shadow-2xl p-2 z-50"
      onMouseLeave={onClose}
    >
      {matched.map((cat) => (
        <Link
          key={cat.id}
          href={`/${cat.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          onClick={onClose}
        >
          <span className="text-lg">{cat.emoji}</span>
          <span className="text-sm font-medium">{cat.name}</span>
          <span className="ml-auto text-xs text-text-muted">{cat.toolCount}</span>
        </Link>
      ))}
    </motion.div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Global "/" shortcut to open search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 h-14 md:h-16 border-b border-white/5 bg-[rgba(3,7,18,0.85)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT - Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-heading font-bold gradient-text">
              ToolNest
            </span>
          </Link>

          {/* CENTER - Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navGroups.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(group.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5">
                  {group.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === group.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Gradient underline for active */}
                {activeDropdown === group.label && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                )}

                <AnimatePresence>
                  {activeDropdown === group.label && (
                    <DropdownMenu
                      categoryIds={group.categoryIds}
                      onClose={() => setActiveDropdown(null)}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}

            <Link
              href="/tools"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
            >
              All Tools
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-bg-base border-r border-border overflow-y-auto lg:hidden"
            >
              {/* Drawer Header */}
              <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                  <span className="text-lg font-heading font-bold gradient-text">
                    ToolNest
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Links */}
              <div className="p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted px-3 mb-3">
                  Categories
                </p>
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <Link
                      href={`/${cat.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="ml-auto text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                        {cat.toolCount}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* All Tools link */}
              <div className="px-4 pb-6">
                <Link
                  href="/tools"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity"
                  onClick={() => setMobileOpen(false)}
                >
                  All Tools
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
