import { useState, useMemo } from 'react';
import { Exercise } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { HeatmapCanvas } from './HeatmapCanvas';
import { generateHeatmapDataByRotation } from '../../utils/statistics';

interface PositionByRotationProps {
  history: Exercise[];
}

// Rotation ranges in degrees
const ROTATION_RANGES = [
  { min: 0, max: 30 },
  { min: 30, max: 60 },
  { min: 60, max: 90 },
  { min: 90, max: 120 },
  { min: 120, max: 150 },
  { min: 150, max: 180 },
];

export function PositionByRotation({ history }: PositionByRotationProps) {
  const { t } = useTranslation();
  const [selectedRange, setSelectedRange] = useState(0);

  // Convert degrees to radians
  const minRad = (ROTATION_RANGES[selectedRange].min * Math.PI) / 180;
  const maxRad = (ROTATION_RANGES[selectedRange].max * Math.PI) / 180;

  // Generate heatmap for selected rotation range
  const heatmapData = useMemo(
    () => generateHeatmapDataByRotation(history, minRad, maxRad),
    [history, minRad, maxRad]
  );

  // Count exercises and calculate average score for this range
  const rangeStats = useMemo(() => {
    let count = 0;
    let totalScore = 0;

    for (const exercise of history) {
      if (exercise.angleDelta === undefined) continue;
      const absAngle = Math.abs(exercise.angleDelta);
      if (absAngle >= minRad && absAngle < maxRad) {
        count++;
        totalScore += exercise.score;
      }
    }

    return {
      count,
      avgScore: count > 0 ? Math.round((totalScore / count) * 10) / 10 : 0,
    };
  }, [history, minRad, maxRad]);

  // Count exercises per range for the indicator
  const rangeCounts = useMemo(() => {
    const counts = ROTATION_RANGES.map(() => 0);
    for (const exercise of history) {
      if (exercise.angleDelta === undefined) continue;
      const absAngle = Math.abs(exercise.angleDelta);
      const degrees = (absAngle * 180) / Math.PI;
      for (let i = 0; i < ROTATION_RANGES.length; i++) {
        if (degrees >= ROTATION_RANGES[i].min && degrees < ROTATION_RANGES[i].max) {
          counts[i]++;
          break;
        }
      }
    }
    return counts;
  }, [history]);

  return (
    <div className="position-by-rotation">
      <div className="rotation-range-selector">
        {ROTATION_RANGES.map((_, index) => (
          <button
            key={t.rotationRanges[index]}
            className={`rotation-range-btn ${selectedRange === index ? 'active' : ''}`}
            onClick={() => setSelectedRange(index)}
          >
            <span className="range-label">{t.rotationRanges[index]}</span>
            <span className="range-count">({rangeCounts[index]})</span>
          </button>
        ))}
      </div>

      <div className="rotation-range-info">
        <span className="range-exercises">
          {rangeStats.count} {t.exerciseCount}
        </span>
        {rangeStats.count > 0 && (
          <span
            className="range-avg-score"
            style={{
              color: rangeStats.avgScore >= 70 ? '#26a269' : rangeStats.avgScore >= 40 ? '#e5a50a' : '#c01c28',
            }}
          >
            {t.averageScoreLabel} {rangeStats.avgScore}
          </span>
        )}
      </div>

      <div className="rotation-heatmap-container">
        {rangeStats.count === 0 ? (
          <div className="rotation-empty">
            <p>{t.noDataForRotation}</p>
          </div>
        ) : (
          <HeatmapCanvas data={heatmapData} />
        )}
      </div>
    </div>
  );
}
