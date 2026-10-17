# Section 2A: QR Code Print Specification for Pocket Cards

**Document Version:** 1.0  
**Target:** Physical Pocket Cards (Business Card format ≈ 85 × 55 mm / 3.5 × 2.0 in)  
**Destination URL:** Production Vercel URL directly (e.g. `https://ai-intro-webpage.vercel.app`) with human-readable fallback printed beneath.

---

## 1. Technical Print Requirements

1. **Error Correction Level: Q (25% Recovery)**
   - Pocket cards suffer friction against cardholders, pockets, and wallet edges. Error correction Level Q ensures that smudges, scratches, or minor dirt do not prevent phone camera optical recognition.
2. **Quiet Zone (Margin): ≥ 4 Modules (Minimum 2.5 mm)**
   - The quiet zone is the blank border surrounding the QR matrix. Cropping the quiet zone is the #1 reason printed QR codes fail to scan. Never place text, borders, or graphics within the quiet zone.
3. **Minimum Printed Physical Size:**
   - **Recommended:** 25 × 25 mm (≈ 1.0 × 1.0 in)
   - **Absolute Minimum:** 20 × 20 mm (≈ 0.8 × 0.8 in)
   - Reason: Arm's-length scanning distance on modern smartphone macro and main camera lenses.
4. **Contrast & Stock Finish:**
   - Dark modules (`#020617` or pure `#000000`) on a light, pure white background (`#FFFFFF`).
   - Use **matte or soft-touch non-glare stock**. Avoid glossy laminate or metallic foils over the QR area, as surface glare prevents camera exposure locks.
5. **Human-Readable Fallback URL:**
   - Always print the concise fallback URL directly below the QR symbol in a legible sans-serif font (minimum 7pt) for visitors whose cameras have QR scanning disabled.
6. **No Intermediate Shorteners:**
   - The QR code points directly to the production Vercel deployment URL. Intermediate redirect services introduce extra DNS latency and failure points.

---

## 2. Multi-Phone Camera Testing Checklist

Before initiating the final commercial print run, test physical laser-printed card proofs on at least three camera applications:
- [x] Apple iOS Camera (iOS 16+)
- [x] Android Google Lens / Native Camera (Samsung / Pixel)
- [x] Third-party QR scanner (low-end device test)

---

## 3. Vector Download

The production-ready vector SVG can be generated dynamically via `/api/qr?download=true` or downloaded from the "Pocket Card QR" modal on the homepage.
