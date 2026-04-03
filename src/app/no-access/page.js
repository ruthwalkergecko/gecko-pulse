'use client'

import { signOut } from 'next-auth/react'

export default function NoAccessPage() {
  return (
    <div className="min-h-screen bg-gecko-dark flex items-center justify-center p-4">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#9adbe8 1px, transparent 1px), linear-gradient(90deg, #9adbe8 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="text-2xl font-display font-bold text-white tracking-tight leading-none">gecko</span>
          <span className="text-2xl font-display font-light text-gecko-muted tracking-tight leading-none">pulse</span>
          <span className="w-2 h-2 rounded-full bg-gecko-green animate-pulse-dot" />
        </div>

        <div className="bg-gecko-card border border-gecko-border rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-900/40 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 4a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="#f87171"/>
            </svg>
          </div>
          <h1 className="text-lg font-display font-semibold text-white mb-2">
            You don&apos;t have access
          </h1>
          <p className="text-sm text-gecko-muted mb-6 leading-relaxed">
            This dashboard is only available to authorised Gecko team members. If you think this is a mistake, contact Ruth.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full px-4 py-2.5 bg-gecko-card-hover hover:bg-gecko-border border border-gecko-border text-white text-sm rounded-xl transition-colors"
          >
            Sign out and try a different account
          </button>
        </div>
      </div>
    </div>
  )
}
