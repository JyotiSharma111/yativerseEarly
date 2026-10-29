import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Fingerprint, Mail, ShieldCheck } from "lucide-react";
import SEO from "../components/SEO";
import FirebaseSignIn from "../components/FirebaseSignIn";
import { fadeUp } from "../lib/motion";
import { login } from "../lib/api";
import { useAuth, enterDemoMode } from "../lib/auth";

// Passkey and SSO sit in the design (see the layout reference) but neither is
// available yet, so by default they are not shown. Set to true to show them as
// disabled "Soon" buttons.
const SHOW_COMING_SOON_METHODS = false;

const PURPLE = "#605CFF";
const MIN_PASSWORD = 8;

// Firebase answers "wrong password" and "no such account" with the same
// codes (on purpose). In both cases we also try the old password login, so
// accounts created before the move to Firebase keep working until we retire it.
const MAYBE_LEGACY_CODES = [
  "auth/invalid-credential",
  "auth/invalid-login-credentials",
  "auth/user-not-found",
  "auth/wrong-password",
];

const inputClass =
  "h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#605CFF] focus:ring-4 focus:ring-[#605CFF]/15";
const outlineBtn =
  "flex h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-solid border-slate-300 bg-white text-[15px] font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

function Ribbons() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-24 left-[8%] h-[360px] w-[46%] -skew-x-[22deg] opacity-70 blur-[1px]"
        style={{ background: "linear-gradient(180deg, #DCEBFF 0%, #B9D6FF 55%, rgba(255,255,255,0) 100%)" }}
      />
      <div
        className="absolute -right-24 -top-10 h-[115%] w-[44%] -skew-x-[18deg]"
        style={{ background: "linear-gradient(180deg, #605CFF 0%, #C86DD7 40%, #FF6B8A 72%, #F5D27A 100%)", opacity: 0.92 }}
      />
      <div
        className="absolute right-[26%] top-[18%] h-[80%] w-[16%] -skew-x-[18deg]"
        style={{ background: "linear-gradient(180deg, #FF9F5A 0%, #FF6B8A 60%, #E26FD8 100%)", opacity: 0.85 }}
      />
    </div>
  );
}

function ErrorBox({ children }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();

  const params = new URLSearchParams(location.search);
  const finishingEmailLink = /[?&]oobCode=/.test(location.search); // opened from an emailed sign-in link
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "signin"); // signin | signup | reset | verify
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function switchMode(next) {
    setMode(next);
    setError(null);
    setInfo(null);
    setPassword("");
  }

  function done() {
    refresh();
    navigate(redirectTo, { replace: true });
  }

  async function loadFirebase() {
    try {
      return await import("../lib/firebaseSession");
    } catch {
      throw new Error("Could not load sign-in. Check your connection and try again.");
    }
  }

  function showError(fb, err) {
    const message = fb && fb.friendlyAuthError ? fb.friendlyAuthError(err) : err.message;
    if (message) setError(message); // null means "they closed the window": say nothing
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      const result = await fb.passwordSignIn(email, password, remember);
      if (result.verified) {
        done();
      } else {
        setVerifyEmail(result.email || email);
        setMode("verify");
      }
    } catch (err) {
      if (fb && MAYBE_LEGACY_CODES.includes(err.code)) {
        try {
          await login(email.trim().toLowerCase(), password);
          done();
          return;
        } catch {
          // fall through to the normal message
        }
      }
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) {
      setError(`Choose a password with at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      const result = await fb.passwordSignUp(email, password, remember);
      setVerifyEmail(result.email || email);
      setCooldown(30);
      setMode("verify");
    } catch (err) {
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      await fb.sendReset(email);
      // Same message whether or not the account exists, so this form can't be used to look people up.
      setInfo("If an account exists for that email, we\u2019ve sent a link to reset your password. Check your inbox and spam folder.");
    } catch (err) {
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      await fb.signInWithGoogle(remember);
      done();
    } catch (err) {
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckVerified() {
    setError(null);
    setBusy(true);
    let fb = null;
    try {
      fb = await loadFirebase();
      const result = await fb.checkVerified();
      if (result === null) {
        switchMode("signin");
        setError("Your session expired. Please sign in again.");
      } else if (result === false) {
        setError("We haven\u2019t seen the confirmation yet. Open the link in the email we sent, then try again.");
      } else {
        done();
      }
    } catch (err) {
      showError(fb, err);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    try {
      const fb = await loadFirebase();
      await fb.resendVerification();
      setCooldown(30);
      setInfo("Sent again. It can take a minute to arrive.");
    } catch (err) {
      setError(err.code === "auth/too-many-requests" ? "Too many requests. Please wait a few minutes." : "Could not resend. Please sign in again.");
    }
  }

  function handleDemo() {
    enterDemoMode();
    refresh();
    navigate(redirectTo, { replace: true });
  }

  const titles = {
    signin: "Sign in to your account",
    signup: "Create your account",
    reset: "Reset your password",
    verify: "Check your email",
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white font-body text-slate-900">
      <SEO title="Sign in — yAtIverse" description="Sign in to your yAtIverse account." />
      <Ribbons />

      <header className="relative z-10 border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur sm:px-12">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">yAtIverse</span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-col items-center px-4 py-12 sm:py-16">
        <motion.div
          {...fadeUp(0)}
          className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_-18px_rgba(50,50,93,0.35)] ring-1 ring-slate-900/5"
        >
          <div className="p-8 sm:p-10">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-slate-800">
              {finishingEmailLink ? "Finishing sign in" : titles[mode]}
            </h1>

            {finishingEmailLink ? (
              <div className="mt-6 text-slate-700 [&_*]:!text-slate-700">
                <FirebaseSignIn defaultEmail={email} onSignedIn={done} />
              </div>
            ) : mode === "verify" ? (
              <div className="mt-5 flex flex-col gap-4">
                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  <Mail size={18} className="mt-0.5 shrink-0 text-[#605CFF]" />
                  <p>
                    We sent a confirmation link to <span className="font-medium text-slate-900">{verifyEmail}</span>. Open it, then come
                    back here. Check your spam folder if it doesn&rsquo;t arrive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCheckVerified}
                  disabled={busy}
                  className="h-12 w-full rounded-lg text-[15px] font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
                  style={{ background: PURPLE }}
                >
                  {busy ? "Checking…" : "I\u2019ve confirmed my email"}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="text-sm font-medium text-[#605CFF] disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
                </button>
                {info && (
                  <p className="flex items-center gap-1.5 text-sm text-emerald-700">
                    <CheckCircle2 size={15} /> {info}
                  </p>
                )}
                {error && <ErrorBox>{error}</ErrorBox>}
                <button type="button" onClick={() => switchMode("signin")} className="text-sm text-slate-500 hover:text-slate-800">
                  &larr; Back to sign in
                </button>
              </div>
            ) : mode === "reset" ? (
              <form onSubmit={handleReset} className="mt-5 flex flex-col gap-4">
                <p className="text-sm text-slate-600">Enter your email and we&rsquo;ll send you a link to choose a new password.</p>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                  <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
                {info && (
                  <p className="flex items-start gap-1.5 text-sm text-emerald-700">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> {info}
                  </p>
                )}
                {error && <ErrorBox>{error}</ErrorBox>}
                <button
                  type="submit"
                  disabled={busy || !email}
                  className="h-12 w-full rounded-lg text-[15px] font-semibold text-white transition hover:brightness-95 disabled:opacity-45"
                  style={{ background: PURPLE }}
                >
                  {busy ? "Sending…" : "Send reset link"}
                </button>
                <button type="button" onClick={() => switchMode("signin")} className="text-sm text-slate-500 hover:text-slate-800">
                  &larr; Back to sign in
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={mode === "signup" ? handleSignUp : handleSignIn} className="mt-6 flex flex-col gap-5">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                    <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                      {mode === "signin" && (
                        <button type="button" onClick={() => switchMode("reset")} className="text-sm font-medium text-[#605CFF] hover:underline">
                          Forgot your password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {mode === "signup" && <p className="mt-1.5 text-xs text-slate-500">At least {MIN_PASSWORD} characters.</p>}
                  </div>

                  <label className="flex cursor-pointer items-center gap-2.5 text-[15px] text-slate-700">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#605CFF]" />
                    Remember me on this device
                  </label>

                  {error && <ErrorBox>{error}</ErrorBox>}

                  <button
                    type="submit"
                    disabled={busy || !email || !password}
                    className="h-12 w-full rounded-lg text-[15px] font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
                    style={{ background: PURPLE }}
                  >
                    {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                  </button>
                </form>

                <div className="my-5 flex items-center gap-3 text-[13px] text-slate-500">
                  <div className="h-px flex-1 bg-slate-200" />
                  {mode === "signup" ? "Or sign up with" : "Or sign in with"}
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="flex flex-col gap-3">
                  <button type="button" onClick={handleGoogle} disabled={busy} className={outlineBtn}>
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z" />
                      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
                      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                    </svg>
                    Google
                  </button>
                  {SHOW_COMING_SOON_METHODS && (
                    <>
                      <button type="button" disabled className={outlineBtn}>
                        <Fingerprint size={18} className="text-[#605CFF]" /> Passkey <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">Soon</span>
                      </button>
                      <button type="button" disabled className={outlineBtn}>
                        <ShieldCheck size={18} className="text-[#605CFF]" /> SSO <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">Soon</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {!finishingEmailLink && mode !== "verify" && mode !== "reset" && (
            <div className="mx-2 mb-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-[15px] text-slate-600">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("signin")} className="font-medium text-[#605CFF] hover:underline">Sign in</button>
                </>
              ) : (
                <>
                  New to yAtIverse?{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="font-medium text-[#605CFF] hover:underline">Create account</button>
                </>
              )}
            </div>
          )}
        </motion.div>

        <button type="button" onClick={handleDemo} className="mt-6 text-sm text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">
          Just looking? Explore with sample data
        </button>
      </main>

      <footer className="relative z-10 flex items-center gap-5 px-6 pb-8 text-sm text-slate-500 sm:px-12">
        <span>&copy; yAtIverse</span>
        <Link to="/privacy-policy" className="hover:text-slate-800">Privacy &amp; terms</Link>
      </footer>
    </div>
  );
}
