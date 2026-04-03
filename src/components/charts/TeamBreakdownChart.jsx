'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { getScoreColor, formatScore } from '@/lib/dataTransform'

/**
 * Horizontal bar chart showing per-department average scores.
 */
export function TeamBreakdownChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gecko-subtext">
        <p className="text-sm">No team data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 54)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 56, bottom: 0, left: 0 }}
        barSize={16}
      >
        <CartesianGrid strokeDasharray="2 4" stroke="#1C2128" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fill: '#505759', fontSize: 10, fontFamily: 'var(--font-dm-sans)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="department"
          tick={{ fill: '#8B949E', fontSize: 12, fontFamily: 'var(--font-dm-sans)' }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip content={<TeamTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        <Bar dataKey="avgScore" radius={[0, 5, 5, 0]}>
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={getScoreColor(entry.avgScore)} fillOpacity={0.88} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function TeamTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-gecko-card border border-gecko-border rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-sm font-display font-semibold text-white mb-1.5">{d.department}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gecko-muted">Avg score</span>
        <span className="text-sm font-display font-bold" style={{ color: getScoreColor(d.avgScore) }}>
          {formatScore(d.avgScore)}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-gecko-muted">Responses</span>
        <span className="text-xs text-gecko-subtext">{d.count}</span>
      </div>
    </div>
  )
}

/**
 * Table version — used in CompanyOverview.
 */
export function TeamBreakdownTable({ data, companyAvg }) {
  if (!data || data.length === 0) return null

  return (
    <div className="space-y-1 stagger">
      {data.map(team => {
        const color = getScoreColor(team.avgScore)
        const diff  = companyAvg !== null ? team.avgScore - companyAvg : null

        return (
          <div
            key={team.department}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gecko-card-hover transition-colors group"
          >
            {/* Score bar */}
            <div className="w-20 flex-shrink-0">
              <div className="h-1 bg-gecko-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${((team.avgScore || 0) / 5) * 100}%`,
                    background: `linear-gradient(90deg, ${color}70, ${color})`,
                    boxShadow: `0 0 5px ${color}50`,
                  }}
                />
              </div>
            </div>

            {/* Department name */}
            <span className="flex-1 text-sm text-white/85 min-w-0 truncate">
              {team.department}
            </span>

            {/* Response count */}
            <span className="text-xs text-gecko-subtext w-14 text-right">
              {team.count} resp.
            </span>

            {/* Score */}
            <span
              className="text-sm font-display font-semibold w-9 text-right metric-number"
              style={{ color }}
            >
              {formatScore(team.avgScore)}
            </span>

            {/* Diff vs company avg */}
            {diff !== null && Math.abs(diff) >= 0.05 ? (
              <span className={`text-xs font-display font-medium w-11 text-right ${diff > 0 ? 'text-gecko-green' : 'text-gecko-red'}`}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}
              </span>
            ) : (
              <span className="text-xs w-11 text-right text-gecko-subtext/40">–</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
