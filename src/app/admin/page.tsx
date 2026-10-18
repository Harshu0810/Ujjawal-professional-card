'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AvatarPlayer from '@/components/AvatarPlayer';
import {
  SiteConfig,
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

  // Content state (Draft) - v3 Section 4 tabs
  const [activeTab, setActiveTab] = useState<'brand' | 'avatar' | 'chatbot' | 'contacts' | 'versions' | 'security'>('brand');
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
  const [captionTrack, setCaptionTrack] = useState<CaptionTrack | null>(null);
  const [knowledgeDoc, setKnowledgeDoc] = useState<KnowledgeDocument | null>(null);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [providerDiagnostic, setProviderDiagnostic] = useState<{ provider: string; model: string; timestamp: string } | null>(null);
  const [versions, setVersions] = useState<ContentVersion[]>([]);

  // Feedback notifications
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // AI Provider live testing state
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        const draft = data.draft;
        setSiteConfig(draft.siteConfig);
        setAvatarConfig(draft.avatarConfig);
        setCaptionTrack(draft.captionTrack);
        setKnowledgeDoc(draft.knowledgeDocument);
        setChatbotConfig(draft.chatbotConfig);
        setVersions(draft.versions || []);
        if (data.providerDiagnostic) {
          setProviderDiagnostic(data.providerDiagnostic);
        }
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

  const handleTestProvider = async (provider: 'claude' | 'gemini' | 'groq' | 'ollama') => {
    if (!chatbotConfig) return;
    setTestingProvider(provider);
    setTestResult(null);

    try {
      let payload = {};
      if (provider === 'claude') {
        payload = { provider: 'claude', apiKey: chatbotConfig.anthropicApiKey, model: chatbotConfig.modelName };
      } else if (provider === 'gemini') {
        payload = { provider: 'gemini', apiKey: chatbotConfig.geminiApiKey, model: chatbotConfig.geminiModel };
      } else if (provider === 'groq') {
        payload = { provider: 'groq', apiKey: chatbotConfig.groqApiKey, model: chatbotConfig.groqModel };
      } else if (provider === 'ollama') {
        payload = { provider: 'ollama', baseUrl: chatbotConfig.ollamaBaseUrl, model: chatbotConfig.ollamaModel };
      }

      const res = await fetch('/api/admin/test-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          provider,
          success: true,
          message: `Connected (${data.latencyMs}ms)! Response: "${data.reply}" [${data.model}]`
        });
      } else {
        setTestResult({
          provider,
          success: false,
          message: data.error || 'Connection failed'
        });
      }
    } catch (err: unknown) {
      setTestResult({
        provider,
        success: false,
        message: err instanceof Error ? err.message : 'Network test error'
      });
    } finally {
      setTestingProvider(null);
    }
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
          avatarConfig,
          captionTrack,
          knowledgeDocument: knowledgeDoc,
          chatbotConfig
        })
      });

      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Draft changes saved successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: 'Failed to save draft changes.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error saving draft.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Published live successfully! Snapshot: ${data.version?.id || 'new'}` });
        loadContent();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Publishing failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error publishing content.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm(`Are you sure you want to rollback all content to ${versionId}?`)) return;

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

  // Helper getters for contact links
  const whatsappLink = siteConfig?.contactLinks.find((l) => l.type === 'whatsapp')?.url || '';
  const bookingLink = siteConfig?.contactLinks.find((l) => l.type === 'cal')?.url || '';
  const linkedinLink = siteConfig?.socialLinks?.find((s) => s.platform === 'linkedin')?.url || '';
  const instagramLink = siteConfig?.socialLinks?.find((s) => s.platform === 'instagram')?.url || '';

  const updateContactLink = (type: 'whatsapp' | 'cal', newUrl: string) => {
    if (!siteConfig) return;
    const updated = [...siteConfig.contactLinks];
    const idx = updated.findIndex((l) => l.type === type);
    if (idx >= 0) {
      updated[idx].url = newUrl;
    } else {
      updated.push({ label: type === 'whatsapp' ? 'WhatsApp' : 'Book Call', url: newUrl, type });
    }
    setSiteConfig({ ...siteConfig, contactLinks: updated });
  };

  const updateSocialLink = (platform: 'linkedin' | 'instagram', newUrl: string) => {
    if (!siteConfig) return;
    const updated = [...(siteConfig.socialLinks || [])];
    const idx = updated.findIndex((s) => s.platform === platform);
    if (idx >= 0) {
      updated[idx].url = newUrl;
    } else {
      updated.push({ platform, url: newUrl, label: platform });
    }
    setSiteConfig({ ...siteConfig, socialLinks: updated });
  };

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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                v3 Pivot Live
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

      {/* Main CMS Layout (v3 Section 4 Tabs) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-56 shrink-0 space-y-1">
          {[
            { id: 'brand', label: '🎨 Brand & Theme' },
            { id: 'avatar', label: '🗣️ Avatar & Speech' },
            { id: 'chatbot', label: '🤖 Chatbot & RAG' },
            { id: 'contacts', label: '📞 Contact Links' },
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
          {/* TAB 1: BRAND & THEME (v3 Section 4 Trimmed) */}
          {activeTab === 'brand' && siteConfig && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Brand &amp; Theme Configuration (v3 Section 4)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Logo Asset Path</label>
                  <input
                    type="text"
                    value={siteConfig.logoAssetId}
                    onChange={(e) => setSiteConfig({ ...siteConfig, logoAssetId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Default: /images/logo.svg</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preloader Duration (ms)</label>
                  <input
                    type="number"
                    value={siteConfig.preloaderDurationMs}
                    onChange={(e) => setSiteConfig({ ...siteConfig, preloaderDurationMs: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-500">Bare transition spinner timing</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Privacy Notice Statement</label>
                <textarea
                  value={siteConfig.privacyConsentText}
                  onChange={(e) => setSiteConfig({ ...siteConfig, privacyConsentText: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                />
                <span className="text-[10px] text-slate-500">India DPDP Act 2023 legal notice</span>
              </div>
            </div>
          )}

          {/* TAB 2: AVATAR & SPEECH (Includes Live Re-Sync & Admin Debug Tools) */}
          {activeTab === 'avatar' && avatarConfig && captionTrack && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Runtime Avatar &amp; Hinglish Speech Settings</span>
                <span className="text-xs font-mono font-normal text-emerald-400">Admin Engine Controls</span>
              </h2>

              {/* Live Preview Container with Admin Controls Enabled */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold block">
                  Interactive Test Preview (Admin Debug View)
                </span>
                <AvatarPlayer
                  config={avatarConfig}
                  captions={captionTrack}
                  isAdmin={true} // Displays engine selector, estimated rate, and live script re-sync tool
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Runtime Engine</label>
                  <select
                    value={avatarConfig.engineName}
                    onChange={(e) => setAvatarConfig({ ...avatarConfig, engineName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  >
                    <option value="d-id">D-ID Agents ($0.12/min)</option>
                    <option value="simli">Simli Ultra Low-Cost ($0.018/min)</option>
                    <option value="heygen">HeyGen LiveAvatar ($3.00/min)</option>
                    <option value="mock">Local Dev Sandbox ($0.00)</option>
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

          {/* TAB 3: CHATBOT & RAG (v3 Extended) */}
          {activeTab === 'chatbot' && chatbotConfig && knowledgeDoc && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 gap-2">
                <h2 className="text-base font-bold text-white">
                  Chatbot &amp; Multi-Provider Intelligence (v4 Section 2)
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Last response via:</span>
                  <span className="font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-blue-400">
                    {providerDiagnostic
                      ? `${providerDiagnostic.provider} (${providerDiagnostic.model})`
                      : 'No queries served yet this session'}
                  </span>
                </div>
              </div>

              {/* AI FALLBACK PROVIDERS & LOCAL LLM CONFIGURATION */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>⚡ AI Fallback Providers &amp; Local LLM Configuration</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Admin Priority
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Keys entered here override environment variables. System cascades: Claude → Gemini → Groq → Ollama → Local Sandbox.
                    </p>
                  </div>
                </div>

                {/* Test Result Alert */}
                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs font-mono border flex items-center justify-between ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <span>{testResult.message}</span>
                    <button
                      type="button"
                      onClick={() => setTestResult(null)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer px-1.5"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. Anthropic Claude (Primary) */}
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        1. Anthropic Claude (Primary)
                      </span>
                      <button
                        type="button"
                        disabled={testingProvider === 'claude'}
                        onClick={() => handleTestProvider('claude')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {testingProvider === 'claude' ? 'Testing...' : 'Test Claude'}
                      </button>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Claude API Key (sk-ant-...)</label>
                      <input
                        type="password"
                        value={chatbotConfig.anthropicApiKey || ''}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, anthropicApiKey: e.target.value })}
                        placeholder="sk-ant-api03-..."
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Model Name</label>
                      <input
                        type="text"
                        value={chatbotConfig.modelName || 'claude-haiku-5-5'}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, modelName: e.target.value })}
                        placeholder="claude-haiku-5-5"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* 2. Google Gemini (Fallback 1) */}
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        2. Google Gemini (First Fallback)
                      </span>
                      <button
                        type="button"
                        disabled={testingProvider === 'gemini'}
                        onClick={() => handleTestProvider('gemini')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {testingProvider === 'gemini' ? 'Testing...' : 'Test Gemini'}
                      </button>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Gemini API Key (AI Studio)</label>
                      <input
                        type="password"
                        value={chatbotConfig.geminiApiKey || ''}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, geminiApiKey: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Model Name</label>
                      <input
                        type="text"
                        value={chatbotConfig.geminiModel || 'gemini-2.5-flash'}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, geminiModel: e.target.value })}
                        placeholder="gemini-2.5-flash"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* 3. Groq (Fallback 2) */}
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        3. Groq Fast Inference (Second Fallback)
                      </span>
                      <button
                        type="button"
                        disabled={testingProvider === 'groq'}
                        onClick={() => handleTestProvider('groq')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {testingProvider === 'groq' ? 'Testing...' : 'Test Groq'}
                      </button>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Groq API Key (gsk_...)</label>
                      <input
                        type="password"
                        value={chatbotConfig.groqApiKey || ''}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, groqApiKey: e.target.value })}
                        placeholder="gsk_..."
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Model Name</label>
                      <input
                        type="text"
                        value={chatbotConfig.groqModel || 'llama-3.3-70b-versatile'}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, groqModel: e.target.value })}
                        placeholder="llama-3.3-70b-versatile"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* 4. Local LLM / Ollama via ngrok Tunnel (Fallback 3 / Local Hosting) */}
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        4. Local LLM via Ollama &amp; ngrok Tunnel
                      </span>
                      <button
                        type="button"
                        disabled={testingProvider === 'ollama'}
                        onClick={() => handleTestProvider('ollama')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {testingProvider === 'ollama' ? 'Testing...' : 'Test Ollama / ngrok'}
                      </button>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Ollama ngrok Tunnel Live URL / Serve Address
                      </label>
                      <input
                        type="text"
                        value={chatbotConfig.ollamaBaseUrl || ''}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, ollamaBaseUrl: e.target.value })}
                        placeholder="https://xxxx-xx-xx.ngrok-free.app or http://localhost:11434"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Run: <code className="text-emerald-400">ollama serve</code> &amp; <code className="text-emerald-400">ngrok http 11434</code>
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Ollama Model Name</label>
                      <input
                        type="text"
                        value={chatbotConfig.ollamaModel || 'llama3.2'}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, ollamaModel: e.target.value })}
                        placeholder="llama3.2 (or mistral, deepseek-r1:8b)"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Per-Session Question Cap (v3 Section 2B)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={chatbotConfig.maxSessionExchanges || 3}
                    onChange={(e) => setChatbotConfig({ ...chatbotConfig, maxSessionExchanges: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Enforced strictly on server</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Allow General Knowledge Q&amp;A
                  </label>
                  <select
                    value={chatbotConfig.allowGeneralQuestions !== false ? 'yes' : 'no'}
                    onChange={(e) => setChatbotConfig({ ...chatbotConfig, allowGeneralQuestions: e.target.value === 'yes' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                  >
                    <option value="yes">Enabled (Answers brief trivia/general Qs)</option>
                    <option value="no">Disabled (Redirects off-topic only)</option>
                  </select>
                  <span className="text-[10px] text-slate-500">v3 Section 2A general intelligence</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Output Tokens</label>
                  <input
                    type="number"
                    value={200}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Capped at 200 for 2-3 sentence brevity</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Greeting Template</label>
                <textarea
                  value={chatbotConfig.greeting}
                  onChange={(e) => setChatbotConfig({ ...chatbotConfig, greeting: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Intro Summary</label>
                <textarea
                  value={chatbotConfig.introSummary}
                  onChange={(e) => setChatbotConfig({ ...chatbotConfig, introSummary: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Approved Business Knowledge Document (Appendix A RAG Grounding Source)
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

          {/* TAB 4: CONTACT LINKS (New in v3 Section 4) */}
          {activeTab === 'contacts' && siteConfig && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Direct Contact Links (v3 Section 4)
              </h2>
              <p className="text-xs text-slate-400">
                These channels are permanently docked in the header and surfaced when visitors reach their 3-question preview quota.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp Chat URL / Phone
                  </label>
                  <input
                    type="text"
                    value={whatsappLink}
                    onChange={(e) => updateContactLink('whatsapp', e.target.value)}
                    placeholder="https://wa.me/919876543210?text=..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Strategy Call Booking URL (Cal.com / Calendly)
                  </label>
                  <input
                    type="text"
                    value={bookingLink}
                    onChange={(e) => updateContactLink('cal', e.target.value)}
                    placeholder="https://cal.com/ujjawal/intro"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="text"
                    value={linkedinLink}
                    onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/ujjawal-marketer"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    type="text"
                    value={instagramLink}
                    onChange={(e) => updateSocialLink('instagram', e.target.value)}
                    placeholder="https://instagram.com/ujjawal.growth"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white font-mono focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VERSION HISTORY */}
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

          {/* TAB 6: SECURITY */}
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
