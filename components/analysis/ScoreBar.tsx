export function ScoreBar({
  label,
  value,
  color = "primary",
}: {
  label: string;
  value: number;
  color?: "primary" | "danger" | "gold" | "success";
}) {
  const colorCls =
    color === "danger"
      ? "bg-danger"
      : color === "gold"
        ? "bg-gold"
        : color === "success"
          ? "bg-success"
          : "bg-primary";
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-[10px] uppercase tracking-wide text-muted font-mono">
        {label}
      </span>
      <div className="flex-1 h-1 rounded bg-surface-2 overflow-hidden">
        <div
          className={`h-full ${colorCls}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-[10px] text-muted">
        {clamped.toFixed(0)}
      </span>
    </div>
  );
}
