# AI Digital Marketer Intro Website — Build Plan v4 (Live QA + Resilience + Visual Redesign)

**Status:** v3's pivot is live at `https://your-brand-needs-me.vercel.app/` and was tested directly (see Section 1 — this is not a desk review, it's actual chat interaction against the deployed site). This document reports what that test found, including one **urgent bug**, and specifies four new owner-directed changes on top of it: multi-provider AI fallback, a session-exhausted popup, removing "Powered by Claude," and a neumorphism redesign.
**v3 is superseded for the items this document changes.** Everything else in v3 (session-cap mechanics, contact buttons, admin structure, avatar/caption behaviour) is confirmed working as designed and carries forward unchanged.

---

## 1. Live QA findings — tested directly against the deployment

I opened the real site and drove an actual conversation through the chatbot (not just reading the HTML). Results:

### Working correctly
- Avatar + captions load, muted by default, tap-to-unmute — matches v3 Section 3.
- Full-screen chat replaces the old sidebar, greeting is pre-populated, suggested-question chips are present.
- The chatbot **does answer general/off-topic questions** when asked (tested with "What is the capital of France?") — matches the new v3 behaviour, not the old "redirect off-topic" rule.
- The 3-per-session quota genuinely works: counter incremented 1→2→3 correctly across real messages, and a 4th message is actually blocked, not just visually hidden.
- Contact buttons (WhatsApp, Book Call, LinkedIn, Instagram) are present and distinct.
- Dark/light toggle **already exists** (a sun icon, top-right) — this was still open in v3; it's done.
- No scroll progress bar yet — still outstanding from v3, carry it forward into this plan's checklist.
- DPDP privacy notice is present and visible.

### 🔴 Urgent bug — fix before any real content goes live, not just before launch
On the third test message ("Tell me a one-line fun fact about the ocean"), the chatbot's reply contained **raw internal document scaffolding, verbatim, visible to the visitor**:

> "Regarding [DRAFT / DUMMY PLACEHOLDER] Business Knowledge Document (Appendix A RAG Source): [DRAFT / DUMMY PLACEHOLDER] Business Knowledge Document (Appendix A RAG Source) **Status:** DRAFT / DUMMY CONTENT ONLY - Legal / Working Name: [DUMMY PLACEHOLDER: Ujjawal - AI Digi..."

This means the retrieval layer is not isolating "context fed to the model" from "text the model is willing to say out loud." Right now the bot is capable of reciting its own internal admin-facing document headers and placeholder labels to a real visitor — which is both unprofessional and a sign of a structural prompt-assembly problem, not a content problem. It will not go away by filling in real business content; it needs a code fix.

**Likely cause and fix, for the build AI:**
- The knowledge document (v2 Appendix A) mixes document-management metadata (status labels, section headers like "Appendix A," placeholder bracket text) with actual retrievable facts in the same text blob, and that whole blob — or too much of it — is being passed into the model's context and then partially echoed back.
- Fix: strip metadata/status/placeholder-bracket text from whatever text is actually sent to the model as retrieval context; keep that labeling only in the admin-facing copy of the document, never in the string that gets concatenated into the prompt. Add an explicit system-prompt instruction not to quote or describe the structure of its own source document, only to use the facts in it. Add a test case for this specific failure mode before closing this bug out.

### Confirmed, scheduled for change in this document
- "Powered by Claude" is visible exactly as shown in the screenshot — see Section 4.
- Quota-exhausted behaviour is currently an inline banner + changed input placeholder — upgraded to a popup in Section 3 (the existing inline behaviour stays as a backup, not a replacement — see Section 3).

---

## 2. Multi-provider AI fallback (Claude primary, Gemini + Groq fallback)

### Why and when

Right now, if the Claude API key isn't yet set in Vercel's environment variables (e.g. during early testing before the $100 budget is funded, or if the key is temporarily invalid), the chatbot presumably can't respond at all. Adding free-tier fallback providers means development and testing can continue uninterrupted without the Claude key being present — and gives the deployed site a safety net if the Claude key ever fails or hits a quota, now or later.

**Priority order, fixed and non-negotiable:**
1. **Claude** (via `ANTHROPIC_API_KEY` in Vercel environment variables) — always tried first, whenever the key is present.
2. **Gemini** (free tier) — used only if the Claude key is absent, invalid, or the Claude call fails/errors.
3. **Groq** (free tier) — used only if both Claude and Gemini are unavailable.

Gemini and Groq are **fallback-only, permanently** — not an either/or choice the system makes for any other reason (cost, speed, etc.). If Claude is configured and working, it is used 100% of the time.

### Current free-tier model options (checked October 2026 — re-verify at build time, these rotate often)

Free-tier model names and limits on both Gemini and Groq change frequently — Gemini alone deprecated and renamed its headline free model at least twice in the first half of 2026. Treat the table below as a starting point to verify against each provider's own current documentation when this is actually built, not as a locked specification.

| Provider | Indicative free-tier model (Oct 2026) | Indicative free-tier limits | Notes |
|---|---|---|---|
| Google Gemini | A current "Flash" or "Flash-Lite" tier model (e.g. in the `gemini-2.5-flash` / `gemini-3.5-flash` family) | Roughly 1,000–1,500 requests/day reported across sources | Google's free tier has repeatedly removed Pro-tier access and renamed/retired Flash models within 2026 — confirm the current model string in Google AI Studio directly before building |
| Groq | A current Llama or open-weight model served on Groq's free tier (e.g. a Llama 3.3 70B class model) | Roughly 30 requests/minute, ~14,000 requests/day reported across sources | Known for very fast inference; good fit as a last-resort fallback since low latency matters for a chat UI |

### Implementation requirements

- Build one internal interface (e.g. `getChatResponse(messages, systemPrompt)`) that the chat API route calls, with the provider-selection and fallback logic hidden behind it — the frontend and the rest of the backend should never need to know which provider actually answered.
- On a Claude failure, log the failure reason server-side (for the owner/admin to see, not the visitor) and immediately retry with Gemini, then Groq, within the same request — the visitor should experience this as one normal response, not an error or a delay long enough to look broken.
- Keep the **same system prompt structure** (v3 Section 2E) across all three providers so answer style/behaviour stays reasonably consistent regardless of which one responds. Expect some real variation in phrasing and quality between providers — this is an accepted trade-off of having a free fallback, not a bug.
- The 3-per-session cap (v3 Section 2B) applies identically regardless of which provider actually served the answer — a visitor's quota doesn't reset or extend because the request fell through to Gemini or Groq.
- **Data-handling caution, worth the owner's attention:** free tiers from different providers can have different data-use/training policies than Anthropic's paid API. Once the knowledge document (v2 Appendix A) contains real business information rather than dummy placeholders, confirm Gemini's and Groq's current data-use terms for their free tiers before relying on them to receive that real content — a paid tier or an explicit opt-out setting may be worth it later even though the fallback itself stays free-tier for cost reasons.
- Add a deliberate test: temporarily remove/invalidate the Claude key in a staging deployment and confirm the chat still works end-to-end via Gemini, then confirm it still works via Groq with both other keys removed. Don't assume the fallback works just because the code compiles.

### Admin visibility (new, read-only diagnostic)

Add a small, read-only status line to the **Chatbot & RAG** admin tab (v3 Section 4) showing which provider served the most recent response (e.g. "Last response via: Claude" / "Last response via: Gemini (fallback — Claude unavailable)"). This isn't a settings control — the priority order in this section is fixed — it's purely so the owner can tell at a glance whether the paid key is actually working without needing to dig through logs.

---

## 3. Session-exhausted popup

### Trigger

The exact moment the quota reaches 3/3 — the same moment the current inline banner already appears (Section 1). This is an upgrade to that moment, not a new trigger point.

### Content

A dismissible modal/popup, appearing once per session, containing:
- A short line explaining the preview has ended (reuse/adapt the existing "3 questions used this session" wording).
- Three (or however many are configured in the v3 Contact Links admin tab) clearly labelled buttons: **WhatsApp**, **Book an appointment**, and the social links (LinkedIn/Instagram) — pulled from the same admin-managed Contact Links data as the footer buttons, not hardcoded separately, so the owner only ever has to update a contact detail in one place.
- A close/dismiss control that lets the visitor keep reading the existing chat transcript — the popup should not trap them or hide what was already said.

### Relationship to the existing inline banner

**Recommendation: keep both, don't replace one with the other.** The popup grabs attention at the exact moment the quota ends; the existing inline banner/changed input placeholder stays as a persistent reminder afterward, in case the visitor dismisses the popup and scrolls back later. This is a recommendation, not an explicit instruction — if the owner would rather have just the popup and drop the inline banner for a cleaner look, that's an easy simplification; flag it to him rather than assuming either way.

### Behaviour notes

- Show the popup only once per session (on first reaching 3/3), not every time the visitor interacts with a disabled input afterward.
- The popup must not appear for visitors who never exhaust the quota.

---

## 4. Remove "Powered by Claude"

Remove the literal text from the chat header, exactly as shown in the screenshot the owner provided.

**Worth raising with the owner, not just doing silently:** now that the chatbot can be served by Gemini or Groq on a given response (Section 2), a "Powered by Claude" label would occasionally be inaccurate even if it were kept — one more reason, beyond the owner's direct instruction, to remove rather than relocate it. Recommend not replacing it with any other provider name either (e.g. "Powered by AI") for the same reason — keep the header to just the assistant's name and status dot ("Ujjawal AI Growth Assistant •"), with "Grounded in verified systems" kept as-is since that phrase doesn't name a specific vendor and stays accurate regardless of which provider answers. Confirm this reduced header wording with the owner before building it, since it's a judgment call beyond his literal instruction.

---

## 5. Neumorphism visual redesign

### Scope question to confirm first

The owner said "current theme in dark mode is not good, use neumorphism instead." Since the site has both dark and light modes (Section 1), this plan assumes **both modes get a neumorphism treatment** (a dark-neumorphism palette and a light-neumorphism palette) for visual consistency between the two — rather than leaving light mode in its current flat style while only dark mode changes. Confirm this with the owner; it's a reasonable default, not a certainty.

### What neumorphism means here, concretely

Neumorphism ("soft UI") renders elements as if gently extruded from or pressed into a single-hue background, using paired soft shadows rather than borders or flat color blocks to show depth:
- A **single base background color** per mode (not a gradient-heavy or multi-panel background) — e.g. a muted dark slate for dark mode, a muted off-white/light grey for light mode.
- Elements get **two soft shadows**: a lighter one offset toward the (implied) light source and a darker one offset away from it, both on the same base color, large blur, low spread — this is what creates the soft "raised" look instead of a drawn border.
- **Pressed/active states** (e.g. the Send button while clicked, a selected chip) invert the shadow pair to look "pushed in" rather than raised.
- Generously rounded corners throughout (large border-radius) — sharp corners read as flat/skeuomorphic, not neumorphic.
- No hard outlines or drop-heavy card borders anywhere elements use this style.

### Where to apply it

- Avatar frame/player card
- Chat message bubbles (both the assistant's and the visitor's, likely with a subtle tonal difference between the two rather than two different hues)
- Suggested-question chips
- Send button and chat input field
- Contact buttons
- The dark/light toggle itself
- The new session-exhausted popup from Section 3
- Quota badge ("X/3 Used")

### Accessibility caution — read before building this

Neumorphism's signature look comes from very low contrast between an element and its background, which is also its best-documented usability weakness: it can make buttons hard to distinguish from backgrounds and text hard to read, especially for low-vision users, and it doesn't play well with standard contrast-ratio accessibility guidelines if applied carelessly.

**Recommended hybrid approach, not pure neumorphism everywhere:** use the soft-shadow neumorphic treatment for *containers* (cards, buttons, the chat bubbles, the toggle) where it's decorative, but keep **text and icon colors at normal, accessible contrast** against their immediate background rather than trying to neumorphic-style the text itself. This gets the visual style the owner wants without making the chat transcript or buttons hard to read — flag this trade-off to the owner as a deliberate choice, not a deviation from the request.

### Indicative palette (starting point, not final)

- **Dark neumorphism base:** a muted dark slate (roughly `#2b2f38`–`#30343d` range) rather than a near-black background, since neumorphic shadows need a mid-tone base to read as soft rather than invisible.
- **Light neumorphism base:** a muted light grey (roughly `#e4e8ed`–`#eceff3` range) rather than pure white, for the same reason.
- Shadow pairs: roughly 6–10px offset, 16–20px blur, one shadow a few shades lighter than the base and one a few shades darker, both at the same hue as the base (not black/white shadows, which look harsh rather than soft).

These are starting values for the developer to tune visually, not exact production specs.

---

## 6. Updated acceptance checklist (delta from v3 Section 7)

- [ ] The RAG-leakage bug from Section 1 is fixed and specifically retested (ask a question, confirm no document scaffolding/placeholder/status text appears in the visible answer).
- [ ] With the Claude key present, 100% of responses come from Claude.
- [ ] With the Claude key removed/invalidated in a staging test, responses still come through successfully via Gemini, then via Groq if Gemini is also removed.
- [ ] A visitor cannot tell, from the response alone, which provider answered — tone/behaviour stays reasonably consistent.
- [ ] The admin "Last response via" diagnostic updates correctly.
- [ ] The session-exhausted popup appears exactly once, at 3/3, is dismissible, and doesn't hide the prior conversation.
- [ ] Popup's contact buttons match the Contact Links admin tab, not a hardcoded duplicate.
- [ ] "Powered by Claude" no longer appears anywhere in the visible UI.
- [ ] Both dark and light modes use the neumorphism treatment (or just dark, if the owner says light should stay as-is — confirm first).
- [ ] Text and icon contrast meets normal accessibility expectations even inside neumorphic containers.
- [ ] Scroll progress bar (still outstanding from v3) is implemented.

---

## 7. Milestones

### Milestone 10 — Bug fix + resilience + session popup
- Fix the RAG-leakage bug (Section 1) — this blocks real content from ever being loaded safely, so treat it as higher priority than the new features below.
- Build the multi-provider fallback layer (Section 2) and its staging test.
- Build the session-exhausted popup (Section 3).
- Remove "Powered by Claude" and confirm the reduced header wording with the owner (Section 4).

### Milestone 11 — Visual redesign
- Confirm the light-mode scope question (Section 5) with the owner before starting.
- Implement the neumorphism design tokens and apply them across the component list in Section 5.
- Verify contrast/accessibility per the hybrid-approach note.
- Add the still-outstanding scroll progress bar from v3.

### Milestone 12 — Re-QA
- Re-run the full Section 6 checklist on the real deployment.
- Specifically re-test the chatbot with several real conversations (not just one, since the leakage bug only showed up on the third test message) to build confidence the fix generalizes.
- Update `CHANGELOG.md` and `KNOWN_ISSUES.md` with everything in this document.

---

## 8. Open questions for the owner

1. Should both light and dark modes get the neumorphism treatment, or only dark mode as literally stated? (Section 5)
2. Is "Ujjawal AI Growth Assistant • Grounded in verified systems" (with no provider name at all) the right replacement header, or should something else go there? (Section 4)
3. Keep both the popup and the existing inline banner at quota exhaustion, or drop the inline version now that the popup exists? (Section 3)
4. Any preference between Gemini and Groq as the *second* fallback vs. *third* fallback, or is Claude → Gemini → Groq (as specified) correct? (Section 2)

These have working defaults in this document so the build isn't blocked, but should get real answers before Milestone 12 closes out.
