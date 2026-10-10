/**
 * API client for founder-agents-api (Render).
 * Mirrors the shape of api.js but points at the founder-agents backend.
 *
 * Auth: uses founders_token from localStorage (set by loginFoundersOS in api.js).
 * Swapped for Firebase ID token when Firebase migration lands — only this file changes.
 */

const FOUNDERS_API_BASE =
  import.meta.env.VITE_FOUNDERS_API_BASE ||
  'https://founder-agents-api.onrender.com'

const FOUNDERS_TOKEN_KEY = 'founders_token'

export function getFoundersToken() {
  return localStorage.getItem(FOUNDERS_TOKEN_KEY)
}

export function setFoundersToken(token) {
  localStorage.setItem(FOUNDERS_TOKEN_KEY, token)
}

export function clearFoundersToken() {
  localStorage.removeItem(FOUNDERS_TOKEN_KEY)
}

async function parseJson(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

async function apiFetch(path, options = {}) {
  const token = getFoundersToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${FOUNDERS_API_BASE}${path}`, { ...options, headers })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.detail || data.error || 'Request failed')
  return data
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Called by loginFoundersOS in api.js — not used directly by components. */
export async function loginFounders(username, password) {
  const res = await fetch(`${FOUNDERS_API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.detail || 'Founders login failed')
  setFoundersToken(data.token)
  return data
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function listContacts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/api/v1/contacts${qs ? `?${qs}` : ''}`)
}

export async function getContact(contactId) {
  return apiFetch(`/api/v1/contacts/${contactId}`)
}

export async function generateDraft(contactId) {
  return apiFetch(`/api/v1/contacts/${contactId}/draft-outreach`, { method: 'POST' })
}

// ---------------------------------------------------------------------------
// Approvals (Drafts)
// ---------------------------------------------------------------------------

export async function listApprovals() {
  return apiFetch('/api/v1/approvals')
}

export async function approveApproval(approvalId) {
  return apiFetch(`/api/v1/approvals/${approvalId}/approve`, { method: 'POST' })
}

export async function rejectApproval(approvalId) {
  return apiFetch(`/api/v1/approvals/${approvalId}/reject`, { method: 'POST' })
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------

export async function listDeals() {
  return apiFetch('/api/v1/deals')
}

// ---------------------------------------------------------------------------
// Sessions (Chat)
// ---------------------------------------------------------------------------

export async function listSessions() {
  return apiFetch('/api/v1/chat/sessions')
}

export async function getChatSession(sessionId) {
  return apiFetch(`/api/v1/chat/sessions/${sessionId}`)
}

export async function saveSession(sessionId, messages, pendingHitl = null) {
  return apiFetch('/api/v1/chat/sessions/save', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId || undefined,
      messages,
      pending_hitl: pendingHitl,
    }),
  })
}

export async function deleteSession(sessionId) {
  return apiFetch(`/api/v1/chat/sessions/${sessionId}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Orchestrator (Chat send)
// ---------------------------------------------------------------------------

export async function sendMessage(message) {
  return apiFetch('/api/v1/orchestrator/run', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

// ---------------------------------------------------------------------------
// Prospecting approve
// ---------------------------------------------------------------------------

export async function approveProspecting(runId, approvedContactIds) {
  return apiFetch('/api/v1/prospecting/approve', {
    method: 'POST',
    body: JSON.stringify({ run_id: runId, approved_contact_ids: approvedContactIds }),
  })
}

// ---------------------------------------------------------------------------
// Settings — ICP
// ---------------------------------------------------------------------------

export async function getIcpSettings() {
  return apiFetch('/api/v1/settings/icp')
}

export async function updateIcpSettings(payload) {
  return apiFetch('/api/v1/settings/icp', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

// ---------------------------------------------------------------------------
// Settings — Product / Seller context
// ---------------------------------------------------------------------------

export async function getProductSettings() {
  return apiFetch('/api/v1/settings/product')
}

export async function updateProductSettings(payload) {
  return apiFetch('/api/v1/settings/product', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/** Scrape a URL and return AI-suggested description + ICP fields. */
export async function scrapeProductUrl(url) {
  return apiFetch('/api/v1/settings/product/scrape', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

// ---------------------------------------------------------------------------
// Settings — SMTP
// ---------------------------------------------------------------------------

export async function getSmtpSettings() {
  return apiFetch('/api/v1/settings/smtp')
}

export async function updateSmtpSettings(payload) {
  return apiFetch('/api/v1/settings/smtp', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function testSmtp(payload) {
  return apiFetch('/api/v1/settings/smtp/test', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
