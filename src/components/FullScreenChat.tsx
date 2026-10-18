'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatbotConfig, ContactLink, SocialLink } from '@/types/content';
import { ChatMessage } from '@/lib/chatbot/claude';

interface FullScreenChatProps {
  config: ChatbotConfig;
  whatsappUrl?: string;
  bookingUrl?: string;
  contactLinks?: ContactLink[];
  socialLinks?: SocialLink[];
}

export default function FullScreenChat({
  config,
  whatsappUrl = 'https://wa.me/919876543210?text=Hi%20Ujjawal%2C%20I%20would%20like%20to%20discuss%20growth%20marketing',
  bookingUrl = 'https://cal.com/ujjawal/intro',
  socialLinks = [
    { platform: 'linkedin', url: 'https://linkedin.com/in/ujjawal-marketer', label: 'LinkedIn' },
    { platform: 'instagram', url: 'https://instagram.com/ujjawal.growth', label: 'Instagram' }
  ]
}: FullScreenChatProps) {
  // Unique session token that lives only in memory until page reload (v3 Section 2B)
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    setSessionId(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `${config.greeting || 'Namaste! I am Ujjawal’s AI marketing assistant.'} ${config.introSummary || 'I help high-growth brands scale with AI performance marketing and funnel architecture.'} Feel free to ask about our marketing workflows or test me on any general question!`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [exchangesUsed, setExchangesUsed] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const maxExchanges = config.maxSessionExchanges || 3;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const triggerQuotaExceeded = (reply?: string) => {
    setQuotaExceeded(true);
    setExchangesUsed(maxExchanges);
    if (!hasShownPopup) {
      setShowPopup(true);
      setHasShownPopup(true);
    }
    if (reply) {
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading || quotaExceeded) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          message: text,
          history: updatedMessages,
          sessionId
        })
      });

      const data = await res.json();

      if (data.quotaExceeded) {
        triggerQuotaExceeded(
          data.reply ||
            `You have reached this session's ${maxExchanges}-question preview limit. To continue the conversation or audit your funnels, reach out directly to Ujjawal!`
        );
        return;
      }

      if (data.success && data.reply) {
        if (typeof data.exchangesUsed === 'number') {
          setExchangesUsed(data.exchangesUsed);
          if (data.exchangesUsed >= maxExchanges) {
            triggerQuotaExceeded();
          }
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply }
        ]);
      } else {
        throw new Error(data.error || 'Failed to generate response.');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I had a momentary connection hiccup. Please ask again or feel free to message Ujjawal on WhatsApp.'
        }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickQuestions = [
    'What marketing funnels do you build?',
    'How do you solve ad fatigue & CAC?',
    'What are your engagement retainers?',
    'Ask a general question (test general IQ)'
  ];

  return (
    <>
      {/* ─── Main Chat Card (Neumorphic Raised) ─── */}
      <div
        id="fullscreen-chat-container"
        className="w-full max-w-4xl mx-auto flex flex-col rounded-3xl neu-raised overflow-hidden transition-all duration-300"
        style={{ minHeight: '500px' }}
      >
        {/* Chat Header & Session Quota Badge */}
        <div className="px-5 sm:px-6 py-4 neu-inset-subtle flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full neu-raised-sm text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Ujjawal AI Growth Assistant
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              {/* v4 Section 4: Removed "Powered by Claude" */}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Grounded in verified systems
              </p>
            </div>
          </div>

          {/* Server-enforced Session Quota Counter (v3 Section 2B / v4 Section 5 Neumorphic) */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold neu-raised-xs flex items-center gap-1.5 transition-colors ${
                quotaExceeded
                  ? 'text-rose-600 dark:text-rose-400'
                  : exchangesUsed >= 2
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              <span className="opacity-75">Quota:</span>
              <span>{exchangesUsed} / {maxExchanges} Used</span>
            </div>
          </div>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[500px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full neu-raised-xs text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'neu-bubble-user text-white rounded-tr-xs font-normal'
                    : 'neu-bubble-assistant text-slate-800 dark:text-slate-100 rounded-tl-xs font-normal'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full neu-raised-xs text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  You
                </div>
              )}
            </div>
          ))}

          {/* Thinking Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full neu-raised-xs text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                AI
              </div>
              <div className="p-3 rounded-2xl neu-bubble-assistant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {/* Quota Exceeded Lead Conversion Callout (Persistent Inline Banner - v4 Section 3) */}
          {quotaExceeded && (
            <div
              id="chat-quota-reached-banner"
              className="p-6 rounded-3xl neu-inset-subtle text-center space-y-3 animate-in fade-in my-4"
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full neu-raised-xs text-amber-600 dark:text-amber-400 text-xs font-semibold">
                Preview Limit Reached (3 / 3)
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Ready to Discuss Your Business Goals Directly?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                You&apos;ve used your 3 preview questions. Connect directly with Ujjawal for a complete funnel breakdown or custom marketing strategy:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl neu-accent-emerald text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <span>💬 Chat on WhatsApp</span>
                </a>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl neu-accent-blue text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <span>📅 Book Strategy Call</span>
                </a>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        {!quotaExceeded && (
          <div className="px-4 sm:px-6 py-2.5 neu-inset-subtle flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] px-3.5 py-1.5 rounded-full neu-button text-slate-700 dark:text-slate-200 transition-all cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 neu-inset-subtle flex items-center gap-2.5 transition-colors"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            disabled={isLoading || quotaExceeded}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              quotaExceeded
                ? '3 questions used this session. Connect directly on WhatsApp or book a call above.'
                : 'Ask a business question or test me on anything...'
            }
            className="flex-1 px-4 py-3 rounded-2xl neu-inset text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim() || quotaExceeded}
            className="px-5 sm:px-6 py-3 rounded-2xl neu-accent-blue font-semibold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Send</span>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>

        {/* DPDP Privacy Notice */}
        <div className="px-4 py-2 bg-slate-200/40 dark:bg-slate-950/40 text-[10px] text-slate-500 dark:text-slate-400 text-center">
          🔒 DPDP Act 2023 Notice: Conversations are session-bound, never persisted across reloads, and used solely to respond to your inquiry.
        </div>
      </div>

      {/* ─── Session-Exhausted Popup Modal (v4 Section 3) ─── */}
      {showPopup && (
        <div
          id="session-exhausted-popup-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-popup-title"
        >
          <div
            id="session-exhausted-popup"
            className="w-full max-w-md rounded-3xl neu-raised p-6 sm:p-7 relative space-y-5 animate-in zoom-in-95 duration-200 shadow-2xl"
          >
            {/* Close Button */}
            <button
              id="close-session-popup-btn"
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 p-2 rounded-full neu-button text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal and view transcript"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header / Limit Notice */}
            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <div className="w-12 h-12 rounded-2xl neu-raised-sm flex items-center justify-center text-amber-500 text-xl font-bold">
                ⚡
              </div>
              <span className="px-3.5 py-1 rounded-full neu-raised-xs text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Session Preview Limit Reached (3 / 3)
              </span>
              <h3 id="session-popup-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Ready to Scale Your Acquisition Funnels?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
                You&apos;ve used all 3 preview questions for this session. Connect directly with Ujjawal to explore custom growth systems or review your funnels:
              </p>
            </div>

            {/* Dynamic Action Buttons (v4 Section 3: WhatsApp, Book Call, LinkedIn/Instagram) */}
            <div className="space-y-2.5 pt-1">
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl neu-accent-emerald flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.074-1.808-.412-1.401-.582-2.316-1.996-2.387-2.09-.071-.095-.584-.775-.584-1.479 0-.705.372-1.05.503-1.193.131-.143.286-.179.382-.179.096 0 .191.002.274.006.088.004.204-.033.32.246.12.288.406 1.008.441 1.082.035.074.059.16.01.258-.049.098-.073.16-.144.246-.072.086-.151.192-.216.258-.072.072-.148.15-.064.294.084.144.372.614.799.994.55.489 1.013.641 1.157.713.144.072.228.06.313-.037.085-.097.363-.423.46-.568.096-.145.192-.121.32-.073.129.049.816.385.957.455.141.071.235.105.27.165.035.06.035.347-.109.752z" />
                </svg>
                <span>Chat on WhatsApp Directly</span>
              </a>

              {/* Book Call Button */}
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl neu-accent-blue flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Book 20-Min Growth Strategy Call</span>
              </a>

              {/* Social Channels Row */}
              {socialLinks && socialLinks.length > 0 && (
                <div className="flex items-center justify-center gap-2.5 pt-1">
                  {socialLinks.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl neu-button text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{s.label || s.platform}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Dismiss Control - Keep Reading Transcript */}
            <div className="pt-2 text-center border-t border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                id="dismiss-session-popup-btn"
                onClick={() => setShowPopup(false)}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:underline"
              >
                ← Keep reading conversation transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
