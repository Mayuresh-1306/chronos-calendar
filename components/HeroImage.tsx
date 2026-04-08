/**
 * HeroImage.tsx
 * ─────────────────────────────────────────────────────────────
 * Left panel: rotating hero image with a gradient overlay and
 * an image switcher. Each image has an associated accent color
 * palette that is applied via CSS custom properties on <html>.
 *
 * Why simulate colors rather than extract them?
 *  → Canvas-based color extraction is complex and slow. Instead
 *    we curate beautiful accent colors for each image manually,
 *    which gives a more controlled, premium result.
 * ─────────────────────────────────────────────────────────────
 */

'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import Image from 'next/image';

// ── Theme palette: each entry maps to one hero image ──────────

interface ThemeImage {
  id: number;
  src: string;
  alt: string;
  /** HSL components of the accent color derived from the image */
  accentH: number;
  accentS: string;
  accentL: string;
  caption: string;
  location: string;
}

export const THEME_IMAGES: ThemeImage[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    alt: 'Mountain peaks at golden hour',
    accentH: 32,
    accentS: '95%',
    accentL: '52%',
    caption: 'Alpine Serenity',
    location: 'Swiss Alps',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80',
    alt: 'Turquoise ocean waves',
    accentH: 185,
    accentS: '75%',
    accentL: '42%',
    caption: 'Ocean Breeze',
    location: 'Maldives',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    alt: 'Dense green forest',
    accentH: 142,
    accentS: '60%',
    accentL: '38%',
    caption: 'Forest Calm',
    location: 'Amazon Rainforest',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    alt: 'Lavender field at dusk',
    accentH: 268,
    accentS: '65%',
    accentL: '50%',
    caption: 'Lavender Dreams',
    location: 'Provence, France',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    alt: 'Desert dunes at sunset',
    accentH: 16,
    accentS: '88%',
    accentL: '48%',
    caption: 'Desert Gold',
    location: 'Sahara Desert',
  },
];

// ── Helper: apply theme to CSS custom properties ──────────────

export function applyTheme(image: ThemeImage) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--accent-h', String(image.accentH));
  root.style.setProperty('--accent-s', image.accentS);
  root.style.setProperty('--accent-l', image.accentL);
}

// ── Component ─────────────────────────────────────────────────

interface HeroImageProps {
  activeImageIndex: number;
  onChangeImage: (index: number) => void;
}

export default function HeroImage({ activeImageIndex, onChangeImage }: HeroImageProps) {
  const active = THEME_IMAGES[activeImageIndex];

  return (
    <div className="relative w-full h-full min-h-[280px] overflow-hidden">
      {/* ── Animated background image ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Image
            src={active.src}
            alt={active.alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Gradient overlay for legibility ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* ── Caption ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-6 text-white"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        key={`caption-${active.id}`}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-white/60 mb-1">
          {active.location}
        </p>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {active.caption}
        </h2>
      </motion.div>

      {/* ── Image switcher dots ── */}
      <div
        className="absolute top-4 right-4 flex flex-col gap-2"
        role="radiogroup"
        aria-label="Select theme image"
      >
        {THEME_IMAGES.map((img, idx) => (
          <button
            key={img.id}
            role="radio"
            aria-checked={idx === activeImageIndex}
            aria-label={`Theme: ${img.caption}`}
            onClick={() => onChangeImage(idx)}
            className={`
              w-2 h-2 rounded-full border border-white/50 transition-all duration-300
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
              ${idx === activeImageIndex
                ? 'bg-white scale-125'
                : 'bg-white/30 hover:bg-white/60'
              }
            `}
          />
        ))}
      </div>

      {/* ── Camera icon badge ── */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
        <Camera size={12} className="text-white/70" />
        <span className="text-white/70 text-xs font-medium">Unsplash</span>
      </div>
    </div>
  );
}
