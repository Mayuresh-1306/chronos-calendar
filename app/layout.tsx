import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wall Calendar — Interactive Date Planner',
  description:
    'A beautiful, interactive wall-calendar experience with date range selection, personal notes, and dynamic theming. Built with Next.js, Framer Motion, and Tailwind CSS.',
  keywords: ['calendar', 'planner', 'date range', 'notes', 'interactive'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
