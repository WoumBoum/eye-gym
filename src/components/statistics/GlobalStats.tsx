import { StatsSummary } from '../../types';

interface GlobalStatsProps {
  stats: StatsSummary;
}

export function GlobalStats({ stats }: GlobalStatsProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{stats.totalExercises}</div>
        <div className="stat-label">Exercices</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.averageScore.toFixed(1)}</div>
        <div className="stat-label">Score moyen</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.last10Average.toFixed(1)}</div>
        <div className="stat-label">Moyenne (10 derniers)</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.bestScore.toFixed(1)}</div>
        <div className="stat-label">Meilleur score</div>
      </div>
    </div>
  );
}
