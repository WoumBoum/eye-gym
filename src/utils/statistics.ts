import { Exercise, StatsSummary, HeatmapData, CurveData } from '../types';

// Calculate summary statistics
export function calculateStats(history: Exercise[]): StatsSummary {
  if (history.length === 0) {
    return {
      totalExercises: 0,
      averageScore: 0,
      last10Average: 0,
      bestScore: 0,
    };
  }

  const scores = history.map(e => e.score);
  const totalExercises = history.length;
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const last10 = scores.slice(-10);
  const last10Average = last10.reduce((a, b) => a + b, 0) / last10.length;
  const bestScore = Math.max(...scores);

  return {
    totalExercises,
    averageScore: Math.round(averageScore * 10) / 10,
    last10Average: Math.round(last10Average * 10) / 10,
    bestScore: Math.round(bestScore * 10) / 10,
  };
}

// Generate heatmap data from exercise history
export function generateHeatmapData(
  history: Exercise[],
  gridWidth: number = 20,
  gridHeight: number = 14
): HeatmapData {
  const scores: number[][] = [];
  const counts: number[][] = [];
  const sums: number[][] = [];

  // Initialize grids
  for (let y = 0; y < gridHeight; y++) {
    scores[y] = new Array(gridWidth).fill(0);
    counts[y] = new Array(gridWidth).fill(0);
    sums[y] = new Array(gridWidth).fill(0);
  }

  // Aggregate scores by position (using idealGreen position)
  for (const exercise of history) {
    if (!exercise.idealGreen) continue;

    // We need to know the canvas size at the time of the exercise
    // For now, use normalized positions (0-1 range)
    // Assuming positions were stored as absolute pixels, we normalize
    // This is a simplification - in practice, you'd store normalized positions

    // Use the relative position within a typical canvas
    const normalizedX = Math.min(1, Math.max(0, exercise.idealGreen.x / 1000));
    const normalizedY = Math.min(1, Math.max(0, exercise.idealGreen.y / 700));

    const gridX = Math.min(gridWidth - 1, Math.floor(normalizedX * gridWidth));
    const gridY = Math.min(gridHeight - 1, Math.floor(normalizedY * gridHeight));

    sums[gridY][gridX] += exercise.score;
    counts[gridY][gridX]++;
  }

  // Calculate averages
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (counts[y][x] > 0) {
        scores[y][x] = sums[y][x] / counts[y][x];
      }
    }
  }

  return { width: gridWidth, height: gridHeight, scores, counts };
}

// Generate ratio curve data
export function generateRatioCurve(history: Exercise[], buckets: number = 15): CurveData {
  const minRatio = 0.5;
  const maxRatio = 2.0;
  const bucketWidth = (maxRatio - minRatio) / buckets;

  const labels: number[] = [];
  const scores: number[] = new Array(buckets).fill(0);
  const counts: number[] = new Array(buckets).fill(0);
  const sums: number[] = new Array(buckets).fill(0);

  // Generate bucket labels
  for (let i = 0; i < buckets; i++) {
    labels.push(Math.round((minRatio + (i + 0.5) * bucketWidth) * 100) / 100);
  }

  // Aggregate by ratio
  for (const exercise of history) {
    const ratio = exercise.ratio;
    if (ratio < minRatio || ratio > maxRatio) continue;

    const bucket = Math.min(buckets - 1, Math.floor((ratio - minRatio) / bucketWidth));
    sums[bucket] += exercise.score;
    counts[bucket]++;
  }

  // Calculate averages
  for (let i = 0; i < buckets; i++) {
    if (counts[i] > 0) {
      scores[i] = Math.round((sums[i] / counts[i]) * 10) / 10;
    }
  }

  return { labels, scores, counts };
}

// Generate angle curve data (angle of green point relative to blue-red line)
export function generateAngleCurve(history: Exercise[], buckets: number = 24): CurveData {
  const bucketWidth = (2 * Math.PI) / buckets;

  const labels: number[] = [];
  const scores: number[] = new Array(buckets).fill(0);
  const counts: number[] = new Array(buckets).fill(0);
  const sums: number[] = new Array(buckets).fill(0);

  // Generate bucket labels (in degrees)
  for (let i = 0; i < buckets; i++) {
    labels.push(Math.round(((i + 0.5) * bucketWidth * 180) / Math.PI));
  }

  // Aggregate by angle
  for (const exercise of history) {
    const angle = exercise.angle;
    const bucket = Math.min(buckets - 1, Math.floor(angle / bucketWidth));
    sums[bucket] += exercise.score;
    counts[bucket]++;
  }

  // Calculate averages
  for (let i = 0; i < buckets; i++) {
    if (counts[i] > 0) {
      scores[i] = Math.round((sums[i] / counts[i]) * 10) / 10;
    }
  }

  return { labels, scores, counts };
}

// Generate angle delta curve data (rotation between model and dark triangles)
export function generateAngleDeltaCurve(history: Exercise[], buckets: number = 12): CurveData {
  // angleDelta ranges from -π to +π, we use absolute value (0 to π)
  const bucketWidth = Math.PI / buckets;

  const labels: number[] = [];
  const scores: number[] = new Array(buckets).fill(0);
  const counts: number[] = new Array(buckets).fill(0);
  const sums: number[] = new Array(buckets).fill(0);

  // Generate bucket labels (in degrees, 0° to 180°)
  for (let i = 0; i < buckets; i++) {
    labels.push(Math.round(((i + 0.5) * bucketWidth * 180) / Math.PI));
  }

  // Aggregate by absolute angleDelta
  for (const exercise of history) {
    // Handle old exercises that don't have angleDelta
    if (exercise.angleDelta === undefined) continue;

    const absAngleDelta = Math.abs(exercise.angleDelta);
    const bucket = Math.min(buckets - 1, Math.floor(absAngleDelta / bucketWidth));
    sums[bucket] += exercise.score;
    counts[bucket]++;
  }

  // Calculate averages
  for (let i = 0; i < buckets; i++) {
    if (counts[i] > 0) {
      scores[i] = Math.round((sums[i] / counts[i]) * 10) / 10;
    }
  }

  return { labels, scores, counts };
}
