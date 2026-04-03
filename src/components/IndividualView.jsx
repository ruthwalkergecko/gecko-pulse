'use client'

import { useState, useMemo } from 'react'
import { Search, User, ArrowLeft, MessageSquare, HelpCircle } from 'lucide-react'
import {
  computeEmployeeSummaries,
  computeEmployeeHistory,
  computeWeeklyTrend,
  formatScore,
  getScoreColor,
  getScoreLabel,
  round1,
  average,
} from '@/lib/dataTransform'
import { ScorePill, TrendBadge } from './ui/MetricCard'
import { EmployeeCard } from './ui/EmployeeCard'
import TrendChart from './charts/TrendChart'

export default function IndividualView({
  responses,
  currentUser,
  loading,
  selectedEmployee,
  onSelectEmployee,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const employees = useMemo(() => computeEmployeeSummaries(responses), [responses])

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees
    const q = searchQuery.toLowerCase()
    return employees.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
    )
  }, [employees, searchQuery])

  if (loading) {
    return <LoadingSkeleton />
  }

  // Show individual drill-down if employee selected
  if (selectedEmployee) {
    return (
      <EmployeeDrillDown
        employee={selectedEmployee}
        responses={responses}
        onBack={() => onSelectEmployee(null)}
      />
    )
  }

  // Otherwise show employee list with search
  return (
    <div className="space-y-5 animate-slide-up">
      {/* Search bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gecko-muted" />
        <input
          type="text"
          placeholder="Search by name, department, or email…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-gecko-card border border-gecko-border text-white text-sm rounded-xl pl-10 pr-4 py-3 placeholder-gecko-subtext focus:outline-none focus:border-gecko-blue transition-colors"
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gecko-muted">
          {searchQuery
            ? `${filteredEmployees.length} result${filteredEmployees.length !== 1 ? 's' : ''} for "${searchQuery}"`
            : `${employees.length} people`
          }
        </p>
      </div>

      {/* Employee list */}
      {filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gecko-muted">
          <User size={32} className="mb-3 opacity-20" />
          <p className="text-sm">No employees found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEmployees.map(emp => (
            <EmployeeCard
              key={emp.email || emp.name}
              employee={emp}
              onClick={() => onSelectEmployee(emp)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Individual employee drill-down ──────────────────────────────────────────

function EmployeeDrillDown({ employee, responses, onBack }) {
  const history = useMemo(
    () => computeEmployeeHistory(responses, employee.email),
    [responses, employee.email]
  )

  // Build trend data for this employee (single person, no company comparison)
  const trendData = history.map(h => ({
    weekKey: h.weekKey,
    weekLabel: h.weekLabel,
    avgScore: h.weekScore,
    companyAvg: null,
    count: 1,
  }))

  const allScores = history.map(h => h.weekScore).filter(Boolean)
  const overallAvg = round1(average(allScores))
  const latestScore = history[history.length - 1]?.weekScore

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gecko-muted hover:text-white transition-colors text-sm"
      >
        <ArrowLeft size={15} />
        Back to all people
      </button>

      {/* Employee header */}
      <div className="bg-gecko-card border border-gecko-border rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{
                backgroundColor: `${getScoreColor(latestScore)}20`,
                color: getScoreColor(latestScore),
                border: `2px solid ${getScoreColor(latestScore)}40`,
              }}
            >
              {employee.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-tight">{employee.name}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {employee.department && (
                  <span className="text-xs text-gecko-blue bg-gecko-blue/10 border border-gecko-blue/20 rounded-full px-2.5 py-0.5">
                    {employee.department}
                  </span>
                )}
                {employee.manager && (
                  <span className="text-xs text-gecko-muted">
                    Manager: {employee.manager}
                  </span>
                )}
                {employee.email && (
                  <span className="text-xs text-gecko-subtext">{employee.email}</span>
                )}
              </div>
            </div>
          </div>

          {/* Score summary */}
          <div className="flex items-center gap-6">
            <ScoreStat label="Latest" score={latestScore} large />
            <ScoreStat label="All-time avg" score={overallAvg} />
            <ScoreStat label="Responses" score={null} count={history.length} />
          </div>
        </div>
      </div>

      {/* Trend chart */}
      {history.length > 1 && (
        <div className="bg-gecko-card border border-gecko-border rounded-2xl p-6">
          <h3 className="text-sm font-display font-semibold text-white mb-4 tracking-tight">Score over time</h3>
          <TrendChart
            data={trendData}
            scopeLabel={employee.name?.split(' ')[0]}
            showCompanyLine={false}
          />
        </div>
      )}

      {/* Week-by-week history */}
      <div className="bg-gecko-card border border-gecko-border rounded-2xl p-6">
        <h3 className="text-sm font-display font-semibold text-white mb-4 tracking-tight">
          Week-by-week responses
          <span className="text-gecko-muted font-normal ml-2">({history.length} total)</span>
        </h3>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gecko-subtext">
            <User size={28} className="mb-3 opacity-30" />
            <p className="text-sm">No responses recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...history].reverse().map((week, i) => (
              <WeekEntry key={week.weekKey} week={week} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WeekEntry({ week }) {
  const scoreColor = getScoreColor(week.weekScore)
  const hasComment = week.comment?.trim()
  const hasRotating = week.rotatingQuestion?.trim()

  return (
    <div className="border border-gecko-border rounded-xl overflow-hidden">
      {/* Week header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gecko-dark">
        <span className="text-xs font-medium text-gecko-muted">{week.weekLabel}</span>
        <ScorePill score={week.weekScore} size="sm" />
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-2.5">
        {/* Main comment */}
        {hasComment && (
          <div className="flex items-start gap-2.5">
            <div
              className="w-0.5 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: scoreColor, minHeight: '16px' }}
            />
            <p className="text-sm text-gecko-white/80 leading-relaxed">
              &ldquo;{week.comment}&rdquo;
            </p>
          </div>
        )}
        {!hasComment && (
          <p className="text-xs text-gecko-subtext italic">No comment left</p>
        )}

        {/* Rotating question */}
        {hasRotating && (
          <div className="flex items-start gap-2.5 pt-2 border-t border-gecko-border/50">
            <HelpCircle size={12} className="text-gecko-subtext mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gecko-subtext mb-1">{week.rotatingQuestion}</p>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{
                  color: getScoreColor(week.rotatingScore),
                  backgroundColor: `${getScoreColor(week.rotatingScore)}15`
                }}
              >
                {formatScore(week.rotatingScore)}
              </span>
              {week.rotatingComment?.trim() && (
                <p className="text-xs text-gecko-white/70 leading-relaxed mt-1.5 italic">
                  &ldquo;{week.rotatingComment}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreStat({ label, score, count, large = false }) {
  return (
    <div className="text-center">
      {count !== undefined ? (
        <p className={`font-display font-bold metric-number text-gecko-blue tracking-tight ${large ? 'text-3xl' : 'text-2xl'}`}>
          {count}
        </p>
      ) : (
        <p
          className={`font-display font-bold metric-number tracking-tight ${large ? 'text-3xl' : 'text-2xl'}`}
          style={{ color: getScoreColor(score) }}
        >
          {formatScore(score)}
        </p>
      )}
      <p className="text-xs text-gecko-muted mt-0.5">{label}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-10 bg-gecko-card border border-gecko-border rounded-xl w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gecko-card border border-gecko-border rounded-xl" />
        ))}
      </div>
    </div>
  )
}
