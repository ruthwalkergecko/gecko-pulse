'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gecko-dark flex items-center justify-center p-4">
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#9adbe8 1px, transparent 1px), linear-gradient(90deg, #9adbe8 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gecko-green/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="text-2xl font-display font-bold text-white tracking-tight leading-none">gecko</span>
          <span className="text-2xl font-display font-light text-gecko-muted tracking-tight leading-none">pulse</span>
          <span className="w-2 h-2 rounded-full bg-gecko-green animate-pulse-dot" />
        </div>

        {/* Card */}
        <div className="bg-gecko-card border border-gecko-border rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-display font-semibold text-white text-center mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-gecko-muted text-center mb-8">
            Sign in with your Gecko Google account
          </p>

          {/* Error state */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-950/50 border border-red-900/50 text-xs text-red-400 text-center">
              There was a problem signing you in. Please try again.
            </div>
          )}

          {/* Google sign-in button */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium text-sm rounded-xl transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.99]"
          >
            {/* Google G icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-[11px] text-gecko-subtext text-center mt-6 leading-relaxed">
            Access is limited to authorised Gecko team members.<br />
            Use your <span className="text-gecko-muted">@geckoengage.com</span> account.
          </p>
        </div>

        <p className="text-center text-[11px] text-gecko-subtext/50 mt-6">
          Gecko Pulse · People Dashboard
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
