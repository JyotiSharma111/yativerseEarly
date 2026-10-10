import { useEffect, useState, useCallback } from "react";
import { Mail, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import { useAuth } from "../../lib/auth";
import { getEntitlements } from "../../lib/api";
import { listApprovals, approveApproval, rejectApproval } from "../../lib/foundersApi";

const SAMPLE_APPROVALS = [
  {
    id: "1",
    contact_name: "Iqbal Khan",
    company: "Priority Logistics",
    subject: "CEO and COO at the same time",
    body: "Hi Iqbal,\n\nMost logistics founders I talk to hit the same wall around 20 people — the CEO job and the COO job stop fitting in one calendar. Hiring for one means the other slips.\n\nWe built yAtI specifically for that moment. It handles the founder OS layer — pipeline health, outreach, deal coaching — so you're not personally running every thread.\n\nWorth a 15-minute call to see if it fits where Priority Logistics is right now?",
  },
  {
    id: "2",
    contact_name: "Sarah Chen",
    company: "FleetTrack Pro",
    subject: "Scaling ops at FleetTrack",
    body: "Hi Sarah,\n\nVP Ops at a fleet software company is a tough seat — you're accountable for uptime and customer outcomes while the sales team keeps adding new accounts.\n\nWe help ops leaders at companies like FleetTrack stay on top of the full pipeline without the manual overhead — automated outreach, deal health signals, and a single dashboard to action everything.\n\nOpen to a quick call this week if the timing works?",
  },
];

const POLL_INTERVAL = 30_000;

export default function DraftsPage() {
  const { email, demo, logout } = useAuth();
  const [approvals, setApprovals]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [acting, setActing]         = useState({});
  const [toast, setToast]           = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [expanded, setExpanded]     = useState({});

  const load = useCallback(async () => {
    if (demo) { setApprovals(SAMPLE_APPROVALS); setLoading(false); return; }
    try {
      const data = await listApprovals();
      setApprovals(Array.isArray(data) ? data : data.approvals ?? []);
      setError(null);
    } catch (err) {
      setError(err.message);
      if (approvals.length === 0) setApprovals(SAMPLE_APPROVALS);
    } finally {
      setLoading(false);
    }
  }, [demo]);

  useEffect(() => {
    load();
    if (demo) return;
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [load, demo]);

  useEffect(() => {
    if (demo) { setEntitlements({ planName: "Founder", status: "trial" }); return; }
    getEntitlements().then(setEntitlements).catch(() => setEntitlements(null));
  }, [demo]);

  async function handleApprove(id) {
    if (demo) { showToast("Sign in to approve drafts", "error"); return; }
    setActing((a) => ({ ...a, [id]: "approving" }));
    try {
      await approveApproval(id);
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      showToast("Draft approved and sent", "success");
    } catch (err) {
      showToast(err.message || "Failed to approve", "error");
    } finally {
      setActing((a) => ({ ...a, [id]: null }));
    }
  }

  async function handleReject(id) {
    if (demo) { showToast("Sign in to reject drafts", "error"); return; }
    setActing((a) => ({ ...a, [id]: "rejecting" }));
    try {
      await rejectApproval(id);
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      showToast("Draft rejected", "success");
    } catch (err) {
      showToast(err.message || "Failed to reject", "error");
    } finally {
      setActing((a) => ({ ...a, [id]: null }));
    }
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function toggleExpand(id) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Drafts</h1>
            <p className="mt-1 text-sm text-white/40">
              {loading ? "Loading…" : `${approvals.length} pending approval${approvals.length !== 1 ? "s" : ""}`}
              {demo && " · sample data"}
            </p>
          </div>
          {!demo && (
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:text-white"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          )}
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 text-sm text-brand-gold2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            Couldn't reach founder-agents-api — showing sample drafts.
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        ) : approvals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-16 text-center">
            <Mail size={28} className="text-white/20" />
            <p className="text-sm text-white/30">No pending drafts — all caught up.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {approvals.map((a) => (
              <div key={a.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                {/* Card header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{a.subject}</p>
                    <p className="mt-0.5 text-xs text-white/40">
                      To: <span className="text-white/60">{a.contact_name}</span>
                      {a.company && <span> · {a.company}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleExpand(a.id)}
                    className="shrink-0 text-xs text-white/30 hover:text-white/60"
                  >
                    {expanded[a.id] ? "Hide" : "Preview"}
                  </button>
                </div>

                {/* Body preview */}
                {expanded[a.id] && (
                  <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-4 font-body text-xs leading-relaxed text-white/60">
                    {a.body}
                  </pre>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(a.id)}
                    disabled={!!acting[a.id]}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CheckCircle size={13} />
                    {acting[a.id] === "approving" ? "Sending…" : "Approve & Send"}
                  </button>
                  <button
                    onClick={() => handleReject(a.id)}
                    disabled={!!acting[a.id]}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/40 transition hover:border-white/20 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <XCircle size={13} />
                    {acting[a.id] === "rejecting" ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              </div>
            ))}
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
