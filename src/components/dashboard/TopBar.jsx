import { ShieldCheck, ShieldAlert } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function TopBar({ email, live }) {
  const name = email ? email.split("@")[0] : "Founder";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
          {greeting()}, <span className="capitalize">{name}</span>
        </h1>
        <p className="mt-1 text-sm text-white/40">Here's your Ring snapshot for {today}.</p>
      </div>

      <div
        className={`flex items-center gap-2 self-start rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
          live
            ? "border-brand-teal/30 bg-brand-teal/10 text-brand-teal"
            : "border-brand-gold/30 bg-brand-gold/10 text-brand-gold"
        }`}
      >
        {live ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
        {live ? "Ring live · other systems coming soon" : "Sample data · other systems coming soon"}
      </div>
    </div>
  );
}
