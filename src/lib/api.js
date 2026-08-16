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
