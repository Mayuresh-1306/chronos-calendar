/**
 * NotesPanel.tsx
 * ─────────────────────────────────────────────────────────────
 * Notes section below the calendar grid.
 *
 * Features:
 *  - Shows selection label (date range) as the heading
 *  - Auto-saves to localStorage on every keystroke (via useNotes)
 *  - Animated entry when a range becomes active
 *  - "Saved" indicator with smooth fade
 *  - Clear note button
 *  - Instructional empty state when no date is selected
 * ─────────────────────────────────────────────────────────────
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotebookPen, CheckCircle2, CalendarDays, Trash2 } from 'lucide-react';

interface NotesPanelProps {
  hasSelection: boolean;
  selectionLabel: string | null;
  noteText: string;
  isSaved: boolean;
  onChange: (text: string) => void;
  onClear: () => void;
}

export default function NotesPanel({
  hasSelection,
  selectionLabel,
  noteText,
  isSaved,
  onChange,
  onClear,
}: NotesPanelProps) {
  return (
    <div className="mt-6 pt-5 border-t border-white/10">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <NotebookPen size={15} className="text-white/40" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Notes
          </h3>
        </div>

        {/* ── Saved indicator + clear button ── */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isSaved && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--accent)' }}
              >
                <CheckCircle2 size={12} />
                <span>Saved</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear note button */}
          <AnimatePresence>
            {noteText && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onClear}
                title="Clear this note"
                aria-label="Clear note for current selection"
                className="
                  p-1 rounded-md text-white/30 hover:text-red-400
                  hover:bg-red-400/10 transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400/50
                "
              >
                <Trash2 size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Selection label ── */}
      <AnimatePresence mode="wait">
        {hasSelection && selectionLabel ? (
          <motion.p
            key={selectionLabel}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="mb-2 text-xs font-medium text-white/50 flex items-center gap-1.5"
          >
            <CalendarDays size={12} />
            {selectionLabel}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {/* ── Textarea or empty state ── */}
      <AnimatePresence mode="wait">
        {hasSelection ? (
          <motion.div
            key="textarea"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <textarea
              id="calendar-notes"
              value={noteText}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Add notes for this period… (auto-saved)"
              rows={4}
              aria-label={`Notes for ${selectionLabel ?? 'selected dates'}`}
              className="
                notes-textarea
                w-full px-3 py-2.5 rounded-xl
                bg-white/5 border border-white/10
                text-sm text-white/85 placeholder:text-white/20
                leading-relaxed
                focus:outline-none
              "
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="
              flex flex-col items-center justify-center
              h-24 rounded-xl border border-dashed border-white/10
              text-white/20 text-xs text-center px-4 gap-1.5
            "
          >
            <CalendarDays size={20} />
            <span>Click a date to start adding notes</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
