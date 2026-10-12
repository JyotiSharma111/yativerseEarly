/**
 * Firebase sign-in for the website.
 *
 * Everything here is loaded on demand (dynamic import) so visitors who only
 * browse the marketing pages never download the Firebase SDK.
 *
 * How it plugs into the rest of the site: after any Firebase sign-in we copy
 * the person's fresh ID token + email into the same localStorage keys the old
 * login used (yati_token / yati_email). That keeps isAuthenticated(),
 * RequireAuth and every page working unchanged. The token itself is
 * re-fetched through getFreshToken() in api.js before every API call, because
 * Firebase tokens expire after about an hour (the SDK refreshes them for us).
 */
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onIdTokenChanged,
  signOut,
} from 'firebase/auth'
import { setSession, clearSession } from './api'

// Public by design: these identify the project, they don't grant access.
// (Access is protected by the authorized-domains list in the Firebase console
// and by token checks on the servers.) Override with VITE_FIREBASE_* if the
// project ever changes.
const env = import.meta.env
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBi7DvkdGe1-yooVXlenbQ3vQCREEfrM1g',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'yativerse-production.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'yativerse-production',
  appId: env.VITE_FIREBASE_APP_ID || '1:524637137538:web:36010de39a1f4fbc36629b',
}

const PROVIDER_KEY = 'yati_auth_provider'
const LINK_EMAIL_KEY = 'yati_email_for_signin'

let authInstance = null
function getFirebaseAuth() {
  if (!authInstance) authInstance = getAuth(initializeApp(firebaseConfig))
  return authInstance
}

/** Copies a Firebase user into the site's session keys. */
async function persist(user) {
  const token = await user.getIdToken()
  setSession(token, (user.email || '').toLowerCase())
  localStorage.setItem(PROVIDER_KEY, 'firebase')
}

/** A fresh ID token for the signed-in Firebase user, or null. */
export async function getFirebaseIdToken() {
  const auth = getFirebaseAuth()
  await auth.authStateReady() // wait until Firebase has restored any saved session
  return auth.currentUser ? auth.currentUser.getIdToken() : null
}

/** Keeps the stored token fresh and clears it if Firebase signs the person out. */
export function watchFirebaseSession(onChange) {
  return onIdTokenChanged(getFirebaseAuth(), async (user) => {
    if (user) {
      await persist(user)
    } else if (localStorage.getItem(PROVIDER_KEY) === 'firebase') {
      clearSession()
      localStorage.removeItem(PROVIDER_KEY)
    }
    if (onChange) onChange()
  })
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
  await persist(result.user)
  return result.user.email
}

/** Emails a one-tap sign-in link. Opening it lands back on /login. */
export async function sendEmailLink(email) {
  const clean = email.trim().toLowerCase()
  await sendSignInLinkToEmail(getFirebaseAuth(), clean, {
    url: `${window.location.origin}/login`,
    handleCodeInApp: true,
  })
  localStorage.setItem(LINK_EMAIL_KEY, clean)
}

/** True if the current page URL is a Firebase sign-in link. */
export function isEmailLinkUrl(href = window.location.href) {
  return isSignInWithEmailLink(getFirebaseAuth(), href)
}

/** The email this browser asked a link for, if any (null on a different device). */
export function rememberedLinkEmail() {
  return localStorage.getItem(LINK_EMAIL_KEY)
}

/** Finishes sign-in from an emailed link. */
export async function completeEmailLink(email, href = window.location.href) {
  const result = await signInWithEmailLink(getFirebaseAuth(), email.trim().toLowerCase(), href)
  localStorage.removeItem(LINK_EMAIL_KEY)
  await persist(result.user)
  return result.user.email
}

export async function firebaseSignOut() {
  localStorage.removeItem(PROVIDER_KEY)
  await signOut(getFirebaseAuth())
}

/** Turns Firebase error codes into sentences a person can act on. */
export function friendlyAuthError(err) {
  switch (err && err.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null // they just closed the window; nothing to report
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google window. Allow pop-ups for this site, or use the email link instead.'
    case 'auth/invalid-email':
      return 'That email address doesn\u2019t look right.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.'
    case 'auth/network-request-failed':
      return 'Network problem. Check your connection and try again.'
    case 'auth/operation-not-allowed':
      return 'This sign-in method isn\u2019t switched on yet. Please contact support@yativerse.ai.'
    case 'auth/unauthorized-domain':
      return 'Sign-in isn\u2019t enabled for this web address yet. Please contact support@yativerse.ai.'
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'That sign-in link has expired or was already used. Request a new one.'
    default:
      return (err && err.message) || 'Could not sign you in. Please try again.'
  }
}
