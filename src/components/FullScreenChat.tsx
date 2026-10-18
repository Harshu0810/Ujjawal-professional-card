'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatbotConfig } from '@/types/content';
import { ChatMessage } from '@/lib/chatbot/claude';

interface FullScreenChatProps {
  config: ChatbotConfig;
  whatsappUrl?: string;
  bookingUrl?: string;
}

export default function FullScreenChat({
  config,
  whatsappUrl = 'https://wa.me/919876543210?text=Hi%20Ujjawal%2C%20I%20would%20like%20to%20discuss%20growth%20marketing',
  bookingUrl = 'https://cal.com/ujjawal/intro'
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
  const maxExchanges = config.maxSessionExchanges || 3;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
        setQuotaExceeded(true);
        setExchangesUsed(maxExchanges);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply || `You have reached this session's ${maxExchanges}-question preview limit. To continue the conversation or audit your funnels, reach out directly to Ujjawal!`
          }
        ]);
        return;
      }

      if (data.success && data.reply) {
        if (typeof data.exchangesUsed === 'number') {
          setExchangesUsed(data.exchangesUsed);
          if (data.exchangesUsed >= maxExchanges) {
            setQuotaExceeded(true);
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
    <div
      id="fullscreen-chat-container"
      className="w-full max-w-4xl mx-auto flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300"
      style={{ minHeight: '480px' }}
    >
      {/* Chat Header & Session Quota Badge */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
            AI
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Ujjawal AI Growth Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Grounded in verified systems • Powered by Claude
            </p>
          </div>
        </div>

        {/* Server-enforced Session Quota Counter (v3 Section 2B) */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold border flex items-center gap-1.5 transition-colors ${
              quotaExceeded
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : exchangesUsed >= 2
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
            }`}
          >
            <span>Quota:</span>
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
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-sm">
                AI
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white shadow-md rounded-tr-xs'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-tl-xs shadow-xs'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                You
              </div>
            )}
          </div>
        ))}

        {/* Thinking Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              AI
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {/* Quota Exceeded Lead Conversion Callout (v3 Section 2B) */}
        {quotaExceeded && (
          <div
            id="chat-quota-reached-banner"
            className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/50 text-center space-y-3 animate-in fade-in"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
              Preview Limit Reached (3 / 3)
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Ready to Discuss Your Business Goals Directly?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              You&apos;ve used your 3 preview questions. Connect directly with Ujjawal for a complete funnel breakdown or custom marketing strategy:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <span>💬 Chat on WhatsApp</span>
              </a>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
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
        <div className="px-4 sm:px-6 py-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap gap-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
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
        className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2 transition-colors"
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
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim() || quotaExceeded}
          className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Send</span>
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>

      {/* DPDP Privacy Notice */}
      <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400 text-center">
        🔒 DPDP Act 2023 Notice: Conversations are session-bound, never persisted across reloads, and used solely to respond to your inquiry.
      </div>
    </div>
  );
}
