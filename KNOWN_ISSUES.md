# Known Issues and Limitations

This file tracks technical limitations, pending decisions, and temporary placeholders across milestones.

## Milestone 1 Status

### Pending Owner Confirmations (Content Brief)
1. **"Resemble pictures" Meaning (Section 0 & 2C):**
   - Need confirmation whether this refers to sample/reference portfolio marketing visuals (e.g., campaign dashboards, ad screenshots, before/after funnels) OR reference photographs supplied exclusively for avatar generation.
   - Status: Flagged for owner input; placeholder portfolio sample visuals wired in `ReferenceVisual` for now.
2. **Preloader Content & Recognition (Section 0 & 2B):**
   - The brief specifies the preloader must showcase work/recognition/personality rather than just a name.
   - Need confirmation on specific niche accolades, certifications, or taglines the owner wishes to highlight.
   - Status: Defaulted to clearly labeled placeholder ("AI Performance Marketing • Funnel Architecture • Growth Systems").
3. **Usage Visuals & Client Problems (Section 0 & 2C):**
   - Need confirmation on preferred specific client use cases to illustrate.
   - Status: Defaulted to 3 standard growth marketing bottlenecks with dummy cards.

### Section 3A Voice / Runtime-Avatar Decision
- **Resolution Strategy:** Target **Option 1** (engine bundled/default TTS voice driving real lip-sync, muted by default with synchronized Hinglish captions and explicit user unmute control).
- **Cost Scaling Alert:** Per-minute real-time avatar generation cost is directly tied to visitor volume. Vendor rates (D-ID, HeyGen, Simli) must be evaluated and approved in Milestone 3 before locking integration.
- **Current Milestone State:** In Milestone 1, the avatar section features an interactive container with simulated synchronized Hinglish captions and placeholder asset. The actual runtime WebRTC/streaming avatar integration is strictly deferred to Milestone 3 per the build plan.

### Deferred Features (Per Milestone Sequencing)
- **Persistent Database & `/admin` Authentication:** Intentionally deferred to Milestone 4 per Section 7 sequence.
- **Anthropic Claude API & Server-side RAG Pipeline:** Intentionally deferred to Milestone 5 per Section 7 sequence.
- **Physical QR Code Print Validation:** In Milestone 1, a digital SVG QR code placeholder is rendered. Final print-dimension verification (Section 2A) is scheduled for Milestone 6.
