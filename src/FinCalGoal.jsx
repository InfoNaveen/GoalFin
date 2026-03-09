import { useState, useEffect, useRef, useCallback } from 'react';
import {
    BRAND, PRESET_GOALS, fmt, fmtFull,
    calcGoal, generateProjection, calcDelay,
} from './utils/calculations';

/* ═══════════════════════════════════════════════════════════════════════════
   DISCLAIMER — Mandatory on every view (verbatim per hackathon rules)
   ═══════════════════════════════════════════════════════════════════════════ */
function Disclaimer() {
    return (
        <aside className="disclaimer" aria-label="Legal disclaimer">
            <p>
                <strong>Disclaimer:</strong> This tool has been designed for information
                purposes only. Actual results may vary depending on various factors
                involved in capital market. Investor should not consider above as a
                recommendation for any schemes of HDFC Mutual Fund. Past performance may
                or may not be sustained in future and is not a guarantee of any future
                returns.
            </p>
        </aside>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED NUMBER — Smooth count-up with requestAnimationFrame
   ═══════════════════════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, prefix = '₹', duration = 900 }) {
    const [display, setDisplay] = useState(0);
    const startRef = useRef(0);
    const startTimeRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        startRef.current = display;
        startTimeRef.current = null;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const animate = (ts) => {
            if (!startTimeRef.current) startTimeRef.current = ts;
            const progress = Math.min((ts - startTimeRef.current) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setDisplay(startRef.current + (value - startRef.current) * ease);
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, duration]);

    const formatted =
        display >= 10000000
            ? `${prefix}${(display / 10000000).toFixed(2)} Cr`
            : display >= 100000
                ? `${prefix}${(display / 100000).toFixed(2)} L`
                : `${prefix}${Math.round(display).toLocaleString('en-IN')}`;

    return (
        <span aria-live="polite" aria-atomic="true" aria-label={fmt(value)}>
            {formatted}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STEP INDICATOR — 3-step progress bar (Fix #5: increased contrast)
   ═══════════════════════════════════════════════════════════════════════════ */
function StepIndicator({ currentStep }) {
    const steps = ['Select Goal', 'Configure', 'Results'];
    return (
        <nav aria-label={`Progress: Step ${currentStep + 1} of 3`} className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
            {steps.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
                    <div
                        className={`progress-dot ${i === currentStep ? 'glow-active' : ''}`}
                        style={{
                            background: i < currentStep ? BRAND.blue : i === currentStep ? `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueLight})` : 'rgba(255,255,255,0.06)',
                            border: i === currentStep ? 'none' : `1px solid rgba(255,255,255,${i < currentStep ? '0.3' : '0.1'})`,
                            color: i <= currentStep ? BRAND.white : '#c4c4c4',
                        }}
                        aria-current={i === currentStep ? 'step' : undefined}
                    >
                        {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span
                        className="step-indicator-labels"
                        style={{ marginLeft: 8, fontSize: 13, color: i === currentStep ? '#ffffff' : '#c4c4c4', fontWeight: i === currentStep ? 700 : 500, whiteSpace: 'nowrap', marginRight: 8 }}
                    >
                        {s}
                    </span>
                    {i < steps.length - 1 && (
                        <div className="progress-line" style={{ background: i < currentStep ? `linear-gradient(90deg, ${BRAND.blue}, rgba(34,76,135,0.3))` : undefined }} />
                    )}
                </div>
            ))}
        </nav>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INFLATION TOOLTIP — Educational explanation
   ═══════════════════════════════════════════════════════════════════════════ */
function InflationTooltip({ inflationRate, presentCost, years }) {
    const [open, setOpen] = useState(false);
    const tooltipRef = useRef(null);
    const inflated = presentCost * Math.pow(1 + inflationRate / 100, years);

    useEffect(() => {
        if (!open) return;
        const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <span className="info-tooltip" ref={tooltipRef}>
            <button
                className="info-btn"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label="Learn about inflation"
                type="button"
            >
                ℹ️
            </button>
            {open && (
                <div className="tooltip-panel" role="tooltip" id="inflation-tooltip">
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: BRAND.textPrimary }}>
                        Why does inflation matter?
                    </h4>
                    <p style={{ fontSize: 12, color: BRAND.textSecondary, lineHeight: 1.6, margin: 0 }}>
                        Inflation means prices rise over time. At <strong style={{ color: '#7ba8d8' }}>{inflationRate}%</strong> annual
                        inflation, something that costs <strong style={{ color: BRAND.textPrimary }}>{fmt(presentCost)}</strong> today
                        may cost approximately <strong style={{ color: '#fca5a5' }}>{fmt(inflated)}</strong> in {years} years.
                        That is why your goal is inflation-adjusted — so your estimate accounts for rising prices.
                    </p>
                </div>
            )}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDER — Custom slider with editable numeric input fallback
   ═══════════════════════════════════════════════════════════════════════════ */
function Slider({ label, id, value, min, max, step, unit, onChange, color = BRAND.blue, info, tooltipNode }) {
    const [editing, setEditing] = useState(false);
    const [editVal, setEditVal] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef(null);
    const pct = ((value - min) / (max - min)) * 100;
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase();
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const displayValue = unit === '₹' ? fmt(value) : `${value}${unit}`;

    const startEdit = () => {
        setEditing(true);
        setEditVal(String(value));
        setError('');
        setTimeout(() => inputRef.current?.select(), 30);
    };

    const commitEdit = () => {
        const num = parseFloat(editVal);
        if (isNaN(num)) {
            setError(`Please enter a valid number`);
            return;
        }
        if (num < min || num > max) {
            setError(`Value must be between ${unit === '₹' ? fmt(min) : min} and ${unit === '₹' ? fmt(max) : max}`);
            return;
        }
        setError('');
        setEditing(false);
        const clamped = Math.round(num / step) * step;
        onChange(Math.max(min, Math.min(max, clamped)));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') { setEditing(false); setError(''); }
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <label htmlFor={inputId} style={{ fontSize: 14, color: BRAND.greyLight, fontWeight: 500 }}>
                        {label}
                    </label>
                    {tooltipNode}
                    {info && (
                        <span id={helperId} style={{ marginLeft: 4, fontSize: 11, color: BRAND.textSecondary, fontStyle: 'italic' }}>
                            {info}
                        </span>
                    )}
                </div>
                <div style={{ minWidth: 90, textAlign: 'center' }}>
                    {editing ? (
                        <div>
                            <input
                                ref={inputRef}
                                className="number-edit-input"
                                type="number"
                                value={editVal}
                                min={min}
                                max={max}
                                step={step}
                                onChange={(e) => setEditVal(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={handleKeyDown}
                                aria-label={`Edit ${label}`}
                                aria-invalid={!!error}
                                aria-describedby={error ? errorId : undefined}
                                style={{ width: 100 }}
                            />
                            {error && (
                                <div id={errorId} role="alert" style={{ fontSize: 10, color: '#fca5a5', marginTop: 2 }}>
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="editable-badge"
                            onClick={startEdit}
                            aria-label={`Edit ${label}: current value ${displayValue}. Click to type a value.`}
                            style={{
                                background: `${color}22`,
                                border: `1px solid ${color}55`,
                                borderRadius: 8,
                                padding: '4px 12px',
                                fontSize: 15,
                                fontWeight: 600,
                                color: BRAND.textPrimary,
                                minWidth: 80,
                                textAlign: 'center',
                                cursor: 'pointer',
                                fontFamily: "'Montserrat', Arial, Verdana, sans-serif",
                                transition: 'background 0.2s',
                                position: 'relative',
                            }}
                        >
                            {displayValue}
                            <span className="badge-pencil" aria-hidden="true">✏</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Slider track — Fix #2: visible thumb via native range with gradient track */}
            <div style={{ position: 'relative', height: 22, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: 6, width: '100%', borderRadius: 99, background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: 6, width: `${pct}%`, background: `linear-gradient(90deg, ${BRAND.blue}, ${color})`, borderRadius: 99, transition: 'width 0.1s', pointerEvents: 'none' }} />
                <input
                    type="range"
                    id={inputId}
                    name={inputId}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    aria-label={label}
                    aria-describedby={info ? helperId : undefined}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                    aria-valuetext={displayValue}
                    className="slider-range-input"
                    data-color={color}
                    style={{ position: 'relative', width: '100%', height: 22, cursor: 'pointer', margin: 0, zIndex: 2 }}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: BRAND.textSecondary }}>{unit === '₹' ? fmt(min) : `${min}${unit}`}</span>
                <span style={{ fontSize: 11, color: BRAND.textSecondary }}>{unit === '₹' ? fmt(max) : `${max}${unit}`}</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DONUT CHART — SVG-based invested vs gains
   ═══════════════════════════════════════════════════════════════════════════ */
function DonutChart({ invested, gains, size = 200 }) {
    const total = invested + gains;
    const investedPct = total > 0 ? invested / total : 0.5;
    const gainsPct = 1 - investedPct;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    const stroke = size * 0.13;
    const circ = 2 * Math.PI * r;
    const investedDash = circ * investedPct;
    const gainsDash = circ * gainsPct;
    const gap = 3;

    const ariaLabel = total > 0
        ? `Donut chart: ${(gainsPct * 100).toFixed(0)}% estimated wealth gained, ${(investedPct * 100).toFixed(0)}% amount invested`
        : 'Donut chart: no data';

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel} style={{ overflow: 'visible' }}>
            <defs>
                <filter id="chart-glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
            <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke={BRAND.blue} strokeWidth={stroke}
                strokeDasharray={`${Math.max(0, investedDash - gap)} ${circ}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)', filter: 'url(#chart-glow)' }}
            />
            <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke={BRAND.red} strokeWidth={stroke}
                strokeDasharray={`${Math.max(0, gainsDash - gap)} ${circ}`}
                strokeLinecap="round"
                style={{
                    transform: `rotate(${-90 + investedPct * 360}deg)`,
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1), transform 1s cubic-bezier(0.4,0,0.2,1)',
                    filter: 'url(#chart-glow)',
                }}
            />
            <text x={cx} y={cy - 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={size * 0.07} fontFamily="Montserrat, Arial, Verdana, sans-serif">Est. Returns</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fill={BRAND.white} fontSize={size * 0.12} fontFamily="Montserrat, Arial, Verdana, sans-serif" fontWeight="600">
                {total > 0 ? `${(gainsPct * 100).toFixed(0)}%` : '—'}
            </text>
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROJECTION TABLE — Year-by-year with milestone markers
   ═══════════════════════════════════════════════════════════════════════════ */
function ProjectionTable({ requiredSIP, annualReturn, years, inflatedGoal }) {
    const rows = generateProjection(requiredSIP, annualReturn, years, inflatedGoal);
    const milestones = [25, 50, 75, 100];

    const getMilestone = (pct) => {
        for (const m of milestones) {
            if (pct >= m && pct < m + 8) return m;
        }
        return null;
    };

    const milestoneColors = { 25: '#7ba8d8', 50: BRAND.blue, 75: '#e07b35', 100: '#7ba8d8' };

    return (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${BRAND.cardBorder}` }}>
            <table className="data-table">
                <caption>Year-by-year illustrative projection of your estimated corpus growth</caption>
                <thead>
                    <tr>
                        <th scope="col">Year</th>
                        <th scope="col">Total Invested</th>
                        <th scope="col">Est. Corpus</th>
                        <th scope="col">Progress</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const milestone = getMilestone(row.progressPct);
                        return (
                            <tr key={row.year} style={row.year === years ? { background: 'rgba(34,76,135,0.15)' } : undefined}>
                                <th scope="row" style={{ color: BRAND.textSecondary, fontWeight: row.year === years ? 700 : 400 }}>{row.year}</th>
                                <td style={{ color: BRAND.textPrimary }}>{fmt(row.invested)}</td>
                                <td style={{ color: row.progressPct >= 100 ? '#7ba8d8' : BRAND.textPrimary, fontWeight: row.year === years ? 700 : 400 }}>
                                    {fmt(row.corpus)}
                                </td>
                                <td style={{ minWidth: 130 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${row.progressPct}%`, background: row.progressPct >= 100 ? '#7ba8d8' : `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.red})`, borderRadius: 99, transition: 'width 0.5s' }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: BRAND.textSecondary, minWidth: 32 }}>{row.progressPct.toFixed(0)}%</span>
                                    </div>
                                    {milestone && (
                                        <span className="milestone-badge" style={{ background: `${milestoneColors[milestone]}22`, color: milestoneColors[milestone], marginTop: 3 }}>
                                            {milestone}% milestone
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WHAT-IF DELAY — Cost of waiting
   ═══════════════════════════════════════════════════════════════════════════ */
function WhatIfDelay({ originalSIP, presentCost, years, inflation, annualReturn }) {
    const [selectedDelay, setSelectedDelay] = useState(null);
    const delays = [1, 2, 5];

    return (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: BRAND.greyLight }}>
                What If You Delay?
            </h3>
            <p style={{ fontSize: 12, color: BRAND.textSecondary, marginBottom: 16, lineHeight: 1.5 }}>
                See the estimated impact of starting your investment later. Delaying may increase your required monthly SIP.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {delays.map((d) => (
                    <button
                        key={d}
                        type="button"
                        className={`scenario-tag ${selectedDelay === d ? 'active' : ''}`}
                        onClick={() => setSelectedDelay(selectedDelay === d ? null : d)}
                        aria-pressed={selectedDelay === d}
                        aria-label={`Show impact of ${d} year${d > 1 ? 's' : ''} delay`}
                        style={{
                            borderColor: selectedDelay === d ? BRAND.blue : 'rgba(255,255,255,0.15)',
                            color: selectedDelay === d ? '#7ba8d8' : BRAND.textSecondary,
                            background: selectedDelay === d ? 'rgba(34,76,135,0.2)' : 'transparent',
                        }}
                    >
                        {d} yr{d > 1 ? 's' : ''} later
                    </button>
                ))}
            </div>

            {selectedDelay && (() => {
                const result = calcDelay({ presentCost, years, inflation, annualReturn, delay: selectedDelay, originalSIP });
                if (!result.achievable) {
                    return (
                        <div className="warning-banner" role="alert">
                            <strong>Not achievable</strong> — With only {years - selectedDelay} year(s) remaining, this goal may not be
                            reachable with the current assumptions. Consider adjusting your target or time horizon.
                        </div>
                    );
                }
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }} className="metrics-row">
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px' }}>
                            <div style={{ fontSize: 11, color: BRAND.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Horizon</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.textPrimary }}>{result.newYears} yrs</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px' }}>
                            <div style={{ fontSize: 11, color: BRAND.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Est. New SIP</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#fca5a5' }}>{fmt(result.newSIP)}/mo</div>
                        </div>
                        <div style={{ background: 'rgba(218,56,50,0.1)', border: '1px solid rgba(218,56,50,0.25)', borderRadius: 12, padding: '14px 16px' }}>
                            <div style={{ fontSize: 11, color: '#fca5a5', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Extra Cost/Mo</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.red }}>+{fmt(result.monthlyCostOfDelay)}</div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCENARIO COMPARISON TABLE
   ═══════════════════════════════════════════════════════════════════════════ */
function ScenarioComparison({ presentCost, years, inflation, annualReturn }) {
    const scenarios = [
        { label: 'Conservative', ret: Math.max(annualReturn - 4, 1), inf: Math.min(inflation + 1, 15), accent: '#9ca3af' },
        { label: 'Base Case', ret: annualReturn, inf: inflation, accent: '#7ba8d8', highlight: true },
        { label: 'Optimistic', ret: Math.min(annualReturn + 4, 30), inf: Math.max(inflation - 1, 1), accent: '#4ade80' },
    ];

    return (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16, color: BRAND.greyLight }}>Scenario Comparison</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 560 }}>
                    <caption>Illustrative comparison across conservative, base, and optimistic assumptions</caption>
                    <thead>
                        <tr>
                            <th scope="col">Scenario</th>
                            <th scope="col">Return</th>
                            <th scope="col">Inflation</th>
                            <th scope="col">Goal Value</th>
                            <th scope="col">Est. SIP/mo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scenarios.map((sc) => {
                            const r = calcGoal({ presentCost, years, inflation: sc.inf, annualReturn: sc.ret });
                            return (
                                <tr key={sc.label} style={sc.highlight ? { background: 'rgba(34,76,135,0.1)' } : undefined}>
                                    <th scope="row" style={{ fontWeight: 600 }}>
                                        <span style={{ color: sc.accent }}>{sc.label}</span>
                                        {sc.highlight && (
                                            <span style={{ marginLeft: 8, fontSize: 10, background: `${BRAND.blue}44`, color: '#7ba8d8', padding: '2px 8px', borderRadius: 99 }}>Your Input</span>
                                        )}
                                    </th>
                                    <td style={{ color: BRAND.textSecondary }}>{sc.ret}%</td>
                                    <td style={{ color: BRAND.textSecondary }}>{sc.inf}%</td>
                                    <td style={{ color: BRAND.textPrimary }}>{fmt(r.inflatedGoal)}</td>
                                    <td style={{ color: sc.accent, fontWeight: 700 }}>{fmt(r.requiredSIP)}/mo</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GOAL CARD — Individual preset goal
   ═══════════════════════════════════════════════════════════════════════════ */
function GoalCard({ goal, onSelect }) {
    return (
        <div
            className="goal-card glass-card"
            onClick={() => onSelect(goal)}
            role="button"
            tabIndex={0}
            aria-label={`Select ${goal.label}: estimated cost ${fmt(goal.defaultCost)}, ${goal.defaultYears} year timeline`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(goal); } }}
            style={{ padding: '28px 20px', textAlign: 'center' }}
        >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{goal.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, lineHeight: 1.2, color: BRAND.textPrimary }}>{goal.label}</div>
            <div style={{ fontSize: 12, color: BRAND.textSecondary }}>
                ~{fmt(goal.defaultCost)} · {goal.defaultYears}y
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP — 3-Step Wizard
   ═══════════════════════════════════════════════════════════════════════════ */
export default function FinCalGoal() {
    const [step, setStep] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [goalName, setGoalName] = useState('');
    const [presentCost, setPresentCost] = useState(1000000);
    const [years, setYears] = useState(7);
    const [inflation, setInflation] = useState(6);
    const [annualReturn, setAnnualReturn] = useState(12);
    const [showTable, setShowTable] = useState(false);
    const [assumptionsOpen, setAssumptionsOpen] = useState(false);
    const [animIn, setAnimIn] = useState(true);
    const [showEditHint, setShowEditHint] = useState(true);

    const sectionRef = useRef(null);

    const result = calcGoal({ presentCost, years, inflation, annualReturn });
    const returnBelowInflation = annualReturn <= inflation;

    // Focus management: focus heading on step change
    useEffect(() => {
        if (sectionRef.current) {
            const heading = sectionRef.current.querySelector('h2');
            if (heading) {
                heading.setAttribute('tabindex', '-1');
                heading.focus();
            }
        }
    }, [step]);

    const transitionTo = useCallback((nextStep) => {
        setAnimIn(false);
        setTimeout(() => { setStep(nextStep); setAnimIn(true); }, 200);
    }, []);

    // Fix #4: For custom goals, use "Custom Goal" until user renames
    const getDisplayGoalName = () => {
        if (selectedGoal?.id === 'custom' && goalName === 'My Own Goal') {
            return 'Custom Goal';
        }
        return goalName;
    };

    const selectGoal = (goal) => {
        setSelectedGoal(goal);
        setGoalName(goal.label);
        setPresentCost(goal.defaultCost);
        setYears(goal.defaultYears);
        transitionTo(1);
    };

    const restart = () => {
        setShowTable(false);
        transitionTo(0);
    };

    return (
        <div className="fincal-root">
            <main role="main" className="content-wrapper">

                {/* ── HEADER ── */}
                <header style={{ padding: '32px 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueLight})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, boxShadow: `0 4px 20px ${BRAND.blue}55`,
                        }}>🎯</div>
                        <div>
                            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1 }}>LifeGoals</h1>
                            <div style={{ fontSize: 10, color: BRAND.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>Goal-Based Calculator</div>
                        </div>
                    </div>
                    <div style={{ fontSize: 11, color: BRAND.textSecondary, textAlign: 'right', lineHeight: 1.5, maxWidth: 200 }}>
                        <div style={{ color: '#7ba8d8', fontWeight: 600, marginBottom: 2 }}>HDFC Mutual Fund</div>
                        Investor Education &amp; Awareness
                    </div>
                </header>

                <div className="brand-divider" />
                <StepIndicator currentStep={step} />

                {/* ════════════════════════════════════════════
            STEP 0 — GOAL SELECTION
        ═══════════════════════════════════════════ */}
                {step === 0 && (
                    <section ref={sectionRef} aria-label="Step 1: Select your goal" className={animIn ? 'slide-in' : ''}>
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <div className="step-badge no-print" style={{ margin: '0 auto 16px' }}>Step 1 of 3</div>
                            <h2 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 14 }}>
                                What are you<br /><em style={{ color: '#7ba8d8', fontStyle: 'normal' }}>saving towards?</em>
                            </h2>
                            <p style={{ color: BRAND.textSecondary, fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
                                Every financial journey starts with a dream. Pick your goal and we will show you an illustrative plan to get there.
                            </p>
                        </div>

                        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                            <legend style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                                Choose a financial goal
                            </legend>
                            <div className="goal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 720, margin: '0 auto' }}>
                                {PRESET_GOALS.map((goal) => (
                                    <GoalCard key={goal.id} goal={goal} onSelect={selectGoal} />
                                ))}
                            </div>
                        </fieldset>

                        <Disclaimer />
                    </section>
                )}

                {/* ════════════════════════════════════════════
            STEP 1 — CONFIGURE
        ═══════════════════════════════════════════ */}
                {step === 1 && selectedGoal && (
                    <section ref={sectionRef} aria-label="Step 2: Configure your goal" className={animIn ? 'slide-in' : ''}>
                        <div style={{ marginBottom: 32 }}>
                            <div className="step-badge no-print" style={{ marginBottom: 14 }}>Step 2 of 3</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                                <span style={{ fontSize: 40 }}>{selectedGoal.icon}</span>
                                <div>
                                    <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.5px' }}>
                                        Plan your <em style={{ color: '#7ba8d8', fontStyle: 'normal' }}>{getDisplayGoalName()}</em>
                                    </h2>
                                    <p style={{ color: BRAND.textSecondary, fontSize: 14, marginTop: 4 }}>Adjust the numbers below. All values are editable.</p>
                                </div>
                            </div>
                        </div>

                        {/* Fix #3: Edit hint banner */}
                        {showEditHint && (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: 'rgba(34,76,135,0.15)', border: '1px solid rgba(34,76,135,0.3)',
                                borderRadius: 10, padding: '10px 16px', marginBottom: 20,
                                fontSize: 13, color: '#7ba8d8',
                            }}>
                                <span>💡 <strong>Tip:</strong> Click any value badge (e.g. ₹50.00 L) to type a number directly.</span>
                                <button
                                    type="button"
                                    onClick={() => setShowEditHint(false)}
                                    aria-label="Dismiss tip"
                                    style={{ background: 'none', border: 'none', color: '#7ba8d8', cursor: 'pointer', fontSize: 16, padding: '0 4px', lineHeight: 1 }}
                                >×</button>
                            </div>
                        )}

                        {selectedGoal.id === 'custom' && (
                            <div style={{ marginBottom: 24 }}>
                                <label htmlFor="goal-name" style={{ fontSize: 14, color: BRAND.greyLight, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                                    Goal Name
                                </label>
                                <input
                                    id="goal-name"
                                    name="goal-name"
                                    className="editable-input"
                                    type="text"
                                    value={goalName}
                                    onChange={(e) => setGoalName(e.target.value)}
                                    placeholder="e.g. Emergency Fund, Business Launch..."
                                    aria-label="Goal name"
                                />
                            </div>
                        )}

                        <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                            <div className="glass-card" style={{ padding: '28px 24px' }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: BRAND.greyLight, borderBottom: `1px solid ${BRAND.cardBorder}`, paddingBottom: 12 }}>
                                    Goal Details
                                </h3>
                                <Slider id="present-cost" label="Current Cost of Goal" value={presentCost} min={100000} max={50000000} step={100000} unit="₹" onChange={setPresentCost} />
                                <Slider id="time-horizon" label="Time to Achieve Goal" value={years} min={1} max={30} step={1} unit=" yrs" onChange={setYears} />
                            </div>

                            <div className="glass-card" style={{ padding: '28px 24px' }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, color: BRAND.greyLight, borderBottom: `1px solid ${BRAND.cardBorder}`, paddingBottom: 12 }}>
                                    Assumptions
                                    <span style={{ fontSize: 11, color: BRAND.textSecondary, fontWeight: 400, marginLeft: 8 }}>(editable)</span>
                                </h3>
                                <p style={{ fontSize: 12, color: BRAND.textSecondary, marginBottom: 20, lineHeight: 1.5 }}>
                                    These are illustrative assumptions. Real-world values may differ.
                                </p>
                                <Slider
                                    id="inflation-rate"
                                    label="Expected Inflation Rate"
                                    value={inflation} min={1} max={15} step={0.5} unit="%"
                                    onChange={setInflation} color="#e07b35"
                                    info="Annual price rise"
                                    tooltipNode={<InflationTooltip inflationRate={inflation} presentCost={presentCost} years={years} />}
                                />
                                <Slider
                                    id="annual-return"
                                    label="Expected Annual Return"
                                    value={annualReturn} min={1} max={30} step={0.5} unit="%"
                                    onChange={setAnnualReturn} color={BRAND.red}
                                    info="Pre-tax, illustrative"
                                />
                            </div>
                        </div>

                        {/* Return below inflation warning */}
                        {returnBelowInflation && (
                            <div className="warning-banner" role="alert" style={{ marginTop: 16 }}>
                                ⚠️ Your assumed return is lower than or equal to inflation. The real purchasing power of your estimated corpus may not meet the goal.
                            </div>
                        )}

                        {/* Live preview */}
                        <div
                            className="glass-card live-preview-card"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label="Live calculation results"
                            style={{
                                padding: '20px 24px', marginTop: 24,
                                background: 'rgba(34,76,135,0.12)',
                                border: '1px solid rgba(34,76,135,0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 12, color: '#7ba8d8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Estimated Goal Value ({years} years from now)
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 700 }}>
                                    <AnimatedNumber value={result.inflatedGoal} />
                                </div>
                                <div style={{ fontSize: 12, color: BRAND.textSecondary, marginTop: 4 }}>
                                    Accounting for {inflation}% assumed annual inflation
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, color: '#f87171', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Estimated Monthly SIP
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: '#f87171' }}>
                                    <AnimatedNumber value={result.requiredSIP} />
                                </div>
                                <div style={{ fontSize: 12, color: BRAND.textSecondary, marginTop: 4 }}>
                                    Assuming {annualReturn}% illustrative annual return
                                </div>
                            </div>
                        </div>

                        <div className="action-bar no-print" style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
                            <button className="btn-ghost" onClick={restart} aria-label="Go back to goal selection" type="button">← Back</button>
                            <button className="btn-primary" onClick={() => transitionTo(2)} aria-label="View detailed results" type="button">See Full Analysis →</button>
                        </div>

                        <Disclaimer />
                    </section>
                )}

                {/* ════════════════════════════════════════════
            STEP 2 — RESULTS
        ═══════════════════════════════════════════ */}
                {step === 2 && (
                    <section ref={sectionRef} aria-label="Step 3: Your investment roadmap" className={animIn ? 'slide-in' : ''}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                            <div>
                                <div className="step-badge no-print" style={{ marginBottom: 12 }}>
                                    <span style={{ fontSize: 16 }}>{selectedGoal?.icon}</span> {goalName}
                                </div>
                                <h2 style={{ fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                                    Your Investment<br /><em style={{ color: '#7ba8d8', fontStyle: 'normal' }}>Roadmap</em>
                                </h2>
                            </div>
                            <div className="no-print" style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-ghost" onClick={() => transitionTo(1)} aria-label="Edit goal parameters" type="button">✏️ Edit</button>
                                <button className="btn-ghost" onClick={() => window.print()} aria-label="Save results as PDF" type="button">📋 Save PDF</button>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
                            {[
                                { label: 'Goal Value (Inflation-adjusted)', value: result.inflatedGoal, accent: '#7ba8d8', icon: '🎯' },
                                { label: 'Estimated Monthly SIP', value: result.requiredSIP, accent: BRAND.red, icon: '📋' },
                                { label: 'Total Amount Invested', value: result.totalInvested, accent: BRAND.blue, icon: '🏠' },
                                { label: 'Estimated Wealth Gained', value: result.wealthGained, accent: '#7ba8d8', icon: '✈️' },
                            ].map((m) => (
                                <div key={m.label} className="result-metric glass-card" style={{ padding: '20px 18px', borderTop: `3px solid ${m.accent}` }}>
                                    <div style={{ fontSize: 20, marginBottom: 10 }}>{m.icon}</div>
                                    <div style={{ fontSize: 11, color: BRAND.textSecondary, marginBottom: 8, lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        {m.label}
                                    </div>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: m.accent, lineHeight: 1 }}>
                                        <AnimatedNumber value={m.value} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Return below inflation warning */}
                        {returnBelowInflation && (
                            <div className="warning-banner" role="alert" style={{ marginBottom: 24 }}>
                                ⚠️ Your assumed return ({annualReturn}%) is lower than or equal to inflation ({inflation}%).
                                Real purchasing power of your estimated corpus may not meet the goal.
                            </div>
                        )}

                        {/* Donut + How this works */}
                        <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, marginBottom: 24 }}>
                            <div className="glass-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 24, color: BRAND.greyLight }}>Corpus Composition</h3>
                                <DonutChart invested={result.totalInvested} gains={result.wealthGained} size={180} />
                                <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {[
                                        { label: 'Amount Invested', value: result.totalInvested, color: BRAND.blue },
                                        { label: 'Est. Wealth Gained', value: result.wealthGained, color: BRAND.red },
                                    ].map((l) => (
                                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: 11, color: BRAND.textSecondary }}>{l.label}</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.textPrimary }}>{fmt(l.value)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* How This Works */}
                            <div className="glass-card" style={{ padding: '28px 24px' }}>
                                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: BRAND.greyLight }}>How This Works</h3>
                                {[
                                    {
                                        num: 1, title: 'Inflation-Adjusted Goal',
                                        desc: `Today's cost of ${fmt(presentCost)} grows at ${inflation}% p.a. assumed inflation over ${years} years`,
                                        result: fmt(result.inflatedGoal),
                                        formula: `${fmt(presentCost)} × (1 + ${inflation}%)^${years}`,
                                        color: '#7ba8d8',
                                    },
                                    {
                                        num: 2, title: 'Estimated Monthly SIP',
                                        desc: `To accumulate the inflated goal in ${years} years at ${annualReturn}% assumed annual return`,
                                        result: `${fmt(result.requiredSIP)}/mo`,
                                        formula: `FV × r ÷ [((1+r)^n − 1) × (1+r)]`,
                                        color: BRAND.red,
                                    },
                                ].map((item) => (
                                    <div key={item.num} style={{ display: 'flex', gap: 16, paddingBottom: item.num === 1 ? 20 : 0, borderBottom: item.num === 1 ? `1px solid ${BRAND.cardBorder}` : 'none', marginBottom: item.num === 1 ? 20 : 0 }}>
                                        <div style={{ flexShrink: 0 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}22`, border: `1px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: item.color, fontWeight: 700 }}>
                                                {item.num}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 11, color: item.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Step {item.num}</div>
                                            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
                                            <div style={{ fontSize: 12, color: BRAND.textSecondary, lineHeight: 1.5, marginBottom: 8 }}>{item.desc}</div>
                                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                                <code style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'Montserrat', Arial, Verdana, sans-serif" }}>{item.formula}</code>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: item.color, whiteSpace: 'nowrap' }}>{item.result}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Assumptions panel */}
                                <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <button
                                        className="assumption-toggle"
                                        type="button"
                                        onClick={() => setAssumptionsOpen(!assumptionsOpen)}
                                        aria-expanded={assumptionsOpen}
                                        aria-controls="assumptions-panel"
                                        aria-label="View all assumptions"
                                    >
                                        <span>📋</span>
                                        <span style={{ flex: 1 }}>View All Assumptions</span>
                                        <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: assumptionsOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                                    </button>
                                    {assumptionsOpen && (
                                        <div id="assumptions-panel" style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            {[
                                                ['Current Cost', fmtFull(presentCost)],
                                                ['Time Horizon', `${years} years`],
                                                ['Inflation Rate', `${inflation}% p.a. (assumed)`],
                                                ['Expected Return', `${annualReturn}% p.a. (illustrative)`],
                                                ['SIP Frequency', 'Monthly'],
                                                ['Total Months', `${years * 12}`],
                                            ].map(([k, v]) => (
                                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <span style={{ color: BRAND.textSecondary }}>{k}</span>
                                                    <span style={{ color: BRAND.textPrimary, fontWeight: 500 }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* What-If Delay */}
                        <WhatIfDelay
                            originalSIP={result.requiredSIP}
                            presentCost={presentCost}
                            years={years}
                            inflation={inflation}
                            annualReturn={annualReturn}
                        />

                        {/* Scenario Comparison */}
                        <ScenarioComparison
                            presentCost={presentCost}
                            years={years}
                            inflation={inflation}
                            annualReturn={annualReturn}
                        />

                        {/* Projection Table */}
                        <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                                <h3 style={{ fontSize: 17, fontWeight: 600, color: BRAND.greyLight }}>Year-by-Year Projection</h3>
                                <button
                                    className="btn-ghost no-print"
                                    type="button"
                                    style={{ padding: '8px 16px', fontSize: 13 }}
                                    onClick={() => setShowTable(!showTable)}
                                    aria-expanded={showTable}
                                    aria-controls="projection-table-section"
                                    aria-label={showTable ? 'Collapse projection table' : 'Expand projection table'}
                                >
                                    {showTable ? '▲ Collapse' : '▼ Expand'}
                                </button>
                            </div>
                            {showTable && (
                                <div id="projection-table-section">
                                    <ProjectionTable
                                        requiredSIP={result.requiredSIP}
                                        annualReturn={annualReturn}
                                        years={years}
                                        inflatedGoal={result.inflatedGoal}
                                    />
                                </div>
                            )}
                            {!showTable && (
                                <p style={{ color: BRAND.textSecondary, fontSize: 13 }}>
                                    Track how your estimated corpus may grow year by year towards your {fmt(result.inflatedGoal)} goal.
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="action-bar no-print" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button className="btn-ghost" onClick={restart} aria-label="Plan a different goal" type="button">🎯 Plan Another Goal</button>
                            <button className="btn-primary" onClick={() => transitionTo(1)} aria-label="Adjust goal parameters" type="button">✏️ Adjust Parameters</button>
                        </div>

                        <Disclaimer />
                    </section>
                )}

                {/* Footer */}
                <footer style={{ marginTop: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'rgba(176,176,176,0.5)' }}>
                        FinCal Innovation Hackathon · Technex '26, IIT-BHU · Co-sponsored by HDFC Mutual Fund · Investor Education &amp; Awareness Initiative
                    </p>
                </footer>
            </main>
        </div>
    );
}
