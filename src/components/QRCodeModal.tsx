'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface QRCodeModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ url: initialUrl, isOpen, onClose }: QRCodeModalProps) {
  const [targetUrl, setTargetUrl] = useState(initialUrl);

  const qrSvgUrl = targetUrl ? `/api/qr?url=${encodeURIComponent(targetUrl)}` : '';

  if (!isOpen) return null;

  return (
    <div
      id="qr-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 antialiased"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200 space-y-4">
        {/* Close Button */}
        <button
          id="close-qr-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
            Section 2A Print Specification
          </span>
          <h3 className="text-base font-bold text-white">Pocket-Card Scannable QR</h3>
          <p className="text-xs text-slate-400">
            Engineered for physical card printing with Level Q error correction &amp; 4-module quiet zone.
          </p>
        </div>

        {/* Live Scannable QR Code Canvas */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="p-4 bg-white rounded-xl shadow-xl border-4 border-slate-200 inline-block">
            {qrSvgUrl ? (
              <Image
                src={qrSvgUrl}
                alt="Production QR Code"
                width={200}
                height={200}
                className="w-48 h-48 block"
                unoptimized
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          {/* Fallback URL per Section 2A */}
          <div className="mt-3 text-center w-full">
            <span className="text-[10px] text-slate-400 block font-mono">PRINTED FALLBACK URL:</span>
            <code className="text-xs font-mono text-blue-400 font-semibold bg-slate-950 px-3 py-1 rounded border border-slate-800 inline-block mt-0.5 max-w-full truncate">
              {targetUrl}
            </code>
          </div>
        </div>

        {/* URL Configuration Field for Testing */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-400">Target Vercel Destination URL:</label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            placeholder="https://ai-intro-webpage.vercel.app"
          />
        </div>

        {/* Technical Print Compliance Grid */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Error Correction:</span>
            <span className="font-semibold text-emerald-400">Level Q (25% damage tolerant)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Quiet Zone Margin:</span>
            <span className="font-semibold text-slate-200">≥ 4 modules preserved (no crop)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Min Physical Print Size:</span>
            <span className="font-semibold text-slate-200">2 × 2 cm (≈0.8 × 0.8 in)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Card Finish Recommendation:</span>
            <span className="font-semibold text-slate-200">Matte non-glare stock (prevents flare)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <a
            id="download-qr-svg-btn"
            href={`/api/qr?url=${encodeURIComponent(targetUrl)}&download=true`}
            download="pocket-card-qr-print-spec.svg"
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs text-center transition-colors shadow-md shadow-blue-600/20"
          >
            📥 Download Vector SVG for Print
          </a>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(targetUrl);
                alert('Fallback URL copied to clipboard!');
              }
            }}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
          >
            Copy URL
          </button>
        </div>
      </div>
    </div>
  );
}
