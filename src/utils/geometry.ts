import { Point } from '../types';

// Calculate distance between two points
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate angle from p1 to p2 (in radians, 0 to 2π)
export function angle(p1: Point, p2: Point): number {
  const a = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  return a < 0 ? a + 2 * Math.PI : a;
}

// Calculate the third point of a triangle given two points and the relative position
// from a model triangle
export function calculateThirdPoint(
  darkBlue: Point,
  darkRed: Point,
  modelBlue: Point,
  modelRed: Point,
  modelGreen: Point
): Point {
  // Vector from model blue to model red
  const modelVecX = modelRed.x - modelBlue.x;
  const modelVecY = modelRed.y - modelBlue.y;
  const modelLen = Math.sqrt(modelVecX * modelVecX + modelVecY * modelVecY);

  // Vector from model blue to model green
  const greenVecX = modelGreen.x - modelBlue.x;
  const greenVecY = modelGreen.y - modelBlue.y;

  // Express green position in terms of the blue-red axis
  // Decompose into parallel and perpendicular components
  const unitX = modelVecX / modelLen;
  const unitY = modelVecY / modelLen;

  // Parallel component (along blue-red axis)
  const parallel = greenVecX * unitX + greenVecY * unitY;
  // Perpendicular component
  const perpendicular = greenVecX * (-unitY) + greenVecY * unitX;

  // Ratios relative to model distance
  const parallelRatio = parallel / modelLen;
  const perpendicularRatio = perpendicular / modelLen;

  // Apply to dark blue-red axis
  const darkVecX = darkRed.x - darkBlue.x;
  const darkVecY = darkRed.y - darkBlue.y;
  const darkLen = Math.sqrt(darkVecX * darkVecX + darkVecY * darkVecY);

  const darkUnitX = darkVecX / darkLen;
  const darkUnitY = darkVecY / darkLen;

  // Calculate ideal green position
  return {
    x: darkBlue.x + darkLen * (parallelRatio * darkUnitX - perpendicularRatio * darkUnitY),
    y: darkBlue.y + darkLen * (parallelRatio * darkUnitY + perpendicularRatio * darkUnitX),
  };
}

// Generate a random point within bounds with margin
export function randomPoint(
  width: number,
  height: number,
  marginPercent: number
): Point {
  const marginX = width * marginPercent / 100;
  const marginY = height * marginPercent / 100;
  return {
    x: marginX + Math.random() * (width - 2 * marginX),
    y: marginY + Math.random() * (height - 2 * marginY),
  };
}

// Check if a point is within bounds with margin
export function isWithinBounds(
  point: Point,
  width: number,
  height: number,
  marginPercent: number
): boolean {
  const marginX = width * marginPercent / 100;
  const marginY = height * marginPercent / 100;
  return (
    point.x >= marginX &&
    point.x <= width - marginX &&
    point.y >= marginY &&
    point.y <= height - marginY
  );
}

// Calculate ratio between two distances
export function calculateRatio(d1: number, d2: number): number {
  if (d2 === 0) return 1;
  return d1 / d2;
}

// Normalize angle to 0-2π range
export function normalizeAngle(a: number): number {
  while (a < 0) a += 2 * Math.PI;
  while (a >= 2 * Math.PI) a -= 2 * Math.PI;
  return a;
}

// Rotate a point around origin by angle
export function rotatePoint(point: Point, origin: Point, angleRad: number): Point {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
}
