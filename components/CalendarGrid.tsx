/**
 * CalendarGrid.tsx
 * ─────────────────────────────────────────────────────────────
 * Renders the 7-column date grid with:
 *  - Day-of-week headers (Mon–Sun)
 *  - Animated month transitions via Framer Motion AnimatePresence
 *    (slides left for next month, right for previous month)
 *  - DateCell components for each calendar day
 *
 * The `slideDirection` from useCalendar drives the enter/exit
 * animation so it always feels natural (next → slide left,
 * prev → slide right).
 * ─────────────────────────────────────────────────────────────
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DateCell from './DateCell';
import type { CalendarDay } from '@/hooks/useCalendar';

// ── Constants ──────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── Animation variants ─────────────────────────────────────────

const gridVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

// ── Types ──────────────────────────────────────────────────────

type DayState = 'start' | 'end' | 'between' | 'preview' | 'none';

interface CalendarGridProps {
  gridKey: string;
  slideDirection: 1 | -1;
  days: CalendarDay[];
  getDayState: (date: Date) => DayState;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
}

// ── Component ─────────────────────────────────────────────────

export default function CalendarGrid({
  gridKey,
  slideDirection,
  days,
  getDayState,
  onDayClick,
  onDayHover,
}: CalendarGridProps) {
  return (
    <div>
      {/* ── Day-of-week headers ── */}
      <div
        className="grid grid-cols-7 mb-2"
        role="row"
        aria-label="Days of the week"
      >
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            role="columnheader"
            aria-label={day}
            className="
              h-9 flex items-center justify-center
              text-xs font-semibold uppercase tracking-wider
              text-white/30
            "
          >
            {day}
          </div>
        ))}
      </div>

      {/* ── Animated month grid ── */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={gridKey}
            custom={slideDirection}
            variants={gridVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            role="grid"
            aria-label="Calendar days"
            className="grid grid-cols-7 gap-y-0.5"
          >
            {days.map((day, index) => (
              <DateCell
                key={`${gridKey}-${index}`}
                day={day}
                state={day.date ? getDayState(day.date) : 'none'}
                onClick={onDayClick}
                onHover={onDayHover}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
