/**
 * DateCell.tsx
 * ─────────────────────────────────────────────────────────────
 * Individual day cell rendered inside the calendar grid.
 *
 * Visual states (driven by the `state` prop from useCalendar):
 *  • 'start'   → solid accent bg + rounded-l-full
 *  • 'end'     → solid accent bg + rounded-r-full
 *  • 'between' → lighter accent tint + sharp/no border-radius
 *  • 'preview' → very light tint (hover before 2nd click)
 *  • 'none'    → default hover style
 *
 * The CSS custom properties (--accent-*) drive the actual colors
 * so they automatically update when the theme changes.
 *
 * Accessibility:
 *  • role="gridcell" inside role="grid"
 *  • aria-selected reflects selection state
 *  • aria-label includes the full date
 *  • Keyboard: focusable via tabIndex, Enter/Space trigger click
 * ─────────────────────────────────────────────────────────────
 */

'use client';

import React, { useCallback, KeyboardEvent, memo } from 'react';
import { motion } from 'framer-motion';
import type { CalendarDay } from '@/hooks/useCalendar';

type DayState = 'start' | 'end' | 'between' | 'preview' | 'none';

interface DateCellProps {
  day: CalendarDay;
  state: DayState;
  onClick: (date: Date) => void;
  onHover: (date: Date | null) => void;
}

// ── Style maps ─────────────────────────────────────────────────

const stateStyles: Record<DayState, string> = {
  // Start: solid accent, left-rounded pill cap
  start: `
    text-white font-semibold
    rounded-l-full
  `,
  // End: solid accent, right-rounded pill cap
  end: `
    text-white font-semibold
    rounded-r-full
  `,
  // In-between: muted accent tint, no border radius (connects the range)
  between: `
    rounded-none
  `,
  // Hover preview: very light tint while choosing the second date
  preview: `
    rounded-none
    opacity-70
  `,
  // Default
  none: `
    rounded-full
  `,
};

function DateCell({ day, state, onClick, onHover }: DateCellProps) {
  // Padding/empty cell — render a blank space
  if (!day.date || day.dayNumber === null) {
    return <div className="h-9" aria-hidden="true" />;
  }

  const date = day.date;
  const isSelected = state === 'start' || state === 'end';
  const isFilled = state === 'start' || state === 'end';
  const isMuted = state === 'between' || state === 'preview';

  const ariaLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(date);
      }
    },
    [date, onClick]
  );

  return (
    <motion.button
      whileHover={state === 'none' ? { scale: 1.15 } : {}}
      whileTap={{ scale: 0.9 }}
      role="gridcell"
      aria-label={ariaLabel}
      aria-selected={isSelected}
      tabIndex={0}
      onClick={() => onClick(date)}
      onMouseEnter={() => onHover(date)}
      onMouseLeave={() => onHover(null)}
      onKeyDown={handleKeyDown}
      style={{
        ...(isFilled ? { backgroundColor: 'var(--accent)' } : {}),
        ...(isMuted ? { backgroundColor: 'var(--accent-muted)' } : {}),
        ...(day.isToday && state === 'none' ? { boxShadow: '0 0 0 2px var(--accent) inset' } : {})
      }}
      className={`
        relative h-9 w-full flex items-center justify-center
        text-sm cursor-pointer select-none
        transition-colors duration-150
        focus-visible:outline-none focus-visible:z-10
        focus-visible:ring-2 focus-visible:ring-offset-1
        focus-visible:ring-offset-transparent
        ${stateStyles[state]}
        ${!isFilled && !isMuted ? 'hover:bg-white/10 text-white/85' : ''}
        ${isMuted ? 'text-white/80' : ''}
        ${day.isToday && state === 'none'
          ? 'ring-2 ring-inset text-white font-medium'
          : ''
        }
      `}
    >
      <span className="relative z-10">{day.dayNumber}</span>

      {/* Start/end marker: small solid dot below the number */}
      {isSelected && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
      )}
    </motion.button>
  );
}

export default memo(DateCell);
