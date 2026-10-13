import { useEffect, useState } from 'react'
import { AlertCircle, Mail } from 'lucide-react'

/**
 * Google + "email me a sign-in link". No passwords.
 *
 * Also finishes the email-link sign-in: when someone taps the link in their
 * inbox they land on /login, and this component (mounted there) completes it.
 * If they opened the link on a different device than the one that asked for
 * it, we don't know their email, so we ask for it once (Firebase requires it).
 *
 * Props:
 *  - defaultEmail: pre-fills the email box (e.g. the email used on an order).
 *  - onSignedIn(email): called after a successful sign-in.
 */
export default function FirebaseSignIn({ defaultEmail = '', onSignedIn }) {
  const [email, setEmail] = useState(defaultEmail)
  const [stage, setStage] = useState('idle') // idle | sending | sent | needEmail | finishing
  const [error, setError] = useState(null)
  const [busyGoogle, setBusyGoogle] = useState(false)

  useEffect(() => setEmail((cur) => cur || defaultEmail), [defaultEmail])

  // Finish an email-link sign-in if this page was opened from one.
  useEffect(() => {
    // Cheap pre-check so ordinary visits never load the Firebase SDK.
    if (!/[?&]oobCode=/.test(window.location.search)) return
    let cancelled = false
    ;(async () => {
      try {
        const fb = await import('../lib/firebaseSession')
        if (!fb.isEmailLinkUrl()) return
        const remembered = fb.rememberedLinkEmail()
        if (!remembered) {
          if (!cancelled) setStage('needEmail')
          return
        }
        setStage('finishing')
        const signedInAs = await fb.completeEmailLink(remembered)
        if (!cancelled && onSignedIn) onSignedIn(signedInAs)
      } catch (err) {
        const fb = await import('../lib/firebaseSession')
        if (!cancelled) {
          setError(fb.friendlyAuthError(err))
          setStage('idle')
        }
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleGoogle() {
    setError(null)
    setBusyGoogle(true)
    try {
      const fb = await import('../lib/firebaseSession')
      try {
        const signedInAs = await fb.signInWithGoogle()
        if (onSignedIn) onSignedIn(signedInAs)
      } catch (err) {
        setError(fb.friendlyAuthError(err))
      }
    } catch {
      setError('Could not load sign-in. Check your connection and try again.')
    } finally {
      setBusyGoogle(false)
    }
  }

  async function handleEmail(e) {
    e.preventDefault()
    setError(null)
    const fb = await import('../lib/firebaseSession')
    try {
      if (stage === 'needEmail') {
        setStage('finishing')
        const signedInAs = await fb.completeEmailLink(email)
        if (onSignedIn) onSignedIn(signedInAs)
        return
      }
      setStage('sending')
      await fb.sendEmailLink(email)
      setStage('sent')
    } catch (err) {
      setError(fb.friendlyAuthError(err))
      setStage(stage === 'finishing' ? 'needEmail' : 'idle')
    }
  }

  if (stage === 'finishing') {
    return <p className="text-sm text-white/60">Signing you in…</p>
  }

  if (stage === 'sent') {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/70">
        <p className="font-medium text-white">Check your inbox</p>
        <p className="mt-1 text-white/55">
          We sent a sign-in link to <span className="text-white/80">{email.trim().toLowerCase()}</span>. Open it on this
          device to continue. If it doesn&rsquo;t arrive in a minute, check your spam folder.
        </p>
        <button type="button" onClick={() => setStage('idle')} className="mt-3 text-xs text-white/45 underline">
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={busyGoogle}
        className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/>
          <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/>
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
        </svg>
        {busyGoogle ? 'Opening Google…' : 'Continue with Google'}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-wide text-white/25">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleEmail} className="flex flex-col gap-3">
        {stage === 'needEmail' && (
          <p className="text-xs text-white/55">
            To finish signing in, confirm the email address you used to request the link.
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@startup.com"
            className="w-full rounded-xl border border-white/10 bg-brand-bg2 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50"
          />
        </div>
        <button
          type="submit"
          disabled={stage === 'sending'}
          className="flex items-center justify-center gap-2 rounded-xl bg-grad-brand px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Mail size={16} />
          {stage === 'sending' ? 'Sending…' : stage === 'needEmail' ? 'Finish signing in' : 'Email me a sign-in link'}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-brand-rose/20 bg-brand-rose/5 px-3.5 py-2.5 text-xs text-brand-rose">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
