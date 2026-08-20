import { Footprints, TrendingUp } from "lucide-react";
import RingProgressGauge from "./RingProgressGauge";
import Sparkline from "./Sparkline";

export default function StepsCard({ history, stepGoal }) {
  const safeHistory = Array.isArray(history) ? history : [];

  const cardHeader = (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
          <Footprints size={17} />
        </div>
        <h3 className="font-display text-base font-bold text-white">Steps</h3>
      </div>
      <span className="text-xs text-white/40">Last 7 days</span>
    </div>
  );

  if (safeHistory.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        {cardHeader}
        <p className="py-10 text-center text-sm text-white/30">
          No steps synced yet — open the Ring app and sync to see your data here.
        </p>
      </div>
    );
  }

  const todayEntry = safeHistory[safeHistory.length - 1];
  const todaySteps = todayEntry?.steps ?? 0;
  const goal = typeof stepGoal === "number" && stepGoal > 0 ? stepGoal : 8000;

  const weekTotal = safeHistory.reduce((sum, h) => sum + (h?.steps ?? 0), 0);
  const weekAvg = Math.round(weekTotal / safeHistory.length);

  const points = safeHistory.map((h) => ({ value: h?.steps ?? 0 }));

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      {cardHeader}

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <RingProgressGauge value={todaySteps} goal={goal} color="#605CFF" />

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-white/50">
              <TrendingUp size={14} className="text-brand-teal" />
              7-day average
            </span>
            <span className="font-semibold text-white">{weekAvg.toLocaleString()} steps</span>
          </div>
          <Sparkline points={points} color="#605CFF" width={260} height={64} />
        </div>
      </div>
    </div>
  );
}
