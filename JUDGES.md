# For Judges — LifeGoals Calculator
## FinCal Innovation Hackathon · Technex '26 · IIT-BHU
### Co-sponsored by HDFC Mutual Fund · Investor Education & Awareness

---

## Quick Formula Verification

**Test case:** ₹50L goal · 10 years · 6% inflation · 12% return

| Step | Formula | Result |
|------|---------|--------|
| Inflate | ₹50,00,000 × (1 + 0.06)^10 | **₹89.54 L** ✅ |
| Monthly SIP | FV × r ÷ [((1+r)^n − 1) × (1+r)] | **₹38,540/mo** ✅ |

Where r = 0.12/12 = 0.01, n = 10 × 12 = 120

---

## Compliance Checklist

| Item | Status |
|------|--------|
| Disclaimer on Step 0 (Goal Selection) | ✅ Present |
| Disclaimer on Step 1 (Configure) | ✅ Present |
| Disclaimer on Step 2 (Results) | ✅ Present |
| Disclaimer text verbatim as specified | ✅ Verified |
| No guarantee language ("will grow", "guaranteed", etc.) | ✅ Zero instances |
| All projections use "estimated" / "illustrative" / "assumed" | ✅ |
| No HDFC fund/scheme names in UI | ✅ None |
| All 4 assumptions user-editable (inflation, return, years, cost) | ✅ Sliders + numeric input |
| Brand colors only: #224c87 · #da3832 · #919090 | ✅ |
| Montserrat font throughout (no DM Sans, Inter, Roboto) | ✅ |
| Neutral icons only (no 🚀, no 💰, no growth arrows) | ✅ |

---

## Accessibility (WCAG 2.1 AA)

| Feature | Implementation |
|---------|---------------|
| `<html lang="en">` | ✅ |
| Semantic HTML | `<main>`, `<section>`, `<fieldset>`, `<legend>`, `<h1>`–`<h3>` |
| All inputs labelled | `<label htmlFor>` on every interactive element |
| Keyboard navigation | Tab, Enter, Space, Escape — all functional |
| Focus management | Focus moves to heading on step change |
| `aria-live="polite"` | On live preview SIP value + AnimatedNumber |
| `aria-expanded` | On collapsible sections (assumptions, projection) |
| `aria-pressed` | On What-if delay toggle buttons |
| Focus rings | `*:focus-visible` with visible outline |
| Color contrast ≥ 4.5:1 | Primary text #e8edf5 on #0d1b2e backgrounds |
| SVG chart accessible | `role="img"` + `aria-label` on donut chart |
| Error messages | `role="alert"` on validation errors |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables animations |
| No keyboard traps | Verified — Escape closes tooltip |

---

## Financial Logic

- **Formula source:** FinCal Hackathon problem statement
- **Edge cases handled:**
  - r = 0 (zero return): simple division, no NaN
  - years = 1: calculates correctly
  - Values up to ₹5 Cr: formatted as "₹X.XX Cr"
  - Wealth gained < 0: clamped to 0
  - SIP < ₹1: floored to ₹1
  - Return ≤ inflation: warning banner displayed
- **All projections labelled as illustrative/estimated**
- **Scenario comparison:** Independent calculation per scenario
- **What-if delay:** Recalculates with reduced horizon, shows "not achievable" when years - delay < 1

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | Component architecture with hooks |
| Vite | Fast build tooling |
| Vanilla CSS | Custom properties, no framework dependency |
| Pure SVG | Donut chart — zero chart library overhead |

**Bundle size:** ~56 KB (gzipped)
**Build time:** < 1 second
**Dependencies:** react, react-dom only (zero bloat)

---

## Feature Highlights

1. **3-Step Wizard** — Select Goal → Configure → Results
2. **6 Preset Goals** — Home, Education, Car, Travel, Wedding, Custom
3. **Real-time Live Preview** — SIP updates as sliders move
4. **Editable Value Badges** — Click any badge to type directly
5. **Donut Chart** — SVG-based invested vs. estimated wealth gained
6. **Scenario Comparison** — Conservative / Base / Optimistic
7. **What-if Delay** — Cost of starting 1, 2, or 5 years later
8. **Year-by-Year Projection** — Expandable table with milestone markers
9. **Inflation Tooltip** — Interactive, educational explanation
10. **Print/PDF Support** — Clean print layout via Ctrl+P

---

## Lighthouse Scores (run in incognito for accurate results)

- **Accessibility:** 100 ✅
- **Best Practices:** 96 ✅
- **SEO:** 91 ✅
- **Performance:** [Run in incognito — extensions affect score]

---

## Disclaimer

This tool has been designed for information purposes only. Actual results may vary depending on various factors involved in capital market. Investor should not consider above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained in future and is not a guarantee of any future returns.
