import { Flame, Clock, Wifi, WifiOff } from "lucide-react";

function timeAgo(iso) {
  if (!iso) return "unknown";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function WorkoutsCard({ workouts, device }) {
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-rose/15 text-brand-rose">
            <Flame size={17} />
          </div>
          <h3 className="font-display text-base font-bold text-white">Recent workouts</h3>
        </div>
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            device?.connected ? "text-brand-teal" : "text-white/30"
          }`}
        >
          {device?.connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {device?.connected ? "Ring connected" : "Ring offline"}
        </div>
      </div>

      {safeWorkouts.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/30">No workouts logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {safeWorkouts.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">{w.type}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                  <Clock size={11} />
                  {w.durationMin} min
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-gold2">{w.calories} cal</p>
                <p className="text-xs text-white/30">{w.date}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {device && (
        <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-white/40">
          <span>{device.name || "Signal Ring"}</span>
          <span>
            {device.batteryPercent != null ? `${device.batteryPercent}% battery · ` : ""}
            synced {timeAgo(device.lastSyncedAt)}
          </span>
        </div>
      )}
    </div>
  );
}
