'use client';

import React, { useState } from 'react';
import Preloader from '@/components/Preloader';
import AvatarPlayer from '@/components/AvatarPlayer';
import ChatSidebar from '@/components/ChatSidebar';
import QRCodeModal from '@/components/QRCodeModal';
import {
  DUMMY_SITE_CONFIG,
  DUMMY_BENEFITS,
  DUMMY_USE_CASES,
  DUMMY_REFERENCE_VISUALS,
  DUMMY_AVATAR_CONFIG,
  DUMMY_CAPTION_TRACK,
  DUMMY_CHATBOT_CONFIG
} from '@/data/dummyContent';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 2B. Preloader: fails open after duration */}
      <Preloader
        text={DUMMY_SITE_CONFIG.preloaderText}
        durationMs={DUMMY_SITE_CONFIG.preloaderDurationMs}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Mark */}
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              U
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                Ujjawal
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  AI Marketer
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Performance Advertising & Funnel Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* QR Card Spec Inspection Button */}
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
              title="Inspect Section 2A QR Print Specification"
            >
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="hidden sm:inline">QR Spec</span>
            </button>

            {/* Chatbot Trigger */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <span>Chat with AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Flow */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
            {DUMMY_SITE_CONFIG.taglines[0]}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {DUMMY_SITE_CONFIG.headline}
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {DUMMY_SITE_CONFIG.introText}
          </p>
        </section>

        {/* 3. Runtime Avatar & Synchronized Captions (Section 3 & 3C) */}
        <section id="avatar-section" className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold">
              Interactive Avatar Introduction
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Watch Runtime Introduction
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Delivered in Hinglish with synchronized on-screen caption track. Muted by default per Section 3A Option 1.
            </p>
          </div>

          <AvatarPlayer
            config={DUMMY_AVATAR_CONFIG}
            captions={DUMMY_CAPTION_TRACK}
          />
        </section>

        {/* 5. Benefits / Pros Section */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Core Value Proposition
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Why Partner With Ujjawal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clear technical advantages combining AI-accelerated workflows with rigorous performance marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {DUMMY_BENEFITS.map((benefit) => (
              <div
                key={benefit.id}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all hover:bg-slate-900 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Common Use Cases & Bottlenecks ("need usage visuals") */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">
              Practical Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Common Marketing Bottlenecks Solved
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Concrete challenges high-growth brands encounter and how AI-augmented workflows resolve them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DUMMY_USE_CASES.map((uc) => (
              <div
                key={uc.id}
                className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-4 flex flex-col items-center justify-center border-b border-slate-800 text-center">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
                    Visual Diagram Placeholder
                  </span>
                  <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white">
                      {uc.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {uc.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. "Resemble Pictures" / Reference Visuals Section (Flagged for Confirmation) */}
        <section className="space-y-6 p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  Section 0 Flagged Item
                </span>
                <span className="text-xs text-slate-400">Pending Owner Confirmation</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Reference / Portfolio Visuals ("Resemble Pictures")
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Flagged in brief: Confirming whether these are sample marketing results visuals or reference photos for avatar training.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DUMMY_REFERENCE_VISUALS.map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2"
              >
                <div className="h-24 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {ref.caption}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Call to Action Section */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/30 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to Accelerate Your Customer Acquisition?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Let&apos;s audit your current marketing funnels, diagnose conversion drops, and test AI-accelerated creative loops.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <span>{DUMMY_SITE_CONFIG.ctaLabel}</span>
            </button>

            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>View Pocket Card QR</span>
            </button>
          </div>
        </section>
      </main>

      {/* 9. Footer & DPDP Act 2023 Compliance */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <p>{DUMMY_SITE_CONFIG.footerText}</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
              {DUMMY_SITE_CONFIG.privacyConsentText}
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Vercel Deployment Baseline
            </span>
          </div>
        </div>
      </footer>

      {/* Collapsible Chatbot Drawer */}
      <ChatSidebar
        config={DUMMY_CHATBOT_CONFIG}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* QR Code Print Spec Modal */}
      <QRCodeModal
        url="https://ai-intro-webpage.vercel.app"
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}
