interface ProgressBarProps {
  progress: number; // 0 to 1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, progress * 100));

  let className = 'progress-bar-fill';
  if (progress < 0.2) {
    className += ' danger';
  } else if (progress < 0.4) {
    className += ' warning';
  }

  return (
    <div className="progress-bar">
      <div
        className={className}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
