'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CaptionTrack, AvatarConfig } from '@/types/content';

interface AvatarPlayerProps {
  config: AvatarConfig;
  captions: CaptionTrack;
}

export default function AvatarPlayer({ config, captions }: AvatarPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Section 3A Option 1: muted by default
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentMs, setCurrentMs] = useState(0);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  const totalDurationMs = captions.segments.length > 0 
    ? captions.segments[captions.segments.length - 1].endMs 
    : 8000;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = 50; // 50ms tick
      timerRef.current = setInterval(() => {
        setCurrentMs((prev) => {
          if (prev >= totalDurationMs) {
            setIsPlaying(false);
            return totalDurationMs;
          }
          return prev + interval;
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalDurationMs]);

  const handlePlayToggle = () => {
    if (currentMs >= totalDurationMs) {
      setCurrentMs(0);
    }
    setIsPlaying(!isPlaying);
    setHasStartedOnce(true);
  };

  const handleRestart = () => {
    setCurrentMs(0);
    setIsPlaying(true);
    setHasStartedOnce(true);
  };

  // Find active caption segment
  const activeSegment = captions.segments.find(
    (s) => currentMs >= s.startMs && currentMs < s.endMs
  );

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-sm">
      {/* Visual Avatar Canvas / Frame */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Avatar Representation */}
        <div className="relative flex flex-col items-center justify-center p-6 text-center">
          {/* Avatar Silhouette / Visual Representation */}
          <div className="relative mb-4">
            <div className={`h-36 w-36 sm:h-44 sm:w-44 rounded-full border-2 ${
              isPlaying ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-blue-500/50'
            } bg-slate-800 flex items-center justify-center overflow-hidden transition-all duration-300`}>
              <div className="flex flex-col items-center justify-center text-slate-400">
                <svg className="h-20 w-20 text-blue-400/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {/* Speaking animation indicator */}
            {isPlaying && (
              <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-emerald-500/90 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-ping" />
                SPEAKING
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              Runtime Engine: {config.engineName.toUpperCase()} (Target: M3 POC)
            </div>
            <p className="text-xs text-slate-400">
              Language: <span className="font-semibold text-slate-200">Hinglish</span> • Voice: <span className="font-semibold text-slate-200">{config.accent || 'Indian-English'}</span>
            </p>
          </div>
        </div>

        {/* Start / Gesture Overlay if not started */}
        {!hasStartedOnce && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <button
              onClick={handlePlayToggle}
              className="group flex items-center gap-3 px-6 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Tap to Hear Introduction (Hinglish)
            </button>
            <p className="mt-3 text-xs text-slate-400 max-w-xs">
              Muted by default to respect browser policies. Synchronized captions provided below.
            </p>
          </div>
        )}

        {/* Synchronized Captions Overlay (Section 3C) */}
        {showCaptions && (
          <div className="absolute bottom-3 inset-x-3 z-10 flex justify-center pointer-events-none">
            <div className="max-w-md px-4 py-2 rounded-lg bg-black/80 backdrop-blur-md border border-slate-700/60 text-center shadow-lg transition-all duration-200">
              <p className="text-xs sm:text-sm font-medium text-amber-300 tracking-wide font-sans leading-snug">
                {activeSegment ? (
                  activeSegment.text
                ) : (
                  <span className="text-slate-400 italic">
                    {isPlaying ? '...' : '[Press play to hear the introduction]'}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-75"
          style={{ width: `${(currentMs / totalDurationMs) * 100}%` }}
        />
      </div>

      {/* Interactive Controls Bar */}
      <div className="px-4 py-3 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            {isPlaying ? (
              <>
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </>
            )}
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Replay from start"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <span className="font-mono text-slate-400 text-[11px] ml-1">
            {(currentMs / 1000).toFixed(1)}s / {(totalDurationMs / 1000).toFixed(1)}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Unmute / Mute Toggle (Option 1 Compliance) */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              isMuted
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
            title="Audio voice toggle (Option 1: stock TTS voice muted by default)"
          >
            {isMuted ? (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                Muted
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Unmuted
              </>
            )}
          </button>

          {/* Captions Toggle */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              showCaptions
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            CC {showCaptions ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Honest Prototype Notice */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Section 3/3A Baseline Demo (Hinglish Audio + Sync Track)</span>
        <span className="text-amber-400 font-semibold">[POC In M3]</span>
      </div>
    </div>
  );
}
