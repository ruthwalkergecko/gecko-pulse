'use client'

import { MessageSquare, ChevronRight } from 'lucide-react'
import { getScoreColor, formatScore, getScoreLabel } from '@/lib/dataTransform'
import { ScorePill } from './MetricCard'

/**
 * Employee summary card — used in team view and search results.
 * Score color bleeds in as a left-edge accent bar for quick visual scanning.
 */
export function EmployeeCard({ employee, onClick, compact = false }) {
  const scoreColor = getScoreColor(employee.latestScore)
  const hasComment = employee.latestComment?.trim().length > 0

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gecko-border hover:border-gecko-muted hover:bg-gecko-card-hover transition-all text-left group"
      >
        <Avatar name={employee.name} score={employee.latestScore} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{employee.name}</p>
          <p className="text-xs text-gecko-muted truncate">{employee.department}</p>
        </div>
        <ScorePill score={employee.latestScore} size="sm" />
        <ChevronRight size={13} className="text-gecko-subtext group-hover:text-gecko-muted transition-colors" />
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-gecko-card border border-gecko-border rounded-xl overflow-hidden text-left hover:border-gecko-muted hover:bg-gecko-card-hover transition-all group card-highlight"
    >
      {/* Score accent bar along the top edge */}
      <div
        className="w-full h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${scoreColor}60, ${scoreColor}20)`,
        }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={employee.name} score={employee.latestScore} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{employee.name}</p>
              <p className="text-xs text-gecko-muted truncate">{employee.department}</p>
            </div>
          </div>

          {/* Score */}
          <div className="text-right flex-shrink-0">
            <div
              className="text-xl font-display font-bold metric-number"
              style={{ color: scoreColor, letterSpacing: '-0.02em' }}
            >
              {formatScore(employee.latestScore)}
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: `${scoreColor}90` }}>
              {getScoreLabel(employee.latestScore)}
            </p>
          </div>
        </div>

        {/* Latest comment */}
        {hasComment && (
          <div className="mt-3 flex items-start gap-2">
            <MessageSquare size={11} className="text-gecko-subtext mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gecko-muted line-clamp-2 leading-relaxed">
              &ldquo;{employee.latestComment}&rdquo;
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gecko-subtext">{employee.latestWeekLabel}</span>
          <div className="flex items-center gap-1 text-xs text-gecko-subtext group-hover:text-gecko-muted transition-colors">
            <span>View history</span>
            <ChevronRight size={11} />
          </div>
        </div>
      </div>
    </button>
  )
}

/**
 * Avatar — score-coloured ring.
 */
export function Avatar({ name, score, size = 'sm' }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const color = getScoreColor(score)
  const sizeClass = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size]

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-display font-bold flex-shrink-0`}
      style={{
        backgroundColor: `${color}16`,
        color,
        border: `1.5px solid ${color}35`,
      }}
    >
      {initials}
    </div>
  )
}

/**
 * Grid of employee cards.
 */
export function EmployeeGrid({ employees, onSelect }) {
  if (!employees || employees.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-gecko-muted">
        <p className="text-sm">No employees found</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
      {employees.map(emp => (
        <EmployeeCard
          key={emp.email || emp.name}
          employee={emp}
          onClick={() => onSelect(emp)}
        />
      ))}
    </div>
  )
}
