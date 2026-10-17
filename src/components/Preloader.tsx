'use client';

import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  text: string;
  durationMs?: number;
}

export default function Preloader({ text, durationMs = 1800 }: PreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Fail-open guarantee: ensure preloader unmounts even if animations stutter
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(800, durationMs - 400));

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [durationMs]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-400 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center px-6 text-center max-w-lg">
        {/* Animated ambient pulse ring */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-600/20 animate-ping absolute" />
          <div className="h-16 w-16 rounded-full border border-blue-500/40 flex items-center justify-center bg-slate-900 shadow-lg shadow-blue-500/20">
            <svg
              className="h-8 w-8 text-blue-400 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-2">
          Specialist Capability & Recognition
        </p>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">
          {text}
        </h2>
        <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 animate-[pulse_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
}
