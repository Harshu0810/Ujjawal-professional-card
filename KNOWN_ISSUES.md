# Known Issues and Limitations

This file tracks technical limitations, pending decisions, and temporary placeholders across milestones.

## Milestone 3 Status (Completed)

### Resolved Items & Technical Validations
1. **Avatar Adapter Layer:** Built vendor-neutral adapter architecture (`src/lib/avatar/`) supporting D-ID, Simli, HeyGen, and Mock local development.
2. **Section 3A Option 1 Validation:** Confirmed that stock/bundled TTS voices drive phoneme/lip-sync accurately in D-ID and Simli without add-on voice cloning charges.
3. **Cost Scaling Projections:** Documented comprehensive traffic modeling in `docs/AVATAR_POC_EVALUATION.md`. Evaluated at 100 scans/month:
   - **Simli:** ~$0.90 / month (~₹75/mo)
   - **D-ID:** ~$6.00 / month (~₹500/mo)
   - **HeyGen:** ~$150.00 / month (~₹12,500/mo)
4. **Hinglish Synchronization:** Tested dynamic caption calculation and live re-synchronization (`/api/avatar/speak`).
5. **Section 0 Confirmations:** "Resemble pictures" Option A implemented with sample marketing visuals.

### Active Focus: Milestone 4 — Admin and Persistent Content
- **Technical Objective:** Implement `/admin` panel protected by real server-side authentication (secure HTTP-only session cookies, bcrypt password hashing, login rate limiting).
- **Database Persistence:** Persistent data store mapping literal Appendix B schema (`SiteConfig`, `BenefitCard`, `UseCaseVisual`, `ReferenceVisual`, `AvatarConfig`, `CaptionTrack`, `KnowledgeDocument`, `ChatbotConfig`, `AdminUser`, `ContentVersion`).
- **CMS Workflow:** Draft vs. published versions, asset validation, rollback capability, and live updates without code redeployment.

### Deferred Features (Per Milestone Sequencing)
- **Anthropic Claude API & Server-side RAG Pipeline:** Scheduled for Milestone 5.
- **Final Card Print Physical Validation:** Scheduled for Milestone 6.
