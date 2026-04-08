/**
 * app/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Entry point for the Next.js App Router.
 *
 * "use client" is NOT here — page.tsx can remain a Server Component.
 * WallCalendar itself is marked 'use client' so Next.js will
 * automatically bundle it as a client component while keeping
 * the page shell server-rendered for optimal performance.
 * ─────────────────────────────────────────────────────────────
 */

import WallCalendar from '@/components/WallCalendar';

export default function Home() {
  return (
    <main>
      <WallCalendar />
    </main>
  );
}
