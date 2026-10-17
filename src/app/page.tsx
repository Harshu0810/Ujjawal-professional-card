'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import {
  SiteConfig,
  BenefitCard,
  UseCaseVisual,
  ReferenceVisual,
  AvatarConfig,
  CaptionTrack,
  ChatbotConfig
} from '@/types/content';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeZoomImage, setActiveZoomImage] = useState<{ src: string; caption: string } | null>(null);

  // Dynamic content loaded from database
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DUMMY_SITE_CONFIG);
  const [benefits, setBenefits] = useState<BenefitCard[]>(DUMMY_BENEFITS);
  const [useCases, setUseCases] = useState<UseCaseVisual[]>(DUMMY_USE_CASES);
  const [referenceVisuals, setReferenceVisuals] = useState<ReferenceVisual[]>(DUMMY_REFERENCE_VISUALS);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DUMMY_AVATAR_CONFIG);
  const [captionTrack, setCaptionTrack] = useState<CaptionTrack>(DUMMY_CAPTION_TRACK);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>(DUMMY_CHATBOT_CONFIG);

  useEffect(() => {
    // Fetch live published content from persistent DB
    fetch('/api/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.siteConfig) setSiteConfig(data.siteConfig);
        if (data.benefits) setBenefits(data.benefits);
        if (data.useCases) setUseCases(data.useCases);
        if (data.referenceVisuals) setReferenceVisuals(data.referenceVisuals);
        if (data.avatarConfig) setAvatarConfig(data.avatarConfig);
        if (data.captionTrack) setCaptionTrack(data.captionTrack);
        if (data.chatbotConfig) setChatbotConfig(data.chatbotConfig);
      })
      .catch((err) => console.log('Using initial seed content:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* 2B. Preloader: fails open after duration */}
      <Preloader
        text={siteConfig.preloaderText}
        durationMs={siteConfig.preloaderDurationMs}
      />

      {/* Top Navigation Bar */}
      <header id="site-header" className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Image */}
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Image
                src={siteConfig.logoAssetId}
                alt="Ujjawal Brand Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                Ujjawal
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  AI Marketer
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Performance Advertising &amp; Funnel Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* QR Card Spec Inspection Button */}
            <button
              id="qr-inspect-btn"
              onClick={() => setIsQRModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              title="Inspect Section 2A QR Print Specification"
            >
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="hidden sm:inline">Pocket Card QR</span>
            </button>

            {/* Chatbot Trigger */}
            <button
              id="open-chat-btn"
              onClick={() => setIsChatOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
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
        {/* 1. Hero / Introduction Section */}
        <section id="hero-section" className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
            {siteConfig.taglines[0]}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {siteConfig.headline}
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {siteConfig.introText}
          </p>
        </section>

        {/* 2. Runtime Avatar & Synchronized Captions (Section 3 & 3C) */}
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
            config={avatarConfig}
            captions={captionTrack}
          />
        </section>

        {/* 3. Benefits / Pros Section */}
        <section id="pros-section" className="space-y-8">
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
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                id={`card-${benefit.id}`}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all hover:bg-slate-900 flex flex-col justify-between group shadow-sm"
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

        {/* 4. Common Use Cases & Bottlenecks ("need usage visuals") */}
        <section id="use-cases-section" className="space-y-8">
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
            {useCases.map((uc) => (
              <div
                key={uc.id}
                id={`usecase-${uc.id}`}
                className="rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden flex flex-col group shadow-lg"
              >
                <div
                  className="aspect-[16/10] bg-slate-950 border-b border-slate-800 relative cursor-pointer overflow-hidden"
                  onClick={() => setActiveZoomImage({ src: uc.imageAssetId, caption: uc.title })}
                  title="Click to zoom diagram"
                >
                  <Image
                    src={uc.imageAssetId}
                    alt={uc.title}
                    width={600}
                    height={360}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-xs text-[10px] text-slate-300 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                    Zoom
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

        {/* 5. "Resemble Pictures" / Reference Visuals Section (Option A: Confirmed by Owner) */}
        <section id="resemble-pictures-section" className="space-y-6 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Option A Confirmed
                </span>
                <span className="text-xs text-slate-400">Sample Marketing Work &amp; System Visuals</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Portfolio &amp; Performance Reference Visuals
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Illustrating verified systems: dashboards, creative matrixes, and attribution pipelines. (Client names omitted per policy).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {referenceVisuals.map((ref) => (
              <div
                key={ref.id}
                id={`refvisual-${ref.id}`}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all text-center space-y-2.5 group cursor-pointer"
                onClick={() => setActiveZoomImage({ src: ref.imageAssetId, caption: ref.caption })}
                title="Click to zoom reference visual"
              >
                <div className="aspect-[16/10] rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative">
                  <Image
                    src={ref.imageAssetId}
                    alt={ref.caption}
                    width={600}
                    height={360}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-xs text-[10px] text-slate-300 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                    Zoom
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 font-mono line-clamp-2">
                  {ref.caption}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Call to Action Section */}
        <section id="cta-section" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/30 text-center space-y-6">
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
              id="cta-chat-btn"
              onClick={() => setIsChatOpen(true)}
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <span>{siteConfig.ctaLabel}</span>
            </button>

            <button
              id="cta-qr-btn"
              onClick={() => setIsQRModalOpen(true)}
              className="px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>View Pocket Card QR</span>
            </button>
          </div>
        </section>
      </main>

      {/* 7. Footer & DPDP Act 2023 Compliance */}
      <footer id="site-footer" className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <p>{siteConfig.footerText}</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
              {siteConfig.privacyConsentText}
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link
              href="/admin"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <span>🔒 Admin CMS</span>
            </Link>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Vercel Deployment Target
            </span>
          </div>
        </div>
      </footer>

      {/* Collapsible Chatbot Drawer */}
      <ChatSidebar
        config={chatbotConfig}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* QR Code Print Spec Modal */}
      <QRCodeModal
        url="https://ai-intro-webpage.vercel.app"
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Image Lightbox / Zoom Modal */}
      {activeZoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-pointer"
          onClick={() => setActiveZoomImage(null)}
        >
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-mono text-slate-300 font-semibold">{activeZoomImage.caption}</span>
              <button
                onClick={() => setActiveZoomImage(null)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                aria-label="Close Preview"
              >
                ✕
              </button>
            </div>
            <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
              <Image
                src={activeZoomImage.src}
                alt={activeZoomImage.caption}
                width={1000}
                height={600}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
