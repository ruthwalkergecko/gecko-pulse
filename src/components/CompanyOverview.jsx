'use client'

import { useMemo } from 'react'
import { Users, MessageSquare, BarChart2, Activity } from 'lucide-react'
import {
  filterByDateRange,
  computeWeeklyTrend,
  computeTeamBreakdown,
  computeEmployeeSummaries,
  getLatestWeekKey,
  filterToWeek,
  getResponseRate,
  getCompanyAverage,
  formatScore,
  computeTrend,
  round1,
  average,
} from '@/lib/dataTransform'
import { ScoreCard, StatCard, ResponseRateCard } from './ui/MetricCard'
import CommentsFeed from './ui/CommentsFeed'
import TrendChart from './charts/TrendChart'
import { TeamBreakdownTable } from './charts/TeamBreakdownChart'

const TOTAL_EMPLOYEES = 40

export default function CompanyOverview({
  responses,
  allResponses,
  currentUser,
  loading,
  dateRange,
  onSelectEmployee,
}) {
  // Use allResponses for company-level metrics (role=admin here so they're the same, but keeping explicit)
  const filteredResponses = useMemo(
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

  const teamBreakdown = useMemo(
    () => computeTeamBreakdown(filteredResponses),
    [filteredResponses]
  )

  const trend = useMemo(() => computeTrend(weeklyTrend), [weeklyTrend])

  const latestAvg = round1(average(latestWeekResponses.map(r => r.weekScore)))
  const periodAvg = round1(average(filteredResponses.map(r => r.weekScore)))

  const responseRate = getResponseRate(latestWeekResponses, TOTAL_EMPLOYEES)

  // All comments for the period
  const responseCount = filteredResponses.length
  const commentCount = filteredResponses.filter(r => r.comment?.trim()).length

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6 animate-slide-up">

      {/* ── Hero row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard
          score={latestAvg}
          label="This week's score"
          subLabel={latestWeekResponses[0]?.weekLabel || 'Latest pulse'}
          trend={trend}
          className="md:col-span-1"
        />

        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            value={formatScore(periodAvg)}
            label="Period average"
            icon={BarChart2}
          />
          <ResponseRateCard
            responded={responseRate.responded}
            total={responseRate.total}
          />
          <StatCard
            value={responseCount}
            label="Total responses"
            icon={Users}
          />
        </div>
      </div>

      {/* ── Trend chart — only show when 2+ weeks of data ── */}
      {weeklyTrend.length > 1 && (
        <div className="bg-gecko-card border border-gecko-border rounded-2xl p-6">
          <SectionHeader
            icon={Activity}
            title="Company trend"
            subtitle={`Score over time · ${weeklyTrend.length} weeks`}
          />
          <div className="mt-4">
            <TrendChart
              data={weeklyTrend}
              scopeLabel="Company avg"
              showCompanyLine={false}
            />
          </div>
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
            <SectionHeader
              icon={MessageSquare}
              title="Rotating question"
              subtitle={latestRotating?.rotatingQuestion || 'This week\'s question'}
            />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* ── Team breakdown + Comments ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Team breakdown */}
        <div className="bg-gecko-card border border-gecko-border rounded-2xl p-6">
          <SectionHeader
            icon={BarChart2}
            title="Department breakdown"
            subtitle={`${teamBreakdown.length} departments`}
          />
          {teamBreakdown.length === 0 ? (
            <EmptyState message="No department data found. Check column H in your Google Sheet." />
          ) : (
            <div className="mt-4">
              <TeamBreakdownTable data={teamBreakdown} companyAvg={periodAvg} />
            </div>
          )}
        </div>

        {/* Week comments */}
        <CommentsFeed
          responses={filteredResponses}
          showAuthor={true}
          title="Comments this period"
        />
      </div>

      {/* ── Rotating question comments ── */}
      <CommentsFeed
        responses={filteredResponses}
        showAuthor={true}
        title="Rotating question comments"
        commentField="rotatingComment"
        scoreField="rotatingScore"
      />
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gecko-dark border border-gecko-border flex items-center justify-center">
          <Icon size={13} className="text-gecko-muted" />
        </div>
        <div>
          <h3 className="text-sm font-display font-semibold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-gecko-muted">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex items-center justify-center py-10 text-gecko-subtext">
      <p className="text-sm text-center">{message}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-40 bg-gecko-card border border-gecko-border rounded-2xl" />
        <div className="md:col-span-2 grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gecko-card border border-gecko-border rounded-xl" />
          ))}
        </div>
      </div>
      <div className="h-72 bg-gecko-card border border-gecko-border rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 bg-gecko-card border border-gecko-border rounded-2xl" />
        <div className="h-64 bg-gecko-card border border-gecko-border rounded-2xl" />
      </div>
    </div>
  )
}
