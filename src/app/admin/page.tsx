'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  SiteConfig,
  BenefitCard,
  UseCaseVisual,
  ReferenceVisual,
  AvatarConfig,
  CaptionTrack,
  KnowledgeDocument,
  ChatbotConfig,
  ContentVersion
} from '@/types/content';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUsername, setAdminUsername] = useState<string>('');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Content state (Draft)
  const [activeTab, setActiveTab] = useState<'brand' | 'benefits' | 'usecases' | 'avatar' | 'chatbot' | 'versions' | 'security'>('brand');
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [benefits, setBenefits] = useState<BenefitCard[]>([]);
  const [useCases, setUseCases] = useState<UseCaseVisual[]>([]);
  const [referenceVisuals, setReferenceVisuals] = useState<ReferenceVisual[]>([]);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
  const [captionTrack, setCaptionTrack] = useState<CaptionTrack | null>(null);
  const [knowledgeDoc, setKnowledgeDoc] = useState<KnowledgeDocument | null>(null);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [versions, setVersions] = useState<ContentVersion[]>([]);

  // Feedback notifications
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        const draft = data.draft;
        setSiteConfig(draft.siteConfig);
        setBenefits(draft.benefits);
        setUseCases(draft.useCases);
        setReferenceVisuals(draft.referenceVisuals);
        setAvatarConfig(draft.avatarConfig);
        setCaptionTrack(draft.captionTrack);
        setKnowledgeDoc(draft.knowledgeDocument);
        setChatbotConfig(draft.chatbotConfig);
        setVersions(draft.versions || []);
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    }
  }, []);

  // Check initial session
  useEffect(() => {
    let ignore = false;
    async function initSession() {
      try {
        const res = await fetch('/api/admin/session');
        if (!ignore) {
          if (res.ok) {
            const data = await res.json();
            setIsAuthenticated(true);
            setAdminUsername(data.username);
            loadContent();
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch {
        if (!ignore) setIsAuthenticated(false);
      }
    }

    initSession();
    return () => {
      ignore = true;
    };
  }, [loadContent]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setAdminUsername(data.username);
        loadContent();
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setSiteConfig(null);
  };

  const handleSaveDraft = async () => {
    if (!siteConfig || !avatarConfig || !captionTrack || !knowledgeDoc || !chatbotConfig) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteConfig,
          benefits,
          useCases,
          referenceVisuals,
          avatarConfig,
          captionTrack,
          knowledgeDocument: knowledgeDoc,
          chatbotConfig
        })
      });

      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Draft saved successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: 'Failed to save draft.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Error saving draft.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);

    try {
      // First ensure draft is saved
      await handleSaveDraft();

      const res = await fetch('/api/admin/publish', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatusMessage({
          type: 'success',
          text: `All content published live! Version ${data.version.id} created.`
        });
        loadContent();
      } else {
        setStatusMessage({ type: 'error', text: 'Publishing failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error during publish.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm(`Are you sure you want to rollback to version ${versionId}?`)) return;

    try {
      const res = await fetch('/api/admin/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId })
      });

      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Successfully rolled back to version ${versionId}.` });
        loadContent();
      } else {
        setStatusMessage({ type: 'error', text: 'Rollback failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error during rollback.' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Admin password changed successfully!' });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Password change failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error.' });
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 items-center justify-center text-blue-400 mb-2 font-bold text-lg">
              🔒
            </div>
            <h1 className="text-xl font-bold text-white">Admin Authentication</h1>
            <p className="text-xs text-slate-400">
              Protected content management for Ujjawal AI Intro Website
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <input
                id="admin-username-input"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                id="admin-password-input"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter admin password"
              />
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
              ← Return to public website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-sm">
            ⚙️
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Website CMS Control Panel
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Milestone 4 Live
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Authenticated as: <span className="font-semibold text-slate-300">{adminUsername}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-medium"
          >
            Live Site ↗
          </Link>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            {isSaving ? 'Saving...' : '💾 Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
          >
            {isPublishing ? 'Publishing...' : '🚀 Publish Live'}
          </button>
          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main CMS Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-56 shrink-0 space-y-1">
          {[
            { id: 'brand', label: '🎨 Brand & Header' },
            { id: 'benefits', label: '⭐ Benefits ("Pros")' },
            { id: 'usecases', label: '📊 Bottlenecks & Proof' },
            { id: 'avatar', label: '🗣️ Avatar & Speech' },
            { id: 'chatbot', label: '🤖 Chatbot & RAG' },
            { id: 'versions', label: '🕒 Version History' },
            { id: 'security', label: '🔐 Security / Password' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Tab Content Canvas */}
        <main className="flex-1 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          {/* TAB 1: BRAND & PAGE */}
          {activeTab === 'brand' && siteConfig && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Brand Configuration (Appendix B: SiteConfig)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Headline</label>
                  <input
                    type="text"
                    value={siteConfig.headline}
                    onChange={(e) => setSiteConfig({ ...siteConfig, headline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preloader Text</label>
                  <input
                    type="text"
                    value={siteConfig.preloaderText}
                    onChange={(e) => setSiteConfig({ ...siteConfig, preloaderText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Introduction Text</label>
                <textarea
                  value={siteConfig.introText}
                  onChange={(e) => setSiteConfig({ ...siteConfig, introText: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">About Text</label>
                <textarea
                  value={siteConfig.aboutText}
                  onChange={(e) => setSiteConfig({ ...siteConfig, aboutText: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CTA Label</label>
                  <input
                    type="text"
                    value={siteConfig.ctaLabel}
                    onChange={(e) => setSiteConfig({ ...siteConfig, ctaLabel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Footer Notice</label>
                  <input
                    type="text"
                    value={siteConfig.footerText}
                    onChange={(e) => setSiteConfig({ ...siteConfig, footerText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BENEFITS */}
          {activeTab === 'benefits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-base font-bold text-white">
                  Value Propositions (&quot;Pros&quot;)
                </h2>
                <button
                  onClick={() => {
                    const newId = `benefit-${Date.now()}`;
                    setBenefits([
                      ...benefits,
                      {
                        id: newId,
                        title: '[New Benefit Card]',
                        description: '[Description]',
                        iconOrImageAssetId: 'zap',
                        order: benefits.length + 1
                      }
                    ]);
                  }}
                  className="px-2.5 py-1 rounded bg-blue-600 text-xs font-semibold hover:bg-blue-500 cursor-pointer"
                >
                  + Add Card
                </button>
              </div>

              <div className="space-y-3">
                {benefits.map((card, idx) => (
                  <div key={card.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-blue-400 font-semibold">Card #{idx + 1}</span>
                      <button
                        onClick={() => setBenefits(benefits.filter((b) => b.id !== card.id))}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => {
                        const updated = [...benefits];
                        updated[idx].title = e.target.value;
                        setBenefits(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-semibold"
                    />
                    <textarea
                      value={card.description}
                      onChange={(e) => {
                        const updated = [...benefits];
                        updated[idx].description = e.target.value;
                        setBenefits(updated);
                      }}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: USE CASES & REFERENCES */}
          {activeTab === 'usecases' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Use Cases &amp; Reference Visuals (Option A)
              </h2>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Common Bottlenecks (Use Cases)</h3>
                {useCases.map((uc, idx) => (
                  <div key={uc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <input
                      type="text"
                      value={uc.title}
                      onChange={(e) => {
                        const updated = [...useCases];
                        updated[idx].title = e.target.value;
                        setUseCases(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-semibold"
                    />
                    <textarea
                      value={uc.description}
                      onChange={(e) => {
                        const updated = [...useCases];
                        updated[idx].description = e.target.value;
                        setUseCases(updated);
                      }}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Portfolio &amp; System Reference Visuals</h3>
                {referenceVisuals.map((ref, idx) => (
                  <div key={ref.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <input
                      type="text"
                      value={ref.caption}
                      onChange={(e) => {
                        const updated = [...referenceVisuals];
                        updated[idx].caption = e.target.value;
                        setReferenceVisuals(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AVATAR & SPEECH */}
          {activeTab === 'avatar' && avatarConfig && captionTrack && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Runtime Avatar &amp; Hinglish Speech Settings (Section 3 &amp; 3A)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Runtime Engine</label>
                  <select
                    value={avatarConfig.engineName}
                    onChange={(e) => setAvatarConfig({ ...avatarConfig, engineName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  >
                    <option value="d-id">D-ID Agents (WebRTC)</option>
                    <option value="simli">Simli (Ultra Low-Cost)</option>
                    <option value="heygen">HeyGen LiveAvatar</option>
                    <option value="mock">Local Dev Mock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Playback Mode</label>
                  <select
                    value={avatarConfig.playbackMode}
                    onChange={(e) => setAvatarConfig({ ...avatarConfig, playbackMode: e.target.value as AvatarConfig['playbackMode'] })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  >
                    <option value="autoplay-muted">Autoplay Muted (Option 1)</option>
                    <option value="tap-to-play">Tap-to-Play Gesture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Voice Accent</label>
                  <input
                    type="text"
                    value={avatarConfig.accent || 'indian-english'}
                    onChange={(e) => setAvatarConfig({ ...avatarConfig, accent: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hinglish Spoken Script</label>
                <textarea
                  value={avatarConfig.scriptText}
                  onChange={(e) => setAvatarConfig({ ...avatarConfig, scriptText: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                />
              </div>

              {/* Captions Segments */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300">Synchronized Caption Segments</h3>
                  <button
                    onClick={() => {
                      // Trigger re-sync
                      const words = avatarConfig.scriptText.split(' ');
                      const dur = Math.max(3000, words.length * 360);
                      setCaptionTrack({
                        ...captionTrack,
                        segments: [
                          { startMs: 0, endMs: Math.round(dur * 0.45), text: words.slice(0, Math.ceil(words.length / 2)).join(' ') },
                          { startMs: Math.round(dur * 0.45), endMs: dur, text: words.slice(Math.ceil(words.length / 2)).join(' ') }
                        ]
                      });
                    }}
                    className="px-2 py-1 rounded bg-indigo-600/30 text-indigo-300 text-[11px] hover:bg-indigo-600/40 cursor-pointer"
                  >
                    ⚡ Auto-Generate Timings
                  </button>
                </div>

                {captionTrack.segments.map((seg, sIdx) => (
                  <div key={sIdx} className="grid grid-cols-12 gap-2 p-2 bg-slate-950 rounded border border-slate-800 items-center text-xs">
                    <span className="col-span-3 text-[11px] font-mono text-slate-400">
                      {seg.startMs}ms – {seg.endMs}ms
                    </span>
                    <input
                      type="text"
                      value={seg.text}
                      onChange={(e) => {
                        const updated = [...captionTrack.segments];
                        updated[sIdx].text = e.target.value;
                        setCaptionTrack({ ...captionTrack, segments: updated });
                      }}
                      className="col-span-9 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CHATBOT & KNOWLEDGE */}
          {activeTab === 'chatbot' && chatbotConfig && knowledgeDoc && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Claude Chatbot &amp; Business Knowledge (Appendix A &amp; D)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name</label>
                  <input
                    type="text"
                    value={chatbotConfig.modelName}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-400 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Anthropic Claude Haiku 5.5 ($100 budget line)</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fallback Response</label>
                  <input
                    type="text"
                    value={chatbotConfig.fallbackResponse}
                    onChange={(e) => setChatbotConfig({ ...chatbotConfig, fallbackResponse: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Greeting</label>
                <textarea
                  value={chatbotConfig.greeting}
                  onChange={(e) => setChatbotConfig({ ...chatbotConfig, greeting: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Approved Business Knowledge Document (RAG Grounding Source)
                </label>
                <textarea
                  value={knowledgeDoc.content}
                  onChange={(e) => setKnowledgeDoc({ ...knowledgeDoc, content: e.target.value })}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 6: VERSION HISTORY */}
          {activeTab === 'versions' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Published Content Versions &amp; Rollback History
              </h2>

              <div className="space-y-3">
                {versions.map((ver) => (
                  <div key={ver.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-400">{ver.id}</span>
                      <p className="text-[11px] text-slate-400">
                        Published by <span className="text-slate-300 font-semibold">{ver.publishedBy}</span> on {new Date(ver.publishedAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRollback(ver.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
                    >
                      ↩ Rollback to this Version
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Account Security: Change Admin Password
              </h2>

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (min 8 chars)</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Update Admin Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
