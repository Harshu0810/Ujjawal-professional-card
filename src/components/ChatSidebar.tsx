'use client';

import React, { useState } from 'react';
import { ChatbotConfig } from '@/types/content';

interface ChatSidebarProps {
  config: ChatbotConfig;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'visitor';
  text: string;
}

export default function ChatSidebar({ config, isOpen, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: config.greeting
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'visitor',
      text: inputText.trim()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');

    // Simulate conversational one-question-at-a-time qualification (Appendix D flow)
    setTimeout(() => {
      let botResponse = '';
      if (currentStepIndex < config.leadQuestions.length) {
        botResponse = `Thanks for sharing. To see how Ujjawal's marketing workflows can best fit: ${config.leadQuestions[currentStepIndex]}`;
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        botResponse = `Thank you! That gives a solid picture of your current growth requirements. Would you like to schedule a 20-minute discovery call directly with Ujjawal, or connect via WhatsApp?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botResponse
        }
      ]);
    }, 600);
  };

  const handleAskIntro = () => {
    const introMsg: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: config.introSummary
    };
    setMessages((prev) => [...prev, introMsg]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              AI Growth Assistant
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Claude M5 Stub
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Representing Ujjawal • AI Marketing
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close Chat"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Honesty & AI Disclosure Banner */}
      <div className="px-3 py-2 bg-blue-950/40 border-b border-blue-900/30 text-[11px] text-blue-300 flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>AI assistant grounded in owner-approved business info. Not human.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'visitor' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                m.sender === 'visitor'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-xs'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">
              {m.sender === 'visitor' ? 'You' : 'AI Assistant'}
            </span>
          </div>
        ))}

        {/* Quick action prompts */}
        <div className="pt-2 flex flex-wrap gap-1.5">
          <button
            onClick={handleAskIntro}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
          >
            💡 Who is Ujjawal?
          </button>
          <button
            onClick={() => {
              setInputText('What services do you offer?');
            }}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
          >
            🎯 Services offered
          </button>
        </div>
      </div>

      {/* Privacy Notice (India DPDP Act 2023 Compliance) */}
      <div className="px-3 py-1.5 bg-slate-950 text-[10px] text-slate-400 border-t border-slate-800">
        DPDP Act 2023: Details provided in chat are used strictly to qualify inquiries and will not be shared.
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message or answer..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium rounded-lg text-xs transition-colors shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}
