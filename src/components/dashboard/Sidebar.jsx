import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Footprints,
  CreditCard,
  Lock,
  LogOut,
} from "lucide-react";

// Items with a `to` are real, working navigation. Items without one are
// still just visual/inert — matches this sidebar's existing pattern
// (Overview/Ring were placeholders before "Plan" became the first real
// second destination in the dashboard).
const LIVE_ITEMS = [
  { icon: LayoutGrid, label: "Overview", to: "/dashboard" },
  { icon: Footprints, label: "Ring" },
  { icon: CreditCard, label: "Plan", to: "/dashboard/plan" },
];

const DISABLED_ITEMS = [
  "Priorities",
  "AI Agents",
  "Venture Pulse",
  "Systems & Devices",
  "Privacy & Trust",
];

export default function Sidebar({ onLogout }) {
  const { pathname } = useLocation();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-brand-bg2 p-5 lg:flex">
      <Link to="/" className="mb-8 flex items-center gap-2 px-1">
        <img src="/logo.png" alt="yAtIverse" className="h-7 w-7 rounded-lg" />
        <span className="font-display text-sm font-bold text-white">
          Founder Command Center
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {LIVE_ITEMS.map(({ icon: Icon, label, to }) => {
          const active = to && pathname === to;
          const className = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            active ? "bg-white/10 text-white" : "text-white hover:bg-white/5"
          }`;
          return to ? (
            <Link key={label} to={to} className={className}>
              <Icon size={17} />
              {label}
            </Link>
          ) : (
            <button key={label} className={`${className} bg-white/5`}>
              <Icon size={17} />
              {label}
            </button>
          );
        })}

        <div className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/25">
          Coming soon
        </div>
        {DISABLED_ITEMS.map((label) => (
          <div
            key={label}
            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/25"
          >
            <Lock size={15} />
            {label}
          </div>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/5 hover:text-white"
      >
        <LogOut size={17} />
        Log out
      </button>
    </aside>
  );
}
