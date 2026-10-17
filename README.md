# AI Digital Marketer Intro Website

Production introductory website for **Ujjawal**, AI Digital Marketer, built from the authoritative specification in `AI_Intro_Webpage_Build_Plan_v2.md`.

---

## 1. Project Overview & Architectural Principles

- **Primary Goal:** Make an immediate, high-converting impression upon scanning a pocket-size card QR code; introduce capabilities, showcase practical solutions to common marketing bottlenecks, and qualify leads conversationally.
- **Runtime Avatar Architecture:** Designed for a real runtime animated avatar (not a static pre-rendered looping video). Lip-sync and speech are delivered in Hinglish with synchronized captioning.
- **Section 3A Voice Strategy:** Building toward **Option 1** — leveraging the runtime engine's bundled/default TTS voice to drive lip synchronization, configured to play muted by default on page load to respect browser policies, with clear on-screen captions as the primary communication channel and an explicit unmute control for the visitor.
- **Maintainability & Security:** Strict separation of client code and server-side secrets. Authentication on `/admin` backed by persistent database storage (Appendix B). Grounded chatbot answers using server-side Claude API with RAG retrieval from an owner-approved business knowledge document (Appendix A).
- **Deployment Target:** Hosted exclusively on **Vercel** (`*.vercel.app`). Version control via private GitHub repository. (GitHub Pages is not used).

---

## 2. Technology Stack

- **Framework:** Next.js 16+ (App Router, Turbopack)
- **Language:** TypeScript 5+ (Strict mode)
- **UI & Styling:** Tailwind CSS 4 with custom dark-mode aesthetic and glassmorphism
- **AI Chatbot:** Anthropic Claude API (`claude-haiku-5-5`) with server-side RAG chunk retrieval
- **Runtime Avatar:** Vendor-neutral adapter layer evaluating D-ID, HeyGen, and Simli
- **Deployment:** Vercel

---

## 3. Directory Structure

```
├── .env.example                     # Environment variable template (no secrets committed)
├── AI_Intro_Webpage_Build_Plan_v2.md# Authoritative project specification
├── CHANGELOG.md                     # Milestone-by-milestone change history
├── KNOWN_ISSUES.md                  # Active technical limitations & open decisions
├── src/
│   ├── app/
│   │   ├── globals.css              # Global styles & theme tokens
│   │   ├── layout.tsx               # Root layout & SEO metadata
│   │   └── page.tsx                 # Main single-page interactive layout (Section 2C)
│   ├── components/
│   │   ├── Preloader.tsx            # Branded preloader transition (fail-open)
│   │   ├── AvatarPlayer.tsx         # Avatar player with synchronized Hinglish captions
│   │   ├── ChatSidebar.tsx          # Collapsible conversational lead qualification
│   │   └── QRCodeModal.tsx          # QR card print spec preview (Section 2A)
│   ├── data/
│   │   ├── business-knowledge.dummy.md # Appendix A RAG document (Draft / Dummy)
│   │   └── dummyContent.ts          # Typed placeholder content for UI baseline
│   ├── lib/
│   │   └── chatbot/
│   │       └── prompt.ts            # Appendix D system prompt builder
│   └── types/
│       └── content.ts               # Appendix B literal database schema types
```

---

## 4. Local Development

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd ujjawal_intro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Populate .env.local with development values
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

5. **Run production build:**
   ```bash
   npm run build
   ```

---

## 5. Milestone Sequencing (Section 7)

- [x] **Milestone 1:** Repository, baseline, and content brief questions (Section 0 & 3A).
- [ ] **Milestone 2:** Visual design, responsive layout polish, and QR code verification.
- [ ] **Milestone 3:** Avatar technical proof of concept, Hinglish validation, and per-minute cost confirmation.
- [ ] **Milestone 4:** Persistent database schema implementation and authenticated `/admin` panel.
- [ ] **Milestone 5:** Anthropic Claude API chatbot with RAG ingestion and DPDP Act 2023 compliance.
- [ ] **Milestone 6:** Final owner content handoff, script/captions synchronization, and print QR verification.
- [ ] **Milestone 7:** Security audit, end-to-end QA checklist, and production deployment handoff.

---

## 6. Privacy & Legal Notice

Complies with principles of the **India Digital Personal Data Protection (DPDP) Act 2023**:
- Clear, visible notice before conversational lead capture.
- Purpose limitation: data provided is used exclusively to answer inquiries.
- AI disclosure: the chatbot explicitly identifies as an automated AI assistant.
