interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const inProgress = clamped > 0 && clamped < 100;

  return (
    <div className="w-full">
      {(label || true) && (
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-text-secondary">{label || "Progress"}</span>
          <span className="text-text-primary font-medium">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div className="w-full h-3 rounded-full bg-bg-card border border-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            inProgress ? "shimmer" : "bg-gradient-to-r from-primary to-secondary"
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
