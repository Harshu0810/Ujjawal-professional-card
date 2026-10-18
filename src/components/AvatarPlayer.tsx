'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CaptionTrack, AvatarConfig } from '@/types/content';

interface AvatarPlayerProps {
  config: AvatarConfig;
  captions: CaptionTrack;
  isAdmin?: boolean;
}

export default function AvatarPlayer({ config, captions: initialCaptions, isAdmin = false }: AvatarPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Section 3A Option 1: muted by default
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentMs, setCurrentMs] = useState(0);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);
  const [captions, setCaptions] = useState<CaptionTrack>(initialCaptions);
  const [activeEngine, setActiveEngine] = useState<string>(config.engineName || 'd-id');
  const [isTestingScript, setIsTestingScript] = useState(false);
  const [testScriptText, setTestScriptText] = useState(config.scriptText);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleScriptResync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/avatar/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeEngine,
          scriptText: testScriptText,
          language: 'hinglish'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.captionTrack) {
          setCaptions(data.captionTrack);
          setCurrentMs(0);
          setIsPlaying(true);
          setHasStartedOnce(true);
        }
      }
    } catch {
      // Fallback local resync if offline
      const words = testScriptText.split(' ');
      const dur = Math.max(3000, words.length * 360);
      setCaptions({
        ...captions,
        segments: [
          { startMs: 0, endMs: Math.round(dur * 0.5), text: words.slice(0, Math.ceil(words.length / 2)).join(' ') },
          { startMs: Math.round(dur * 0.5), endMs: dur, text: words.slice(Math.ceil(words.length / 2)).join(' ') }
        ]
      });
      setCurrentMs(0);
      setIsPlaying(true);
    } finally {
      setIsSyncing(false);
      setIsTestingScript(false);
    }
  };

  // Find active caption segment
  const activeSegment = captions.segments.find(
    (s) => currentMs >= s.startMs && currentMs < s.endMs
  );

  // Per-minute estimated rates per Appendix C (shown in admin only)
  const engineRates: Record<string, string> = {
    'simli': '$0.018 / min (~₹1.50/min)',
    'd-id': '$0.12 / min (~₹10.00/min)',
    'heygen': '$3.00 / min (~₹250/min)',
    'mock': '$0.00 (Local Sandbox)'
  };

  return (
    <div
      id="avatar-player-container"
      className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden neu-raised transition-all duration-300"
    >
      {/* Admin-only Engine Selector & Rate Bar (v3: hidden from public page) */}
      {isAdmin && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold">Engine:</span>
            <select
              id="avatar-engine-select"
              value={activeEngine}
              onChange={(e) => setActiveEngine(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="d-id">D-ID Agents (WebRTC)</option>
              <option value="simli">Simli (Ultra Low-Cost)</option>
              <option value="heygen">HeyGen LiveAvatar</option>
              <option value="mock">Local Dev Sandbox</option>
            </select>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            Est. Rate: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{engineRates[activeEngine] || '$0.12 / min'}</span>
          </div>
        </div>
      )}

      {/* Visual Avatar Canvas / Frame */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-gradient-to-b from-slate-200/40 via-transparent to-slate-200/30 dark:from-slate-900/40 dark:via-transparent dark:to-slate-900/50 flex items-center justify-center overflow-hidden transition-colors">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-15 dark:opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Avatar Representation */}
        <div className="relative flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-3">
            <div className={`h-32 w-32 sm:h-40 sm:w-40 rounded-full neu-raised-sm ${
              isPlaying ? 'ring-4 ring-emerald-500/20' : ''
            } flex items-center justify-center overflow-hidden transition-all duration-300`}>
              <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <svg className="h-16 w-16 sm:h-20 sm:w-20 text-blue-500 dark:text-blue-400/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {/* Speaking animation indicator */}
            {isPlaying && (
              <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-ping" />
                SPEAKING
              </div>
            )}
          </div>

          <div className="space-y-1">
            {isAdmin ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-raised-xs text-[11px] font-mono text-blue-600 dark:text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Runtime Adapter: {activeEngine.toUpperCase()} (M3 Validated)
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-raised-xs text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Ujjawal • AI Digital Marketer
              </div>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Audio: <span className="font-semibold text-slate-700 dark:text-slate-200">{isMuted ? 'Muted (Tap Unmute Below)' : 'Unmuted'}</span>
            </p>
          </div>
        </div>

        {/* Start / Gesture Overlay if not started */}
        {!hasStartedOnce && (
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <button
              id="avatar-play-gesture-btn"
              onClick={handlePlayToggle}
              className="group flex items-center gap-2.5 px-6 py-3.5 rounded-full neu-accent-blue text-white font-semibold text-xs sm:text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Tap to Play Introduction</span>
            </button>
            <p className="mt-2.5 text-[11px] text-slate-300 dark:text-slate-400 max-w-xs">
              Muted by default to respect browser policies. Tap unmute below for audio.
            </p>
          </div>
        )}

        {/* Synchronized Captions Overlay (Section 3C) */}
        {showCaptions && (
          <div className="absolute bottom-2 inset-x-4 flex justify-center pointer-events-none z-10">
            <div className="px-4 py-2 rounded-2xl bg-black/85 dark:bg-black/90 text-white text-xs sm:text-sm font-medium text-center shadow-lg max-w-lg transition-all border border-white/10 backdrop-blur-xs">
              {activeSegment ? (
                <span className="tracking-wide text-blue-200 font-medium">
                  {activeSegment.text}
                </span>
              ) : (
                <span className="text-slate-400 italic text-[11px]">
                  {isPlaying ? '...' : '(Synchronized Hinglish captions will appear here)'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Media Playback Controls Bar */}
      <div className="px-4 py-3 neu-inset-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            id="avatar-play-btn"
            onClick={handlePlayToggle}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl neu-accent-blue font-semibold transition-all cursor-pointer"
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
            id="avatar-restart-btn"
            onClick={handleRestart}
            className="p-2 rounded-xl neu-button text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            title="Replay from start"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] ml-1">
            {(currentMs / 1000).toFixed(1)}s / {(totalDurationMs / 1000).toFixed(1)}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Unmute / Mute Toggle (Option 1 Compliance) */}
          <button
            id="avatar-mute-toggle-btn"
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer neu-button ${
              isMuted
                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                : 'text-emerald-600 dark:text-emerald-400 font-semibold'
            }`}
            title="Audio voice toggle (Option 1: stock TTS voice muted by default)"
          >
            {isMuted ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                Muted
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Unmuted
              </>
            )}
          </button>

          {/* Captions Toggle */}
          <button
            id="avatar-captions-toggle-btn"
            onClick={() => setShowCaptions(!showCaptions)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer neu-button ${
              showCaptions
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            CC {showCaptions ? 'ON' : 'OFF'}
          </button>

          {/* Test Script Edit / Re-sync Action (Admin Only) */}
          {isAdmin && (
            <button
              id="avatar-test-script-btn"
              onClick={() => setIsTestingScript(!isTestingScript)}
              className="px-2 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 text-[11px] font-medium hover:bg-indigo-600/30 transition-colors cursor-pointer"
              title="Test changing speech script and re-synchronizing timestamps"
            >
              ✏️ Test Script
            </button>
          )}
        </div>
      </div>

      {/* Script Test & Live Re-sync Panel (Admin Only) */}
      {isAdmin && isTestingScript && (
        <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Test Live Script &amp; Caption Re-Sync:</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Section 3C Verification</span>
          </div>
          <textarea
            value={testScriptText}
            onChange={(e) => setTestScriptText(e.target.value)}
            rows={2}
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded p-2 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            placeholder="Type Hinglish script..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsTestingScript(false)}
              className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleScriptResync}
              disabled={isSyncing}
              className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSyncing ? 'Synchronizing...' : '⚡ Re-Sync Captions'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
