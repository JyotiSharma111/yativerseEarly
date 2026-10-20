import { useEffect, useState } from "react";
import { LogIn, X } from "lucide-react";
import FirebaseSignIn from "./FirebaseSignIn";
import { useAuth } from "../lib/auth";
import { AUTH_EXPIRED_EVENT } from "../lib/foundersApi";

export const REAUTHED_EVENT = "founders:reauthed";

/**
 * Pops up when a founder-agents-api call finds the session expired.
 *
 * After sign-in it fires REAUTHED_EVENT. A page that can refresh its own data
 * calls preventDefault() on the event; if nobody does, the page reloads so
 * every failed request is retried.
 */
export default function SessionExpiredDialog() {
  const { refresh, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(AUTH_EXPIRED_EVENT, show);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, show);
  }, []);

  if (!open) return null;

  function handleSignedIn() {
    refresh();
    setOpen(false);
    const handled = !window.dispatchEvent(new CustomEvent(REAUTHED_EVENT, { cancelable: true }));
    if (!handled) window.location.reload();
  }

  function handleSignOut() {
    setOpen(false);
    logout();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-brand-bg p-6 font-body text-white shadow-2xl"
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 text-white/30 transition hover:text-white/70"
        >
          <X size={16} />
        </button>
        <div className="mb-1 flex items-center gap-2">
          <LogIn size={16} className="text-white/50" />
          <h2 id="session-expired-title" className="font-display text-lg font-extrabold">
            Session expired
          </h2>
        </div>
        <p className="mb-5 text-sm text-white/45">
          Sign in again to keep working. Your page will pick up where it left off.
        </p>
        <FirebaseSignIn onSignedIn={handleSignedIn} />
        <button
          onClick={handleSignOut}
          className="mt-4 w-full text-center text-xs text-white/30 underline transition hover:text-white/60"
        >
          Sign out instead
        </button>
      </div>
    </div>
  );
}
