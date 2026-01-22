import { StatsSummary } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface GlobalStatsProps {
  stats: StatsSummary;
}

export function GlobalStats({ stats }: GlobalStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{stats.totalExercises}</div>
        <div className="stat-label">{t.exercisesLabel}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.averageScore.toFixed(1)}</div>
        <div className="stat-label">{t.averageScore}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.last10Average.toFixed(1)}</div>
        <div className="stat-label">{t.last10Average}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.bestScore.toFixed(1)}</div>
        <div className="stat-label">{t.bestScore}</div>
      </div>
    </div>
  );
}
