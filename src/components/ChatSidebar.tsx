'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  modelUsed?: string;
}

export default function ChatSidebar({ config, isOpen, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: config.greeting,
      modelUsed: 'claude-haiku-5-5'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'visitor',
      text: textToSend.trim()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Map history for API
      const historyPayload = newMessages.map((m) => ({
        role: m.sender === 'visitor' ? ('user' as const) : ('assistant' as const),
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: historyPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            modelUsed: data.modelUsed
          }
        ]);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'bot',
            text: data.error || config.fallbackResponse,
            modelUsed: 'system'
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: config.fallbackResponse,
          modelUsed: 'system'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  if (!isOpen) return null;

  return (
    <div
      id="chatbot-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 antialiased"
    >
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
                Claude 5.5
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Grounded in Ujjawal&apos;s Business Profile
            </p>
          </div>
        </div>

        <button
          id="close-chat-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close Chat"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* AI Disclosure & Privacy Banner */}
      <div className="px-3 py-2 bg-blue-950/40 border-b border-blue-900/30 text-[11px] text-blue-300 flex items-center gap-1.5">
        <svg className="h-3.5 w-3.5 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>AI assistant grounded in owner-approved facts. Never claims to be human.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'visitor' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm whitespace-pre-wrap ${
                m.sender === 'visitor'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-xs'
              }`}
            >
              {m.text}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-1 px-1">
              <span>{m.sender === 'visitor' ? 'You' : 'AI Assistant'}</span>
              {m.modelUsed && <span>• {m.modelUsed}</span>}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-slate-400 text-xs w-36">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            <span>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Pills */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex flex-wrap gap-1.5">
        <button
          onClick={() => sendMessage('Who is Ujjawal?')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
        >
          💡 Who is Ujjawal?
        </button>
        <button
          onClick={() => sendMessage('What services do you offer?')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
        >
          🎯 Services offered
        </button>
        <button
          onClick={() => sendMessage('How does pricing and engagement work?')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
        >
          💼 Pricing structure
        </button>
        <button
          onClick={() => sendMessage('How do we book a discovery session?')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
        >
          📅 Next steps
        </button>
      </div>

      {/* Privacy Notice (India DPDP Act 2023 Compliance) */}
      <div className="px-3 py-1.5 bg-slate-950 text-[10px] text-slate-400 border-t border-slate-800">
        DPDP Act 2023 Notice: Inquiries are processed strictly to answer your questions and qualify business leads.
      </div>

      {/* Input Form */}
      <form onSubmit={handleFormSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          id="chat-input-field"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question or share your business goals..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}
