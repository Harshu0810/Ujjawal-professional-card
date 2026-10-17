'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';

interface UtmData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  referrer: string;
}

const DEFAULT_UTM_JSON = JSON.stringify({
  utm_source: 'direct',
  utm_medium: 'web',
  utm_campaign: 'none',
  utm_term: 'none',
  utm_content: 'none',
  referrer: ''
});

function subscribeUrl(callback: () => void) {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

function getUtmSnapshot(): string {
  if (typeof window === 'undefined') return DEFAULT_UTM_JSON;

  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source') || (params.get('ref') === 'qr' ? 'pocket_card_qr' : 'direct');
  const medium = params.get('utm_medium') || (source === 'pocket_card_qr' ? 'physical_print' : 'organic');
  const campaign = params.get('utm_campaign') || 'intro_landing';
  const term = params.get('utm_term') || 'growth_audit';
  const content = params.get('utm_content') || 'v1_intro';
  const referrer = typeof document !== 'undefined' ? document.referrer || 'direct' : '';

  return JSON.stringify({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    utm_term: term,
    utm_content: content,
    referrer
  });
}

function getServerUtmSnapshot(): string {
  return DEFAULT_UTM_JSON;
}

export default function UtmInquiryForm() {
  const utmRaw = useSyncExternalStore(subscribeUrl, getUtmSnapshot, getServerUtmSnapshot);
  const utmData: UtmData = useMemo(() => {
    try {
      return JSON.parse(utmRaw);
    } catch {
      return JSON.parse(DEFAULT_UTM_JSON);
    }
  }, [utmRaw]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    adSpend: '₹1,00,000 - ₹5,00,000',
    bottleneck: 'Ad Fatigue & Rising CAC',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email format (e.g. name@brand.com)';
    }

    if (formData.phone && formData.phone.length < 8) {
      errors.phone = 'Please enter a valid phone number with country code';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          utmSource: utmData.utm_source,
          utmMedium: utmData.utm_medium,
          utmCampaign: utmData.utm_campaign,
          utmTerm: utmData.utm_term,
          utmContent: utmData.utm_content,
          referrer: utmData.referrer
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A network error occurred. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="inquiry-form-card"
      className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-all duration-300 relative overflow-hidden group hover:border-blue-500/40"
    >
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="max-w-2xl mx-auto text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-mono uppercase font-semibold border border-blue-500/20">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          Growth Audit &amp; Strategy Inquiry
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Request an AI Funnel &amp; Growth Audit
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Share your primary acquisition bottleneck. Ujjawal will review your current ad performance metrics and propose a high-impact experimentation roadmap.
        </p>

        {/* Real-time UTM Attribution Badge */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
          <span className="text-slate-500 dark:text-slate-400">Attribution Tracked:</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            Source: <strong className="text-blue-600 dark:text-blue-400">{utmData.utm_source}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            Medium: <strong className="text-emerald-600 dark:text-emerald-400">{utmData.utm_medium}</strong>
          </span>
        </div>
      </div>

      {submitted ? (
        // Success State
        <div
          id="inquiry-success-state"
          className="max-w-md mx-auto text-center p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 animate-in fade-in duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Audit Request Transmitted!
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Thank you, <strong>{formData.name}</strong>. Your inquiry has been logged with source attribution (<code className="text-blue-500 font-mono">{utmData.utm_source}</code>). Ujjawal will review your bottleneck and follow up within 4–6 business hours.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: '',
                email: '',
                phone: '',
                adSpend: '₹1,00,000 - ₹5,00,000',
                bottleneck: 'Ad Fatigue & Rising CAC',
                message: ''
              });
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        // Form
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
          {/* General Error Banner */}
          {errorMessage && (
            <div
              id="inquiry-error-banner"
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold cursor-pointer shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                id="inquiry-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border ${
                  fieldErrors.name
                    ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                } text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors`}
              />
              {fieldErrors.name && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.name}</span>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work / Business Email *
              </label>
              <input
                id="inquiry-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rahul@company.com"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border ${
                  fieldErrors.email
                    ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                } text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors`}
              />
              {fieldErrors.email && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.email}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp / Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp / Phone (Optional)
              </label>
              <input
                id="inquiry-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border ${
                  fieldErrors.phone
                    ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                } text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors`}
              />
              {fieldErrors.phone && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.phone}</span>
              )}
            </div>

            {/* Monthly Spend Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Monthly Ad Spend
              </label>
              <select
                id="inquiry-spend"
                value={formData.adSpend}
                onChange={(e) => setFormData({ ...formData, adSpend: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Under ₹1,00,000">Under ₹1,00,000 / mo</option>
                <option value="₹1,00,000 - ₹5,00,000">₹1,00,000 - ₹5,00,000 / mo</option>
                <option value="₹5,00,000 - ₹20,00,000">₹5,00,000 - ₹20,00,000 / mo</option>
                <option value="₹20,00,000+">₹20,00,000+ / mo</option>
              </select>
            </div>
          </div>

          {/* Primary Bottleneck */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Bottleneck to Solve
            </label>
            <select
              id="inquiry-bottleneck"
              value={formData.bottleneck}
              onChange={(e) => setFormData({ ...formData, bottleneck: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Ad Fatigue & Rising CAC">Ad Fatigue &amp; High Customer Acquisition Cost (CAC)</option>
              <option value="Landing Page & Funnel Drop-off">Landing Page Drop-off &amp; Low Conversion Rate (CRO)</option>
              <option value="Lead Qualification & Routing">Lead Qualification Delays &amp; Automation Bottlenecks</option>
              <option value="Full-Funnel Scaling & Attribution">Full-Funnel Scaling &amp; Multi-Channel Attribution</option>
            </select>
          </div>

          {/* Message / Context */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Brand / Funnel Details (Optional)
            </label>
            <textarea
              id="inquiry-message"
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us about your product, current ad channels (Meta/Google), and 30-day goals..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="inquiry-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-semibold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer ${
                isSubmitting
                  ? 'bg-blue-600/70 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Transmitting Audit Request...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  <span>Request Free Growth Audit with UTM Attribution</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-2">
              🔒 Your contact data is strictly governed by the DPDP Act 2023 and never shared with third parties.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
