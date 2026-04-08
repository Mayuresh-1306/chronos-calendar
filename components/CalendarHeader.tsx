/**
 * CalendarHeader.tsx
 * ─────────────────────────────────────────────────────────────
 * Displays the current month/year title and prev/next navigation
 * buttons. The month title uses the display font (Playfair Display)
 * for a premium editorial feel.
 *
 * Accessibility: navigation buttons have descriptive aria-labels.
 * ─────────────────────────────────────────────────────────────
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { NavigationDirection } from '@/hooks/useCalendar';

interface CalendarHeaderProps {
  monthLabel: string;
  onNavigate: (dir: NavigationDirection) => void;
}

export default function CalendarHeader({ monthLabel, onNavigate }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* ── Prev month button ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('prev')}
        aria-label="Go to previous month"
        className="
          w-9 h-9 rounded-full flex items-center justify-center
          bg-white/5 hover:bg-white/10 border border-white/10
          text-white/70 hover:text-white
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50
        "
      >
        <ChevronLeft size={18} />
      </motion.button>

      {/* ── Month / Year title ── */}
      <motion.h1
        key={monthLabel}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="text-xl font-semibold text-white tracking-wide"
        style={{ fontFamily: "'Playfair Display', serif" }}
        aria-live="polite"
        aria-atomic="true"
      >
        {monthLabel}
      </motion.h1>

      {/* ── Next month button ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('next')}
        aria-label="Go to next month"
        className="
          w-9 h-9 rounded-full flex items-center justify-center
          bg-white/5 hover:bg-white/10 border border-white/10
          text-white/70 hover:text-white
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50
        "
      >
        <ChevronRight size={18} />
      </motion.button>
    </div>
  );
}
