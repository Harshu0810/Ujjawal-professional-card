# Known Issues and Limitations

This file tracks technical limitations, pending decisions, and temporary placeholders across milestones.

## Milestone 5 Status (Completed)

### Resolved Items & Technical Validations
1. **RAG Ingestion & Semantic Retrieval:**
   - Real-time knowledge parser (`src/lib/rag/index.ts`) extracts and scores section chunks from the Appendix A business document.
   - Grounded context injection into system prompt before every inference request.
2. **Server-Side Claude API Integration:**
   - Built Anthropic Messages API client (`src/lib/chatbot/claude.ts`) targeting `claude-haiku-5-5`.
   - Strict adherence to Appendix D system prompt rules: admits missing knowledge, redirects off-topic requests, and never claims to be human.
   - Zero-API-key local sandbox engine providing full conversational and lead qualification responses during local testing.
3. **Chatbot Security & Privacy:**
   - Per-IP rate limiting (12 messages/min).
   - Message size validation (max 1,000 characters).
   - Visible India DPDP Act 2023 notice on chat drawer.
4. **Interactive Chat Sidebar:**
   - Responsive drawer with quick suggestion pills, typing state, role badges, and auto-scroll.

### Active Focus: Milestone 6 — Content, Captions, and QR Code Validation
- **Technical Objective:** Review all placeholder content labels, validate synchronized Hinglish captions timing against spoken script, and finalize the Section 2A QR code print specification.
- **Physical QR Requirements:** Error correction Level M/Q, minimum quiet zone (≥4 modules), minimum physical dimension 2×2 cm, high contrast, and direct Vercel URL with human-readable fallback.

### Deferred Features (Per Milestone Sequencing)
- **Production QA, Security Audit, and Handover:** Scheduled for Milestone 7.
