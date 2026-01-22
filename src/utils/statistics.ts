import {
  Exercise,
  StatsSummary,
  HeatmapData,
  CurveData,
  HEATMAP_MIN_X,
  HEATMAP_MAX_X,
  HEATMAP_MIN_Y,
  HEATMAP_MAX_Y,
  HEATMAP_GRID_WIDTH,
  HEATMAP_GRID_HEIGHT,
} from '../types';

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

// Transform a point from pixel coordinates to normalized heatmap coordinates
// The coordinate system is defined such that:
// - Blue point is at (+0.5, 0)
// - Red point is at (-0.5, 0)
// - The segment between them has length 1
function toNormalizedCoordinates(
  point: { x: number; y: number },
  darkBlue: { x: number; y: number },
  darkRed: { x: number; y: number }
): { x: number; y: number } {
  // Calculate midpoint of blue-red segment (this becomes the origin)
  const midX = (darkBlue.x + darkRed.x) / 2;
  const midY = (darkBlue.y + darkRed.y) / 2;

  // Calculate the segment length (this becomes 1 unit in normalized space)
  const dx = darkBlue.x - darkRed.x;
  const dy = darkBlue.y - darkRed.y;
  const segmentLength = Math.sqrt(dx * dx + dy * dy);

  if (segmentLength === 0) {
    return { x: 0, y: 0 };
  }

  // Unit vectors for the local coordinate system
  // X-axis: from red to blue (positive direction)
  const uxX = dx / segmentLength;
  const uxY = dy / segmentLength;
  // Y-axis: perpendicular to X-axis (90° counterclockwise)
  const uyX = -uxY;
  const uyY = uxX;

  // Transform point to local coordinates relative to midpoint
  const localX = point.x - midX;
  const localY = point.y - midY;

  // Project onto local coordinate system and normalize by segment length
  const normalizedX = (localX * uxX + localY * uxY) / segmentLength;
  const normalizedY = (localX * uyX + localY * uyY) / segmentLength;

  return { x: normalizedX, y: normalizedY };
}

// Convert normalized coordinates to grid cell indices
function coordinateToCell(x: number, y: number): { col: number; row: number } | null {
  // Check bounds
  if (x < HEATMAP_MIN_X || x > HEATMAP_MAX_X || y < HEATMAP_MIN_Y || y > HEATMAP_MAX_Y) {
    return null;
  }

  // Map to grid cell (70 columns, 50 rows)
  const col = Math.floor((x - HEATMAP_MIN_X) / (HEATMAP_MAX_X - HEATMAP_MIN_X) * HEATMAP_GRID_WIDTH);
  const row = Math.floor((y - HEATMAP_MIN_Y) / (HEATMAP_MAX_Y - HEATMAP_MIN_Y) * HEATMAP_GRID_HEIGHT);

  return {
    col: Math.max(0, Math.min(HEATMAP_GRID_WIDTH - 1, col)),
    row: Math.max(0, Math.min(HEATMAP_GRID_HEIGHT - 1, row)),
  };
}

// Generate heatmap data from exercise history
// Uses a 70x50 grid covering the coordinate space from (-3.5, -2.5) to (3.5, 2.5)
export function generateHeatmapData(history: Exercise[]): HeatmapData {
  const gridWidth = HEATMAP_GRID_WIDTH;
  const gridHeight = HEATMAP_GRID_HEIGHT;

  const scores: number[][] = [];
  const counts: number[][] = [];
  const sums: number[][] = [];

  // Initialize grids
  for (let y = 0; y < gridHeight; y++) {
    scores[y] = new Array(gridWidth).fill(0);
    counts[y] = new Array(gridWidth).fill(0);
    sums[y] = new Array(gridWidth).fill(0);
  }

  // Aggregate scores by normalized position
  for (const exercise of history) {
    if (!exercise.idealGreen || !exercise.darkBlue || !exercise.darkRed) continue;

    // Transform idealGreen to normalized coordinate system
    const normalized = toNormalizedCoordinates(
      exercise.idealGreen,
      exercise.darkBlue,
      exercise.darkRed
    );

    // Map to grid cell
    const cell = coordinateToCell(normalized.x, normalized.y);
    if (!cell) continue;

    sums[cell.row][cell.col] += exercise.score;
    counts[cell.row][cell.col]++;
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
