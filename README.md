# Ujjawal — AI Digital Marketer (Interactive Introduction & Growth Funnel Card)

A high-converting, interactive digital introduction website for **Ujjawal**, AI Digital Marketer & Growth Strategist. Designed to make an immediate impression upon scanning a pocket-size card QR code, demonstrate state-of-the-art conversational AI capabilities, and qualify high-intent business leads.

---

## 🌟 Key Highlights & Architecture

- **Pinned Runtime Avatar with Hinglish Captions:** Interactive avatar player delivering a synchronized intro script in Hinglish with precise caption segments (`AvatarPlayer.tsx`), muted by default to comply with browser autoplay policies, with tap-to-unmute audio controls.
- **Full-Screen Conversational AI Centerpiece:** High-velocity chat interface (`FullScreenChat.tsx`) serving as the central interactive core of the landing page, grounded in verified business systems.
- **Multi-Provider AI Fallback & Local LLM Cascade:**
  1. **Anthropic Claude** (`ANTHROPIC_API_KEY` or admin-configured key, primary)
  2. **Google Gemini** (`GEMINI_API_KEY` or admin-configured key, `gemini-2.5-flash`, first fallback)
  3. **Groq** (`GROQ_API_KEY` or admin-configured key, `llama-3.3-70b-versatile`, second fallback)
  4. **Local LLMs via Ollama & ngrok** (Live ngrok tunnel URL e.g. `https://xxxx.ngrok-free.app`, third fallback)
  5. **Grounded Local Sandbox** (Internal semantic RAG engine, zero external downtime safety net)
- **CMS Admin Configuration:**
  - Enter and update Claude, Gemini, Groq API keys directly inside `/admin` without redeploying.
  - Connect your PC's local Ollama serve via an ngrok forwarding URL.
  - Live test diagnostic tool (`/api/admin/test-llm`) to ping any provider and verify latency/responses in one click.
- **3-Exchange Session Quota & Conversion Popup:** Enforces a 3-question preview cap to showcase capability while driving leads directly to WhatsApp and Cal.com booking. Features a non-blocking session-exhausted popup modal on the 3rd exchange plus a persistent inline callout.
- **Neumorphism ("Soft UI") Redesign:**
  - Modern dual-palette design system implemented in pure CSS:
    - **Light Mode Base:** `#edf0f5` with paired soft shadows (`#cad1dc` / `#ffffff`).
    - **Dark Mode Base:** `#2b2f38` with paired soft shadows (`#1e2127` / `#383d49`).
  - Extruded cards (`.neu-raised`), pressed input wells (`.neu-inset`), and interactive buttons (`.neu-button`).
  - Accessible hybrid contrast: Sharp high-contrast typography and crisp vector iconography.
- **DPDP Act 2023 Compliance:** Indian Digital Personal Data Protection compliance notice, session-bound client storage, and transparent automated assistant disclosure.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16+ (App Router, Turbopack, React 19) |
| **Language** | TypeScript 5+ (Strict Mode) |
| **Styling** | Tailwind CSS 4 + Custom Neumorphic Soft UI tokens (`globals.css`) |
| **Primary AI Provider** | Anthropic Claude API (`claude-haiku-5-5`) |
| **Cloud Fallback AI** | Google Gemini 2.5 Flash & Groq (Llama 3.3 70B) |
| **Local LLM Support** | Ollama via ngrok live HTTP tunnel |
| **Grounding & RAG** | In-memory semantic keyword chunk indexing with metadata stripping (`src/lib/rag/`) |
| **Avatar Player** | Multi-engine adapter (Simli, D-ID, HeyGen, Local Sandbox) with sub-100ms caption sync |
| **Persistence** | Atomic file-based JSON store (`data/content_store.json`) with rollback snapshots |
| **Security** | PBKDF2 SHA-512 password hashing, HMAC-SHA256 session cookies, brute-force rate limiting |
| **Hosting Target** | Vercel (`*.vercel.app`) |

---

## 📁 Repository Directory Structure

```
├── AI_Intro_Webpage_Build_Plan_v4.md # Authoritative v4 specification & QA report
├── CHANGELOG.md                      # Chronological milestone log (v1 → v4)
├── KNOWN_ISSUES.md                   # Technical resolutions and operational trade-offs
├── src/
│   ├── app/
│   │   ├── admin/page.tsx            # Authenticated CMS (Brand, Avatar, Chatbot, Contacts, Versions)
│   │   ├── api/
│   │   │   ├── admin/                # Admin auth, content sync, and test-llm diagnostic route
│   │   │   ├── avatar/               # Avatar session and script re-sync WebRTC endpoints
│   │   │   ├── chat/route.ts         # Multi-provider chat endpoint with session quota tracking
│   │   │   ├── content/route.ts      # Public published content endpoint
│   │   │   ├── inquiry/route.ts      # UTM-tagged lead inquiry receiver
│   │   │   └── qr/route.ts           # Vector QR print card streaming endpoint
│   │   ├── globals.css               # Neumorphic soft UI design tokens & utilities
│   │   ├── layout.tsx                # Metadata, viewport, and theme initialization
│   │   └── page.tsx                  # Public landing layout: Avatar + Full-Screen Chatbot
│   ├── components/
│   │   ├── AvatarPlayer.tsx          # Pinned avatar player with synchronized captions
│   │   ├── FullScreenChat.tsx        # Centerpiece chatbot with session popup modal
│   │   ├── ScrollProgressBar.tsx     # Viewport scroll progress indicator
│   │   ├── ThemeToggle.tsx           # Neumorphic dark/light mode toggle
│   │   └── UtmInquiryForm.tsx        # Optional UTM attribution capture form
│   ├── data/
│   │   └── dummyContent.ts           # Typed baseline content & default configuration
│   ├── lib/
│   │   ├── auth/                     # Password hashing & cookie session encryption
│   │   ├── chatbot/
│   │   │   ├── claude.ts             # Multi-provider cascade (Claude → Gemini → Groq → Ollama → Local)
│   │   │   └── prompt.ts             # Anti-leakage grounded system prompt builder
│   │   ├── db/index.ts               # Persistent content store & snapshot engine
│   │   └── rag/index.ts              # RAG chunk retrieval & metadata sanitization
│   └── types/
│       └── content.ts                # TypeScript schemas for site, avatar, chatbot, and admin
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Harshu0810/Ujjawal-professional-card.git
cd Ujjawal-professional-card

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:
```env
# Admin Authentication (Change for production)
ADMIN_USERNAME=ujjawal_admin
ADMIN_PASSWORD=YourSecurePassword2026!
SESSION_SECRET=at-least-32-characters-cryptographic-random-salt-string-here

# Optional: Cloud AI Providers (Can also be entered directly via /admin)
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-haiku-5-5

GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash

GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# Optional: Local LLM / Ollama Serve URL
OLLAMA_BASE_URL=https://your-tunnel.ngrok-free.app
OLLAMA_MODEL=llama3.2
```

### 4. Running Locally
```bash
# Start development server
npm run dev

# Run production build validation
npm run build
```
Visit `http://localhost:3000` to interact with the public landing page, or `http://localhost:3000/admin` to access the CMS.

---

## 💻 Running Local LLMs (Ollama + ngrok)

You can serve completely free open-weight models (e.g. Llama 3.2, Mistral, DeepSeek) from your local computer:

1. **Install and start Ollama:**
   ```bash
   ollama serve
   ```
2. **Download your model of choice:**
   ```bash
   ollama pull llama3.2
   ```
3. **Open a live public tunnel using ngrok:**
   ```bash
   ngrok http 11434
   ```
4. **Configure in Admin Panel:**
   - Log into `/admin` → Go to the **🤖 Chatbot & RAG** tab.
   - In the **Local LLM via Ollama & ngrok Tunnel** card, paste your forwarding URL:
     ```
     https://abc-123.ngrok-free.app
     ```
   - Model name: `llama3.2`
   - Click **"Test Ollama / ngrok"** to verify connection.
   - Click **"Save Draft"** and **"Publish Live"**.
   - *Note:* The system automatically transmits `'ngrok-skip-browser-warning': 'true'` to bypass free-tier ngrok splash screens.

---

## 🔒 Security & Data Privacy

- **Indian DPDP Act 2023 Principles:** Session-bound interaction tracking with explicit notices before user inquiries.
- **RAG Scaffolding Isolation:** Retrieved business facts pass through `sanitizeForRetrieval()` to strip all internal markers, status labels, and draft scaffolding before reaching model context.
- **PBKDF2 Password Hashing:** 10,000 iterations of SHA-512 with per-user cryptographic salts.
- **HMAC-SHA256 Session Tokens:** Server-signed `httpOnly`, `sameSite=lax` cookies with cryptographic rotation.
- **Rate Limiting:** Protects `/api/admin/login` against brute-force attacks (5 failed attempts per IP per 15 minutes).

---

## 📄 License & Attribution

Designed and engineered for **Ujjawal** • AI Digital Marketer.
All rights reserved © 2026.
