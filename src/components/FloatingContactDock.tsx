'use client';

import React, { useState } from 'react';

export default function FloatingContactDock() {
  const [isOpen, setIsOpen] = useState(true);

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      href: 'https://wa.me/919876543210?text=Hi%20Ujjawal%2C%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20discuss%20growth%20marketing',
      color: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.074-1.808-.412-1.401-.582-2.316-1.996-2.387-2.09-.071-.095-.584-.775-.584-1.479 0-.705.372-1.05.503-1.193.131-.143.286-.179.382-.179.096 0 .191.002.274.006.088.004.204-.033.32.246.12.288.406 1.008.441 1.082.035.074.059.16.01.258-.049.098-.073.16-.144.246-.072.086-.151.192-.216.258-.072.072-.148.15-.064.294.084.144.372.614.799.994.55.489 1.013.641 1.157.713.144.072.228.06.313-.037.085-.097.363-.423.46-.568.096-.145.192-.121.32-.073.129.049.816.385.957.455.141.071.235.105.27.165.035.06.035.347-.109.752z" />
        </svg>
      )
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/ujjawal-marketer',
      color: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      href: 'https://instagram.com/ujjawal.growth',
      color: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white shadow-rose-500/20',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    },
    {
      id: 'cal',
      name: 'Book Strategy Call',
      href: 'https://cal.com/ujjawal/intro',
      color: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 border border-slate-700/60 dark:border-slate-300 shadow-slate-900/20',
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div
      id="floating-contact-dock"
      className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2 select-none"
    >
      {/* Expanded Contact Channels */}
      <div
        className={`flex flex-col gap-2 transition-all duration-300 origin-bottom-left ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
      >
        {channels.map((ch) => (
          <a
            key={ch.id}
            id={`floating-btn-${ch.id}`}
            href={ch.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ${ch.color}`}
            aria-label={ch.name}
          >
            {ch.icon}

            {/* Hover Tooltip */}
            <span className="absolute left-12 px-2.5 py-1 rounded-md bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-md border border-slate-800 dark:border-slate-200">
              {ch.name}
            </span>
          </a>
        ))}
      </div>

      {/* Dock Toggle Button */}
      <button
        id="toggle-contact-dock-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label={isOpen ? 'Collapse quick contacts' : 'Expand quick contacts'}
        title="Quick Connect Channels"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-45 text-rose-400' : 'rotate-0 text-blue-400'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
