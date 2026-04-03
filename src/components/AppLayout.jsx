'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Users,
  User,
  RefreshCw,
  ChevronDown,
  Building2,
  AlertCircle,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { canSeeAllDepartments, getUserScopeLabel } from '@/lib/roleConfig'
import ThemeToggle from './ThemeToggle'
import { getLatestWeekKey, average, round1, formatScore, getScoreColor } from '@/lib/dataTransform'
import CompanyOverview from './CompanyOverview'
import TeamView from './TeamView'
import IndividualView from './IndividualView'

const NAV_ITEMS = [
  {
    id: 'company',
    label: 'Company',
    icon: Building2,
    adminOnly: true,
    description: 'Company-wide overview',
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    adminOnly: false,
    description: 'Team performance',
  },
  {
    id: 'individual',
    label: 'People',
    icon: User,
    adminOnly: false,
    description: 'Individual employees',
  },
]

export default function AppLayout({
  currentUser,
  responses,
  allResponses,
  loading,
  error,
  refresh,
  isRefreshing,
  lastUpdated,
}) {
  const isAdmin = currentUser?.access === 'admin'
  const defaultView = isAdmin ? 'company' : 'team'
  const [currentView, setCurrentView] = useState(defaultView)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [dateRange, setDateRange] = useState('thisweek')

  // Set default view based on access level
  useEffect(() => {
    setCurrentView(currentUser?.access === 'admin' ? 'company' : 'team')
    setSelectedEmployee(null)
  }, [currentUser?.id])

  // Compute company average this week from ALL responses (visible to everyone in header)
  const latestWeekKey = useMemo(() => getLatestWeekKey(allResponses || []), [allResponses])
  const companyAvgThisWeek = useMemo(() => {
    const weekResponses = (allResponses || []).filter(r => r.weekKey === latestWeekKey)
    return round1(average(weekResponses.map(r => r.weekScore)))
  }, [allResponses, latestWeekKey])

  function handleSelectEmployee(emp) {
    setSelectedEmployee(emp)
    setCurrentView('individual')
  }

  const visibleNav = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

  return (
    <div className="flex h-screen bg-gecko-dark overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-gecko-card border-r border-gecko-border">

        {/* Brand */}
        <div className="px-5 py-5 border-b border-gecko-border">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-display font-bold text-white tracking-tight leading-none">gecko</span>
            <span className="text-[17px] font-display font-light text-gecko-muted tracking-tight leading-none">pulse</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gecko-green animate-pulse-dot mt-0.5" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNav.map(item => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id)
                  if (item.id !== 'individual') setSelectedEmployee(null)
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left relative overflow-hidden
                  ${isActive
                    ? 'bg-gecko-card-hover text-white font-medium'
                    : 'text-gecko-muted hover:text-white hover:bg-gecko-card-hover/60'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gecko-green rounded-r-full" />
                )}
                <Icon
                  size={15}
                  className={isActive ? 'text-gecko-green' : 'text-gecko-subtext'}
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Bottom: user info */}
        <div className="px-3 py-4 border-t border-gecko-border">
          <div className="flex items-center gap-2.5 px-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-gecko-dark flex-shrink-0"
              style={{ backgroundColor: currentUser?.color || '#8de971' }}
            >
              {(currentUser?.initials || 'U').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-gecko-muted truncate">{currentUser?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-gecko-border bg-gecko-card gap-4">

          {/* Left: page title */}
          <div className="min-w-0">
            <h1 className="text-base font-display font-semibold text-white tracking-tight truncate">
              {NAV_ITEMS.find(n => n.id === currentView)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-gecko-muted mt-0.5 hidden sm:block">
              {NAV_ITEMS.find(n => n.id === currentView)?.description}
            </p>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Company average — visible to everyone, always */}
            {companyAvgThisWeek !== null && !loading && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gecko-dark border border-gecko-border">
                <span className="text-[10px] text-gecko-subtext uppercase tracking-[0.08em] hidden sm:block">Company avg</span>
                <span
                  className="text-sm font-display font-bold leading-none"
                  style={{ color: getScoreColor(companyAvgThisWeek) }}
                >
                  {formatScore(companyAvgThisWeek)}
                </span>
              </div>
            )}

            {/* Date range selector */}
            <DateRangeSelector value={dateRange} onChange={setDateRange} />

            {/* Refresh button */}
            <button
              onClick={refresh}
              disabled={isRefreshing}
              title="Refresh data"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gecko-muted hover:text-white border border-gecko-border hover:border-gecko-muted rounded-lg transition-colors"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? 'animate-spin text-gecko-green' : ''}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Refreshing…' : lastUpdated ? `${formatRelativeTime(lastUpdated)}` : 'Refresh'}
              </span>
            </button>

            {/* Light/dark toggle */}
            <ThemeToggle />

            <div className="w-px h-5 bg-gecko-border" />

            {/* Signed-in user + sign out */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-gecko-dark flex-shrink-0"
                style={{ backgroundColor: currentUser?.color || '#8de971' }}
              >
                {(currentUser?.initials || '?').slice(0, 2)}
              </div>
              <span className="text-xs font-medium text-white hidden sm:block">
                {currentUser?.name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                title="Sign out"
                className="flex items-center gap-1 px-2 py-1.5 text-gecko-subtext hover:text-white border border-transparent hover:border-gecko-border rounded-lg transition-colors"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 px-6 py-3 bg-red-950/30 border-b border-red-900/40">
            <AlertCircle size={15} className="text-gecko-red mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gecko-red font-medium">Failed to load data</p>
              <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
              {error.includes('credentials') && (
                <p className="text-xs text-red-400/70 mt-1">
                  Set <code className="bg-red-950 px-1 rounded">GOOGLE_CLIENT_EMAIL</code> and{' '}
                  <code className="bg-red-950 px-1 rounded">GOOGLE_PRIVATE_KEY</code> in Vercel environment variables.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentView === 'company' && isAdmin && (
            <CompanyOverview
              responses={responses}
              allResponses={allResponses}
              currentUser={currentUser}
              loading={loading}
              dateRange={dateRange}
              onSelectEmployee={handleSelectEmployee}
            />
          )}
          {currentView === 'team' && (
            <TeamView
              responses={responses}
              allResponses={allResponses}
              currentUser={currentUser}
              loading={loading}
              dateRange={dateRange}
              onSelectEmployee={handleSelectEmployee}
            />
          )}
          {currentView === 'individual' && (
            <IndividualView
              responses={responses}
              currentUser={currentUser}
              loading={loading}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={setSelectedEmployee}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// ── Date range selector ───────────────────────────────────────────────────────

function DateRangeSelector({ value, onChange }) {
  const options = [
    { value: 'thisweek', label: 'This week' },
    { value: 'thismonth', label: 'This month' },
    { value: 'lastmonth', label: 'Last month' },
    { value: '4weeks', label: 'Last 4 weeks' },
    { value: '8weeks', label: 'Last 8 weeks' },
    { value: 'all', label: 'All time' },
  ]
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-gecko-dark border border-gecko-border text-gecko-muted text-xs rounded-lg px-3 py-1.5 pr-7 hover:border-gecko-muted focus:outline-none focus:border-gecko-blue cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gecko-muted pointer-events-none" />
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeTime(date) {
  if (!date) return ''
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}
