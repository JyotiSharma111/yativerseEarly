import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getStoredEmail, clearSession, enforceSessionOnly } from "./api";
import { clearFoundersToken } from "./foundersApi";
import { clearEntitlementsCache, useEntitlements } from "./useEntitlements";

// Runs once when the app loads, before anything reads the stored login.
enforceSessionOnly();

const DEMO_KEY = "yati_demo_mode";

export function isDemoMode() {
  return sessionStorage.getItem(DEMO_KEY) === "1";
}

export function enterDemoMode() {
  sessionStorage.setItem(DEMO_KEY, "1");
}

function exitDemoMode() {
  sessionStorage.removeItem(DEMO_KEY);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [, forceRender] = useState(0);
  const refresh = useCallback(() => forceRender((n) => n + 1), []);

  // Returning Firebase users: keep the stored token fresh (the SDK refreshes
  // it roughly hourly) and sign the site out if Firebase signs them out.
  // Only loads the SDK when this browser already has a Firebase session.
  useEffect(() => {
    if (localStorage.getItem("yati_auth_provider") !== "firebase") return undefined;
    let unsubscribe = () => {};
    let cancelled = false;
    import("./firebaseSession").then(({ watchFirebaseSession }) => {
      if (!cancelled) unsubscribe = watchFirebaseSession(refresh);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [refresh]);

  const value = {
    authenticated: isAuthenticated() || isDemoMode(),
    demo: isDemoMode() && !isAuthenticated(),
    email: getStoredEmail(),
    refresh,
    logout: () => {
      if (localStorage.getItem("yati_auth_provider") === "firebase") {
        import("./firebaseSession").then(({ firebaseSignOut }) => firebaseSignOut()).catch(() => {});
      }
      clearSession();
      clearFoundersToken();
      clearEntitlementsCache();
      exitDemoMode();
      refresh();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function RequireAuth({ children }) {
  const { authenticated } = useAuth();
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * Gates Founder OS pages (Agents, Contacts, Drafts, Deals).
 * While entitlements are loading, renders nothing to avoid a flash.
 * If founderOS is false, redirects to the plan page.
 */
export function RequireFounderOS({ children }) {
  const { data, loading } = useEntitlements();

  if (loading) return null;
  if (!data?.founderOS) {
    return <Navigate to="/dashboard/plan" replace />;
  }
  return children;
}
