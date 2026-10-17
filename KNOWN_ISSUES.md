# Known Issues and Limitations

This file tracks technical limitations, pending decisions, and temporary placeholders across milestones.

## Milestone 7 Status (Completed — Production Ready)

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

