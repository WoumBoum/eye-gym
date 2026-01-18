import {
  GradientF1,
  GradientF2,
  GradientF3,
  Point,
  Exercise,
  ExplorationState,
  EXPLORATION_GRID_WIDTH,
  EXPLORATION_GRID_HEIGHT,
} from '../types';

// Calculate temperature based on recent performance
export function calculateTemperature(recentScores: number[]): number {
  if (recentScores.length === 0) return 1.0;

  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  return 0.5 + (avg / 100) * 1.5;
}

// Apply temperature to weights for sampling
function applyTemperature(weights: number[], temperature: number): number[] {
  const powered = weights.map(w => Math.pow(w, 1 / temperature));
  const sum = powered.reduce((a, b) => a + b, 0);
  return powered.map(w => w / sum);
}

// Sample from 1D weighted distribution
function sampleWeighted(weights: number[]): number {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (r <= cumulative) return i;
  }
  return weights.length - 1;
}

// Get untested positions during exploration phase
function getUntestedPositions(exploration: ExplorationState): { x: number; y: number }[] {
  const untested: { x: number; y: number }[] = [];
  for (let y = 0; y < exploration.positionGrid.length; y++) {
    for (let x = 0; x < exploration.positionGrid[y].length; x++) {
      if (!exploration.positionGrid[y][x]) {
        untested.push({ x, y });
      }
    }
  }
  return untested;
}

// Get untested ratio buckets
function getUntestedRatios(exploration: ExplorationState): number[] {
  return exploration.ratioTested
    .map((tested, i) => tested ? -1 : i)
    .filter(i => i >= 0);
}

// Get untested angle buckets
function getUntestedAngles(exploration: ExplorationState): number[] {
  return exploration.angleTested
    .map((tested, i) => tested ? -1 : i)
    .filter(i => i >= 0);
}

// Sample position - with exploration priority
export function samplePositionWithExploration(
  f1: GradientF1,
  temperature: number,
  canvasWidth: number,
  canvasHeight: number,
  marginPercent: number,
  exploration: ExplorationState
): { point: Point; bucketX: number; bucketY: number } {
  const margin = marginPercent / 100;
  const effectiveWidth = canvasWidth * (1 - 2 * margin);
  const effectiveHeight = canvasHeight * (1 - 2 * margin);

  let bucketX: number;
  let bucketY: number;

  // During exploration, prioritize untested positions
  if (!exploration.explorationComplete) {
    const untested = getUntestedPositions(exploration);
    if (untested.length > 0) {
      // Pick a random untested position
      const chosen = untested[Math.floor(Math.random() * untested.length)];
      bucketX = chosen.x;
      bucketY = chosen.y;

      const cellWidth = effectiveWidth / EXPLORATION_GRID_WIDTH;
      const cellHeight = effectiveHeight / EXPLORATION_GRID_HEIGHT;

      return {
        point: {
          x: canvasWidth * margin + bucketX * cellWidth + Math.random() * cellWidth,
          y: canvasHeight * margin + bucketY * cellHeight + Math.random() * cellHeight,
        },
        bucketX,
        bucketY,
      };
    }
  }

  // Normal weighted sampling
  const flatWeights: number[] = [];
  for (let y = 0; y < f1.height; y++) {
    for (let x = 0; x < f1.width; x++) {
      flatWeights.push(f1.weights[y][x]);
    }
  }

  const temperedWeights = applyTemperature(flatWeights, temperature);
  const index = sampleWeighted(temperedWeights);

  const gridX = index % f1.width;
  const gridY = Math.floor(index / f1.width);

  // Map to exploration grid
  bucketX = Math.floor((gridX / f1.width) * EXPLORATION_GRID_WIDTH);
  bucketY = Math.floor((gridY / f1.height) * EXPLORATION_GRID_HEIGHT);

  const cellWidth = effectiveWidth / f1.width;
  const cellHeight = effectiveHeight / f1.height;

  return {
    point: {
      x: canvasWidth * margin + gridX * cellWidth + Math.random() * cellWidth,
      y: canvasHeight * margin + gridY * cellHeight + Math.random() * cellHeight,
    },
    bucketX: Math.min(bucketX, EXPLORATION_GRID_WIDTH - 1),
    bucketY: Math.min(bucketY, EXPLORATION_GRID_HEIGHT - 1),
  };
}

// Sample ratio - with exploration priority
export function sampleRatioWithExploration(
  f2: GradientF2,
  temperature: number,
  exploration: ExplorationState
): { ratio: number; bucket: number } {
  let bucket: number;

  // During exploration, prioritize untested ratios
  if (!exploration.explorationComplete) {
    const untested = getUntestedRatios(exploration);
    if (untested.length > 0) {
      bucket = untested[Math.floor(Math.random() * untested.length)];
      const bucketWidth = (f2.maxRatio - f2.minRatio) / f2.buckets;
      return {
        ratio: f2.minRatio + bucket * bucketWidth + Math.random() * bucketWidth,
        bucket,
      };
    }
  }

  // Normal weighted sampling
  const temperedWeights = applyTemperature(f2.weights, temperature);
  bucket = sampleWeighted(temperedWeights);

  const bucketWidth = (f2.maxRatio - f2.minRatio) / f2.buckets;
  return {
    ratio: f2.minRatio + bucket * bucketWidth + Math.random() * bucketWidth,
    bucket,
  };
}

// Sample angle - with exploration priority
export function sampleAngleWithExploration(
  f3: GradientF3,
  temperature: number,
  exploration: ExplorationState
): { angle: number; bucket: number } {
  let bucket: number;

  // During exploration, prioritize untested angles
  if (!exploration.explorationComplete) {
    const untested = getUntestedAngles(exploration);
    if (untested.length > 0) {
      bucket = untested[Math.floor(Math.random() * untested.length)];
      const bucketWidth = (2 * Math.PI) / f3.buckets;
      return {
        angle: bucket * bucketWidth + Math.random() * bucketWidth,
        bucket,
      };
    }
  }

  // Normal weighted sampling
  const temperedWeights = applyTemperature(f3.weights, temperature);
  bucket = sampleWeighted(temperedWeights);

  const bucketWidth = (2 * Math.PI) / f3.buckets;
  return {
    angle: bucket * bucketWidth + Math.random() * bucketWidth,
    bucket,
  };
}

// Legacy functions for compatibility
export function samplePosition(
  f1: GradientF1,
  temperature: number,
  canvasWidth: number,
  canvasHeight: number,
  marginPercent: number
): Point {
  const margin = marginPercent / 100;
  const effectiveWidth = canvasWidth * (1 - 2 * margin);
  const effectiveHeight = canvasHeight * (1 - 2 * margin);

  const flatWeights: number[] = [];
  for (let y = 0; y < f1.height; y++) {
    for (let x = 0; x < f1.width; x++) {
      flatWeights.push(f1.weights[y][x]);
    }
  }

  const temperedWeights = applyTemperature(flatWeights, temperature);
  const index = sampleWeighted(temperedWeights);

  const gridX = index % f1.width;
  const gridY = Math.floor(index / f1.width);

  const cellWidth = effectiveWidth / f1.width;
  const cellHeight = effectiveHeight / f1.height;

  return {
    x: canvasWidth * margin + gridX * cellWidth + Math.random() * cellWidth,
    y: canvasHeight * margin + gridY * cellHeight + Math.random() * cellHeight,
  };
}

export function sampleRatio(f2: GradientF2, temperature: number): number {
  const temperedWeights = applyTemperature(f2.weights, temperature);
  const bucket = sampleWeighted(temperedWeights);
  const bucketWidth = (f2.maxRatio - f2.minRatio) / f2.buckets;
  return f2.minRatio + bucket * bucketWidth + Math.random() * bucketWidth;
}

export function sampleAngle(f3: GradientF3, temperature: number): number {
  const temperedWeights = applyTemperature(f3.weights, temperature);
  const bucket = sampleWeighted(temperedWeights);
  const bucketWidth = (2 * Math.PI) / f3.buckets;
  return bucket * bucketWidth + Math.random() * bucketWidth;
}

export function getRecentScores(history: Exercise[], n: number = 10): number[] {
  return history.slice(-n).map(e => e.score);
}
