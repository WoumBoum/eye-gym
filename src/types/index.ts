// Point and Vector types
export interface Point {
  x: number;
  y: number;
}

// Exercise data
export interface Exercise {
  id: string;
  timestamp: number;
  // Model triangle (light colors)
  modelBlue: Point;
  modelRed: Point;
  modelGreen: Point;
  // User triangle (dark colors)
  darkBlue: Point;
  darkRed: Point;
  idealGreen: Point;
  userGreen: Point | null;
  // Parameters - stored as bucket indices for exploration tracking
  positionBucketX: number;
  positionBucketY: number;
  ratioBucket: number;
  angleBucket: number;
  // Raw values
  ratio: number;
  angle: number;
  // Result
  score: number;
  distance: number;
}

// Settings
export interface Settings {
  exerciseDuration: number; // seconds (5-30)
  timerEnabled: boolean; // whether timer is enabled
  marginPercent: number; // screen margin (5-15%)
  maxAngleDelta: number; // max rotation delta in radians (0 to π)
  sigma1: number; // F1 gradient spread
  sigma2: number; // F2 gradient spread
  sigma3: number; // F3 gradient spread
  learningRate: number; // gradient update rate
  darkMode: boolean; // dark mode theme
  pointSize: number; // size of points in pixels (12-36)
}

// Gradient grids
export interface GradientF1 {
  width: number; // 70
  height: number; // 50
  weights: number[][]; // normalized weights for position sampling
}

export interface GradientF2 {
  buckets: number; // 15
  weights: number[]; // weights for ratio sampling (0.5 to 2.0)
  minRatio: number;
  maxRatio: number;
}

export interface GradientF3 {
  buckets: number; // 24
  weights: number[]; // weights for angle sampling (0 to 2π)
}

export interface Gradients {
  f1: GradientF1;
  f2: GradientF2;
  f3: GradientF3;
}

// Exploration tracking - which parameter combinations have been tested
export interface ExplorationState {
  // Simplified grid for exploration (smaller than gradient grid)
  positionGrid: boolean[][]; // 10x7 grid
  ratioTested: boolean[]; // 15 buckets
  angleTested: boolean[]; // 24 buckets
  explorationComplete: boolean;
}

// Profile data - contains all user-specific data
export interface Profile {
  id: string;
  name: string;
  createdAt: number;
  lastPlayedAt: number;
  settings: Settings;
  gradients: Gradients;
  history: Exercise[];
  exploration: ExplorationState;
}

// Statistics
export interface StatsSummary {
  totalExercises: number;
  averageScore: number;
  last10Average: number;
  bestScore: number;
}

export interface HeatmapData {
  width: number;
  height: number;
  scores: number[][]; // average score per cell
  counts: number[][]; // number of exercises per cell
}

export interface CurveData {
  labels: number[];
  scores: number[];
  counts: number[];
}

// Timeline data for evolution view
export interface TimelineSnapshot {
  timestamp: number;
  heatmap: HeatmapData;
  ratioCurve: CurveData;
  angleCurve: CurveData;
  averageScore: number;
  totalExercises: number;
}

// Game phase
export type GamePhase = 'placement' | 'feedback' | 'transition';

// Screen navigation
export type Screen = 'menu' | 'game' | 'statistics' | 'settings' | 'profiles';

// Storage keys
export const STORAGE_KEY = 'eye_gym_v1';
export const PROFILES_KEY = `${STORAGE_KEY}_profiles`;
export const CURRENT_PROFILE_KEY = `${STORAGE_KEY}_current_profile`;

// Exploration grid dimensions (simplified)
export const EXPLORATION_GRID_WIDTH = 10;
export const EXPLORATION_GRID_HEIGHT = 7;
export const EXPLORATION_RATIO_BUCKETS = 15;
export const EXPLORATION_ANGLE_BUCKETS = 24;
