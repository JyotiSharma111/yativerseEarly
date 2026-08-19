export default function RingProgressGauge({
  value,
  goal,
  size = 168,
  stroke = 14,
  color = "#605CFF",
  trackColor = "rgba(255,255,255,0.08)",
}) {
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-extrabold text-white">
          {value.toLocaleString()}
        </span>
        <span className="text-xs text-white/50">of {goal.toLocaleString()} steps</span>
      </div>
    </div>
  );
}
