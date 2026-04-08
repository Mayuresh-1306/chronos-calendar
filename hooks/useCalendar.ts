/**
 * useCalendar.ts
 * ─────────────────────────────────────────────────────────────
 * Custom hook encapsulating ALL calendar state and logic:
 *  - Current month/year navigation
 *  - Building the day grid (with leading/trailing empty cells)
 *  - Two-click date range selection
 *  - Hover preview of range before second click
 *
 * Why a hook? Keeps WallCalendar.tsx clean and ensures the logic
 * is independently testable and reusable.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────

export interface CalendarDay {
  date: Date | null;   // null for leading/trailing padding cells
  dayNumber: number | null;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type NavigationDirection = 'prev' | 'next';

// ── Helpers ────────────────────────────────────────────────────

/** Format a Date as "YYYY-MM-DD" for use as localStorage keys */
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Return true if two dates refer to the same calendar day */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Return true if `date` is strictly between start and end (exclusive) */
function isBetween(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime();
  const s = Math.min(start.getTime(), end.getTime());
  const e = Math.max(start.getTime(), end.getTime());
  return t > s && t < e;
}

/** Build a flat array of CalendarDay objects for a given month/year.
 *  The grid always starts on Monday (index 0 = Mon). */
function buildDayGrid(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  // getDay() returns 0 = Sunday. We shift so Monday = 0.
  const firstDayOfWeek = (firstOfMonth.getDay() + 6) % 7;
  const totalDays = lastOfMonth.getDate();

  const cells: CalendarDay[] = [];

  // Leading empty cells (days from previous month)
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ date: null, dayNumber: null, isToday: false, isCurrentMonth: false });
  }

  // Actual days of the month
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    cells.push({
      date,
      dayNumber: d,
      isToday: isSameDay(date, today),
      isCurrentMonth: true,
    });
  }

  // Trailing empty cells to complete the last row (always produce a
  // multiple of 7 so the grid rows are even)
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push({ date: null, dayNumber: null, isToday: false, isCurrentMonth: false });
    }
  }

  return cells;
}

// ── Hook ───────────────────────────────────────────────────────

export function useCalendar() {
  const now = new Date();

  // ── State ──
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  // rangeStart = first click, rangeEnd = second click.
  // While the user has only clicked once, rangeEnd stays null and
  // hoverDate is used to show the preview range.
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Drives slide direction for Framer Motion
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  // ── Memoised day grid ──
  const days = useMemo(
    () => buildDayGrid(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // ── Navigation ──
  const navigateMonth = useCallback((direction: NavigationDirection) => {
    setSlideDirection(direction === 'next' ? 1 : -1);
    setCurrentMonth((prev) => {
      if (direction === 'next') {
        if (prev === 11) {
          setCurrentYear((y) => y + 1);
          return 0;
        }
        return prev + 1;
      } else {
        if (prev === 0) {
          setCurrentYear((y) => y - 1);
          return 11;
        }
        return prev - 1;
      }
    });
  }, []);

  // ── Selection ──
  /**
   * Two-click range selection:
   *  • First click → sets rangeStart, clears rangeEnd
   *  • Second click → sets rangeEnd (normalises so start ≤ end)
   *  • Clicking on the same date twice → single-day selection
   */
  const handleDayClick = useCallback((date: Date) => {
    if (!rangeStart || rangeEnd) {
      // Start a new selection
      setRangeStart(date);
      setRangeEnd(null);
      setHoverDate(null);
    } else {
      // Complete the range
      if (date.getTime() < rangeStart.getTime()) {
        setRangeEnd(rangeStart);
        setRangeStart(date);
      } else {
        setRangeEnd(date);
      }
      setHoverDate(null);
    }
  }, [rangeStart, rangeEnd]);

  const handleDayHover = useCallback(
    (date: Date | null) => {
      if (rangeStart && !rangeEnd) {
        setHoverDate(date);
      }
    },
    [rangeStart, rangeEnd]
  );

  /** Clear the entire selection */
  const clearSelection = useCallback(() => {
    setRangeStart(null);
    setRangeEnd(null);
    setHoverDate(null);
  }, []);

  // ── Derived values for each cell ──

  /**
   * Returns the visual "role" of a given date in the current selection
   * so that DateCell can apply the correct Tailwind classes.
   */
  const getDayState = useCallback(
    (date: Date): 'start' | 'end' | 'between' | 'preview' | 'none' => {
      // Effective end: actual rangeEnd or hoverDate (preview)
      const effectiveEnd = rangeEnd ?? hoverDate;

      if (!rangeStart) return 'none';

      if (isSameDay(date, rangeStart)) {
        // If no end yet, it's just a plain start; if rangeEnd same as start → both start+end shown without a range bg
        return 'start';
      }
      if (effectiveEnd) {
        if (isSameDay(date, effectiveEnd) && !isSameDay(date, rangeStart)) {
          return rangeEnd ? 'end' : 'preview';
        }
        const lo = rangeStart < effectiveEnd ? rangeStart : effectiveEnd;
        const hi = rangeStart < effectiveEnd ? effectiveEnd : rangeStart;
        if (isBetween(date, lo, hi)) {
          return rangeEnd ? 'between' : 'preview';
        }
      }

      return 'none';
    },
    [rangeStart, rangeEnd, hoverDate]
  );

  // ── Month label ──
  const monthLabel = useMemo(
    () =>
      new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [currentYear, currentMonth]
  );

  // Unique key for Framer Motion AnimatePresence (changes on every navigation)
  const gridKey = `${currentYear}-${currentMonth}`;

  return {
    currentYear,
    currentMonth,
    days,
    rangeStart,
    rangeEnd,
    hoverDate,
    slideDirection,
    navigateMonth,
    handleDayClick,
    handleDayHover,
    clearSelection,
    getDayState,
    monthLabel,
    gridKey,
  };
}
