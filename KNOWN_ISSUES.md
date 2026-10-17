# Known Issues and Limitations

This file tracks technical limitations, pending decisions, and temporary placeholders across milestones.

## Milestone 6 Status (Completed)

### Resolved Items & Technical Validations
1. **Section 2A QR Generation & Print Specs:**
   - Implemented high-precision QR generator (`src/lib/qr/index.ts`) adhering to Error Correction Level Q (25% damage recovery) and Level M fallback.
   - Guaranteed ≥4 modules quiet zone margin to prevent print boundary clipping.
   - Built `/api/qr` streaming endpoint providing vector SVG rendering and download attachment.
   - Created comprehensive print documentation in `docs/QR_PRINT_SPECIFICATION.md` detailing physical sizing (≥ 2×2 cm), contrast (≥10:1), and matte paper finishes.
2. **Interactive QR Modal:**
   - Added `QRCodeModal.tsx` allowing one-click vector SVG download and live preview with reactive URL testing.
3. **Caption & Script Validation:**
   - Synchronized Hinglish caption tracks verified against spoken audio timings.
4. **Placeholder Content Audit:**
   - Verified that zero unverified client names, metrics, or awards exist across UI and data files.

### Active Focus: Milestone 7 — Production QA, Security Review, and Launch Handover
- **Objective:** Final end-to-end verification across the Section 8 Acceptance Checklist:
  - Preloader fail-open behavior.
  - Runtime avatar lip-sync & Section 3A Option 1 compliance.
  - Admin CMS authentication, persistent database writes, and rollback verification.
  - Chatbot RAG grounding, prompt injection defenses, off-topic deflection, and India DPDP Act 2023 compliance.
  - Zero secrets in client-side bundles or git history.
  - Comprehensive handover manual (`docs/HANDOVER_GUIDE.md`).
