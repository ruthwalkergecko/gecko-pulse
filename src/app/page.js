'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import AppLayout from '@/components/AppLayout'
import { usePulseData } from '@/hooks/usePulseData'
import { filterResponsesForUser } from '@/lib/roleConfig'

export default function Home() {
  const { data: session, status } = useSession()
  const currentUser = session?.geckoUser

  const { responses, loading, error, refresh, isRefreshing, lastUpdated } = usePulseData()

  const userResponses = useMemo(
    () => filterResponsesForUser(responses, currentUser),
    [responses, currentUser]
  )

  // Still loading auth session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gecko-dark flex items-center justify-center">
        <div className="flex items-center gap-3 text-gecko-muted">
          <span className="w-2 h-2 rounded-full bg-gecko-green animate-pulse-dot" />
          <span className="text-sm font-display">Loading…</span>
        </div>
      </div>
    )
  }

  return (
    <AppLayout
      currentUser={currentUser}
      responses={userResponses}
      allResponses={responses}
      loading={loading}
      error={error}
      refresh={refresh}
      isRefreshing={isRefreshing}
      lastUpdated={lastUpdated}
    />
  )
}
