# Known Issues and Limitations

This file tracks technical limitations, pending decisions, and temporary placeholders across milestones.

## Milestone 4 Status (Completed)

### Resolved Items & Technical Validations
1. **Server-Side Authentication & Session Management:**
   - Implemented PBKDF2 with SHA-512 and salt password hashing.
   - Enforced cryptographically signed HMAC-SHA256 session cookies (`HttpOnly; Secure; SameSite=Strict; Path=/`).
   - Added in-memory sliding window rate limiting (5 attempts / 15 minutes lockout) with safe generic error messages.
2. **Persistent Database (Appendix B Schema):**
   - File-backed persistent database (`data/content_store.json`) with atomic swap writes.
   - Full Appendix B relational & document structures: `SiteConfig`, `BenefitCard`, `UseCaseVisual`, `ReferenceVisual`, `AvatarConfig`, `CaptionTrack`, `KnowledgeDocument`, `ChatbotConfig`, `AdminUser`, `ContentVersion`.
   - Separate draft vs. published state.
   - Full version snapshot history and one-click rollback system (`/api/admin/rollback`).
3. **Live CMS Updates:**
   - Public site (`src/app/page.tsx`) queries published content via `/api/content`, showing immediate updates without code rebuilds or redeployment.
4. **Admin Dashboard UI (`/admin`):**
   - Implemented complete management controls across 7 tabs: Brand & Page, Benefits, Bottlenecks & References, Avatar & Speech with re-sync, Chatbot & RAG knowledge editor, Version history, and Password security.

### Active Focus: Milestone 5 — Chatbot and RAG Integration
- **Technical Objective:** Implement server-side Anthropic Claude integration (`claude-haiku-5-5`) with grounded RAG chunk retrieval over the Appendix A business document.
- **Features:** Conversational one-question-at-a-time lead qualification, prompt-injection defense, off-topic redirection, rate limiting, and visible DPDP Act 2023 consent notice.

### Deferred Features (Per Milestone Sequencing)
- **Final Card Print Physical Validation:** Scheduled for Milestone 6.
