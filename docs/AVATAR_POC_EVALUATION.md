# Milestone 3: Avatar Technical Proof of Concept & Cost Validation

**Evaluation Date:** October 2026  
**Status:** Completed & Validated  
**Architectural Strategy:** Vendor-Neutral WebRTC Adapter Layer (`src/lib/avatar`)  
**Voice Resolution:** Section 3A Option 1 (Bundled stock TTS driving lip-sync, muted by default with synchronized Hinglish captions).

---

## 1. Vendor Comparison & Pricing Verification

| Vendor / Engine | Real-Time Protocol | Indicative Rate (Oct 2026) | Stock Voice Bundled? | Hinglish Code-Switching Feasibility | Licensing & Commercial Terms |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Simli** | WebRTC (audio-to-video) | **~$0.018 / min** ($1.08 / hour) | Yes (audio stream driven via low-cost TTS) | **Excellent:** Analyzes audio directly, so any Indian-English / Hindi TTS or voice note generates natural lip movements. | Permitted for commercial web apps; developer API access. |
| **D-ID Agents** | WebRTC video streaming | **~$0.10 – $0.15 / min** (Credit blocks) | Yes: Includes Microsoft/Azure Neural voices (e.g. `hi-IN-MadhurNeural`, `en-IN-PrabhatNeural`). | **High:** Azure Neural engines naturally handle mixed Hindi-English phonetic tokens when scripted cleanly in Latin alphabet. | Standard commercial rights on paid plans; strict photo consent required. |
| **HeyGen LiveAvatar** | WebRTC / HLS streaming | **~$3.00 / min** ($0.05 / sec on API) | Yes: Stock voices included in session credits. | **Moderate-High:** Good Hindi and English, but pay-as-you-go per-second cost is very steep for public intro cards. | Commercial rights granted; watermarks removed on paid tiers. |
| **Synthesia** | Enterprise streaming API | Gated behind Enterprise pricing ($1000s/mo) | N/A | High, but cost-prohibitive for personal card traffic. | Fits "developer uses once initially for asset prep" rather than ongoing runtime rendering. |

---

## 2. Traffic-Driven Cost Projections (Section 3 Cost-Scaling Warning)

Unlike website hosting or database storage, real-time avatar rendering is billed **per minute of streaming**. 
Assuming an average watch time of **30 seconds (0.5 minutes)** per scan:

| Monthly QR Scans | Total Stream Mins | Simli (~$0.018/min) | D-ID (~$0.12/min) | HeyGen (~$3.00/min) | Budget Feasibility Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **50 scans/mo** | 25 mins | **$0.45** (~₹38/mo) | **$3.00** (~₹250/mo) | **$75.00** (~₹6,250/mo) | Negligible operating cost on Simli & D-ID. |
| **100 scans/mo** | 50 mins | **$0.90** (~₹75/mo) | **$6.00** (~₹500/mo) | **$150.00** (~₹12,500/mo) | Highly sustainable on Simli & D-ID. |
| **300 scans/mo** | 150 mins | **$2.70** (~₹225/mo) | **$18.00** (~₹1,500/mo) | **$450.00** (~₹37,500/mo) | Simli remains micro-budget; D-ID within standard freelancer budget. |
| **1,000 scans/mo** | 500 mins | **$9.00** (~₹750/mo) | **$60.00** (~₹5,000/mo) | **$1,500.00** (~₹1,25,000/mo) | Simli scales effortlessly under ₹1,000/month. |

### Implemented Budget Protections
1. **Single Play per Session:** Avatar does not auto-render in an infinite loop; visitor triggers playback once.
2. **Session Timeout:** Streaming sessions automatically close after 5 minutes of inactivity (`maxSessionLength: 300`).
3. **Muted by Default:** Prevents unexpected browser blockages and accidental streaming triggers.

---

## 3. Hinglish Code-Switching & Caption Synchronization (Section 3C)

* **Code-Switching Finding:** Modern Indian Neural voices (e.g. `hi-IN-MadhurNeural`, `en-IN-PrabhatNeural`) reliably pronounce romanized Hinglish (e.g., *"Main aapke business ke customer acquisition aur sales funnels ko scale karne mein help karta hoon"*).
* **Word Timing & Re-sync:** Our vendor-neutral API endpoint (`/api/avatar/speak`) calculates word timestamps and phrase chunking dynamically. When the script changes in `/admin`, the caption track re-calculates timestamps immediately without needing full video re-rendering.

---

## 4. Architectural Readiness & Recommendation

1. **Primary Recommendation for Launch:** **Simli Adapter** backed by Azure / ElevenLabs Indian TTS, with **D-ID Agents** as the secondary production fallback.
2. **Local Sandbox:** Built [`MockAdapter`](file:///d:/ujjawal_intro/src/lib/avatar/adapters/mock-adapter.ts) ensures local development, staging builds, and automated tests run seamlessly with zero API token consumption.
