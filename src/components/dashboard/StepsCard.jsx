import { Footprints, TrendingUp } from "lucide-react";
import RingProgressGauge from "./RingProgressGauge";
import Sparkline from "./Sparkline";

export default function StepsCard({ history, stepGoal }) {
  const todayEntry = history[history.length - 1];
  const todaySteps = todayEntry?.steps ?? 0;

  const weekTotal = history.reduce((sum, h) => sum + h.steps, 0);
  const weekAvg = history.length ? Math.round(weekTotal / history.length) : 0;

  const points = history.map((h) => ({ value: h.steps }));

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
            <Footprints size={17} />
          </div>
          <h3 className="font-display text-base font-bold text-white">Steps</h3>
        </div>
        <span className="text-xs text-white/40">Last 7 days</span>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <RingProgressGauge value={todaySteps} goal={stepGoal} color="#605CFF" />

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
