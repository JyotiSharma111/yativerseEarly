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
 * Fetches the logged-in founder's Ring sync data.
 * Expected shape (see yati-api-table-storage-reference.md, UserData table):
 * { device, stepGoal, history, workouts }. Mirrors listOrders()'s pattern —
 * same base URL, same Bearer token, same error handling.
 *
 * The real response has been observed to not always match that shape —
 * confirmed in production: a successful (2xx) response whose top-level
 * `history`/`workouts` come back missing rather than as arrays, most likely
 * because the account hasn't synced from the Ring app yet, or because the
 * API returns the stored `dataJson` field as a still-JSON-encoded string
 * instead of already-parsed fields. This function normalizes either case
 * so callers can always trust `history`/`workouts` are arrays and never
 * crash on `.length`/`.map` — see StepsCard/WorkoutsCard for the matching
 * empty-state UI when there's genuinely no data yet.
 */
export async function fetchRingData() {
  const token = getToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/data`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not load Ring data.')

  // Unwrap dataJson if the API returns the raw Table Storage entity (where
  // the sync payload is a JSON-encoded string) instead of parsed fields.
  let payload = data
  if (typeof data?.dataJson === 'string') {
    try {
      payload = JSON.parse(data.dataJson)
    } catch {
      payload = {}
    }
  }

  return {
    device: payload?.device ?? null,
    stepGoal: typeof payload?.stepGoal === 'number' ? payload.stepGoal : null,
    history: Array.isArray(payload?.history) ? payload.history : [],
    workouts: Array.isArray(payload?.workouts) ? payload.workouts : [],
  }
}
