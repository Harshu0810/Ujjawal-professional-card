'use client';

import React, { useEffect, useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('ujjawal_theme') as 'dark' | 'light') || 'dark';
}

function getServerSnapshot(): 'dark' | 'light' {
  return 'dark';
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Synchronize document.documentElement class with current theme (external DOM mutation)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ujjawal_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Notify subscribers
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl neu-button text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer flex items-center justify-center group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      {theme === 'dark' ? (
        // Sun Icon
        <svg
          className="h-4 w-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon Icon
        <svg
          className="h-4 w-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
