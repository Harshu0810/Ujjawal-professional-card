# Changelog

All notable changes to the AI Digital Marketer Intro Website project will be documented in this file.
This changelog follows the project milestones outlined in `AI_Intro_Webpage_Build_Plan_v4.md`.

## [v4 Build - Live QA Bug Fixes, Multi-Provider Fallback, Session Popup & Neumorphism] - 2026-10-18
### Fixed
- **🔴 RAG Scaffolding Leakage Bug (v4 Section 1):**
  - Resolved bug where off-topic queries (e.g. "Tell me a one-line fun fact about the ocean") received fallback document header chunks containing `[DRAFT / DUMMY PLACEHOLDER]` text.
  - Updated `src/lib/rag/index.ts` so zero-score queries return an empty chunk array `[]` rather than fallback to internal document headers.
  - Implemented comprehensive `sanitizeForRetrieval()` engine that strips placeholder brackets, status labels, internal appendix markers, and dangling key labels before chunks reach model context.
  - Added anti-leakage instruction to system prompt (`src/lib/chatbot/prompt.ts`) and dynamically omitted business context block when empty.

### Added
- **Multi-Provider AI Fallback Engine (`src/lib/chatbot/claude.ts`):**
  - Priority chain: **Claude** (`ANTHROPIC_API_KEY`) → **Google Gemini** (`GEMINI_API_KEY`, `gemini-2.5-flash`) → **Groq** (`GROQ_API_KEY`, `llama-3.3-70b-versatile`) → **Grounded Local Sandbox**.
  - Server-side failure recovery: If Claude API key is absent or errors, request seamlessly cascades to Gemini, then Groq, with no user disruption.
  - Added read-only provider diagnostic line in `🤖 Chatbot & RAG` admin CMS tab (`src/app/admin/page.tsx`) displaying which provider answered the last query (`Claude`, `Gemini (fallback)`, `Groq (fallback)`, or `Local`).
- **Session-Exhausted Popup Modal (`src/components/FullScreenChat.tsx`):**
  - Triggers exactly when quota reaches 3/3 questions.
  - Dismissible popup modal informing visitor that preview has ended, with dynamic WhatsApp, Book Call, LinkedIn, and Instagram buttons pulled from `siteConfig`.
  - Non-blocking: Includes close button and "Keep reading conversation transcript" control so visitor can freely review prior chat.
  - Persistent inline banner preserved in chat thread as secondary reminder.
- **Neumorphism Soft UI Redesign (`src/app/globals.css` & components):**
  - Applied soft UI treatment across both Light Mode (base `#edf0f5`) and Dark Mode (base `#2b2f38`).
  - Implemented paired soft shadows for extruded elements (`.neu-raised`, `.neu-raised-sm`), pressed input fields (`.neu-inset`), and interactive buttons (`.neu-button`, `.neu-accent-blue`, `.neu-accent-emerald`).
  - Redesigned Avatar Player, Full-Screen Chat, input fields, message bubbles, contact buttons, and ThemeToggle to neumorphic styling.
  - Preserved accessible high-contrast text and icons throughout.

### Changed
- **Chat Header Wording (v4 Section 4):**
  - Removed "Powered by Claude" text from header.
  - Updated header to: `Ujjawal AI Growth Assistant •` with subtitle `Grounded in verified systems`.

---

## [Milestone 8 - v3 Owner-Directed Pivot] - 2026-10-18
### Added
- **Full-Screen In-Page Chat Interface (`src/components/FullScreenChat.tsx`):**
  - Serves as the primary centerpiece of the website directly beneath the pinned avatar.
  - Implemented server-side session quota enforcement (`3 questions per session`) tracked in `/api/chat`.
  - Added visual session exchange quota badge (`Quota: X / 3 Used`) with real-time reactive feedback.
  - Added message 4 quota banner transforming the session limit into a high-intent lead conversion callout directly linking to WhatsApp and Cal.com booking.
  - Pre-populated initial conversation thread with Ujjawal's greeting and quick suggestion pills.
  - Bound by DPDP Act 2023 compliance notice.
- **Server-Side Quota & General Intelligence Engine (`src/app/api/chat/route.ts` & `src/lib/chatbot/`):**
  - Updated system prompt (`src/lib/chatbot/prompt.ts`) per Section 2E skeleton: allows brief general questions/testing while strictly grounding all business Q&A in Appendix A knowledge.
  - Enforced strict 200 `max_tokens` cap and 2-3 sentence brevity instruction to safeguard API costs.
  - Enforced server-side quota tracking via in-memory `sessionStore` keyed by session token/IP, blocking 4th+ API queries with 403 quota responses.
- **Direct Contact Links CMS Tab (`src/app/admin/page.tsx`):**
  - Added dedicated `📞 Contact Links` admin management tab allowing the owner to dynamically configure WhatsApp, Booking (Cal.com), LinkedIn, and Instagram URLs.
  - Added editable question quota limit and general questions toggle in `🤖 Chatbot & RAG` tab.
  - Integrated interactive live avatar debug player directly into `🗣️ Avatar & Speech` tab.
- **Clean Visitor Avatar Presentation (`src/components/AvatarPlayer.tsx`):**
  - Introduced `isAdmin?: boolean` prop: on public page, all internal dev/debug badges (`Est. Rate`, `Runtime Adapter: D-ID`, `Test Script`) are hidden. Full developer controls remain active inside `/admin`.

### Removed
- Removed legacy promotional sections from the public page:
  - Hero headline, subheadline, and intro paragraph.
  - Section navigation links.
  - "Why Partner With Ujjawal" benefits/pros cards.
  - "Common Marketing Bottlenecks Solved" use-case cards.
  - "Portfolio & Performance Reference Visuals" and hover-zoom lightbox.
  - Static "Request an AI Funnel & Growth Audit" form (fully superseded by the interactive chatbot).
  - Closing CTA block ("Ready to Accelerate...").
  - QR pocket-card button/modal on public page.
  - Generic copy-to-clipboard buttons.
  - Branded preloader recognition lines (reduced to a bare, non-blocking 0.5s transition line).

---

## [UX & Conversion Enhancements] - 2026-10-17
### Added
- **Dark Mode Toggle (`src/components/ThemeToggle.tsx`):**
  - Smooth light/dark theme switcher powered by `useSyncExternalStore` and `localStorage` persistence (`ujjawal_theme`).
  - Seamless color system transition between light (slate-50 / white cards) and dark (slate-950 / glassmorphism) themes.
- **Scroll Progress Bar (`src/components/ScrollProgressBar.tsx`):**
  - Viewport-width gradient progress indicator fixed at top with smooth scroll calculation.
- **Sticky Header Enhancement:**
  - Dynamic glassmorphic elevation and border transitions on scroll (`isScrolled`), incorporating desktop jump navigation.
- **Copy-to-Clipboard Buttons (`src/components/CopyButton.tsx`):**
  - Instant one-click copy with animated checkmark and "Copied!" popover tooltip for email, WhatsApp, website URL, and QR fallback link.
- **UTM Tracking & Inquiry Form (`src/components/UtmInquiryForm.tsx` & `src/app/api/inquiry/route.ts`):**
  - Automatic URL and referrer parameter capture (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`).
  - Visual attribution badge displaying real-time tracking metrics to visitors.
  - Interactive lead capture form with monthly spend brackets and bottleneck selection.
  - Full loading state (spinner), validation error states, and celebratory success state.
- **Floating Contact Dock (`src/components/FloatingContactDock.tsx`):**
  - Collapsible floating speed-dial dock in bottom corner with direct action links for:
    - **WhatsApp** (pre-filled greeting message)
    - **Instagram** (`@ujjawal.growth`)
    - **LinkedIn** (`/in/ujjawal-marketer`)
    - **Strategy Call Booking** (`cal.com/ujjawal/intro`)
  - Smooth hover tooltips and micro-interactions.
- **Loading Animations & Error States:**
  - Shimmer loading skeleton placeholders for value proposition cards during data synchronization.
  - Global error banner with one-click "Retry Sync" action if CMS API fails.
  - Card hover lift (`hover:-translate-y-1.5`) and glowing border states.

## [Milestone 7] - 2026-10-17
### Added
- Completed end-to-end production audit against the Section 8 Acceptance Checklist:
  - **Page & Performance:** Verified preloader fail-open timeout (2,000ms), responsive layouts across breakpoints, accessibility focus states, and zero unverified client claims.
  - **Runtime Avatar:** Verified Section 3A Option 1 implementation (stock voice drives WebRTC lip-sync, muted by default with visitor unmute and synchronized Hinglish captions).
  - **Admin CMS & Persistence:** Verified PBKDF2 SHA-512 password authentication, HMAC-SHA256 signed session cookies, sliding-window rate limiting, atomic DB writes, draft vs. published state, and snapshot rollback.
  - **Chatbot & RAG:** Verified grounded answers from Appendix A business knowledge, conversational lead qualification, off-topic deflection, prompt-injection defense, and India DPDP Act 2023 compliance notice.
  - **QR Code & Print:** Verified Section 2A error correction Level Q, quiet zone margin, vector SVG streaming, and print specifications.
- Created comprehensive production manual in `docs/HANDOVER_GUIDE.md`:
  - Step-by-step Vercel deployment instructions (GitHub integration, production environment variables).
  - Credentials rotation guide for admin master password and session secret.
  - Cloud database persistence recommendations for Vercel serverless environments.
  - Runtime avatar cost management and provider switching (`simli`, `did`, `heygen`, `mock`).
  - Chatbot Claude API token monitoring and fail-safe local fallback.
  - Pocket-card print house checklist (350+ GSM matte card, minimum 2×2 cm).
  - Incident recovery procedures (emergency password reset, content rollback).
- Updated `README.md` reflecting 100% completion of Milestones 1–7 with all technical documentation links.
- Verified Next.js 16+ production build (`npm run build`) and ESLint (`npm run lint`) pass cleanly with 0 errors.

## [Milestone 6] - 2026-10-17
### Added
- Implemented Section 2A pocket-card QR code generator (`src/lib/qr/index.ts`):
  - Strict compliance with Error Correction Level Q (25% damage tolerance) and Level M fallback.
  - Quiet zone margin enforcement (≥ 4 modules, un-cropped).
  - High-resolution SVG vector output preventing rasterization blur during professional offset/digital card printing.
- Built QR streaming API endpoint (`GET /api/qr`):
  - Dynamic vector SVG rendering and streaming with HTTP caching.
  - Supports `download=true` header for instant attachment download as `pocket-card-qr-print-spec.svg`.
- Enhanced `QRCodeModal.tsx`:
  - Live vector scannable preview canvas.
  - Interactive target Vercel URL testing with instant reactive QR regeneration.
  - Printed fallback URL display for card typography pairing.
  - One-click print-ready SVG vector download.
  - Card printer compliance specs (Level Q, 4-module quiet zone, 2×2 cm min physical dimensions, matte stock recommendation).
- Created comprehensive physical print guide in `docs/QR_PRINT_SPECIFICATION.md`:
  - Dimensions for standard business card (85 × 55 mm / 3.5 × 2.0 in) and pocket card formats.
  - Minimum scannable module sizes and contrast requirements (black on solid white, ≥10:1 ratio).
  - Paper finish recommendations (matte coated 350+ GSM silk/art card).
- Verified synchronized Hinglish caption tracks against spoken audio timing.
- Audited all placeholder content across landing page, CMS, and dummy data models to guarantee zero unverified client names or metrics.

## [Milestone 5] - 2026-10-17
### Added
- Implemented RAG knowledge ingestion and retrieval engine (`src/lib/rag/index.ts`):
  - Ingests and parses active business knowledge document (Appendix A).
  - Implemented token scoring and retrieval algorithm retrieving top-K passages based on visitor intent.
  - Automatic cache invalidation upon knowledge edits in `/admin`.
- Built server-side Anthropic Claude integration (`src/lib/chatbot/claude.ts`):
  - Direct HTTPS API client to Anthropic Messages endpoint (`claude-haiku-5-5`).
  - Strict system prompt architecture complying with Appendix D.
  - Server-side API key protection (`ANTHROPIC_API_KEY` never sent to client).
  - Grounded zero-API-key local sandbox fallback engine with off-topic redirection, qualification flow, and honesty guardrails.
- Created chat API endpoint (`POST /api/chat`):
  - Per-IP rate limiting (12 messages/min).
  - Message size validation (max 1,000 characters).
  - Context window token management.
- Enhanced `ChatSidebar.tsx` UI:
  - Real-time conversational loops with dynamic bot and user message bubbles.
  - Thinking indicators, quick action suggestion pills, and automatic smooth scroll.
  - Visible India DPDP Act 2023 notice.
- Verified Next.js production build (`npm run build`) and ESLint (`npm run lint`) pass with 0 errors.

## [Milestone 4] - 2026-10-17
### Added
- Implemented persistent database storage engine (`src/lib/db/index.ts`) supporting all Appendix B models:
  - `SiteConfig`, `BenefitCard`, `UseCaseVisual`, `ReferenceVisual`, `AvatarConfig`, `CaptionTrack`, `KnowledgeDocument`, `ChatbotConfig`, `AdminUser`, `ContentVersion`.
  - Atomic write guarantees with temporary file swap and auto-seeding.
  - Draft vs. published state management with version snapshot creation.
  - Snapshot rollback system (`rollbackToVersion`).
- Built secure server-side `/admin` authentication:
  - PBKDF2 with SHA-512 and salt password hashing (`src/lib/auth/password.ts`).
  - Cryptographically signed HMAC-SHA256 session cookies (`HttpOnly; SameSite=Strict; Path=/`) (`src/lib/auth/session.ts`).
  - Sliding window login rate limiting with generic error messages (`src/lib/auth/rateLimit.ts`).
- Created secure admin API routes:
  - `POST /api/admin/login`: rate-limited authentication and session creation.
  - `POST /api/admin/logout`: session cookie invalidation.
  - `GET /api/admin/session`: active session verification.
  - `GET /api/admin/content` & `POST /api/admin/content`: draft read and update.
  - `POST /api/admin/publish`: promote drafts to published live state with version snapshot.
  - `POST /api/admin/rollback`: restore previous content snapshot.
  - `POST /api/admin/change-password`: owner password update.
  - `GET /api/content`: public live content endpoint.
- Built comprehensive `/admin` CMS dashboard with tabbed controls:
  - Brand & Page configuration, Benefit cards, Bottlenecks & References, Avatar script & caption synchronization, Chatbot & RAG knowledge editor, Version history with rollbacks, and Account security.
- Updated public landing page (`src/app/page.tsx`) to dynamically load published content from the persistent database on mount, enabling live CMS updates without code redeployment.
- Verified zero errors and zero warnings across Next.js build and ESLint.

## [Milestone 3] - 2026-10-17
### Added
- Built vendor-neutral runtime avatar adapter layer (`src/lib/avatar/`):
  - Defined `IAvatarAdapter`, `AvatarSession`, `SpeechRequest`, and `SpeechResult` interfaces.
  - Implemented `DidAdapter` for D-ID Agents streaming API with Azure Neural TTS.
  - Implemented `HeygenAdapter` for HeyGen LiveAvatar real-time API.
  - Implemented `SimliAdapter` for ultra low-cost real-time audio-to-video WebRTC layer (~$0.018/min).
  - Implemented `MockAdapter` for local development sandbox with zero API spend.
- Implemented server-side API endpoints protecting private credentials:
  - `POST /api/avatar/session`: WebRTC session handshake & ICE server negotiation.
  - `DELETE /api/avatar/session`: Graceful session teardown.
  - `POST /api/avatar/speak`: Dynamic script synthesis with synchronized Hinglish caption timestamps.
- Enhanced `AvatarPlayer.tsx` with:
  - Active engine selector (`D-ID`, `Simli`, `HeyGen`, `Local Dev Sandbox`).
  - Real-time estimated streaming rate badge based on Appendix C rates.
  - Live script test and re-synchronization interface for instant testing without video regeneration.
  - Verified Section 3A Option 1 compliance (stock voice drives lip-sync, muted by default with explicit user unmute).
- Created detailed technical evaluation report in `docs/AVATAR_POC_EVALUATION.md` documenting per-minute cost scaling projections across scan volumes.

## [Milestone 2] - 2026-10-17
### Added
- Created dedicated vector visual assets in `public/images/`:
  - `logo.svg`: Branded modern monogram for header and preloader.
  - `ad-fatigue.svg`: Use case visual illustrating CAC reduction and AI creative refresh.
  - `funnel-leakage.svg`: Use case visual illustrating post-click drop-off diagnosis and CRO lift.
  - `lead-automation.svg`: Use case visual illustrating AI inbound qualification and routing.
  - `metric-dashboard.svg`: Reference visual (Option A) showing multi-channel growth analytics.
  - `creative-matrix.svg`: Reference visual (Option A) showing multi-variant ad testing framework.
  - `pipeline-map.svg`: Reference visual (Option A) showing end-to-end attribution lifecycle funnel.
- Implemented Section 0 owner confirmations:
  - Confirmed "Resemble pictures" as **Option A** (sample portfolio/marketing performance reference visuals; real client names omitted per policy).
  - Maintained approved default for Preloader content ("AI Performance Marketing • Funnel Architecture • Growth Systems").
  - Mapped common client bottlenecks into dedicated use-case visual cards.
  - Enforced strict omission of unverified client claims and awards.
- Added click-to-zoom diagram lightbox in `src/app/page.tsx` for high-resolution inspection of diagrams.
- Assigned unique, descriptive IDs across all sections, interactive buttons, and cards for testability and SEO.
- Verified Next.js production build (`npm run build`) and ESLint (`npm run lint`) pass with 0 errors.

## [Milestone 1] - 2026-10-17
### Added
- Initialized Next.js 16+ project with TypeScript, App Router, React 19, and Tailwind CSS.
- Established Git version control repository; configured `.gitignore` to protect environment secrets while tracking `.env.example`.
- Created `.env.example` defining all required configuration keys without exposing real credentials.
- Created `src/types/content.ts` defining data models matching Appendix B (`SiteConfig`, `BenefitCard`, `UseCaseVisual`, `ReferenceVisual`, `AvatarConfig`, `CaptionTrack`, `KnowledgeDocument`, `ChatbotConfig`, `AdminUser`, `ContentVersion`).
- Created `src/data/business-knowledge.dummy.md` adhering strictly to Appendix A (all 12 points) with clearly labeled `[DUMMY / PLACEHOLDER]` sections.
- Created `src/data/dummyContent.ts` providing typed baseline placeholder content with explicit `[PLACEHOLDER]` labeling.
- Created `src/lib/chatbot/prompt.ts` with prompt builder implementing Appendix D's structural template.
- Implemented baseline responsive page (`src/app/page.tsx`) with preloader transition, brand header, avatar playback container with Hinglish synchronized captions mockup, value proposition cards ("pros"), use cases, reference visuals placeholder, clear CTA, and footer with DPDP notice.
- Added collapsible chatbot drawer component stub ready for Milestone 5 Claude integration.
- Created `KNOWN_ISSUES.md` and `CHANGELOG.md` for milestone tracking and future debugging.
- Verified Next.js production build (`npm run build`) passes cleanly with zero errors.
