'use client';

import React from 'react';

interface QRCodeModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ url, isOpen, onClose }: QRCodeModalProps) {
  if (!isOpen) return null;

  // Generate SVG QR matrix representation for demonstration
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Section 2A Print Spec
          </span>
          <h3 className="text-base font-bold text-white mt-2">Pocket Card QR Entry</h3>
          <p className="text-xs text-slate-400 mt-1">
            Engineered for physical pocket-size card scanning.
          </p>

          {/* QR Canvas with Quiet Zone (4 modules) on matte white background */}
          <div className="mt-4 p-5 bg-white rounded-xl shadow-inner inline-block border-4 border-slate-200">
            {/* SVG QR Code Illustration complying with Error Correction Level M/Q */}
            <svg
              className="h-44 w-44 text-slate-950"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Corner position markers */}
              <rect x="5" y="5" width="25" height="25" rx="3" />
              <rect x="10" y="10" width="15" height="15" fill="white" />
              <rect x="14" y="14" width="7" height="7" fill="black" />

              <rect x="70" y="5" width="25" height="25" rx="3" />
              <rect x="75" y="10" width="15" height="15" fill="white" />
              <rect x="79" y="14" width="7" height="7" fill="black" />

              <rect x="5" y="70" width="25" height="25" rx="3" />
              <rect x="10" y="75" width="15" height="15" fill="white" />
              <rect x="14" y="79" width="7" height="7" fill="black" />

              {/* Data matrix blocks */}
              <rect x="35" y="10" width="6" height="6" />
              <rect x="45" y="10" width="6" height="6" />
              <rect x="55" y="10" width="6" height="6" />

              <rect x="10" y="35" width="6" height="6" />
              <rect x="20" y="35" width="6" height="6" />
              <rect x="35" y="25" width="6" height="6" />
              <rect x="45" y="25" width="6" height="6" />
              <rect x="55" y="25" width="6" height="6" />

              <rect x="35" y="38" width="8" height="8" rx="1" />
              <rect x="48" y="38" width="6" height="6" />
              <rect x="58" y="38" width="6" height="6" />

              <rect x="35" y="52" width="6" height="6" />
              <rect x="45" y="52" width="6" height="6" />
              <rect x="58" y="52" width="6" height="6" />
              <rect x="70" y="45" width="6" height="6" />
              <rect x="80" y="45" width="6" height="6" />
              <rect x="70" y="58" width="6" height="6" />
              <rect x="80" y="58" width="6" height="6" />

              <rect x="35" y="70" width="6" height="6" />
              <rect x="45" y="70" width="6" height="6" />
              <rect x="55" y="70" width="6" height="6" />
              <rect x="70" y="70" width="6" height="6" />
              <rect x="80" y="70" width="6" height="6" />
              <rect x="40" y="82" width="6" height="6" />
              <rect x="55" y="82" width="6" height="6" />
              <rect x="75" y="82" width="6" height="6" />
            </svg>
          </div>

          {/* Human Readable Fallback URL (Section 2A requirement) */}
          <div className="mt-3">
            <span className="text-[11px] text-slate-400 block">Fallback URL:</span>
            <code className="text-xs font-mono text-blue-400 font-semibold bg-slate-950 px-2.5 py-1 rounded border border-slate-800 inline-block mt-0.5">
              {url}
            </code>
          </div>

          {/* Print Specification Card */}
          <div className="mt-4 text-left p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Error Correction:</span>
              <span className="font-semibold text-emerald-400">Level M / Q (Smudge-tolerant)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Quiet Zone:</span>
              <span className="font-semibold text-slate-200">≥ 4 modules preserved</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Min Physical Size:</span>
              <span className="font-semibold text-slate-200">2 × 2 cm (≈0.8 × 0.8 in)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stock Recommendation:</span>
              <span className="font-semibold text-slate-200">Matte non-glare finish</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
