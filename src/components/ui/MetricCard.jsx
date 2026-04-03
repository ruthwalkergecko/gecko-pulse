'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getScoreColor, getScoreLabel, formatScore } from '@/lib/dataTransform'

// ── Hero score card — big number, arc bar, trend badge ───────────────────────
export function ScoreCard({ score, label, subLabel, trend, comparisonScore, comparisonLabel, className = '' }) {
  const color = getScoreColor(score)
  const scoreLabel = getScoreLabel(score)

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 border card-highlight ${className}`}
      style={{
        background: score !== null
          ? `linear-gradient(145deg, #161B22 0%, ${color}08 100%)`
          : '#161B22',
        borderColor: score !== null ? `${color}22` : '#21262D',
        boxShadow: score !== null ? `0 0 40px ${color}07` : 'none',
      }}
    >
      {/* Label row */}
      <div className="flex items-start justify-between mb-1">
        <p className="text-[11px] font-medium text-gecko-subtext uppercase tracking-[0.12em]">
          {label}
        </p>
        {trend && <TrendBadge direction={trend.direction} delta={trend.delta} />}
      </div>

      {/* Big score number */}
      <div className="flex items-end gap-2 mt-3">
        <span
          className="metric-number font-display font-bold leading-none"
          style={{ color, fontSize: '76px', letterSpacing: '-0.035em', lineHeight: 1 }}
        >
          {formatScore(score)}
        </span>
        <span className="text-gecko-subtext text-lg font-display mb-2.5 leading-none">/ 5</span>
      </div>

      {/* Score label */}
      <p className="text-sm font-medium mt-2" style={{ color: `${color}cc` }}>
        {scoreLabel}
      </p>
      {subLabel && (
        <p className="text-xs text-gecko-muted mt-0.5">{subLabel}</p>
      )}

      {/* Progress bar */}
      {score !== null && (
        <div className="mt-4">
          <div className="w-full h-1 bg-gecko-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(score / 5) * 100}%`,
                backgroundColor: color,
                boxShadow: `0 0 6px ${color}70`,
              }}
            />
          </div>
        </div>
      )}

      {/* Company comparison */}
      {comparisonScore !== undefined && comparisonScore !== null && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gecko-muted">{comparisonLabel || 'Company avg'}:</span>
          <span className="text-xs font-display font-semibold text-gecko-blue">{formatScore(comparisonScore)}</span>
          {score !== null && <DiffBadge diff={score - comparisonScore} />}
        </div>
      )}
    </div>
  )
}

// ── Compact stat card ─────────────────────────────────────────────────────────
export function StatCard({ value, label, icon: Icon, accent = false, className = '' }) {
  return (
    <div className={`bg-gecko-card border border-gecko-border rounded-xl px-5 py-4 card-highlight ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-medium text-gecko-subtext uppercase tracking-[0.1em]">{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-gecko-dark border border-gecko-border flex items-center justify-center flex-shrink-0">
            <Icon size={13} className="text-gecko-subtext" />
          </div>
        )}
      </div>
      <p className={`text-[26px] font-display font-bold tracking-tight mt-1.5 leading-none ${accent ? 'text-gecko-green' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}

// ── Mini score pill ───────────────────────────────────────────────────────────
export function ScorePill({ score, size = 'md' }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs text-gecko-subtext bg-gecko-border/50">
        –
      </span>
    )
  }
  const color = getScoreColor(score)
  const sizeClass = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-sm', lg: 'px-3 py-1.5 text-base' }[size]
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-display font-semibold tracking-tight ${sizeClass}`}
      style={{ color, backgroundColor: `${color}12`, border: `1px solid ${color}28` }}
    >
      {formatScore(score)}
    </span>
  )
}

// ── Trend badge ───────────────────────────────────────────────────────────────
export function TrendBadge({ direction, delta }) {
  if (direction === 'flat' || delta === 0) {
    return (
      <div className="flex items-center gap-1.5 text-gecko-subtext text-xs bg-gecko-dark border border-gecko-border rounded-lg px-2.5 py-1.5">
        <Minus size={11} />
        <span>Stable</span>
      </div>
    )
  }
  const isUp = direction === 'up'
  return (
    <div className={`
      flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 font-medium
      ${isUp
        ? 'text-gecko-green bg-gecko-green/10 border border-gecko-green/20'
        : 'text-gecko-red bg-red-950/40 border border-red-900/30'
      }
    `}>
      {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      <span>{isUp ? '+' : ''}{delta}</span>
    </div>
  )
}

// ── Diff badge (inline, vs company) ──────────────────────────────────────────
function DiffBadge({ diff }) {
  if (Math.abs(diff) < 0.05) return null
  const isPositive = diff > 0
  return (
    <span className={`text-xs font-display font-semibold ${isPositive ? 'text-gecko-green' : 'text-gecko-red'}`}>
      {isPositive ? '+' : ''}{diff.toFixed(1)}
    </span>
  )
}

// ── Response rate card with SVG donut ─────────────────────────────────────────
export function ResponseRateCard({ responded, total, className = '' }) {
  const pct = total > 0 ? Math.round((responded / total) * 100) : 0
  const color = pct >= 80 ? '#8de971' : pct >= 60 ? '#9adbe8' : pct >= 40 ? '#d29922' : '#f85149'

  // SVG donut arc
  const r = 19
  const circ = 2 * Math.PI * r
  const filled = circ * (pct / 100)
  const offset = circ - filled

  return (
    <div className={`bg-gecko-card border border-gecko-border rounded-xl px-5 py-4 card-highlight ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium text-gecko-subtext uppercase tracking-[0.1em] mb-2">Response rate</p>
          <p
            className="text-[26px] font-display font-bold leading-none tracking-tight"
            style={{ color }}
          >
            {pct}%
          </p>
          <p className="text-xs text-gecko-subtext mt-1">{responded} of {total}</p>
        </div>

        {/* SVG donut */}
        <svg width="52" height="52" className="flex-shrink-0 -mr-1">
          {/* Track */}
          <circle cx="26" cy="26" r={r} fill="none" stroke="#21262D" strokeWidth="2.5" />
          {/* Fill */}
          <circle
            cx="26" cy="26" r={r}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${offset}`}
            strokeDashoffset={circ * 0.25} /* start from top */
            transform="rotate(-90 26 26)"
            style={{ filter: `drop-shadow(0 0 3px ${color}70)`, transition: 'stroke-dasharray 0.7s ease' }}
          />
        </svg>
      </div>
    </div>
  )
}
