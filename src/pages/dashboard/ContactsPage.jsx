import { useEffect, useState } from "react";
import {
  Search, Zap, CheckCircle, AlertCircle, X,
  Mail, Linkedin, Phone, MapPin, Building2,
  ExternalLink, Copy, Globe, TrendingUp,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import { useAuth } from "../../lib/auth";
import { getEntitlements } from "../../lib/api";
import { listContacts, generateDraft } from "../../lib/foundersApi";

const SAMPLE_CONTACTS = [
  { id: "1", name: "Iqbal Khan",     title: "CEO / COO",      company: "Priority Logistics", score: "High",   email: "iqbal@prioritylogistics.com", industry: "Logistics", company_size: "51-200", location: "Dubai, UAE", linkedin_url: "https://linkedin.com", score_reasons: ["VP+ seniority", "Logistics industry match"] },
  { id: "2", name: "Sarah Chen",     title: "VP Operations",  company: "FleetTrack Pro",     score: "High",   email: "sarah@fleettrack.io",         industry: "SaaS",      company_size: "11-50",  location: "Singapore",  linkedin_url: "https://linkedin.com", score_reasons: ["VP+ seniority", "Tech-forward company"] },
  { id: "3", name: "Marcus Johnson", title: "Head of Growth", company: "ShipEasy",           score: "Medium", email: "marcus@shipeasy.com",         industry: "Logistics", company_size: "11-50",  location: "London, UK", linkedin_url: null,                   score_reasons: ["Mid seniority", "Industry match"] },
  { id: "4", name: "Priya Sharma",   title: "CTO",            company: "LogiSync",           score: "Medium", email: "priya@logisync.co",           industry: "Supply Chain", company_size: "51-200", location: "Bangalore", linkedin_url: "https://linkedin.com", score_reasons: ["C-suite", "Missing email"] },
  { id: "5", name: "Tom Bradley",    title: "Founder",        company: "FreightFlow",        score: "Low",    email: "tom@freightflow.io",          industry: "Logistics", company_size: "1-10",   location: "Austin, TX", linkedin_url: null,                   score_reasons: ["Company too small"] },
];

const SCORE_STYLES = {
  High:   "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  Medium: "border-brand-gold/25  bg-brand-gold/10  text-brand-gold2",
  Low:    "border-white/10       bg-white/5        text-white/40",
};

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button onClick={copy} className="ml-1.5 rounded p-0.5 text-white/30 transition hover:text-white/70">
      {copied ? <CheckCircle size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

function DetailPanel({ contact, onClose, onDraft, drafting, demo }) {
  if (!contact) return null;

  const techs = Array.isArray(contact.technologies) ? contact.technologies : [];
  const reasons = Array.isArray(contact.score_reasons) ? contact.score_reasons : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0f0f12] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/5 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-sm font-semibold text-white/70">
              {initials(contact.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">{contact.name || "—"}</p>
                <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${SCORE_STYLES[contact.score] || SCORE_STYLES.Low}`}>
                  {contact.score || "—"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/40">{contact.title || "—"}{contact.company ? ` · ${contact.company}` : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/[0.05] hover:text-white/70">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Contact info */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/25">Contact</p>
            <div className="space-y-2.5">
              {contact.email ? (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail size={14} className="shrink-0 text-white/30" />
                  <span className="text-white/70">{contact.email}</span>
                  <CopyButton value={contact.email} />
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-sm text-white/25">
                  <Mail size={14} className="shrink-0" />
                  <span>No email available</span>
                </div>
              )}

              {contact.linkedin_url ? (
                <div className="flex items-center gap-2.5 text-sm">
                  <Linkedin size={14} className="shrink-0 text-white/30" />
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-gold2 hover:underline"
                  >
                    LinkedIn profile <ExternalLink size={11} />
                  </a>
                </div>
              ) : null}

              {contact.phone ? (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone size={14} className="shrink-0 text-white/30" />
                  <span className="text-white/70">{contact.phone}</span>
                </div>
              ) : null}

              {contact.location ? (
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin size={14} className="shrink-0 text-white/30" />
                  <span className="text-white/70">{contact.location}</span>
                </div>
              ) : null}
            </div>
          </section>

          {/* Company info */}
          {(contact.company || contact.industry || contact.company_size || contact.revenue_range) && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/25">Company</p>
              <div className="space-y-2.5">
                {contact.company && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Building2 size={14} className="shrink-0 text-white/30" />
                    <span className="text-white/70">{contact.company}</span>
                    {contact.company_domain && (
                      <a
                        href={`https://${contact.company_domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-white/30 hover:text-white/60"
                      >
                        <Globe size={12} />
                      </a>
                    )}
                  </div>
                )}
                {contact.industry && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <TrendingUp size={14} className="shrink-0 text-white/30" />
                    <span className="text-white/70">{contact.industry}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/40 pl-0.5">
                  {contact.company_size  && <span>{contact.company_size} employees</span>}
                  {contact.revenue_range && <span>{contact.revenue_range} revenue</span>}
                  {contact.founded_year  && <span>Founded {contact.founded_year}</span>}
                </div>
                {techs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {techs.map((t) => (
                      <span key={t} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-white/50">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Score reasons */}
          {reasons.length > 0 && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/25">Score Reasons</p>
              <ul className="space-y-1.5">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/20" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer action */}
        <div className="border-t border-white/5 px-6 py-4">
          <button
            onClick={() => onDraft(contact.id)}
            disabled={drafting || demo}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Zap size={14} />
            {drafting ? "Queuing draft…" : "Draft Outreach Email"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function ContactsPage() {
  const { demo, logout } = useAuth();
  const [contacts, setContacts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [scoreFilter, setScoreFilter]   = useState("All");
  const [selectedContact, setSelectedContact] = useState(null);
  const [drafting, setDrafting]         = useState({});
  const [toast, setToast]               = useState(null);
  const [entitlements, setEntitlements] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (demo) {
        if (!cancelled) { setContacts(SAMPLE_CONTACTS); setLoading(false); }
        return;
      }
      try {
        const data = await listContacts({ limit: 100 });
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
                    onClick={() => setSelectedContact(c)}
                    className={`cursor-pointer border-b border-white/5 transition hover:bg-white/[0.03] ${
                      selectedContact?.id === c.id ? "bg-white/[0.04]" : ""
                    } ${i === filtered.length - 1 ? "border-0" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xs font-medium text-white/50">
                          {initials(c.name)}
                        </div>
                        <span className="font-medium text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-white/50 sm:table-cell">{c.title}</td>
                    <td className="hidden px-4 py-3 text-white/50 md:table-cell">{c.company}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${SCORE_STYLES[c.score] || SCORE_STYLES.Low}`}>
                        {c.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGenerateDraft(c.id); }}
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

      {/* Detail slide-over */}
      {selectedContact && (
        <DetailPanel
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onDraft={handleGenerateDraft}
          drafting={!!drafting[selectedContact.id]}
          demo={demo}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
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
