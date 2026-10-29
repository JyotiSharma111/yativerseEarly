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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
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

/**
 * "Remember me on this device". Checked: Firebase keeps the person signed in
 * across browser restarts. Unchecked: Firebase forgets them when the tab
 * closes, and we mark our own copy of the session to be dropped too
 * (see enforceSessionOnly in api.js).
 */
async function applyRemember(remember) {
  await setPersistence(getFirebaseAuth(), remember ? browserLocalPersistence : browserSessionPersistence)
}
function markRemember(remember) {
  if (remember) {
    localStorage.removeItem('yati_session_only')
    sessionStorage.removeItem('yati_session_alive')
  } else {
    localStorage.setItem('yati_session_only', '1')
    sessionStorage.setItem('yati_session_alive', '1')
  }
}

export async function signInWithGoogle(remember = true) {
  await applyRemember(remember)
  const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
  await persist(result.user)
  markRemember(remember)
  return result.user.email
}

const VERIFY_SETTINGS = () => ({ url: `${window.location.origin}/login` })

/**
 * Email + password sign-in. Returns { verified, email }.
 * An account whose email hasn't been confirmed yet is NOT given a session:
 * the servers reject its token anyway, so we send the person to the
 * "check your inbox" step instead of letting them into a broken dashboard.
 */
export async function passwordSignIn(email, password, remember = true) {
  await applyRemember(remember)
  const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim().toLowerCase(), password)
  if (!cred.user.emailVerified) return { verified: false, email: cred.user.email }
  await persist(cred.user)
  markRemember(remember)
  return { verified: true, email: cred.user.email }
}

/** Creates the account and emails a confirmation link. */
export async function passwordSignUp(email, password, remember = true) {
  await applyRemember(remember)
  const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim().toLowerCase(), password)
  await sendEmailVerification(cred.user, VERIFY_SETTINGS())
  markRemember(remember)
  return { email: cred.user.email }
}

export async function resendVerification() {
  const user = getFirebaseAuth().currentUser
  if (!user) throw Object.assign(new Error('Please sign in again.'), { code: 'auth/no-current-user' })
  await sendEmailVerification(user, VERIFY_SETTINGS())
}

/** "I've verified my email": re-check with Firebase and, if so, finish signing in. */
export async function checkVerified() {
  const user = getFirebaseAuth().currentUser
  if (!user) return null
  await user.reload()
  if (!user.emailVerified) return false
  await user.getIdToken(true) // force a new token that carries email_verified = true
  await persist(user)
  return user.email
}

/** Always succeeds from the caller's view, so it can't be used to find out who has an account. */
export async function sendReset(email) {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim().toLowerCase(), VERIFY_SETTINGS())
  } catch (err) {
    if (err && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email')) return
    throw err
  }
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
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead, or choose \u201cForgot your password?\u201d. If you signed up with Google, use Continue with Google.'
    case 'auth/weak-password':
      return 'Choose a stronger password (at least 8 characters).'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support@yativerse.ai.'
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
