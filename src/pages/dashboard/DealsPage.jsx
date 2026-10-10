import { useEffect, useState } from "react";
import { TrendingUp, Calendar, Zap, AlertCircle, CheckCircle } from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import { useAuth } from "../../lib/auth";
import { getEntitlements } from "../../lib/api";
import { listDeals, getFoundersToken } from "../../lib/foundersApi";

const FOUNDERS_API_BASE =
  import.meta.env.VITE_FOUNDERS_API_BASE || "https://founder-agents-api.onrender.com";

const SAMPLE_DEALS = [
  { id: "1", name: "Priority Logistics — Enterprise", stage: "Proposal Sent",  health: "green",  close_date: "2026-11-15", amount: 24000 },
  { id: "2", name: "FleetTrack Pro — Growth",         stage: "Discovery",      health: "yellow", close_date: "2026-12-01", amount: 12000 },
  { id: "3", name: "ShipEasy — Starter",              stage: "Closed Won",     health: "green",  close_date: "2026-10-01", amount: 6000  },
  { id: "4", name: "LogiSync — Scale",                stage: "Negotiation",    health: "red",    close_date: "2026-10-20", amount: 36000 },
];

const HEALTH_STYLES = {
  green:  { dot: "bg-emerald-400", label: "Healthy",  badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" },
  yellow: { dot: "bg-amber-400",   label: "At risk",  badge: "border-amber-400/25   bg-amber-400/10   text-amber-300"   },
  red:    { dot: "bg-rose-400",    label: "Critical", badge: "border-rose-400/25    bg-rose-400/10    text-rose-300"    },
};

const STAGE_STYLES = {
  "Closed Won":  "text-emerald-300",
  "Closed Lost": "text-white/30",
};

function formatAmount(n) {
  if (!n) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(str) {
  if (!str) return null;
  return new Date(str).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function DealsPage() {
  const { demo, logout } = useAuth();
  const [deals, setDeals]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [coaching, setCoaching]     = useState({});
  const [toast, setToast]           = useState(null);
  const [entitlements, setEntitlements] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (demo) {
        if (!cancelled) { setDeals(SAMPLE_DEALS); setLoading(false); }
        return;
      }
      try {
        const data = await listDeals();
        if (!cancelled) setDeals(Array.isArray(data) ? data : data.deals ?? []);
      } catch (err) {
        if (!cancelled) { setError(err.message); setDeals(SAMPLE_DEALS); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [demo]);

  useEffect(() => {
    if (demo) { setEntitlements({ planName: "Founder", status: "trial" }); return; }
    getEntitlements().then(setEntitlements).catch(() => setEntitlements(null));
  }, [demo]);

  async function handleDealCoach(dealId) {
    if (demo) { showToast("Sign in to run Deal Coach", "error"); return; }
    setCoaching((c) => ({ ...c, [dealId]: true }));
    try {
      const res = await fetch(`${FOUNDERS_API_BASE}/api/v1/orchestrator/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getFoundersToken()}` },
        body: JSON.stringify({ event: "deal_coach", deal_id: dealId }),
      });
      if (!res.ok) throw new Error("Deal Coach request failed");
      showToast("Deal Coach running — results in ~60s", "success");
    } catch (err) {
      showToast(err.message || "Failed to start Deal Coach", "error");
    } finally {
      setCoaching((c) => ({ ...c, [dealId]: false }));
    }
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Deals</h1>
          <p className="mt-1 text-sm text-white/40">
            {loading ? "Loading…" : `${deals.length} deal${deals.length !== 1 ? "s" : ""}`}
            {demo && " · sample data"}
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 text-sm text-brand-gold2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            Couldn't reach founder-agents-api — showing sample deals.
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-16 text-center">
            <TrendingUp size={28} className="text-white/20" />
            <p className="text-sm text-white/30">No deals yet — connect HubSpot to pull your pipeline.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {deals.map((d) => {
              const health = HEALTH_STYLES[d.health] || HEALTH_STYLES.yellow;
              return (
                <div key={d.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <p className={`font-semibold ${STAGE_STYLES[d.stage] || "text-white"}`}>{d.name}</p>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${health.badge}`}>
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${health.dot}`} />
                      {health.label}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/40">
                    <span className="font-medium text-white/60">{d.stage}</span>
                    {d.amount && <span>{formatAmount(d.amount)}</span>}
                    {d.close_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(d.close_date)}
                      </span>
                    )}
                  </div>

                  {/* Deal coach output */}
                  {d.coach_summary && (
                    <p className="mt-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs leading-relaxed text-white/50">
                      {d.coach_summary}
                    </p>
                  )}

                  {/* Actions */}
                  {d.stage !== "Closed Won" && d.stage !== "Closed Lost" && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleDealCoach(d.id)}
                        disabled={coaching[d.id]}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Zap size={12} />
                        {coaching[d.id] ? "Running…" : "Run Deal Coach"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
          toast.type === "success"
            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
            : "border-brand-rose/25 bg-brand-rose/10 text-brand-rose"
        }`}>
          {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
