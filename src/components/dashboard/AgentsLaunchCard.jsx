import { Sparkles, ArrowUpRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function AgentsLaunchCard({ className = "", locked = false, planName = null }) {
  if (locked) {
    return (
      <div
        className={`relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 opacity-60 ${className}`}
      >
        <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">
          <Lock size={11} />
          Locked
        </div>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40">
          <Sparkles size={18} />
        </div>
        <h3 className="font-display text-base font-bold text-white/60">AI Agents</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/30">
          {planName
            ? `Your ${planName} plan doesn't include AI Agents yet. `
            : "AI Agents aren't included on your current plan. "}
          Upgrade to Founder or higher to unlock 2 agents (CMO, CRO, CFO, COO).
        </p>
        <Link
          to="/agents"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white/50 transition-colors hover:text-white/70"
        >
          See what AI Agents can do
          <ArrowUpRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <Link
      to="/dashboard/agents"
      className={`group relative block rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-6 transition-colors hover:border-brand-gold/40 hover:bg-brand-gold/10 ${className}`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold2">
        <Sparkles size={18} />
      </div>
      <h3 className="font-display text-base font-bold text-white">AI Agents</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-white/50">
        {planName ? `${planName} plan · ` : ""}
        Revenue, outreach, and deal coaching agents — all inside your dashboard.
      </p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-gold2">
        Open AI Agents
        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
