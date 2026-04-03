'use client'

import { useMemo } from 'react'
import { Users, Activity, MessageSquare, TrendingUp } from 'lucide-react'
import {
  filterByDateRange,
  computeWeeklyTrend,
  computeEmployeeSummaries,
  getLatestWeekKey,
  filterToWeek,
  getCompanyAverage,
  formatScore,
  computeTrend,
  round1,
  average,
  getScoreColor,
} from '@/lib/dataTransform'
import { getUserScopeLabel } from '@/lib/roleConfig'
import { ScoreCard, StatCard } from './ui/MetricCard'
import CommentsFeed from './ui/CommentsFeed'
import TrendChart from './charts/TrendChart'
import { EmployeeGrid } from './ui/EmployeeCard'

export default function TeamView({
  responses,        // role-filtered responses
  allResponses,     // all responses (for company average)
  currentUser,
  loading,
  dateRange,
  onSelectEmployee,
}) {
  const filteredResponses = useMemo(
    () => filterByDateRange(responses, dateRange),
    [responses, dateRange]
  )

  const allFiltered = useMemo(
    () => filterByDateRange(allResponses, dateRange),
    [allResponses, dateRange]
  )

  const latestWeekKey = useMemo(() => getLatestWeekKey(filteredResponses), [filteredResponses])
  const latestWeekResponses = useMemo(
    () => filterToWeek(filteredResponses, latestWeekKey),
    [filteredResponses, latestWeekKey]
  )

  const weeklyTrend = useMemo(
    () => computeWeeklyTrend(filteredResponses, allResponses),
    [filteredResponses, allResponses]
  )

  const employees = useMemo(
    () => computeEmployeeSummaries(filteredResponses),
    [filteredResponses]
  )

  const trend = useMemo(() => computeTrend(weeklyTrend), [weeklyTrend])

  const teamAvg = round1(average(filteredResponses.map(r => r.weekScore)))
  const latestTeamAvg = round1(average(latestWeekResponses.map(r => r.weekScore)))
  const companyAvg = round1(average(allFiltered.map(r => r.weekScore)))

  // Total unique team members who have ever submitted (scope-filtered, not period-filtered)
  const totalTeamMembers = useMemo(
    () => new Set(responses.map(r => r.email || r.name)).size,
    [responses]
  )

  const scopeLabel = getUserScopeLabel(currentUser)

  if (loading) {
    return <LoadingSkeleton />
  }

  if (filteredResponses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gecko-muted">
        <Users size={40} className="mb-4 opacity-20" />
        <p className="text-base font-medium text-white mb-2">No data found</p>
        <p className="text-sm text-center max-w-sm">
          No pulse responses found for this period.
          {currentUser?.access === 'manager' && (
            <> Check that the Manager column in your Google Sheet exactly matches{' '}
              <span className="text-gecko-blue font-medium">{currentUser.managerName}</span>.
            </>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">

      {/* ── Hero row: team score vs company ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team score card */}
        <div
          className="rounded-2xl p-6 border card-highlight"
          style={{
            background: latestTeamAvg !== null ? `linear-gradient(145deg, #161B22 0%, ${getScoreColor(latestTeamAvg)}08 100%)` : '#161B22',
            borderColor: latestTeamAvg !== null ? `${getScoreColor(latestTeamAvg)}22` : '#21262D',
          }}
        >
          <p className="text-[11px] font-medium text-gecko-subtext uppercase tracking-[0.12em] mb-3">
            {scopeLabel} · This week
          </p>
          <div className="flex items-end gap-3 mb-2">
            <span
              className="font-display font-bold metric-number leading-none"
              style={{ color: getScoreColor(latestTeamAvg), fontSize: '72px', letterSpacing: '-0.035em' }}
            >
              {formatScore(latestTeamAvg)}
            </span>
            <span className="text-gecko-subtext text-lg font-display mb-2.5 leading-none">/ 5</span>
            {trend && <div className="mb-1">{/* TrendBadge inline */}</div>}
          </div>

          {/* vs Company average — "Your team: 3.8 | Company: 4.1 | Difference: -0.3" */}
          {companyAvg !== null && (
            <div className="mt-4 pt-4 border-t border-gecko-border">
              <ComparisonStrip
                teamLabel={scopeLabel}
                teamScore={latestTeamAvg}
                companyScore={companyAvg}
              />
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            value={formatScore(teamAvg)}
            label="Period average"
            icon={TrendingUp}
          />
          <StatCard
            value={totalTeamMembers}
            label="Team members"
            icon={Users}
          />
          <StatCard
            value={latestWeekResponses.length}
            label="Responded this week"
            icon={Activity}
          />
          <StatCard
            value={filteredResponses.filter(r => r.comment?.trim()).length}
            label="Comments left"
            icon={MessageSquare}
          />
        </div>
      </div>

      {/* ── Trend chart — only show when 2+ weeks of data ── */}
      {weeklyTrend.length > 1 && (
        <div className="bg-gecko-card border border-gecko-border rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gecko-dark border border-gecko-border flex items-center justify-center">
              <Activity size={13} className="text-gecko-muted" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-white">Team trend</h3>
              <p className="text-xs text-gecko-muted">{scopeLabel} vs company average</p>
            </div>
          </div>
          <TrendChart
            data={weeklyTrend}
            scopeLabel={scopeLabel}
            showCompanyLine={true}
          />
        </div>
      )}

      {/* ── Rotating question section ── */}
      {weeklyTrend.some(w => w.avgRotatingScore !== null) && (() => {
        const latestRotating = [...weeklyTrend].reverse().find(w => w.avgRotatingScore !== null)
        const rotatingTrendData = weeklyTrend
          .filter(w => w.avgRotatingScore !== null)
          .map(w => ({ ...w, avgScore: w.avgRotatingScore }))
        return (
          <div className="bg-gecko-card border border-gecko-border rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gecko-dark border border-gecko-border flex items-center justify-center">
                <MessageSquare size={13} className="text-gecko-muted" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white">Rotating question</h3>
                <p className="text-xs text-gecko-muted">{latestRotating?.rotatingQuestion || 'This week\'s question'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <ScoreCard
                  score={latestRotating?.avgRotatingScore}
                  label="This week"
                  subLabel={latestRotating?.weekLabel || ''}
                />
              </div>
              <div className="md:col-span-3">
                <TrendChart
                  data={rotatingTrendData}
                  scopeLabel="Avg response"
                  showCompanyLine={false}
                />
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Team members grid ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gecko-card border border-gecko-border flex items-center justify-center">
            <Users size={13} className="text-gecko-muted" />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-white">Team members</h3>
            <p className="text-xs text-gecko-muted">Latest score · click to view history</p>
          </div>
        </div>
        <EmployeeGrid employees={employees} onSelect={onSelectEmployee} />
      </div>

      {/* ── Week comments ── */}
      <CommentsFeed
        responses={filteredResponses}
        showAuthor={currentUser?.access !== 'manager'}
        title="Team comments"
      />

      {/* ── Rotating question comments ── */}
      <CommentsFeed
        responses={filteredResponses}
        showAuthor={currentUser?.access !== 'manager'}
        title="Rotating question comments"
        commentField="rotatingComment"
        scoreField="rotatingScore"
      />
    </div>
  )
}

// ── Comparison strip: "Your team: 3.8 | Company: 4.1 | Difference: -0.3" ──────
function ComparisonStrip({ teamLabel, teamScore, companyScore }) {
  const diff = teamScore !== null && companyScore !== null
    ? Math.round((teamScore - companyScore) * 10) / 10
    : null

  const isPositive = diff !== null && diff > 0.05
  const isNegative = diff !== null && diff < -0.05
  const diffLabel = diff === null ? '–' : isPositive ? `+${diff.toFixed(1)}` : diff.toFixed(1)
  const diffColor = isPositive ? '#8de971' : isNegative ? '#f85149' : '#505759'

  return (
    <div className="flex items-center gap-0 text-sm flex-wrap">
      {/* Your team */}
      <div className="flex items-baseline gap-1.5 pr-3">
        <span className="text-[11px] text-gecko-subtext uppercase tracking-[0.08em]">{teamLabel}</span>
        <span
          className="font-display font-bold text-lg leading-none"
          style={{ color: getScoreColor(teamScore) }}
        >
          {formatScore(teamScore)}
        </span>
      </div>

      <span className="text-gecko-border text-base select-none pr-3">|</span>

      {/* Company */}
      <div className="flex items-baseline gap-1.5 pr-3">
        <span className="text-[11px] text-gecko-subtext uppercase tracking-[0.08em]">Company</span>
        <span className="font-display font-bold text-lg text-gecko-muted leading-none">
          {formatScore(companyScore)}
        </span>
      </div>

      <span className="text-gecko-border text-base select-none pr-3">|</span>

      {/* Difference */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-[11px] text-gecko-subtext uppercase tracking-[0.08em]">Difference</span>
        <span
          className="font-display font-bold text-lg leading-none"
          style={{ color: diffColor }}
        >
          {diffLabel}
        </span>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-44 bg-gecko-card border border-gecko-border rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gecko-card border border-gecko-border rounded-xl" />
          ))}
        </div>
      </div>
      <div className="h-72 bg-gecko-card border border-gecko-border rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gecko-card border border-gecko-border rounded-xl" />
        ))}
      </div>
    </div>
  )
}
