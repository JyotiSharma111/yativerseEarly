import { Sparkles, ArrowUpRight } from "lucide-react";

// A live, clickable dashboard tile that launches the teammate's Founder
// Agents app in a new tab. Deliberately a link-out, not an <iframe> embed:
// that app's backend (founder-agents-api.onrender.com) has no auth check
// yet (see claude/founder-agents-integration-status.md) — anyone who could
// see an embedded iframe could trigger real actions (send outreach,
// approve drafts, burn Apollo credits). A new-tab launch keeps it on its
// own origin instead of exposing it inside yativerse.ai.
//
// Once that app's backend verifies the same yati_token this dashboard
// already issues (the decided fix in the doc above), this card can be
// swapped for a real embedded/data-wired AgentsCard.
export default function AgentsLaunchCard({ className = "" }) {
  return (
    <a
      href="https://founder-agents-ui.onrender.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-6 transition-colors hover:border-brand-gold/40 hover:bg-brand-gold/10 ${className}`}
    >
      <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-brand-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-gold2">
        External
      </div>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold2">
        <Sparkles size={18} />
      </div>
      <h3 className="font-display text-base font-bold text-white">AI Agents</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-white/50">
        Revenue, Content, and Research agents — opens in a new tab, separate app for now.
      </p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-gold2">
        Open Founder Agents
        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  );
}
