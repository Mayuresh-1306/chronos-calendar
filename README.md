# Interactive Wall Calendar Component

A highly polished, production-ready React component evaluating modern frontend engineering best practices. Built with Next.js, Tailwind CSS, Lucide React, and Framer Motion.

## Overview

This project implements a physical-style wall calendar split-panel aesthetic. It features:
- **Interactive Calendar Grid**: With dynamic month navigation mapping natively to smooth `Framer Motion` exits and entries.
- **Two-Click Date Ranges**: Click a start date and an end date to generate a beautifully highlighted date range.
- **Persistent Notes**: Save reminders or notes to the precise date ranges chosen, persisting securely utilizing debounced `localStorage` bindings.
- **Dynamic Theming**: Swap out the hero image and watch the application automatically sample a curated complementary `--accent` palette mapping natively to the UI.

## Architecture

This project strictly adheres to **separation of concerns** by divorcing business logic from presentational components via custom hooks. This design pattern enables:

- **Testability**: Pure logic in hooks can be unit tested independently without rendering React components.
- **Reusability**: Hooks can be composed or migrated across components without coupling UI to logic.
- **Maintainability**: Logic changes don't require touching component JSX, reducing regression risk.

### `hooks/useCalendar.ts`
Manages all of the complex date math decoupled from the UI. It calculates the correct leading/trailing day padding to ensure grids map squarely to CSS. It captures the intermediate "hover preview" temporal states dynamically returning `['none', 'start', 'between', 'end', 'preview']` logic to the view. **No DOM dependencies** means this logic can be tested in isolation with pure JavaScript.

### `hooks/useNotes.ts`
Interfaces with `localStorage` via a thin abstraction layer. To prevent micro-stutters commonly found in rich text inputs rapidly firing I/O events, notes are buffered in React memory immediately but debounced with a 300ms delay before flushing to disk. **Debouncing is a defensive programming habit** that reduces unnecessary writes and is especially valuable when discussing performance optimization in interviews.

### Component Tree
1. **`WallCalendar`**: The structural orchestration layer controlling the grid vs hero panel distributions.
2. **`DateCell`**: A completely pure, highly controlled component wrapped in `React.memo` to ensure date ranges only trigger surgical recalculations of cells entering or leaving `preview` state instead of globally re-rendering the calendar on every mouse hover!
3. **`HeroImage`**: Modulates aesthetics via CSS Custom Property insertions in the `<html />` root node to ensure all accents are synchronized across DOM boundaries.

## Quick Start
```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Open your browser
# http://localhost:3000
```

## Future Improvements

* **Roving TabIndex Accessibility (Keyboard Nav)**
  While standard tab navigation and basic `Enter/Space` hooks are wired up natively to ARIA specs, full WCAG 2.1 compliance for calendar grids recommends implementing a roving tabIndex (`tabIndex={-1}`) to allow fluid up/down/left/right arrow-key navigation exclusively across the grid surface.
* **Date FNS Engine**
  For enterprise scaling or multi-timezones, the native `Date` object calculations inside `useCalendar` logic would theoretically scale out using a light utility library like `date-fns`.
