import { SiteConfig, BenefitCard, UseCaseVisual, ReferenceVisual, AvatarConfig, CaptionTrack, ChatbotConfig } from '@/types/content';

export const DUMMY_SITE_CONFIG: SiteConfig = {
  logoAssetId: '/images/dummy-logo.svg',
  faviconAssetId: '/favicon.ico',
  brandColors: ['#0f172a', '#3b82f6', '#10b981'],
  fontChoice: 'Inter, system-ui, sans-serif',
  taglines: [
    '[PLACEHOLDER: AI-Powered Digital Marketing & Growth Engineering]',
    '[PLACEHOLDER: Scaling Customer Acquisition with Precision Funnels]'
  ],
  headline: '[PLACEHOLDER: Scaling Brands with Intelligent Performance Marketing]',
  introText: '[PLACEHOLDER: Hi, I am Ujjawal — an AI digital marketer combining performance advertising, conversion-driven funnels, and automated growth workflows to scale customer acquisition.]',
  aboutText: '[PLACEHOLDER: With a focus on measurable revenue impact, I partner with ambitious founders and marketing leaders to design and execute high-converting digital acquisition funnels.]',
  preloaderText: '[PLACEHOLDER: AI Performance Marketing • Funnel Architecture • Growth Systems]',
  preloaderAssetId: '/images/preloader-badge.svg',
  preloaderDurationMs: 1800,
  footerText: '© 2026 [PLACEHOLDER: Ujjawal - AI Digital Marketer]. All rights reserved. [PLACEHOLDER DUMMY CONTENT]',
  privacyConsentText: 'Privacy Notice: We respect your privacy in accordance with DPDP Act 2023 principles. Visitor interaction data is used solely to respond to inquiries.',
  contactLinks: [
    { label: '[PLACEHOLDER: Book Strategy Call]', url: '#contact', type: 'cal' },
    { label: '[PLACEHOLDER: WhatsApp Chat]', url: 'https://wa.me/placeholder', type: 'whatsapp' },
    { label: '[PLACEHOLDER: Email Inquiry]', url: 'mailto:placeholder@example.com', type: 'email' }
  ],
  socialLinks: [
    { platform: 'linkedin', url: 'https://linkedin.com/in/placeholder', label: 'LinkedIn' },
    { platform: 'twitter', url: 'https://x.com/placeholder', label: 'X (Twitter)' }
  ],
  ctaLabel: '[PLACEHOLDER: Start a Conversation]',
  ctaTarget: '#chat'
};

export const DUMMY_BENEFITS: BenefitCard[] = [
  {
    id: 'benefit-1',
    title: '[PLACEHOLDER: AI-Accelerated Creative Velocity]',
    description: '[PLACEHOLDER: Test 5-10x more ad creative variations and hooks in fraction of traditional agency turnaround times.]',
    iconOrImageAssetId: 'zap',
    order: 1
  },
  {
    id: 'benefit-2',
    title: '[PLACEHOLDER: Full-Funnel Architecture]',
    description: '[PLACEHOLDER: Seamless integration connecting ad hooks, dynamic landing page copy, and automated CRM lead capture.]',
    iconOrImageAssetId: 'layers',
    order: 2
  },
  {
    id: 'benefit-3',
    title: '[PLACEHOLDER: Transparent KPI Attribution]',
    description: '[PLACEHOLDER: Live dashboards tracking return on ad spend (ROAS), customer acquisition cost (CAC), and pipeline value.]',
    iconOrImageAssetId: 'bar-chart',
    order: 3
  },
  {
    id: 'benefit-4',
    title: '[PLACEHOLDER: Direct Specialist Attention]',
    description: '[PLACEHOLDER: No junior account middle-managers. Direct strategic collaboration with your dedicated growth engineer.]',
    iconOrImageAssetId: 'user-check',
    order: 4
  }
];

export const DUMMY_USE_CASES: UseCaseVisual[] = [
  {
    id: 'uc-1',
    title: '[PLACEHOLDER USE CASE: Breaking Stagnant Ad Fatigue]',
    description: '[PLACEHOLDER: Re-igniting customer acquisition when previous winning ads burn out and customer acquisition costs spike.]',
    imageAssetId: '/images/dummy-ad-fatigue.svg',
    order: 1
  },
  {
    id: 'uc-2',
    title: '[PLACEHOLDER USE CASE: Fixing Post-Click Lead Leakage]',
    description: '[PLACEHOLDER: Auditing high-traffic, low-converting landing pages to plug funnel drops and boost conversion rate.]',
    imageAssetId: '/images/dummy-funnel-drop.svg',
    order: 2
  },
  {
    id: 'uc-3',
    title: '[PLACEHOLDER USE CASE: Automated Inbound Qualification]',
    description: '[PLACEHOLDER: Integrating instant AI conversational lead qualification to prevent lost inquiries during off-hours.]',
    imageAssetId: '/images/dummy-lead-auto.svg',
    order: 3
  }
];

export const DUMMY_REFERENCE_VISUALS: ReferenceVisual[] = [
  {
    id: 'ref-1',
    caption: '[PLACEHOLDER REFERENCE VISUAL: Sample Campaign Performance Dashboard - Pending Owner Approved Proof]',
    imageAssetId: '/images/dummy-metric-1.svg',
    order: 1
  },
  {
    id: 'ref-2',
    caption: '[PLACEHOLDER REFERENCE VISUAL: Multi-Variant Ad Creative Matrix - Pending Owner Approved Proof]',
    imageAssetId: '/images/dummy-metric-2.svg',
    order: 2
  },
  {
    id: 'ref-3',
    caption: '[PLACEHOLDER REFERENCE VISUAL: Automated Lead Funnel Pipeline Map - Pending Owner Approved Proof]',
    imageAssetId: '/images/dummy-metric-3.svg',
    order: 3
  }
];

export const DUMMY_AVATAR_CONFIG: AvatarConfig = {
  avatarAssetId: '/images/dummy-avatar-photo.png',
  engineName: 'd-id', // target runtime engine to validate in Milestone 3
  engineAvatarId: 'avatar_ujjawal_draft',
  scriptText: 'Namaste! Main hoon Ujjawal, aapka AI Digital Marketing partner. Main aapke business ke customer acquisition aur sales funnels ko scale karne mein help karta hoon.',
  language: 'hinglish',
  speechStyle: 'warm-professional',
  tone: 'confident',
  accent: 'indian-english',
  speedMultiplier: 1.0,
  playbackMode: 'autoplay-muted', // Section 3A Option 1: muted by default with explicit unmute control
  renderStatus: 'idle'
};

export const DUMMY_CAPTION_TRACK: CaptionTrack = {
  avatarConfigId: 'avatar_ujjawal_draft',
  segments: [
    { startMs: 0, endMs: 2200, text: 'Namaste! Main hoon Ujjawal, aapka AI Digital Marketing partner.' },
    { startMs: 2200, endMs: 5000, text: 'Main aapke business ke customer acquisition aur sales funnels ko' },
    { startMs: 5000, endMs: 7800, text: 'scale karne mein help karta hoon.' }
  ],
  fontFamily: 'Inter, sans-serif',
  fontSize: '1.05rem',
  textColor: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  position: 'bottom-center',
  needsResync: false
};

export const DUMMY_CHATBOT_CONFIG: ChatbotConfig = {
  greeting: 'Hi there! I am the AI assistant for Ujjawal’s digital marketing business. Would you like a quick overview of what he does, or do you have a specific question about your marketing goals?',
  introSummary: 'Ujjawal is an AI digital marketer specializing in performance ad campaigns, conversion funnel optimization, and automated lead acquisition systems.',
  leadQuestions: [
    'What role do you play in your company, and what does your business do?',
    'Where is your business located, and what is your primary target market?',
    'What is your main growth or revenue target for the next quarter?',
    'How do you currently acquire most of your leads or customers?',
    'What is the single biggest bottleneck in your current marketing funnel?'
  ],
  fallbackResponse: 'I do not have specific verified information on that in Ujjawal’s approved business profile. Would you like to connect with him directly via email or schedule a quick discovery call?',
  allowedTopicsNote: 'Digital marketing services, AI marketing workflows, working process, engagement models, and booking discovery calls.',
  modelName: 'claude-haiku-5-5',
  maxOutputTokens: 350,
  rateLimitPerSessionPerMinute: 6
};
