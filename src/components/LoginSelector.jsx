'use client'

import { useState } from 'react'
import { USERS } from '@/lib/roleConfig'
import { getScoreColor } from '@/lib/dataTransform'

// ── Decorative mini card for the brand panel ──────────────────────────────────
function MiniMetricCard({ score, label, style = {} }) {
  const color = getScoreColor(score)
  return (
    <div
      className="absolute flex items-center gap-3 px-3.5 py-2.5 rounded-xl border backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(13, 17, 23, 0.85)',
        borderColor: `${color}22`,
        boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px ${color}10`,
        ...style,
      }}
    >
      <span
        className="text-xl font-display font-bold leading-none"
        style={{ color, letterSpacing: '-0.03em' }}
      >
        {score.toFixed(1)}
      </span>
      <span className="text-xs text-gecko-muted leading-tight max-w-[80px]">{label}</span>
    </div>
  )
}

// ── Brand panel — left side on desktop ───────────────────────────────────────
function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden bg-gecko-card border-r border-gecko-border dot-grid">

      {/* Atmospheric colour washes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 65% 55% at 20% 30%, rgba(141,233,113,0.045) 0%, transparent 70%)',
            'radial-gradient(ellipse 45% 45% at 85% 75%, rgba(154,219,232,0.04) 0%, transparent 65%)',
          ].join(', '),
        }}
      />

      {/* Top — wordmark */}
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-[36px] font-display font-bold tracking-tight text-white leading-none">gecko</span>
          <span className="text-[36px] font-display font-light tracking-tight leading-none" style={{ color: '#6B7280' }}>pulse</span>
          <span className="w-2.5 h-2.5 rounded-full bg-gecko-green animate-pulse-dot flex-shrink-0 self-center" />
        </div>
        <p className="text-sm text-gecko-muted leading-relaxed max-w-[240px]">
          Weekly wellbeing pulse for teams who care about people.
        </p>
      </div>

      {/* Middle — decorative score cards floating */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-8">
        <div className="relative w-full max-w-[280px] h-56">

          {/* Faint connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.07 }}>
            <line x1="18%" y1="22%" x2="78%" y2="38%" stroke="#8de971" strokeWidth="1" strokeDasharray="5 4" />
            <line x1="78%" y1="38%" x2="32%" y2="68%" stroke="#9adbe8" strokeWidth="1" strokeDasharray="5 4" />
            <line x1="32%" y1="68%" x2="88%" y2="82%" stroke="#9adbe8" strokeWidth="1" strokeDasharray="5 4" />
          </svg>

          <MiniMetricCard score={4.7} label="Company avg" style={{ top: '2%', left: '2%' }} />
          <MiniMetricCard score={4.2} label="Engineering" style={{ top: '28%', right: '-2%' }} />
          <MiniMetricCard score={3.8} label="Customer Success" style={{ bottom: '26%', left: '12%' }} />
          <MiniMetricCard score={4.1} label="Product" style={{ bottom: '4%', right: '4%' }} />
        </div>
      </div>

      {/* Bottom — meta */}
      <div className="relative z-10">
        <p className="text-xs text-gecko-subtext">Gecko Labs · Pilot v0.1 · 2025</p>
      </div>
    </div>
  )
}

// ── Main login component ──────────────────────────────────────────────────────
export default function LoginSelector({ onLogin }) {
  const [selected, setSelected] = useState(null)

  const admins    = USERS.filter(u => u.access === 'admin')
  const deptLeads = USERS.filter(u => u.access === 'dept-lead')
  const managers  = USERS.filter(u => u.access === 'manager')

  function handleLogin() {
    if (selected) onLogin(selected)
  }

  return (
    <div className="min-h-screen bg-gecko-dark flex">

      {/* Left: brand panel */}
      <BrandPanel />

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[360px] animate-scale-in">

          {/* Mobile-only wordmark */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <span className="text-2xl font-display font-bold text-white">gecko</span>
            <span className="text-2xl font-display font-light text-gecko-muted">pulse</span>
            <span className="w-2 h-2 rounded-full bg-gecko-green animate-pulse-dot" />
          </div>

          {/* Login card */}
          <div className="bg-gecko-card border border-gecko-border rounded-2xl p-7 card-highlight">

            <div className="mb-6">
              <h2 className="text-base font-display font-semibold text-white tracking-tight">
                Sign in
              </h2>
              <p className="text-xs text-gecko-muted mt-1">Select your profile to view your data</p>
            </div>

            <UserGroup label="Leadership"       users={admins}    selected={selected} onSelect={setSelected} />
            <UserGroup label="Department lead"  users={deptLeads} selected={selected} onSelect={setSelected} />
            <UserGroup label="Managers"         users={managers}  selected={selected} onSelect={setSelected} />

            <button
              onClick={handleLogin}
              disabled={!selected}
              className={`
                w-full mt-5 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                ${selected
                  ? 'bg-gecko-green text-gecko-dark hover:bg-gecko-green-dim cursor-pointer active:scale-[0.99]'
                  : 'bg-gecko-border/60 text-gecko-subtext cursor-not-allowed'
                }
              `}
            >
              {selected ? `Continue as ${selected.name.split(' ')[0]}` : 'Select a profile'}
            </button>

            <p className="text-center text-gecko-subtext text-[11px] mt-4">
              Pilot mode · SSO authentication coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── User group section ────────────────────────────────────────────────────────
function UserGroup({ label, users, selected, onSelect }) {
  if (!users.length) return null
  return (
    <div className="mb-4">
      <p className="text-[10px] font-medium text-gecko-subtext uppercase tracking-[0.1em] mb-1.5 px-1">
        {label}
      </p>
      <div className="space-y-1 stagger">
        {users.map(user => (
          <UserButton
            key={user.id}
            user={user}
            isSelected={selected?.id === user.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

// ── Individual user button ────────────────────────────────────────────────────
function UserButton({ user, isSelected, onSelect }) {
  const scopeLabel = {
    admin:      'All teams',
    'dept-lead': user.departments?.join(' & ') || 'Departments',
    manager:    'Own team',
  }[user.access]

  return (
    <button
      onClick={() => onSelect(user)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
        ${isSelected
          ? 'border border-gecko-green/30 bg-gecko-card-hover'
          : 'border border-transparent hover:bg-gecko-card-hover hover:border-gecko-border'
        }
      `}
      style={isSelected ? {
        boxShadow: '0 0 0 1px rgba(141,233,113,0.08), inset 0 0 12px rgba(141,233,113,0.04)',
      } : {}}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold text-gecko-dark flex-shrink-0"
        style={{ backgroundColor: user.color }}
      >
        {user.initials.slice(0, 2)}
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{user.name}</div>
        <div className="text-xs text-gecko-muted truncate">{user.role}</div>
      </div>

      {/* Scope badge */}
      <span
        className={`
          text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0
          ${isSelected
            ? 'border-gecko-green/35 text-gecko-green bg-gecko-green/10'
            : 'border-gecko-border text-gecko-subtext'
          }
        `}
      >
        {scopeLabel}
      </span>
    </button>
  )
}
