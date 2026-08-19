import { createContext, useContext, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getStoredEmail, clearSession } from "./api";

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

  const value = {
    authenticated: isAuthenticated() || isDemoMode(),
    demo: isDemoMode() && !isAuthenticated(),
    email: getStoredEmail(),
    refresh,
    logout: () => {
      clearSession();
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
