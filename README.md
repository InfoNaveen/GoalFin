# LifeGoals — Goal-Based Investment Calculator

<div align="center">

![LifeGoals Banner](https://img.shields.io/badge/FinCal%20Innovation%20Hackathon-Technex%20%2726%20%7C%20IIT--BHU-224c87?style=for-the-badge&logoColor=white)
![HDFC Mutual Fund](https://img.shields.io/badge/Co--Sponsored%20by-HDFC%20Mutual%20Fund-da3832?style=for-the-badge)
![Investor Education](https://img.shields.io/badge/Initiative-Investor%20Education%20%26%20Awareness-919090?style=for-the-badge)

**[🔗 Live Demo](https://goalfin-olive.vercel.app)** &nbsp;·&nbsp; **[📹 Demo Video](#)** &nbsp;·&nbsp; **[📋 Judges Guide](#for-judges)**

![Accessibility](https://img.shields.io/badge/Lighthouse%20Accessibility-100%2F100-00c853?style=flat-square&logo=google-chrome)
![Best Practices](https://img.shields.io/badge/Best%20Practices-96%2F100-00c853?style=flat-square&logo=google-chrome)
![SEO](https://img.shields.io/badge/SEO-91%2F100-00c853?style=flat-square&logo=google-chrome)
![WCAG](https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-00c853?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)

</div>

---

## The Problem We Solved

> *"The current calculators across the industry are boring and inaccessible."*
> — FinCal Hackathon Problem Statement

Every existing SIP/goal calculator looks like a government form. Sliders, a number, done. No story. No education. No emotional connection to the goal. Users don't understand *why* they need to invest that amount, or *what happens* if they wait.

**LifeGoals** reimagines the financial calculator as an interactive, educational experience — one that tells users the story of their money.

---

## Live Demo

👉 **[https://goalfin-olive.vercel.app](https://goalfin-olive.vercel.app)**

> No setup required. Opens instantly. Works on all devices.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/lifegoals.git
cd lifegoals

# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Requirements:** Node.js 18+ · npm 9+

---

## For Judges

### ⚡ Formula Verification — Check This First

| Input | Value |
|-------|-------|
| Present Cost | ₹50,00,000 (₹50L) |
| Time Horizon | 10 years |
| Inflation Rate | 6% p.a. |
| Expected Return | 12% p.a. |

| Output | Expected | Result |
|--------|----------|--------|
| Inflation-adjusted Goal | ₹89,54,238 (₹89.54 L) | ✅ |
| Required Monthly SIP | ₹38,540/mo | ✅ |

### ✅ Compliance Checklist

| Requirement | Status |
|-------------|--------|
| Mandatory disclaimer on **all 3 views** (verbatim) | ✅ |
| Zero guarantee language ("will", "assured", "certain") | ✅ |
| All 4 assumptions user-editable | ✅ |
| No HDFC fund/scheme names referenced | ✅ |
| Brand colors only: `#224c87` · `#da3832` · `#919090` | ✅ |
| Montserrat font throughout (Arial/Verdana fallback) | ✅ |
| No growth arrows or exaggerated visual metaphors | ✅ |
| Illustrative language throughout ("estimated", "assumed") | ✅ |

### ♿ Accessibility Checklist

| Requirement | Status |
|-------------|--------|
| Lighthouse Accessibility Score | **100 / 100** ✅ |
| WCAG 2.1 AA compliant | ✅ |
| Semantic HTML (`<main>`, `<section>`, `<fieldset>`, `<legend>`) | ✅ |
| Heading hierarchy (h1 → h2 → h3, no skips) | ✅ |
| All inputs have associated `<label>` elements | ✅ |
| `aria-live` regions on all dynamic content | ✅ |
| Full keyboard navigation (Tab · Enter · Space · Escape) | ✅ |
| Focus management on step transitions | ✅ |
| Contrast ratio ≥ 4.5:1 on all text | ✅ |
| Screen reader compatible | ✅ |

### 📊 Lighthouse Scores (measured on live deployment, incognito)

| Metric | Score |
|--------|-------|
| Performance | — *(run on live URL)* |
| **Accessibility** | **100** ✅ |
| Best Practices | **96** ✅ |
| SEO | **91** ✅ |

---

## Features

### 🧭 3-Step Wizard Experience

```
Step 1: Select Goal  →  Step 2: Configure  →  Step 3: Results
```

Designed as a guided journey — not a form. Each step has a clear purpose, smooth transitions, and full keyboard accessibility.

### 🎯 6 Preset Goals

| Goal | Default Cost | Default Timeline |
|------|-------------|-----------------|
| 🏠 Dream Home | ₹50L | 10 years |
| 🎓 Child's Education | ₹20L | 15 years |
| 🚗 New Car | ₹8L | 3 years |
| ✈️ World Tour | ₹5L | 5 years |
| 💍 Dream Wedding | ₹15L | 4 years |
| ⭐ My Custom Goal | ₹10L | 7 years |

All defaults are user-editable. Every assumption is transparent.

### 📊 Analysis Tools

**Donut Chart** — SVG-based, zero external libraries. Shows the split between amount invested and estimated wealth gained at goal maturity.

**Scenario Comparison** — Side-by-side view of Conservative, Base Case, and Optimistic projections with different return and inflation assumptions.

**Year-by-Year Projection Table** — Full compounding table with milestone markers at 25%, 50%, 75%, and 100% of goal. See exactly when your corpus crosses each threshold.

**What-If Delay Calculator** — Shows the estimated monthly cost of waiting 1, 2, or 5 years to start. Answers the most important financial question: *what does procrastination actually cost?*

**Inflation Education Tooltip** — Interactive panel that explains purchasing power erosion in plain language. Updates dynamically as the inflation slider moves.

**Live Preview** — Inflation-adjusted goal value and required SIP update in real-time as any slider moves. `aria-live` region announces changes to screen readers.

---

## Financial Formulas

All formulas follow the exact specification from the FinCal hackathon problem statement.

### Step 1 — Inflate the Goal

```
Future Goal Value = Present Cost × (1 + Inflation Rate / 100) ^ Years
```

*Why this matters:* ₹10 lakh today does not equal ₹10 lakh in 10 years. At 6% inflation, it costs ₹17.9 lakh. This step makes that visible.

### Step 2 — Required Monthly SIP

```
r = Annual Return Rate / 100 / 12       (monthly rate)
n = Years × 12                           (total months)

Case r = 0:   SIP = Future Goal Value / n
Case r > 0:   SIP = (FV × r) / (((1 + r)^n − 1) × (1 + r))
```

*This is the standard annuity-due formula — the industry benchmark for SIP calculations.*

### Year-Wise Projection

```
For year y (1 to n):
  corpus = SIP × ((1 + r)^(y×12) − 1) / r × (1 + r)
  invested = SIP × (y × 12)
  wealth_gained = corpus − invested
```

### Edge Cases Handled

| Case | Handling |
|------|----------|
| Return rate = 0% | `SIP = FV / n` (simple division, no compounding) |
| Years = 1 | Minimum valid input, calculates correctly |
| Values > ₹1 Cr | Formatted as `₹X.XX Cr` |
| Values > ₹1 L | Formatted as `₹X.XX L` |
| SIP result < ₹1 | Floored to ₹1 minimum |
| Return ≤ Inflation | Warning banner with `role="alert"` |
| What-if delay > years | "Goal not achievable" warning shown |

---

## Assumptions

All assumptions are **user-editable** and **clearly disclosed** as illustrative.

| Parameter | Default | Editable Range | How to Edit |
|-----------|---------|----------------|-------------|
| Present Cost of Goal | Goal-specific | ₹1L – ₹5Cr | Slider + direct input |
| Time Horizon | Goal-specific | 1 – 30 years | Slider + direct input |
| Expected Inflation Rate | 6% p.a. | 1% – 15% | Slider + direct input |
| Expected Annual Return | 12% p.a. | 1% – 30% | Slider + direct input |

> All projections are illustrative estimates only. Past performance is not a guarantee of future returns.

---

## Accessibility

Accessibility is a **first-class feature**, not an afterthought.

**Lighthouse Accessibility: 100/100**

### Semantic Structure
```html
<main role="main">
  <section aria-label="Step 1: Select your goal">
    <h1>LifeGoals</h1>
    <h2>What are you saving towards?</h2>
    <fieldset>
      <legend>Choose a goal</legend>
      <!-- goal cards -->
    </fieldset>
  </section>
</main>
```

### Key Implementations
- **Focus management**: On every step transition, focus moves programmatically to the new section heading
- **Live regions**: `aria-live="polite"` on SIP preview — screen readers announce updates as sliders move
- **Keyboard navigation**: Every interaction achievable without a mouse
- **Error states**: Validation messages use `role="alert"` for immediate announcement
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` disables all animations

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| UI Framework | React 18 | Functional components + hooks |
| Build Tool | Vite 5 | Fast HMR, optimised production builds |
| Styling | Vanilla CSS + Custom Properties | Zero runtime overhead, full control |
| Charts | Pure SVG | No external library, perfect accessibility |
| Calculations | Pure JS functions | Isolated, testable, no React dependency |
| Deployment | Vercel | Instant CDN, automatic HTTPS |

**Zero chart libraries. Zero CSS frameworks. Zero UI component libraries.**
Every pixel is intentional. Every calculation is transparent.

---

## Project Structure

```
lifegoals/
├── index.html                 # Entry point, Montserrat font, meta tags
├── vite.config.js             # Build configuration
├── package.json
├── README.md                  # This file
├── JUDGES.md                  # Quick reference for judges
└── src/
    ├── main.jsx               # React 18 createRoot
    ├── App.jsx                # Root component
    ├── FinCalGoal.jsx         # Main calculator (wizard, UI, state)
    ├── index.css              # Global styles, animations, responsive
    └── utils/
        └── calculations.js   # Pure financial calculation functions
```

---

## Brand Compliance

| Element | Specification | Applied |
|---------|--------------|---------|
| Primary Blue | `#224c87` | Buttons, active states, accents |
| Red | `#da3832` | Return rate slider, highlights |
| Grey | `#919090` | Decorative elements only |
| Font | Montserrat | All text throughout app |
| Fallback | Arial, Verdana, sans-serif | System fallback stack |
| Visual metaphors | None (no arrows, no rockets) | ✅ Compliant |

---

## What Makes This Different

Most financial calculators answer *"what is the number?"*

LifeGoals answers *"why does this number matter?"*

| Feature | Standard Calculator | LifeGoals |
|---------|--------------------|-----------| 
| UX pattern | Single form | 3-step wizard |
| Goal context | None | 6 relatable presets |
| Inflation education | No | Interactive tooltip |
| Cost of delay | No | What-if delay section |
| Scenario analysis | No | 3-scenario comparison |
| Accessibility | Minimal | Lighthouse 100/100 |
| Mobile experience | Functional | Touch-optimised |
| Print support | No | Clean print layout |

---

## Disclaimer

> This tool has been designed for information purposes only. Actual results may vary depending on various factors involved in capital market. Investor should not consider above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained in future and is not a guarantee of any future returns.

---

<div align="center">

**FinCal Innovation Hackathon · Technex '26 · IIT-BHU**

Built with precision. Designed for people. Compliant by default.

</div>
