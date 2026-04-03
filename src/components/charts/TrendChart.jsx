'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatScore, getScoreColor } from '@/lib/dataTransform'

/**
 * Area chart showing average score trend over time.
 * Shows the role-filtered scope area + a dashed company average line.
 */
export default function TrendChart({ data, scopeLabel = 'Score', showCompanyLine = true }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="Not enough data to show a trend yet" />
  }
  if (data.length === 1) {
    return null
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center gap-5 mb-5">
        <LegendItem color="#9adbe8" label={scopeLabel} dashed={false} />
        {showCompanyLine && (
          <LegendItem color="#3D444D" label="Company avg" dashed={true} />
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>

          <defs>
            {/* Gradient fill under the main score area */}
            <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#9adbe8" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#9adbe8" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="2 4"
            stroke="#1C2128"
            vertical={false}
          />
          <XAxis
            dataKey="weekLabel"
            tick={{ fill: '#505759', fontSize: 10, fontFamily: 'var(--font-dm-sans)' }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fill: '#505759', fontSize: 10, fontFamily: 'var(--font-dm-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip scopeLabel={scopeLabel} showCompany={showCompanyLine} />}
            cursor={{ stroke: '#2D333B', strokeWidth: 1 }}
          />

          {/* Company average — dashed line only, no fill */}
          {showCompanyLine && (
            <Area
              type="monotone"
              dataKey="companyAvg"
              stroke="#3D444D"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="transparent"
              dot={false}
              activeDot={false}
            />
          )}

          {/* Main scope area */}
          <Area
            type="monotone"
            dataKey="avgScore"
            stroke="#9adbe8"
            strokeWidth={2.5}
            fill="url(#gradScore)"
            dot={<CustomDot />}
            activeDot={{ r: 5, fill: '#9adbe8', stroke: '#0D1117', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function CustomDot({ cx, cy, payload }) {
  if (!payload?.avgScore) return null
  const color = getScoreColor(payload.avgScore)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill={color}
      stroke="#0D1117"
      strokeWidth={2}
      style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
    />
  )
}

function CustomTooltip({ active, payload, label, scopeLabel, showCompany }) {
  if (!active || !payload?.length) return null

  const scopeData   = payload.find(p => p.dataKey === 'avgScore')
  const companyData = payload.find(p => p.dataKey === 'companyAvg')

  return (
    <div className="bg-gecko-card border border-gecko-border rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] text-gecko-subtext mb-2.5 font-medium uppercase tracking-wider">{label}</p>
      {scopeData && (
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-gecko-blue flex-shrink-0" />
          <span className="text-xs text-gecko-muted">{scopeLabel}</span>
          <span
            className="text-sm font-display font-bold"
            style={{ color: getScoreColor(scopeData.value) }}
          >
            {formatScore(scopeData.value)}
          </span>
          <span className="text-xs text-gecko-subtext">
            ({scopeData.payload?.count || 0} resp.)
          </span>
        </div>
      )}
      {showCompany && companyData && (
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="w-2 h-2 rounded-full bg-gecko-subtext flex-shrink-0" />
          <span className="text-xs text-gecko-muted">Company</span>
          <span className="text-xs font-display font-semibold text-gecko-muted">
            {formatScore(companyData.value)}
          </span>
        </div>
      )}
    </div>
  )
}

function LegendItem({ color, label, dashed }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="18" height="8">
        <line
          x1="0" y1="4" x2="18" y2="4"
          stroke={color}
          strokeWidth={dashed ? '1.5' : '2.5'}
          strokeDasharray={dashed ? '4 3' : undefined}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs text-gecko-muted">{label}</span>
    </div>
  )
}

function EmptyChart({ message }) {
  return (
    <div className="flex items-center justify-center h-48 text-gecko-subtext">
      <p className="text-sm">{message}</p>
    </div>
  )
}
