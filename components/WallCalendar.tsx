/**
 * WallCalendar.tsx
 * ─────────────────────────────────────────────────────────────
 * The root "Wall Calendar" component. Orchestrates:
 *  - Split-panel layout (hero image left | calendar right)
 *  - useCalendar hook (range selection, navigation)
 *  - useNotes hook (localStorage persistence)
 *  - Dynamic theming via applyTheme()
 *
 * Layout breakdown:
 *  Desktop (≥ md): side-by-side — image 40% | calendar 60%
 *  Mobile (< md):  stacked — image on top, calendar below
 *
 * The outer container is a glassmorphism card floating over the
 * dark gradient background defined in globals.css.
 * ─────────────────────────────────────────────────────────────
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

import HeroImage, { THEME_IMAGES, applyTheme } from './HeroImage';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import NotesPanel from './NotesPanel';

import { useCalendar } from '@/hooks/useCalendar';
import { useNotes } from '@/hooks/useNotes';

// ── Component ─────────────────────────────────────────────────

export default function WallCalendar() {
  // ── Theme image selection ──
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Apply accent theme to CSS custom properties whenever image changes
  useEffect(() => {
    applyTheme(THEME_IMAGES[activeImageIndex]);
  }, [activeImageIndex]);

  const handleChangeImage = useCallback((index: number) => {
    setActiveImageIndex(index);
  }, []);

  // ── Calendar logic ──
  const {
    days,
    rangeStart,
    rangeEnd,
    slideDirection,
    navigateMonth,
    handleDayClick,
    handleDayHover,
    clearSelection,
    getDayState,
    monthLabel,
    gridKey,
  } = useCalendar();

  // ── Notes logic ──
  const {
    noteText,
    isSaved,
    selectionLabel,
    hasSelection,
    handleNoteChange,
    clearNote,
  } = useNotes(rangeStart, rangeEnd);

  // ── Clear everything ──
  const handleReset = useCallback(() => {
    clearSelection();
    clearNote();
  }, [clearSelection, clearNote]);

  return (
    <div
      className="
        min-h-screen w-full flex items-center justify-center
        p-4 md:p-8
        bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950
      "
    >
      {/* ── Ambient glow behind card ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 50%, hsl(var(--accent-h, 210), 60%, 20%) / 0.15), radial-gradient(ellipse 40% 40% at 80% 50%, hsl(var(--accent-h, 210), 40%, 15%) / 0.10)',
        }}
      />

      {/* ── Main card ── */}
      <motion.article
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Interactive Wall Calendar"
        className="
          relative w-full max-w-5xl
          rounded-3xl overflow-hidden
          shadow-2xl shadow-black/60
          border border-white/10
          bg-gradient-to-br from-slate-900/90 to-slate-950/90
          backdrop-blur-2xl
          flex flex-col md:flex-row
          min-h-[580px]
        "
      >
        {/* ════ LEFT PANEL: Hero Image ════ */}
        <section
          className="
            relative w-full md:w-[40%]
            min-h-[260px] md:min-h-0
          "
          aria-label="Theme image"
        >
          <HeroImage
            activeImageIndex={activeImageIndex}
            onChangeImage={handleChangeImage}
          />
        </section>

        {/* ════ RIGHT PANEL: Calendar + Notes ════ */}
        <section
          className="
            flex-1 flex flex-col
            p-6 md:p-8
            overflow-y-auto
          "
          aria-label="Calendar and notes"
        >
          {/* ── Top row: Branding + Clear button ── */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles
                  size={14}
                  className="text-white/40"
                  style={{ color: 'var(--accent)' }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--accent)' }}
                >
                  Planner
                </span>
              </div>
              <p className="text-white/30 text-xs mt-0.5">
                Select a date or drag a range
              </p>
            </div>

            {/* Clear / Reset button — only visible when something is selected */}
            {hasSelection && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                aria-label="Clear date selection and notes"
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  bg-white/5 hover:bg-white/10
                  border border-white/10
                  text-white/40 hover:text-white/70
                  text-xs font-medium
                  transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                "
              >
                <X size={12} />
                Clear
              </motion.button>
            )}
          </div>

          {/* ── Calendar header (month title + prev/next) ── */}
          <CalendarHeader
            monthLabel={monthLabel}
            onNavigate={navigateMonth}
          />

          {/* ── Calendar grid ── */}
          <CalendarGrid
            gridKey={gridKey}
            slideDirection={slideDirection}
            days={days}
            getDayState={getDayState}
            onDayClick={handleDayClick}
            onDayHover={handleDayHover}
          />

          {/* ── Notes panel ── */}
          <NotesPanel
            hasSelection={hasSelection}
            selectionLabel={selectionLabel}
            noteText={noteText}
            isSaved={isSaved}
            onChange={handleNoteChange}
            onClear={clearNote}
          />
        </section>
      </motion.article>
    </div>
  );
}
