/**
 * useNotes.ts
 * ─────────────────────────────────────────────────────────────
 * Custom hook for managing notes tied to date selections.
 *
 * Key design decisions:
 *  1. Storage key is derived from the date range so each unique
 *     range has its own note entry in localStorage.
 *  2. Auto-save is INSTANT (no debounce needed since writes to
 *     localStorage are synchronous and very fast).
 *  3. Notes load automatically when the selection changes.
 * ─────────────────────────────────────────────────────────────
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatDateKey } from './useCalendar';

// ── Constants ──────────────────────────────────────────────────
const STORAGE_PREFIX = 'wall-calendar-note';

// ── Helpers ────────────────────────────────────────────────────

/** Build a deterministic localStorage key from a date range */
function buildStorageKey(start: Date | null, end: Date | null): string | null {
  if (!start) return null;
  const startKey = formatDateKey(start);
  const endKey = end ? formatDateKey(end) : startKey;
  return `${STORAGE_PREFIX}::${startKey}::${endKey}`;
}

/** Safely read from localStorage (SSR-safe) */
function readFromStorage(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

/** Safely write to localStorage (SSR-safe) */
function writeToStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (value.trim() === '') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage errors (private browsing, full storage, etc.)
  }
}

/** Remove a specific key from localStorage */
function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch { /* noop */ }
}

// ── Hook ───────────────────────────────────────────────────────

export function useNotes(rangeStart: Date | null, rangeEnd: Date | null) {
  const [noteText, setNoteText] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // ── Compute the storage key for the current selection ──
  const storageKey = buildStorageKey(rangeStart, rangeEnd);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * When the selected range changes, load the corresponding note
   * from localStorage. Clear the text if no selection is active.
   */
  useEffect(() => {
    if (!storageKey) {
      setNoteText('');
      setIsSaved(false);
      return;
    }
    const saved = readFromStorage(storageKey);
    setNoteText(saved);
    setIsSaved(saved !== '');
    
    // Clear any pending saves on key change
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [storageKey]);

  /**
   * Called from the textarea's onChange handler.
   * Updates local state INSTANTLY but DEBOUNCES the localStorage write.
   */
  const handleNoteChange = useCallback(
    (text: string) => {
      setNoteText(text);
      setIsSaved(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (storageKey) {
          writeToStorage(storageKey, text);
          setIsSaved(true);
        }
      }, 300); // 300ms debounce for defensive programming
    },
    [storageKey]
  );

  /**
   * Clear note for the current selection both from state and storage.
   */
  const clearNote = useCallback(() => {
    setNoteText('');
    setIsSaved(false);
    if (storageKey) {
      removeFromStorage(storageKey);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [storageKey]);

  /**
   * Human-readable label for the currently selected range,
   * shown above the notes textarea.
   */
  const selectionLabel = (() => {
    if (!rangeStart) return null;
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const startStr = rangeStart.toLocaleDateString('en-US', opts);
    if (!rangeEnd || formatDateKey(rangeStart) === formatDateKey(rangeEnd)) {
      return startStr;
    }
    const endStr = rangeEnd.toLocaleDateString('en-US', opts);
    return `${startStr} — ${endStr}`;
  })();

  return {
    noteText,
    isSaved,
    selectionLabel,
    handleNoteChange,
    clearNote,
    hasSelection: !!rangeStart,
  };
}
