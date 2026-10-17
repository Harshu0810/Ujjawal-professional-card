# Changelog

All notable changes to the AI Digital Marketer Intro Website project will be documented in this file.
This changelog follows the project milestones outlined in `AI_Intro_Webpage_Build_Plan_v2.md`.

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
