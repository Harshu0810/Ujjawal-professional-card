# Changelog

All notable changes to the AI Digital Marketer Intro Website project will be documented in this file.
This changelog follows the project milestones outlined in `AI_Intro_Webpage_Build_Plan_v2.md`.

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
