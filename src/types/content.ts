/**
 * Content Data Model Sketch (Appendix B)
 * Literal starting shape for the persistent content store and admin schema.
 */

export interface ContactLink {
  label: string;
  url: string;
  type: 'email' | 'whatsapp' | 'phone' | 'cal' | 'other';
}

export interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'github' | 'youtube' | 'other';
  url: string;
  label: string;
}

export interface SiteConfig {
  logoAssetId: string;
  faviconAssetId: string;
  brandColors: string[];
  fontChoice: string;
  taglines: string[];
  headline: string;
  introText: string;
  aboutText: string;
  preloaderText: string;
  preloaderAssetId: string;
  preloaderDurationMs: number;
  footerText: string;
  privacyConsentText: string;
  contactLinks: ContactLink[];
  socialLinks: SocialLink[];
  ctaLabel: string;
  ctaTarget: string;
  publishedVersionId?: string;
  draftVersionId?: string;
}

export interface BenefitCard {
  id: string;
  title: string;
  description: string;
  iconOrImageAssetId: string;
  order: number;
}

export interface UseCaseVisual {
  id: string;
  title: string;
  description: string;
  imageAssetId: string;
  order: number;
}

/**
 * Reference Visuals:
 * Corresponds to "resemble pictures" in Section 0 & Appendix B.
 * Flagged for owner confirmation (portfolio sample visuals vs. avatar training photos).
 */
export interface ReferenceVisual {
  id: string;
  caption: string;
  imageAssetId: string;
  order: number;
}

export type AvatarPlaybackMode = 'autoplay-muted' | 'tap-to-play';

export interface AvatarConfig {
  avatarAssetId: string;
  engineName: string; // e.g., 'd-id' | 'heygen' | 'simli'
  engineAvatarId: string;
  scriptText: string;
  language: string; // 'hinglish' | 'en' | 'hi'
  voiceId?: string;
  speechStyle?: string;
  tone?: string;
  accent?: string;
  speedMultiplier?: number;
  playbackMode: AvatarPlaybackMode;
  lastRenderedAt?: string;
  renderStatus: 'idle' | 'rendering' | 'ready' | 'error';
}

export interface CaptionSegment {
  startMs: number;
  endMs: number;
  text: string;
}

export interface CaptionTrack {
  avatarConfigId: string;
  segments: CaptionSegment[];
  fontFamily: string;
  fontSize: string;
  textColor: string;
  backgroundColor: string;
  position: 'bottom-center' | 'bottom-overlay' | 'below-avatar';
  needsResync: boolean; // true after script edits until re-synced
}

export interface KnowledgeDocument {
  id: string;
  versionNumber: number;
  content: string; // structured document matching Appendix A
  lastIndexedAt?: string;
  ownerApproved: boolean;
}

export interface ChatbotConfig {
  greeting: string;
  introSummary: string;
  leadQuestions: string[];
  fallbackResponse: string;
  allowedTopicsNote: string;
  modelName: string; // default: 'claude-haiku-5-5'
  maxOutputTokens: number;
  rateLimitPerSessionPerMinute: number;
  maxSessionExchanges?: number; // default: 3 per v3 Section 2B
  allowGeneralQuestions?: boolean; // default: true per v3 Section 2A
  // v4 Extended: Multi-Provider API Keys & Local LLM (Ollama / ngrok) Endpoints
  anthropicApiKey?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  groqApiKey?: string;
  groqModel?: string;
  ollamaBaseUrl?: string; // Live ngrok tunnel URL or local endpoint (e.g. https://xyz.ngrok-free.app or http://localhost:11434)
  ollamaModel?: string;   // e.g. 'llama3.2', 'mistral', 'deepseek-r1:8b', 'qwen2.5'
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  lastLoginAt?: string;
}

export interface ContentVersion {
  id: string;
  targetEntity: string; // 'site' | 'avatar' | 'knowledge' | 'all'
  snapshot: Record<string, unknown>;
  publishedAt: string;
  publishedBy: string;
}
