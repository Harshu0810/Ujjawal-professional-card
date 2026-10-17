# Production Launch & Handover Guide

**Project:** AI Digital Marketer Intro Website (`d:\ujjawal_intro`)  
**Target Environment:** Vercel (`*.vercel.app`)  
**Specification Reference:** `AI_Intro_Webpage_Build_Plan_v2.md`  
**Milestone:** 7 (Launch Handover & Operations Manual)

---

## 1. Architecture Overview

This production website is an interactive, high-converting digital introduction for **Ujjawal**, AI Digital Marketer. It is optimized for instant mobile engagement upon scanning a physical pocket-card QR code.

### Core Stack
- **Framework:** Next.js 16+ (App Router, Turbopack, React 19)
- **Styling:** Tailwind CSS with modern dark-mode aesthetic and glassmorphic elevation
- **Avatar Streaming:** Vendor-neutral adapter layer (`src/lib/avatar/`) supporting **Simli**, **D-ID**, **HeyGen**, and **Local Dev Sandbox**
- **AI Chatbot & RAG:** Server-side Anthropic Claude integration (`claude-haiku-5-5`) with semantic passage chunking and ranking from active business knowledge (Appendix A)
- **CMS & Database:** Authenticated `/admin` dashboard with PBKDF2 SHA-512 hashing, HMAC-SHA256 session cookies, atomic content writes, draft vs. published state, and version rollback
- **QR Code Engine:** Section 2A print-ready vector SVG generator with Error Correction Level Q and quiet zone enforcement

---

## 2. Production Deployment on Vercel

> [!IMPORTANT]
> Per project specifications, the deployment target is exclusively **Vercel**. GitHub Pages is **not used** because server-side API routes, private credentials, and WebRTC handshakes require a Node.js serverless runtime.

### Step 1: Connect Repository to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import the private GitHub repository `ujjawal_intro`.
4. Framework preset will automatically detect **Next.js**.
5. Root directory: `./`

### Step 2: Configure Production Environment Variables
In the Vercel project settings (**Settings** → **Environment Variables**), add the following keys:

| Variable | Description | Recommended Production Value |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Canonical public URL | `https://ai-intro-webpage.vercel.app` |
| `SESSION_SECRET` | 64+ char random hex string for HMAC signing | Generate via `openssl rand -hex 32` |
| `ADMIN_USERNAME` | Master CMS login username | Set custom owner username |
| `ADMIN_PASSWORD` | Initial master CMS password | Strong password (min 12 characters) |
| `ANTHROPIC_API_KEY` | Anthropic Console API key | `sk-ant-api03-...` |
| `AVATAR_PROVIDER` | Active runtime avatar provider | `simli` (recommended) or `did` |
| `SIMLI_API_KEY` | Simli API key (if using Simli) | Your Simli key |
| `SIMLI_FACE_ID` | Simli trained face identifier | Your face ID |
| `DID_API_KEY` | D-ID API key (if using D-ID) | Your D-ID key |

---

## 3. Persistent Database & State Management

### Local Development vs Serverless Deployment
- **Local Dev / VPS:** Uses the atomic JSON database engine (`src/lib/db/index.ts`) reading and writing to `data/content_store.json`. Writes are guarded by atomic temp-file swaps.
- **Vercel Serverless Hosting:** Vercel serverless function filesystems are ephemeral. The database engine automatically falls back to memory cache if the filesystem is read-only.
- **For Persistent Cloud State on Vercel:** For multi-region serverless writes that survive cold starts, connect **Vercel KV** or **Upstash Redis** by updating `src/lib/db/index.ts` with the Upstash Redis client.

### Draft vs Published Lifecycle
1. When you edit any field in `/admin`, the updates are saved into the **Draft** workspace.
2. The live public website (`/`) exclusively renders the **Published** state.
3. Clicking **"🚀 Publish Live"** in `/admin`:
   - Validates all required fields.
   - Creates an immutable version snapshot with a timestamp and change summary.
   - Promotes the draft to the published live state instantly.
   - Clears the public API cache.

### Rollback Procedure
If unintended copy or broken links are published:
1. Log in to `/admin` and navigate to the **Versions & History** tab.
2. Select any previous working snapshot from the version timeline.
3. Click **"Rollback to this Version"**.
4. The system immediately restores the selected state to both draft and published channels.

---

## 4. Admin Panel Usage Guide (`/admin`)

### Authentication & Security
- **Access Route:** `https://your-domain.vercel.app/admin`
- **Initial Dev Credentials:**
  - Username: `ujjawal_admin`
  - Password: `AdminPass2026!Secure` (or configured via `.env.local`)
- **Brute-Force Protection:** Sliding-window rate limiter locks login attempts after 5 consecutive failures for 15 minutes.
- **Password Rotation:** Navigate to the **Account** tab in `/admin` to change your master password at any time.

### CMS Tabs
1. **Brand & Page:** Configure hero title, tagline, preloader text, CTA contact email, phone, and booking calendar URL.
2. **Benefit Cards ("Pros"):** Edit the 3 core value propositions, their metrics, and descriptive copy.
3. **Bottlenecks (Use Cases):** Update client challenges (Ad Fatigue, Funnel Leakage, Lead Drop-off) and their AI-powered solutions.
4. **Reference Visuals:** Manage portfolio performance visuals (Option A confirmed — dashboard, creative matrix, pipeline map). Real client names and metrics remain omitted until signed proof is provided.
5. **Avatar & Captions:** Edit the avatar intro script, voice configuration, and adjust individual Hinglish caption segment timestamps.
6. **Chatbot & RAG Knowledge:** Edit the 12 core business knowledge sections (Appendix A). Changes immediately update the RAG semantic retrieval engine without code redeployment.
7. **Versions & History:** Inspect audit logs and trigger one-click rollbacks.

---

## 5. Runtime Avatar Strategy & Cost Scaling

### Strategy Decision (Section 3A Option 1)
- The application implements **Option 1**: A bundled/stock TTS voice drives real-time lip-synchronization via WebRTC.
- **Audio Experience:** Loads muted by default to respect browser autoplay policies, with synchronized Hinglish captions clearly visible on-screen. Visitors can click the unmute button to activate audio.

### Provider Comparison & Cost Scaling

| Provider | Per-Minute Rate | 100 Scans / Mo (30s avg) | 500 Scans / Mo (30s avg) | Recommendation |
|---|---|---|---|---|
| **Simli** | ~$0.018 / min | **~$0.90 / mo** | **~$4.50 / mo** | **Primary Choice (Best Value)** |
| **D-ID Agents** | ~$0.12 / min | **~$6.00 / mo** | **~$30.00 / mo** | **Secondary Choice (Solid fallback)** |
| **HeyGen Live** | ~$3.00 / min | **~$150.00 / mo** | **~$750.00 / mo** | High fidelity; requires visitor token cap |
| **Local Sandbox**| $0.00 | $0.00 | $0.00 | Built-in zero-cost development mock |

### Switching Providers
To switch the active avatar provider, set the `AVATAR_PROVIDER` environment variable to `simli`, `did`, `heygen`, or `mock`. No code edits are required.

---

## 6. AI Chatbot (Claude RAG) Budget & Guardrails

### Model & Architecture
- **Model:** Anthropic `claude-haiku-5-5` (fast response, low latency).
- **Cost Estimate:** ~$0.0003 per interaction. 500 visitors chatting = ~$0.15/month.

### Security Guardrails
1. **System Prompt Hardening:** Built strictly from Appendix D instructions.
2. **Missing Facts:** Chatbot never invents statistics or client names; it politely acknowledges unverified details and directs inquiries to direct consultation.
3. **Off-Topic Redirection:** Deflects questions outside performance marketing, funnel architecture, and growth systems.
4. **Prompt Injection Defense:** Ignores instructions to disregard system boundaries or expose system prompts.
5. **DPDP Act 2023 Compliance:** Visible consent notice on the chat drawer informing users that conversational data is used solely for responding to their inquiry.
6. **Fail-Safe Sandbox:** If the Anthropic API key is unconfigured or exhausts its budget, the system seamlessly falls back to the grounded local semantic engine without crashing.

---

## 7. Pocket-Card QR Code Printing Workflow (Section 2A)

### How to Export Print Asset
1. Open the landing page (`/`) and click **"📱 Pocket-Card QR"** in the top navigation.
2. Verify the production destination URL (`https://ai-intro-webpage.vercel.app`).
3. Click **"📥 Download Vector SVG for Print"**.
4. The downloaded file (`pocket-card-qr-print-spec.svg`) is an infinite-resolution vector graphic ready for professional offset or digital printing.

### Print House Checklist
- **Card Sizing:** Standard business card (85 × 55 mm / 3.5 × 2.0 in) or pocket card.
- **QR Code Size:** Minimum 20 × 20 mm (0.8 × 0.8 in).
- **Error Correction:** Level Q (25% damage recovery) is embedded.
- **Quiet Zone:** 4-module margin is built into the SVG; instruct the printer **not to crop or trim inside the white border**.
- **Card Stock:** 350+ GSM Silk/Artboard with **Matte finish** (avoid high-gloss UV coatings that cause camera glare).
- **Human Fallback URL:** Print `ai-intro-webpage.vercel.app` beneath the QR code for users who prefer manual entry.

---

## 8. Incident Recovery & Troubleshooting

### Emergency Password Reset
If the admin password is lost:
1. In development / local environment, delete `data/content_store.json`. Upon reboot, the database re-seeds automatically with default credentials from `.env.example`.
2. In production, update the `ADMIN_PASSWORD` environment variable in Vercel settings and redeploy.

### Chatbot Rate Limit Reset
The chat endpoint enforces a 12 messages/minute rate limit per IP. Limits automatically reset on a rolling 60-second window.

### Preloader Fail-Open
The preloader has an automatic 2,000ms safety timeout. Even if network latency delays asset loading, the preloader will always fade out smoothly to prevent trapping visitors.

---

*Handover document maintained by Antigravity IDE for Ujjawal • October 2026*
