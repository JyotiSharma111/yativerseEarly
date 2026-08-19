import { Lock } from "lucide-react";

// Renders a card in the same visual system as the live Ring cards, but inert —
// used for every dashboard section that isn't built yet (AI Agents, Venture Pulse,
// Priorities, Systems & Devices, Privacy & Trust). Never fabricates data for these;
// it only ever shows the "coming in Phase N" label from the rollout plan.
export default function ComingSoonCard({ icon: Icon, title, phase, description, className = "" }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 opacity-60 ${className}`}
    >
      <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">
        <Lock size={11} />
        {phase}
      </div>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40">
        <Icon size={18} />
      </div>
      <h3 className="font-display text-base font-bold text-white/60">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-white/30">{description}</p>
    </div>
  );
}
