import { useState, useMemo, useEffect } from 'react';
import { Exercise } from '../../types';
import { HeatmapCanvas } from './HeatmapCanvas';
import { RatioCurve } from './RatioCurve';
import { AngleCurve } from './AngleCurve';
import { AngleDeltaCurve } from './AngleDeltaCurve';
import {
  generateHeatmapData,
  generateRatioCurve,
  generateAngleCurve,
  generateAngleDeltaCurve,
} from '../../utils/statistics';

interface TimelineEvolutionProps {
  history: Exercise[];
}

type ViewMode = 'heatmap' | 'ratio' | 'angle' | 'rotation';

export function TimelineEvolution({ history }: TimelineEvolutionProps) {
  const [exerciseIndex, setExerciseIndex] = useState(history.length);
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');
  const [isPlaying, setIsPlaying] = useState(false);

  // Get the subset of history up to the selected index
  const filteredHistory = useMemo(() => {
    return history.slice(0, exerciseIndex);
  }, [history, exerciseIndex]);

  // Generate statistics for the filtered history
  const heatmapData = useMemo(() => generateHeatmapData(filteredHistory), [filteredHistory]);
  const ratioCurve = useMemo(() => generateRatioCurve(filteredHistory), [filteredHistory]);
  const angleCurve = useMemo(() => generateAngleCurve(filteredHistory), [filteredHistory]);
  const angleDeltaCurve = useMemo(() => generateAngleDeltaCurve(filteredHistory), [filteredHistory]);

  // Format date for display
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get current exercise info
  const currentExercise = exerciseIndex > 0 ? history[exerciseIndex - 1] : null;
  const startDate = history.length > 0 ? formatDate(history[0].timestamp) : '';
  const currentDate = currentExercise ? formatDate(currentExercise.timestamp) : '';

  // Calculate average score for filtered history
  const avgScore = filteredHistory.length > 0
    ? Math.round(filteredHistory.reduce((sum, e) => sum + e.score, 0) / filteredHistory.length)
    : 0;

  // Auto-play functionality
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (exerciseIndex >= history.length) {
        setExerciseIndex(1);
      }
    }
  };

  // Animation effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setExerciseIndex(prev => {
        if (prev >= history.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, history.length]);

  const viewButtons: { id: ViewMode; label: string }[] = [
    { id: 'heatmap', label: 'Positions' },
    { id: 'ratio', label: 'Ratios' },
    { id: 'angle', label: 'Angles' },
    { id: 'rotation', label: 'Rotation' },
  ];

  return (
    <div className="timeline-evolution">
      <div className="timeline-header">
        <div className="timeline-info">
          <span className="timeline-count">
            {exerciseIndex} / {history.length} exercices
          </span>
          {currentExercise && (
            <span className="timeline-score" style={{ color: avgScore >= 70 ? '#26a269' : avgScore >= 40 ? '#e5a50a' : '#c01c28' }}>
              Score moyen: {avgScore}
            </span>
          )}
        </div>
        <div className="timeline-dates">
          <span className="timeline-start">{startDate}</span>
          <span className="timeline-current">{currentDate}</span>
        </div>
      </div>

      <div className="timeline-controls">
        <button
          className="btn-icon-timeline"
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Lecture'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <input
          type="range"
          className="timeline-slider"
          min={0}
          max={history.length}
          value={exerciseIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setExerciseIndex(Number(e.target.value));
          }}
        />
        <button
          className="btn-icon-timeline"
          onClick={() => {
            setIsPlaying(false);
            setExerciseIndex(history.length);
          }}
          title="Aller à la fin"
        >
          ⏭️
        </button>
      </div>

      <div className="timeline-view-selector">
        {viewButtons.map(btn => (
          <button
            key={btn.id}
            className={`timeline-view-btn ${viewMode === btn.id ? 'active' : ''}`}
            onClick={() => setViewMode(btn.id)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="timeline-content">
        {exerciseIndex === 0 ? (
          <div className="timeline-empty">
            <p>Déplacez le curseur pour voir l'évolution</p>
          </div>
        ) : (
          <>
            {viewMode === 'heatmap' && <HeatmapCanvas data={heatmapData} />}
            {viewMode === 'ratio' && <RatioCurve data={ratioCurve} />}
            {viewMode === 'angle' && <AngleCurve data={angleCurve} />}
            {viewMode === 'rotation' && <AngleDeltaCurve data={angleDeltaCurve} />}
          </>
        )}
      </div>
    </div>
  );
}
