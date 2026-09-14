/**
 * Client for yati-api — the same backend the yAtI mobile app talks to.
 * Using the same /register and /login endpoints here is what makes login
 * shared between the storefront and the app: one account, one password,
 * one Users table, two clients.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'https://yati-api-7421.azurewebsites.net'

const TOKEN_KEY = 'yati_token'
const EMAIL_KEY = 'yati_email'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY)
}

export function setSession(token, email) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EMAIL_KEY, email)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

async function parseJson(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

/** Creates a guest order — no account required. */
export async function createOrder(order) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Something went wrong placing your order.')
  return data
}

/** Registers a new account — same endpoint the yAtI app uses. */
export async function register(email, password) {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not create your account.')
  setSession(data.token, data.email)
  return data
}

/**
 * Requests a password-reset code be emailed to this address — same
 * endpoint the yAtI app uses (see PasswordResets table in
 * yati-api-table-storage-reference.md: a 6-digit code, 15-minute expiry,
 * one active code per email). Deliberately does not distinguish "no such
 * account" from "code sent" in the UI layer — that's for the backend to
 * decide; this client just surfaces whatever it returns.
 */
export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE}/api/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not send a reset code. Please try again.')
  return data
}

/** Completes a password reset using the code emailed by forgotPassword(). */
export async function resetPassword(email, code, newPassword) {
  const res = await fetch(`${API_BASE}/api/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not reset your password. Check the code and try again.')
  return data
}

/** Logs in — same endpoint the yAtI app uses. */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not log in.')
  setSession(data.token, data.email)
  return data
}

/** Lists orders for the logged-in account. */
export async function listOrders() {
  const token = getToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not load orders.')
  return data.orders || []
}

/** Whether a token is currently stored — used to gate the /dashboard route. */
export function isAuthenticated() {
  return Boolean(getToken())
}

/**
 * Creates a Stripe PaymentIntent covering every order in orderIds (one
 * Stripe payment can cover several Orders rows — the Orders table has no
 * multi-item concept, see yativerse-order-data-flow.md). The backend
 * recomputes the charged amount itself from the stored order totals, so
 * nothing client-side is trusted for the actual amount charged.
 * Returns { clientSecret, totalCents, currency } — clientSecret is what
 * Stripe Elements needs to mount the embedded Payment Element.
 */
export async function createPaymentIntent({ email, orderIds }) {
  const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, orderIds }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not start payment.')
  return data
}

/**
 * The yAtI mobile app stores daily history as a date-keyed object —
 * { "2026-09-10": { steps, sleepMin, restHr, ... }, "2026-09-11": {...} } —
 * see Map<String,dynamic> _history in ring_controller.dart. That's exactly
 * what gets synced to Azure and exactly what /api/data hands back: a real
 * object, never an array. StepsCard/WorkoutsCard expect an array ordered
 * oldest-to-newest (see SAMPLE_RING_DATA), so this turns the real shape
 * into that shape instead of discarding it.
 *
 * Root cause of the "dashboard shows no data despite a successful sync"
 * bug (confirmed Sept 2026): fetchRingData() used to do
 * `Array.isArray(payload?.history) ? payload.history : []`, which is false
 * for every real synced account (since history is always an object here),
 * so it silently returned [] even when Azure had the real data. Nothing
 * wrong with the sync, the token, or the account — just this parsing step.
 */
function normalizeHistory(history) {
  if (Array.isArray(history)) return history
  if (history && typeof history === 'object') {
    return Object.entries(history)
      .map(([date, entry]) => ({ date, ...(entry && typeof entry === 'object' ? entry : {}) }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  }
  return []
}

/**
 * Fetches the logged-in founder's Ring sync data.
 *
 * The real /api/data response (confirmed Sept 2026 from a live Network tab
 * capture, matching getDataHandler in dataCore.js) is wrapped one level
 * deep: { data: { device, stepGoal, history, workouts } }. This function
 * used to only unwrap a *different*, hypothetical shape — a raw Table
 * Storage entity with a JSON-encoded `dataJson` string field — and never
 * checked for this actual `{ data: {...} }` wrapper. So `payload` stayed
 * as the outer object, `payload.history` etc. were always undefined, and
 * every field silently fell back to its empty default — regardless of how
 * much real data was sitting in Azure. Handles all three shapes now: the
 * real wrapped one, the legacy raw-entity one, and an already-flat one.
 *
 * `history`'s own shape is normalized separately via normalizeHistory()
 * above, so callers can always trust `history`/`workouts` are arrays and
 * never crash on `.length`/`.map` — see StepsCard/WorkoutsCard for the
 * matching empty-state UI when there's genuinely no data yet.
 */
export async function fetchRingData() {
  const token = getToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/data`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const parsed = await parseJson(res)
  if (!res.ok) throw new Error(parsed.error || 'Could not load Ring data.')

  let payload = parsed
  if (typeof parsed?.dataJson === 'string') {
    // Legacy shape: a raw Table Storage entity, sync payload still JSON-encoded.
    try {
      payload = JSON.parse(parsed.dataJson)
    } catch {
      payload = {}
    }
  } else if (parsed && typeof parsed === 'object' && parsed.data && typeof parsed.data === 'object') {
    // Real shape: getDataHandler's { data: { device, stepGoal, history, workouts } }.
    payload = parsed.data
  }

  return {
    device: payload?.device ?? null,
    stepGoal: typeof payload?.stepGoal === 'number' ? payload.stepGoal : null,
    history: normalizeHistory(payload?.history),
    workouts: Array.isArray(payload?.workouts) ? payload.workouts : [],
  }
}

/**
 * Fetches the logged-in founder's plan/permissions — see entitlements.js
 * and plans.js in yati-api. Returns the raw shape GET /api/entitlements
 * sends: { planId, planName, agents: { includedSlots, extraSlots, selected,
 * hasAnyAccess, family }, storage: {...}, aiCapacity: {...}, ... }.
 * Dashboard.jsx uses agents.hasAnyAccess to decide whether to show the
 * live AgentsLaunchCard or its locked/upgrade variant.
 */
export async function getEntitlements() {
  const token = getToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/entitlements`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not load your plan.')
  return data
}
