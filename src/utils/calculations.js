/* ═══════════════════════════════════════════════════════════════════════════
   FINANCIAL CALCULATION LOGIC — Pure functions, no side effects
   ═══════════════════════════════════════════════════════════════════════════
   Formulas per FinCal Innovation Hackathon specification:
     Step 1: Future Goal Value = Present Cost × (1 + Inflation/100)^Years
     Step 2: Required SIP = FV × r / [((1+r)^n − 1) × (1+r)]
             where r = Annual Return / 100 / 12, n = Years × 12
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Inflate a present-day cost to its future value using compound inflation.
 * @param {number} presentCost  — today's cost of the goal (₹)
 * @param {number} inflationRate — annual inflation rate (percentage, e.g. 6)
 * @param {number} years        — time horizon in years
 * @returns {number} inflation-adjusted future goal value
 */
export function inflateCost(presentCost, inflationRate, years) {
    return presentCost * Math.pow(1 + inflationRate / 100, years);
}

/**
 * Calculate the required monthly SIP to reach a future goal value.
 * Uses the standard future-value-of-annuity-due formula.
 * @param {number} futureGoalValue — target corpus (₹)
 * @param {number} annualReturn    — assumed annual return (percentage, e.g. 12)
 * @param {number} years           — investment horizon in years
 * @returns {number} required monthly SIP amount (₹), floored to ₹1 minimum
 */
export function requiredMonthlySIP(futureGoalValue, annualReturn, years) {
    const r = annualReturn / 100 / 12; // monthly rate
    const n = years * 12;              // total months

    if (r === 0) {
        // Edge case: zero return — simple division
        return Math.max(1, futureGoalValue / n);
    }

    const sip = (futureGoalValue * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
    return Math.max(1, sip);
}

/**
 * Full goal calculation: inflated goal, required SIP, total invested, wealth gained.
 * @param {object} params
 * @param {number} params.presentCost   — current cost of the goal (₹)
 * @param {number} params.years         — investment horizon (years)
 * @param {number} params.inflation     — annual inflation rate (%)
 * @param {number} params.annualReturn  — expected annual return (%)
 * @returns {object} { inflatedGoal, requiredSIP, totalInvested, wealthGained }
 */
export function calcGoal({ presentCost, years, inflation, annualReturn }) {
    const inflatedGoal = inflateCost(presentCost, inflation, years);
    const sip = requiredMonthlySIP(inflatedGoal, annualReturn, years);
    const totalInvested = sip * years * 12;
    const wealthGained = Math.max(0, inflatedGoal - totalInvested);

    return {
        inflatedGoal,
        requiredSIP: sip,
        totalInvested,
        wealthGained,
    };
}

/**
 * Generate year-by-year projection data.
 * @param {number} monthlySIP    — monthly SIP amount (₹)
 * @param {number} annualReturn  — expected annual return (%)
 * @param {number} years         — total investment horizon (years)
 * @param {number} inflatedGoal  — target future goal value (₹)
 * @returns {Array<{year, corpus, invested, progressPct}>}
 */
export function generateProjection(monthlySIP, annualReturn, years, inflatedGoal) {
    const r = annualReturn / 100 / 12;
    const rows = [];

    for (let y = 1; y <= Math.min(years, 30); y++) {
        const n = y * 12;
        let corpus;

        if (r === 0) {
            corpus = monthlySIP * n;
        } else {
            corpus = monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        }

        const invested = monthlySIP * n;
        const progressPct = inflatedGoal > 0
            ? Math.min((corpus / inflatedGoal) * 100, 100)
            : 0;

        rows.push({ year: y, corpus, invested, progressPct });
    }

    return rows;
}

/**
 * What-if delay calculation: what happens if the investor starts d years later.
 * @param {object} params
 * @param {number} params.presentCost   — current cost of the goal (₹)
 * @param {number} params.years         — original time horizon (years)
 * @param {number} params.inflation     — annual inflation rate (%)
 * @param {number} params.annualReturn  — expected annual return (%)
 * @param {number} params.delay         — delay in years (1, 2, or 5)
 * @param {number} params.originalSIP   — the SIP without delay (₹)
 * @returns {object} { achievable, newYears, newInflatedGoal, newSIP, monthlyCostOfDelay }
 */
export function calcDelay({ presentCost, years, inflation, annualReturn, delay, originalSIP }) {
    const newYears = years - delay;

    if (newYears < 1) {
        return {
            achievable: false,
            newYears,
            newInflatedGoal: 0,
            newSIP: 0,
            monthlyCostOfDelay: 0,
        };
    }

    // Same inflation but applied over original years (the goal date doesn't change)
    const newInflatedGoal = inflateCost(presentCost, inflation, years);
    const newSIP = requiredMonthlySIP(newInflatedGoal, annualReturn, newYears);

    return {
        achievable: true,
        newYears,
        newInflatedGoal,
        newSIP,
        monthlyCostOfDelay: newSIP - originalSIP,
    };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FORMATTING HELPERS — Indian number system (Lakhs, Crores)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Compact format: ₹X.XX Cr / ₹X.XX L / ₹X,XX,XXX
 */
export function fmt(n) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/**
 * Full format with no abbreviation: ₹X,XX,XX,XXX
 */
export function fmtFull(n) {
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRESET GOALS — 6 goal cards per specification
   ═══════════════════════════════════════════════════════════════════════════ */

export const PRESET_GOALS = [
    { id: 'home', icon: '🏠', label: 'Dream Home', defaultCost: 5000000, defaultYears: 10 },
    { id: 'education', icon: '🎓', label: "Child's Education", defaultCost: 2000000, defaultYears: 15 },
    { id: 'car', icon: '🚗', label: 'New Car', defaultCost: 800000, defaultYears: 3 },
    { id: 'travel', icon: '✈️', label: 'World Tour', defaultCost: 500000, defaultYears: 5 },
    { id: 'wedding', icon: '💍', label: 'Dream Wedding', defaultCost: 1500000, defaultYears: 4 },
    { id: 'custom', icon: '⭐', label: 'My Own Goal', defaultCost: 1000000, defaultYears: 7 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   BRAND CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

export const BRAND = {
    blue: '#224c87',
    blueLight: '#2d62ad',
    blueDark: '#162f54',
    red: '#da3832',
    grey: '#919090',
    greyLight: '#c4c4c4',
    textPrimary: '#e8edf5',
    textSecondary: '#b0b0b0',
    white: '#ffffff',
    offWhite: '#f4f6fa',
    dark: '#0d1b2e',
    darker: '#070f1a',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.09)',
};
