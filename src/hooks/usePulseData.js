'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches and manages Gecko Pulse data from the API route.
 * Automatically refreshes every 5 minutes and exposes a manual refresh function.
 */
export function usePulseData() {
  const [data, setData] = useState(null)       // { responses: [], fetchedAt: string }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const intervalRef = useRef(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsRefreshing(true)
    setError(null)

    try {
      const res = await fetch('/api/pulse', {
        // bust browser cache on manual refresh
        cache: silent ? 'default' : 'no-store',
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }

      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Failed to load pulse data')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchData(true), REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchData])

  // Manual refresh exposed to consumers
  const refresh = useCallback(async () => {
    // Also bust the server-side cache via POST
    await fetch('/api/pulse', { method: 'POST' }).catch(() => {})
    await fetchData(false)
  }, [fetchData])

  return {
    data,
    loading,
    error,
    lastUpdated,
    isRefreshing,
    refresh,
    responses: data?.responses || [],
  }
}
