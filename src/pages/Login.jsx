import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, AlertCircle, Sparkles } from "lucide-react";
import SEO from "../components/SEO";
import { fadeUp } from "../lib/motion";
import { login } from "../lib/api";
import { useAuth, enterDemoMode } from "../lib/auth";

const GOLD = "#C9A84C";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      refresh();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDemo() {
    enterDemoMode();
    refresh();
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-5 py-16 font-body text-white">
      <SEO title="Log in — yAtIverse" description="Log in to your Founder Command Center." />

      <motion.div {...fadeUp(0)} className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src="/logo.png" alt="yAtIverse" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-lg font-bold">yAtIverse</span>
        </Link>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
          <h1 className="font-display text-2xl font-extrabold text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-white/40">
            Log in with your yAtIverse account to see your Ring data.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@startup.com"
                className="w-full rounded-xl border border-white/10 bg-brand-bg2 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-brand-bg2 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-brand-rose/20 bg-brand-rose/5 px-3.5 py-2.5 text-xs text-brand-rose">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-grad-brand px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LogIn size={16} />
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] uppercase tracking-wide text-white/25">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={handleDemo}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white"
          >
            <Sparkles size={15} style={{ color: GOLD }} />
            Continue with sample data
          </button>
        </div>
      </motion.div>
    </div>
  );
}
