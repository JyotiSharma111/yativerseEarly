import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, AlertCircle, Eye, EyeOff } from "lucide-react";
import SEO from "../components/SEO";
import { fadeUp } from "../lib/motion";
import { register } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(email.trim().toLowerCase(), password);
      refresh();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-5 py-16 font-body text-white">
      <SEO title="Sign up — yAtIverse" description="Create your yAtIverse account." />

      <motion.div {...fadeUp(0)} className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src="/logo.png" alt="yAtIverse" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-lg font-bold">yAtIverse</span>
        </Link>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
          <h1 className="font-display text-2xl font-extrabold text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-white/40">
            One account works everywhere — the yativerse.ai storefront and the yAtI app, same email and password.
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-white/10 bg-brand-bg2 px-4 py-2.5 pr-10 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              <UserPlus size={16} />
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-white/70 hover:text-white">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
