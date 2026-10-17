/**
 * Shared entitlements hook — fetches once per session and caches the result
 * in module-level state so every component (Sidebar, RequireFounderOS, etc.)
 * gets the same data without triggering multiple API calls.
 *
 * Cache is cleared on logout via clearEntitlementsCache().
 */
import { useState, useEffect } from 'react'
import { getEntitlements } from './api'
import { isDemoMode } from './auth'

// Module-level cache — survives re-renders, resets on logout
let _cache = null        // { founderOS, planName, planId, status, agents, ... }
let _promise = null      // in-flight fetch promise

export function clearEntitlementsCache() {
  _cache = null
  _promise = null
}

const DEMO_ENTITLEMENTS = {
  founderOS: true,
  planId: 'demo',
  planName: 'Demo',
  status: 'active',
  agents: { hasAnyAccess: true },
}

/**
 * Returns { data, loading }.
 * data is null while loading, then the entitlements object.
 * founderOS: true means the user can access Founder OS pages.
 */
export function useEntitlements() {
  const [data, setData] = useState(_cache)
  const [loading, setLoading] = useState(!_cache)

  useEffect(() => {
    if (_cache) {
      setData(_cache)
      setLoading(false)
      return
    }

    if (isDemoMode()) {
      _cache = DEMO_ENTITLEMENTS
      setData(_cache)
      setLoading(false)
      return
    }

    if (!_promise) {
      _promise = getEntitlements()
        .then(d => { _cache = d; return d })
        .catch(() => {
          const fallback = { founderOS: false, agents: { hasAnyAccess: false } }
          _cache = fallback
          return fallback
        })
    }

    _promise.then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  return { data, loading }
}
