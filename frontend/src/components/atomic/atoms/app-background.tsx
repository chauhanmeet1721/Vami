import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AppBackgroundProps {
  className?: string;
  patternUrl?: string;
}

/**
 * AppBackground — Global Hardware-Accelerated Ambient Wallpaper
 *
 * Inspired by Telegram Web (WebK/WebA) architecture:
 * 1. Fixed viewport layer (z-index 0, pointer-events-none) decoupled from scrolling DOM.
 * 2. Theme-adaptive CSS gradient base (sage green light / navy slate dark).
 * 3. Monochrome vector SVG alpha mask with dynamic CSS tinting.
 * 4. translateZ(0) GPU compositor promotion preventing scroll repaints.
 */
export function AppBackground({
  className,
  patternUrl = '/assets/wallpapers/chat-pattern.svg',
}: AppBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-0 select-none overflow-hidden',
        className
      )}
    >
      {/* ─── Layer 1: Ambient Theme Gradient ─────────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 transition-colors duration-500 pointer-events-none',
          'bg-linear-to-br from-vami-wall-from via-vami-wall-via to-vami-wall-to',
          'dark:from-vami-dark-bg dark:via-vami-wall-dark-via dark:to-vami-wall-dark-to'
        )}
      />

      {/* ─── Layer 2: Vector Mask Pattern (Tiled Doodle Pattern) ─────── */}
      <div
        className={cn(
          'fixed inset-0 transition-colors duration-500 pointer-events-none',
          'bg-vami-wall-pattern-light/35 dark:bg-white/30'
        )}
        style={{
          maskImage: `url('${patternUrl}')`,
          WebkitMaskImage: `url('${patternUrl}')`,
          maskSize: '374px 666px',
          WebkitMaskSize: '374px 666px',
          maskRepeat: 'repeat',
          WebkitMaskRepeat: 'repeat',
          maskPosition: 'center top',
          WebkitMaskPosition: 'center top',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />
    </div>
  );
}
