import { useEffect, useState } from "react";
import {
  Clock,
  Mail,
  Info,
  Users,
  HardDrive,
  Cpu,
  Sparkles,
  Lock,
} from "lucide-react";
import SEO from "../components/SEO";
import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../lib/auth";
import { getEntitlements, getPlans, selectAgents } from "../lib/api";
import { SAMPLE_ENTITLEMENTS } from "../lib/sampleRingData";

const GB = 1024 * 1024 * 1024;

// Real address, confirmed in use elsewhere in this codebase (Order.jsx's
// return-policy copy, Checkout.jsx's payment-failure fallback) — not
// invented for this page. There's no checkout/Stripe plan-switch yet (see
// claude/subscription-entitlement-model.md), so "upgrade" here means a
// pre-filled email to a human, not a fake button that pretends to charge
// a card.
const SUPPORT_EMAIL = "support@yativerse.ai";

// Matches the family in plans.js / Agents.jsx's marketing copy.
const AGENT_LABELS = {
  ai_cmo: { label: "AI CMO", blurb: "Marketing & growth" },
  ai_cro: { label: "AI CRO", blurb: "Revenue & sales" },
  ai_cfo: { label: "AI CFO", blurb: "Finance & runway" },
  ai_coo: { label: "AI COO", blurb: "Operations & systems" },
};

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "—";
  const gb = bytes / GB;
  if (gb >= 1000) {
    const tb = gb / 1000;
    return `${tb % 1 === 0 ? tb : tb.toFixed(1)} TB`;
  }
  return `${gb % 1 === 0 ? gb : gb.toFixed(1)} GB`;
}

function formatTokens(tokens) {
  if (tokens === null || tokens === undefined) return "—";
  if (tokens >= 1_000_000) return `${Math.round(tokens / 1_000_000)}M tokens`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K tokens`;
  return `${tokens} tokens`;
}

function daysLeft(isoDate) {
  if (!isoDate) return null;
  const ms = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

// The `trial` tier isn't a real catalog entry (see plans.js) — it mirrors
// Founder's limits as a placeholder. Rather than hardcode "founder" here
// (fragile if that assumption changes), find whichever catalog plan has
// the exact same storage/AI-capacity/agent-slot limits the account is
// actually trialing, so the "matches your trial" ribbon below stays
// correct even if the mirrored plan changes.
function findTrialMirror(catalog, entitlements) {
  if (!catalog?.plans || entitlements?.status !== "trial") return null;
  return (
    catalog.plans.find(
      (p) =>
        p.storageBytes === entitlements.storage?.limitBytes &&
        p.aiCapacityTokens === entitlements.aiCapacity?.limitTokens &&
        p.includedAgentSlots === entitlements.agents?.includedSlots
    ) || null
  );
}

function findCatalogEntry(catalog, planId) {
  if (!catalog || !planId) return null;
  return catalog.plans?.find((p) => p.id === planId) || catalog.bundles?.find((b) => b.id === planId) || null;
}

function mailtoUpgrade(accountEmail, targetPlanName) {
  const subject = encodeURIComponent(`Upgrade to ${targetPlanName}`);
  const body = encodeURIComponent(
    `Hi YATIverse team,\n\nI'd like to upgrade my account (${accountEmail || "—"}) to ${targetPlanName}.\n\nThanks!`
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

function StatusBadge({ status }) {
  const styles = {
    trial: "bg-brand-gold/10 text-brand-gold2 border-brand-gold/20",
    active: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    canceled: "bg-white/5 text-white/40 border-white/10",
  };
  const label = { trial: "Free trial", active: "Active", canceled: "Canceled" }[status] || status || "—";
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[status] || styles.canceled}`}>
      {label}
    </span>
  );
}

function UsageBar({ icon: Icon, label, usedText, limitText, pct }) {
  const clamped = Math.min(100, Math.max(0, pct || 0));
  const over = pct > 100;
  const warn = pct >= 80;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-white/70">
          <Icon size={14} />
          {label}
        </span>
        <span className={over ? "text-red-400" : "text-white/40"}>
          {usedText} / {limitText}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all ${
            over ? "bg-red-400" : warn ? "bg-brand-gold2" : "bg-brand-gold"
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function PlanCard({ plan, isCurrent, isTrialMirror, accountEmail }) {
  const isBundle = plan.upfrontUsd !== undefined;
  const highlighted = isCurrent || isTrialMirror;
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 ${
        isCurrent
          ? "border-brand-gold ring-2 ring-brand-gold/50 bg-brand-gold/[0.08]"
          : isTrialMirror
          ? "border-brand-gold/40 bg-brand-gold/[0.05]"
          : "border-white/5 bg-white/[0.02]"
      }`}
    >
      {highlighted && (
        <div
          className={`-mx-5 -mt-5 mb-4 px-5 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide ${
            isCurrent ? "bg-brand-gold text-brand-bg" : "bg-brand-gold/20 text-brand-gold2"
          }`}
        >
          {isCurrent ? "✓ Your current plan" : "Matches your trial limits"}
        </div>
      )}
      <div className="mb-1 flex items-center justify-between">
        <h4 className="font-display text-sm font-bold text-white">{plan.name}</h4>
      </div>
      <div className="mb-4 text-2xl font-bold text-white">
        ${plan.priceMonthlyUsd}
        <span className="text-sm font-normal text-white/40">/mo</span>
        {isBundle && (
          <div className="mt-0.5 text-xs font-normal text-white/40">
            + ${plan.upfrontUsd} upfront (hardware)
          </div>
        )}
      </div>
      <ul className="mb-5 space-y-1.5 text-sm text-white/60">
        <li className="flex items-center gap-1.5">
          <Users size={13} className="text-white/30" />
          {plan.maxUsers} {plan.maxUsers === 1 ? "user" : "users"}
          {plan.pooled ? " (pooled)" : ""}
        </li>
        <li className="flex items-center gap-1.5">
          <HardDrive size={13} className="text-white/30" />
          {formatBytes(plan.storageBytes)} storage
        </li>
        <li className="flex items-center gap-1.5">
          <Cpu size={13} className="text-white/30" />
          {formatTokens(plan.aiCapacityTokens)} AI capacity
        </li>
        <li className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-white/30" />
          {plan.includedAgentSlots} agent slot{plan.includedAgentSlots === 1 ? "" : "s"}
        </li>
      </ul>
      {isCurrent ? (
        <div className="mt-auto rounded-lg bg-white/5 px-3 py-2 text-center text-xs font-medium text-white/40">
          This is your plan
        </div>
      ) : (
        <a
          href={mailtoUpgrade(accountEmail, plan.name)}
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-gold/30 px-3 py-2 text-xs font-semibold text-brand-gold2 transition-colors hover:bg-brand-gold/10"
        >
          <Mail size={13} />
          {isTrialMirror ? "Email us to subscribe" : "Email us to switch"}
        </a>
      )}
    </div>
  );
}

export default function PlanPage() {
  const { email, demo, logout } = useAuth();
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [savingAgents, setSavingAgents] = useState(false);
  const [agentError, setAgentError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (demo) {
        if (!cancelled) {
          setEntitlements(SAMPLE_ENTITLEMENTS);
          setSelected(SAMPLE_ENTITLEMENTS.agents?.selected || []);
          setLoading(false);
        }
        return;
      }
      try {
        const data = await getEntitlements();
        if (!cancelled) {
          setEntitlements(data);
          setSelected(data.agents?.selected || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [demo]);

  // Public catalog — same call regardless of demo/login, since /api/plans
  // needs no auth. Kept in its own effect/error state so a catalog hiccup
  // never blocks the "your plan" section above from rendering.
  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const data = await getPlans();
        if (!cancelled) setCatalog(data);
      } catch (err) {
        if (!cancelled) setCatalogError(err.message);
      }
    }

    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleAgent(agentId) {
    if (demo || !entitlements?.isOwner || savingAgents) return;
    const totalSlots = entitlements.agents?.totalSlots || 0;
    const isSelected = selected.includes(agentId);
    const next = isSelected ? selected.filter((id) => id !== agentId) : [...selected, agentId];

    if (!isSelected && next.length > totalSlots) {
      setAgentError(
        `Your plan includes ${totalSlots} agent slot${totalSlots === 1 ? "" : "s"} — unselect one first, or add an agent slot below.`
      );
      return;
    }

    const prev = selected;
    setSelected(next);
    setSavingAgents(true);
    setAgentError(null);
    try {
      await selectAgents(next);
    } catch (err) {
      setSelected(prev);
      setAgentError(err.message);
    } finally {
      setSavingAgents(false);
    }
  }

  const trialDays = entitlements?.status === "trial" ? daysLeft(entitlements.trialEndsAt) : null;
  const totalSlots = entitlements?.agents?.totalSlots || 0;
  const canManageAgents = !demo && entitlements?.isOwner && totalSlots > 0;
  const trialMirror = findTrialMirror(catalog, entitlements);
  const currentCatalogEntry = entitlements ? findCatalogEntry(catalog, entitlements.planId) : null;

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <SEO title="Your Plan — yAtIverse" description="Your subscription, usage, and AI agents." />
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-white">Your Plan</h1>
            <p className="mt-0.5 text-sm text-white/40">{email}</p>
          </div>
        </div>

        {(demo || error) && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 text-sm text-brand-gold2">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              {error
                ? `Couldn't reach yati-api (${error}) — showing what we can.`
                : "Sample data — this is demo mode. Log in with a real account to see your actual plan and usage."}
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        ) : entitlements ? (
          <>
            {/* Current plan + usage — redesigned Sept 18 to actually answer
                "which plan am I on" at a glance: a large, high-contrast
                hero instead of a small inline heading, plus (for trial
                accounts) an explicit note about which real plan the trial
                mirrors, since nothing in the comparison grid below used to
                highlight anything for a trial account. */}
            <section className="relative overflow-hidden rounded-2xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/[0.09] via-white/[0.02] to-white/[0.02] p-6 sm:p-7">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-gold2/80">
                Your current plan
              </div>
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <h2 className="font-display text-3xl font-extrabold leading-none text-white sm:text-4xl">
                  {entitlements.planName || "No plan"}
                </h2>
                {currentCatalogEntry && (
                  <span className="pb-0.5 text-lg font-semibold text-white/50">
                    ${currentCatalogEntry.priceMonthlyUsd}/mo
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StatusBadge status={entitlements.status} />
                {trialDays !== null && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                    <Clock size={13} />
                    {trialDays === 0 ? "Trial ends today" : `${trialDays} day${trialDays === 1 ? "" : "s"} left in trial`}
                  </span>
                )}
              </div>

              {entitlements.status === "trial" && trialMirror && (
                <p className="mt-3 text-sm text-white/50">
                  Free trial, using the same limits as{" "}
                  <strong className="font-semibold text-white/80">{trialMirror.name}</strong> — marked below.
                </p>
              )}

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <UsageBar
                  icon={HardDrive}
                  label="Storage"
                  usedText={formatBytes(entitlements.storage?.usedBytes)}
                  limitText={formatBytes(entitlements.storage?.limitBytes)}
                  pct={entitlements.storage?.usedPct}
                />
                <UsageBar
                  icon={Cpu}
                  label="AI capacity"
                  usedText={formatTokens(entitlements.aiCapacity?.usedTokens)}
                  limitText={formatTokens(entitlements.aiCapacity?.limitTokens)}
                  pct={entitlements.aiCapacity?.usedPct}
                />
              </div>

              {(entitlements.storage?.approachingLimit || entitlements.aiCapacity?.approachingLimit) && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-brand-gold/5 px-3 py-2 text-xs text-brand-gold2">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  You're approaching a plan limit — see the comparison below if you'd like more room.
                </div>
              )}

              {entitlements.maxUsers > 1 && (
                <div className="mt-5 border-t border-white/5 pt-4">
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-white/70">
                    <Users size={14} />
                    Team ({entitlements.members?.length || 0} of {entitlements.maxUsers})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(entitlements.members || []).map((m) => (
                      <span key={m} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/50">
                        {m}
                        {m === entitlements.ownerEmail ? " · owner" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Agents */}
            <section className="mt-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="mb-1 flex items-center gap-1.5">
                <Sparkles size={16} className="text-brand-gold2" />
                <h2 className="font-display text-base font-bold text-white">AI Agents</h2>
              </div>

              {totalSlots === 0 ? (
                <p className="mt-2 flex items-start gap-2 text-sm text-white/40">
                  <Lock size={14} className="mt-0.5 shrink-0" />
                  Your current plan doesn't include any agent slots — see the comparison below to upgrade.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-sm text-white/40">
                    {selected.length} of {totalSlots} slot{totalSlots === 1 ? "" : "s"} filled
                    {!entitlements.isOwner && !demo ? " · only the plan owner can change this" : ""}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {Object.entries(AGENT_LABELS).map(([id, meta]) => {
                      const checked = selected.includes(id);
                      return (
                        <label
                          key={id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                            checked
                              ? "border-brand-gold/30 bg-brand-gold/5"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                          } ${!canManageAgents ? "cursor-default opacity-70" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!canManageAgents || savingAgents}
                            onChange={() => toggleAgent(id)}
                            className="mt-0.5 accent-brand-gold2"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-white">{meta.label}</span>
                            <span className="block text-xs text-white/40">{meta.blurb}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {agentError && <p className="mt-3 text-sm text-red-400">{agentError}</p>}

                  {catalog?.addOns && (
                    <p className="mt-4 text-xs text-white/30">
                      Need more slots?{" "}
                      {Object.values(catalog.addOns).map((addOn, i) => (
                        <span key={addOn.id}>
                          {i > 0 ? " · " : ""}
                          <a
                            href={mailtoUpgrade(email, addOn.name)}
                            className="text-brand-gold2 hover:underline"
                          >
                            {addOn.name} (+${addOn.priceMonthlyUsd}/mo, +{addOn.extraAgentSlots} slot{addOn.extraAgentSlots === 1 ? "" : "s"})
                          </a>
                        </span>
                      ))}
                    </p>
                  )}
                </>
              )}
            </section>
          </>
        ) : null}

        {/* Plan comparison */}
        <div className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-white/25">
          All plans
        </div>
        {catalogError ? (
          <p className="text-sm text-white/30">Couldn't load the plan catalog ({catalogError}).</p>
        ) : !catalog ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {catalog.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={entitlements?.planId === plan.id}
                  isTrialMirror={trialMirror?.id === plan.id}
                  accountEmail={email}
                />
              ))}
            </div>

            {catalog.bundles?.length > 0 && (
              <>
                <div className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-white/25">
                  Hardware + subscription bundles
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {catalog.bundles.map((bundle) => (
                    <PlanCard
                      key={bundle.id}
                      plan={bundle}
                      isCurrent={entitlements?.planId === bundle.id}
                      accountEmail={email}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <p className="mt-8 flex items-start gap-2 text-xs text-white/25">
          <Info size={13} className="mt-0.5 shrink-0" />
          There's no self-serve checkout yet — switching plans is handled by our team for now. "Email us to
          switch" opens a pre-filled email to {SUPPORT_EMAIL}, not a charge.
        </p>
      </main>
    </div>
  );
}
