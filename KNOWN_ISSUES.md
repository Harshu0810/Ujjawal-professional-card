# Known Issues and Limitations

This file tracks technical limitations, pending decisions, and temporary placeholders across milestones.

## v4 Status (Live QA Bug Fixes, Multi-Provider AI Fallback, Session Popup & Neumorphic Redesign)

### Resolutions & Enhancements Completed
1. **RAG Scaffolding Leakage Resolved:**
   - Fixed bug where off-topic questions (e.g. general trivia about the ocean) received internal document headers.
   - Zero-score queries now bypass retrieval and return empty chunk arrays.
   - Retrieved chunks undergo sanitization stripping bracketed placeholders, status tags, and appendix headers.
2. **Multi-Provider AI Resilience:**
   - Multi-provider fallback cascade: Claude (`ANTHROPIC_API_KEY`) → Gemini (`GEMINI_API_KEY`) → Groq (`GROQ_API_KEY`) → Grounded Local Sandbox.
   - Server-side diagnostic tracking records the active provider per request and surfaces it in the `/admin` CMS dashboard.
3. **Session-Exhausted Popup:**
   - Dismissible modal at 3/3 questions with dynamic WhatsApp, Book Call, LinkedIn, and Instagram buttons.
   - Non-blocking dismiss action lets visitors freely review their conversation transcript.
4. **Visual Neumorphic Redesign:**
   - Implemented soft UI paired shadows across dark (`#2b2f38`) and light (`#edf0f5`) modes.
   - High-contrast text and icons maintained for accessibility compliance.
5. **Brand Identity:**
   - Removed "Powered by Claude" from chat header.

## Milestone 8 Status (v3 Owner-Directed Pivot — Baseline)

### v3 Pivot Scope Summary
In accordance with `AI_Intro_Webpage_Build_Plan_v3_Pivot.md`, all legacy marketing sections (headline, pros cards, use-case cards, reference visual zoom, static audit form, closing CTA block) have been stripped from the public landing page. The website is centered on:
1. **Pinned Runtime Avatar + Captions:** Autoplay muted with tap-to-unmute and synchronized Hinglish caption tracks. Clean visitor UI with debug badges restricted to `/admin`.
2. **Full-Screen In-Page Chat:** Claude-powered AI assistant with server-side 3-question session quota, general intelligence showcase capability, and direct lead conversion triggers (WhatsApp / Cal.com).
3. **Slim Header & Contact Dock:** Direct links to WhatsApp, Cal.com booking, LinkedIn, and Instagram, plus ThemeToggle (Dark/Light mode) and top ScrollProgressBar.
4. **Streamlined Admin CMS:** Trimmed to 6 functional tabs (`Brand & Theme`, `Avatar & Speech`, `Chatbot & RAG`, `Contact Links`, `Version History`, `Security`).

### Milestone 8 Technical Notes & Operational Trade-offs
1. **Session Quota Reset Behavior (Milestone 9 Review):**
   - Per Section 2B specification, the 3-question cap is session-bound. When a visitor reloads/refreshes the page, their in-memory session resets to 0.
   - *Operational Trade-off:* A motivated visitor could refresh the page to start a new 3-question preview. As noted in Section 9, for a low-traffic personal card website this is standard and harmless; if stronger per-visitor restrictions are ever required in the future, IP-based or device-fingerprint persistent quotas can be enabled via Upstash Redis.
2. **Claude Brevity & Cost Controls:**
   - Out-of-band trivia and general knowledge questions are answered in 2–3 sentences.
   - Enforced by both system prompt instructions and a strict 200 `max_tokens` API limit, protecting Anthropic spend while demonstrating AI capability.

## Milestone 7 Status (Completed — Pre-Pivot Baseline)

### Full Milestones Sign-off (Milestones 1–7)
All milestones in `AI_Intro_Webpage_Build_Plan_v2.md` have been implemented and validated against the Section 8 Acceptance Checklist:
1. **Milestone 1:** Repository structure, TypeScript data schemas (Appendix B), initial dummy content, and Section 0/3A decisions confirmed.
2. **Milestone 2:** Mobile-first responsive visual layout, custom SVG asset library, and click-to-zoom diagram lightbox.
3. **Milestone 3:** Vendor-neutral runtime avatar engine (Simli, D-ID, HeyGen, Mock), real-time WebRTC APIs, live script testing, dynamic Hinglish caption re-sync, and cost scaling evaluation (`docs/AVATAR_POC_EVALUATION.md`).
4. **Milestone 4:** Atomic persistent JSON database (`data/content_store.json`), PBKDF2 SHA-512 password hashing, HMAC-SHA256 session cookies, brute-force rate limiting, 7-tab `/admin` CMS, and snapshot rollback.
5. **Milestone 5:** Grounded Anthropic Claude integration (`claude-haiku-5-5`), semantic RAG ingestion from Appendix A business facts, prompt injection hardening, fail-safe local sandbox, and India DPDP Act 2023 compliance notice.
6. **Milestone 6:** Section 2A pocket-card QR code engine (Level Q, ≥4 module quiet zone), vector SVG streaming/download, print specifications (`docs/QR_PRINT_SPECIFICATION.md`), and content verification.
7. **Milestone 7:** Complete security audit, Section 8 Acceptance Checklist verification, zero secrets committed, and comprehensive operations manual (`docs/HANDOVER_GUIDE.md`).

### Technical Notes for Production Hosting (Vercel)
1. **Serverless Filesystem Persistence:**
   - The local database engine writes atomically to `data/content_store.json`.
   - On Vercel serverless deployments, function filesystems are read-only and ephemeral across cold starts.
   - For persistent cloud state when hosting on Vercel, connect **Vercel KV** or **Upstash Redis** as detailed in `docs/HANDOVER_GUIDE.md`.
2. **Avatar Vendor Credentials:**
   - The system defaults to the zero-cost local sandbox (`mock`) if vendor API keys are not supplied.
   - To activate live streaming avatars, configure `AVATAR_PROVIDER=simli` (or `did` / `heygen`) with corresponding API credentials in Vercel environment variables.
3. **Claude API Token Monitoring:**
   - Uses `claude-haiku-5-5`. If `ANTHROPIC_API_KEY` is omitted, the built-in grounded local semantic sandbox responds to visitor inquiries with zero downtime.
4. **Zero Unverified Claims Policy:**
   - Real client logos, names, and metrics remain omitted per the owner's policy until signed-off proof is supplied.

