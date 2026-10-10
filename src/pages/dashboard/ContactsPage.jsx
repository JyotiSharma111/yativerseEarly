import { useEffect, useState } from "react";
import { Search, Zap, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import { useAuth } from "../../lib/auth";
import { getEntitlements } from "../../lib/api";
import { listContacts, generateDraft } from "../../lib/foundersApi";

const SAMPLE_CONTACTS = [
  { id: "1", name: "Iqbal Khan",     title: "CEO / COO",         company: "Priority Logistics", score: "High",   email: "iqbal@prioritylogistics.com" },
  { id: "2", name: "Sarah Chen",     title: "VP Operations",     company: "FleetTrack Pro",     score: "High",   email: "sarah@fleettrack.io" },
  { id: "3", name: "Marcus Johnson", title: "Head of Growth",    company: "ShipEasy",           score: "Medium", email: "marcus@shipeasy.com" },
  { id: "4", name: "Priya Sharma",   title: "CTO",               company: "LogiSync",           score: "Medium", email: "priya@logisync.co" },
  { id: "5", name: "Tom Bradley",    title: "Founder",           company: "FreightFlow",        score: "Low",    email: "tom@freightflow.io" },
];

const SCORE_STYLES = {
  High:   "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  Medium: "border-brand-gold/25  bg-brand-gold/10  text-brand-gold2",
  Low:    "border-white/10       bg-white/5        text-white/40",
};

export default function ContactsPage() {
  const { email, demo, logout } = useAuth();
  const [contacts, setContacts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [drafting, setDrafting]     = useState({});
  const [toast, setToast]           = useState(null);
  const [entitlements, setEntitlements] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (demo) {
        if (!cancelled) { setContacts(SAMPLE_CONTACTS); setLoading(false); }
        return;
      }
      try {
        const data = await listContacts({ limit: 500 });
        if (!cancelled) setContacts(Array.isArray(data) ? data : data.contacts ?? []);
      } catch (err) {
        if (!cancelled) { setError(err.message); setContacts(SAMPLE_CONTACTS); }
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

  async function handleGenerateDraft(contactId) {
    setDrafting((d) => ({ ...d, [contactId]: true }));
    try {
      await generateDraft(contactId);
      showToast("Draft queued — check Drafts tab in ~60s", "success");
    } catch (err) {
      showToast(err.message || "Failed to queue draft", "error");
    } finally {
      setDrafting((d) => ({ ...d, [contactId]: false }));
    }
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  const filtered = contacts.filter((c) => {
    const matchScore  = scoreFilter === "All" || c.score === scoreFilter;
    const matchSearch = !search || `${c.name} ${c.company}`.toLowerCase().includes(search.toLowerCase());
    return matchScore && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Contacts</h1>
            <p className="mt-1 text-sm text-white/40">
              {loading ? "Loading…" : `${filtered.length} contact${filtered.length !== 1 ? "s" : ""}`}
              {demo && " · sample data"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 text-sm text-brand-gold2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            Couldn't reach founder-agents-api — showing sample contacts.
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search by name or company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/25 outline-none focus:border-white/20"
            />
          </div>
          <div className="flex gap-2">
            {["All", "High", "Medium", "Low"].map((s) => (
              <button
                key={s}
                onClick={() => setScoreFilter(s)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  scoreFilter === s
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/5 bg-white/[0.03] text-white/40 hover:text-white/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-6 py-12 text-center text-sm text-white/30">
            No contacts match your filters.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/30">Name</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/30 sm:table-cell">Title</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/30 md:table-cell">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/30">Score</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-white/5 transition hover:bg-white/[0.02] ${i === filtered.length - 1 ? "border-0" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                    <td className="hidden px-4 py-3 text-white/50 sm:table-cell">{c.title}</td>
                    <td className="hidden px-4 py-3 text-white/50 md:table-cell">{c.company}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${SCORE_STYLES[c.score] || SCORE_STYLES.Low}`}>
                        {c.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleGenerateDraft(c.id)}
                        disabled={drafting[c.id] || demo}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Zap size={12} />
                        {drafting[c.id] ? "Queuing…" : "Draft"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Toast */}
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
