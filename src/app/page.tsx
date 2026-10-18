'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AvatarPlayer from '@/components/AvatarPlayer';
import FullScreenChat from '@/components/FullScreenChat';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import ThemeToggle from '@/components/ThemeToggle';
import {
  DUMMY_SITE_CONFIG,
  DUMMY_AVATAR_CONFIG,
  DUMMY_CAPTION_TRACK,
  DUMMY_CHATBOT_CONFIG
} from '@/data/dummyContent';
import {
  SiteConfig,
  AvatarConfig,
  CaptionTrack,
  ChatbotConfig
} from '@/types/content';

export default function Home() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DUMMY_SITE_CONFIG);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DUMMY_AVATAR_CONFIG);
  const [captionTrack, setCaptionTrack] = useState<CaptionTrack>(DUMMY_CAPTION_TRACK);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>(DUMMY_CHATBOT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live published content from persistent DB on mount
  useEffect(() => {
    let ignore = false;
    async function initLiveContent() {
      try {
        const res = await fetch('/api/content');
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (ignore) return;
        if (data.siteConfig) setSiteConfig(data.siteConfig);
        if (data.avatarConfig) setAvatarConfig(data.avatarConfig);
        if (data.captionTrack) setCaptionTrack(data.captionTrack);
        if (data.chatbotConfig) setChatbotConfig(data.chatbotConfig);
      } catch (err) {
        console.warn('Using baseline seed content:', err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    initLiveContent();
    return () => {
      ignore = true;
    };
  }, []);

  // Quick contact links
  const whatsappUrl =
    siteConfig.contactLinks.find((l) => l.type === 'whatsapp')?.url ||
    'https://wa.me/919876543210?text=Hi%20Ujjawal%2C%20I%20saw%20your%20digital%20card%20and%20would%20like%20to%20discuss%20marketing';

  const bookingUrl =
    siteConfig.contactLinks.find((l) => l.type === 'cal')?.url ||
    'https://cal.com/ujjawal/intro';

  const linkedinUrl =
    siteConfig.socialLinks?.find((s) => s.platform === 'linkedin')?.url ||
    'https://linkedin.com/in/ujjawal-marketer';

  const instagramUrl =
    siteConfig.socialLinks?.find((s) => s.platform === 'instagram')?.url ||
    'https://instagram.com/ujjawal.growth';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300 antialiased">
      {/* 1. Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* 2. Bare Loading Spinner / Transition */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-blue-500 animate-pulse" />
      )}

      {/* 3. Slim Navigation Header */}
      <header
        id="site-header"
        className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md py-2.5 transition-colors"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Minimized Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xs">
              <Image
                src={siteConfig.logoAssetId}
                alt="Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Ujjawal
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                  AI Marketer
                </span>
              </span>
            </div>
          </div>

          {/* Contact Links & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Contact Icons (v3: WhatsApp, LinkedIn, Instagram, Book Call) */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <a
                id="header-whatsapp-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="WhatsApp Direct"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.074-1.808-.412-1.401-.582-2.316-1.996-2.387-2.09-.071-.095-.584-.775-.584-1.479 0-.705.372-1.05.503-1.193.131-.143.286-.179.382-.179.096 0 .191.002.274.006.088.004.204-.033.32.246.12.288.406 1.008.441 1.082.035.074.059.16.01.258-.049.098-.073.16-.144.246-.072.086-.151.192-.216.258-.072.072-.148.15-.064.294.084.144.372.614.799.994.55.489 1.013.641 1.157.713.144.072.228.06.313-.037.085-.097.363-.423.46-.568.096-.145.192-.121.32-.073.129.049.816.385.957.455.141.071.235.105.27.165.035.06.035.347-.109.752z" />
                </svg>
                <span className="hidden md:inline">WhatsApp</span>
              </a>

              <a
                id="header-booking-btn"
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Book 20-Min Call"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline">Book Call</span>
              </a>

              <a
                id="header-linkedin-btn"
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                title="LinkedIn"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>

              <a
                id="header-instagram-btn"
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                title="Instagram"
                aria-label="Instagram Profile"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            {/* Dark Mode Switcher */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 4. Core Public Layout: Pinned Avatar (Top) + Full-Screen Chatbot (Center) */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 flex flex-col items-center">
        {/* Pinned Avatar Player with Hinglish Synchronized Captions */}
        <section id="avatar-section" className="w-full max-w-xl mx-auto">
          <AvatarPlayer
            config={avatarConfig}
            captions={captionTrack}
            isAdmin={false} // Clean visitor presentation: hides debug rates/test script
          />
        </section>

        {/* Full-Screen In-Page Chat Interface (v3 Pivot Centerpiece) */}
        <section id="chat-section" className="w-full">
          <FullScreenChat
            config={chatbotConfig}
            whatsappUrl={whatsappUrl}
            bookingUrl={bookingUrl}
          />
        </section>
      </main>

      {/* 5. Minimal Footer with DPDP Compliance & Discrete Admin Link */}
      <footer id="site-footer" className="border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 py-4 px-4 sm:px-6 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="text-center sm:text-left">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              © 2026 Ujjawal • AI Digital Marketer
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Personal Digital Introduction &amp; AI Funnel Consultation
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link
              href="/admin"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              🔒 Admin
            </Link>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              Vercel Deploy
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
