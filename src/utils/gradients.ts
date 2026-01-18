import { GradientF1, GradientF2, GradientF3, Gradients, Point } from '../types';

// Create default F1 gradient (position, 70x50 grid)
export function createDefaultF1(): GradientF1 {
  const width = 70;
  const height = 50;
  const weights: number[][] = [];

  for (let y = 0; y < height; y++) {
    weights[y] = [];
    for (let x = 0; x < width; x++) {
      weights[y][x] = 1.0; // Uniform initial weights
    }
  }

  return { width, height, weights };
}

// Create default F2 gradient (ratio, 15 buckets for 0.5 to 2.0)
export function createDefaultF2(): GradientF2 {
  const buckets = 15;
  const weights = new Array(buckets).fill(1.0);
  return {
    buckets,
    weights,
    minRatio: 0.5,
    maxRatio: 2.0,
  };
}

// Create default F3 gradient (angle, 24 buckets for 0 to 2π)
export function createDefaultF3(): GradientF3 {
  const buckets = 24;
  const weights = new Array(buckets).fill(1.0);
  return { buckets, weights };
}

// Create all default gradients
export function createDefaultGradients(): Gradients {
  return {
    f1: createDefaultF1(),
    f2: createDefaultF2(),
    f3: createDefaultF3(),
  };
}

// Update F1 gradient based on exercise result
export function updateF1(
  f1: GradientF1,
  normalizedX: number, // 0-1
  normalizedY: number, // 0-1
  score: number,
  sigma: number,
  learningRate: number
): GradientF1 {
  const newWeights = f1.weights.map(row => [...row]);
  const centerX = normalizedX * f1.width;
  const centerY = normalizedY * f1.height;
  const sigma2 = sigma * sigma;

  // Score adjustment: high score = decrease weight (mastered), low score = increase
  const adjustment = score > 70 ? -learningRate : learningRate;

  for (let y = 0; y < f1.height; y++) {
    for (let x = 0; x < f1.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist2 = dx * dx + dy * dy;
      const influence = Math.exp(-dist2 / (2 * sigma2));

      newWeights[y][x] = Math.max(0.1, newWeights[y][x] + adjustment * influence);
    }
  }

  // Normalize weights
  normalizeGrid(newWeights);

  return { ...f1, weights: newWeights };
}

// Update F2 gradient based on ratio result
export function updateF2(
  f2: GradientF2,
  ratio: number,
  score: number,
  sigma: number,
  learningRate: number
): GradientF2 {
  const newWeights = [...f2.weights];
  const normalizedRatio = (ratio - f2.minRatio) / (f2.maxRatio - f2.minRatio);
  const centerBucket = normalizedRatio * f2.buckets;
  const sigma2 = sigma * sigma;

  const adjustment = score > 70 ? -learningRate : learningRate;

  for (let i = 0; i < f2.buckets; i++) {
    const dist = i - centerBucket;
    const influence = Math.exp(-(dist * dist) / (2 * sigma2));
    newWeights[i] = Math.max(0.1, newWeights[i] + adjustment * influence);
  }

  // Normalize
  normalizeArray(newWeights);

  return { ...f2, weights: newWeights };
}

// Update F3 gradient based on angle result
export function updateF3(
  f3: GradientF3,
  angle: number, // 0 to 2π
  score: number,
  sigma: number,
  learningRate: number
): GradientF3 {
  const newWeights = [...f3.weights];
  const normalizedAngle = angle / (2 * Math.PI);
  const centerBucket = normalizedAngle * f3.buckets;
  const sigma2 = sigma * sigma;

  const adjustment = score > 70 ? -learningRate : learningRate;

  for (let i = 0; i < f3.buckets; i++) {
    // Handle circular distance for angles
    let dist = Math.abs(i - centerBucket);
    if (dist > f3.buckets / 2) {
      dist = f3.buckets - dist;
    }
    const influence = Math.exp(-(dist * dist) / (2 * sigma2));
    newWeights[i] = Math.max(0.1, newWeights[i] + adjustment * influence);
  }

  // Normalize
  normalizeArray(newWeights);

  return { ...f3, weights: newWeights };
}

// Helper: normalize a 2D grid so sum = 1
function normalizeGrid(grid: number[][]): void {
  let sum = 0;
  for (const row of grid) {
    for (const val of row) {
      sum += val;
    }
  }
  if (sum > 0) {
    for (const row of grid) {
      for (let i = 0; i < row.length; i++) {
        row[i] /= sum;
      }
    }
  }
}

// Helper: normalize a 1D array so sum = 1
function normalizeArray(arr: number[]): void {
  let sum = 0;
  for (const val of arr) {
    sum += val;
  }
  if (sum > 0) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] /= sum;
    }
  }
}

// Get bucket index for a ratio value
export function getRatioBucket(f2: GradientF2, ratio: number): number {
  const normalized = (ratio - f2.minRatio) / (f2.maxRatio - f2.minRatio);
  return Math.min(f2.buckets - 1, Math.max(0, Math.floor(normalized * f2.buckets)));
}

// Get bucket index for an angle value
export function getAngleBucket(f3: GradientF3, angle: number): number {
  const normalized = angle / (2 * Math.PI);
  return Math.min(f3.buckets - 1, Math.max(0, Math.floor(normalized * f3.buckets)));
}

// Get grid cell for a position
export function getPositionCell(f1: GradientF1, point: Point, width: number, height: number): { x: number; y: number } {
  const normalizedX = point.x / width;
  const normalizedY = point.y / height;
  return {
    x: Math.min(f1.width - 1, Math.max(0, Math.floor(normalizedX * f1.width))),
    y: Math.min(f1.height - 1, Math.max(0, Math.floor(normalizedY * f1.height))),
  };
}
