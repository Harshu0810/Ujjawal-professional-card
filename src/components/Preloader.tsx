'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface PreloaderProps {
  text?: string;
  assetId?: string;
  durationMs?: number;
}

export default function Preloader({
  text = 'AI Performance Marketing • Funnel Architecture • Growth Systems',
  assetId = '/images/logo.svg',
  durationMs = 1800
}: PreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Fail-open guarantee: ensure preloader unmounts even if animations stutter
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(600, durationMs - 450));

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [durationMs]);

  if (!visible) return null;

  // Strip placeholder markers if present
  const cleanText = text
    .replace(/\[(?:DRAFT|DUMMY|PLACEHOLDER|TODO)[^\]]*:\s*/gi, '')
    .replace(/[\[\]]/g, '')
    .trim();

  return (
    <div
      id="site-preloader"
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--neu-surface)] text-slate-800 dark:text-slate-100 transition-opacity duration-500 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center px-6 text-center max-w-md w-full">
        {/* Extruded Neumorphic Card */}
        <div className="w-full neu-raised rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
          {/* Logo / Emblem Container with Soft Neumorphic Ring */}
          <div className="relative mb-2 flex items-center justify-center">
            <div className="h-20 w-20 rounded-2xl neu-raised-sm flex items-center justify-center p-3.5">
              <Image
                src={assetId}
                alt="Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain animate-pulse"
                priority
              />
            </div>
          </div>

          {/* Capability Pill */}
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full neu-raised-xs text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Specialist Capability &amp; Recognition
          </span>

          {/* Heading Tagline */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {cleanText || 'AI Performance Marketing • Funnel Architecture • Growth Systems'}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ujjawal • Digital Growth Partner
          </p>

          {/* Neumorphic Inset Loading Progress Bar */}
          <div className="w-full max-w-xs neu-inset h-2 rounded-full overflow-hidden p-0.5 mt-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 animate-[shimmer_1.5s_infinite]"
              style={{
                width: '100%',
                animationDuration: `${durationMs}ms`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
