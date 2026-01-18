import { Point } from '../types';
import { distance } from './geometry';

// Calculate score based on distance from ideal position
// score = max(0, 100 × (1 - distance / maxError))
// where maxError = dist(darkBlue, darkRed) × 0.5
export function calculateScore(
  userPoint: Point,
  idealPoint: Point,
  darkBlue: Point,
  darkRed: Point
): { score: number; distance: number } {
  const userDistance = distance(userPoint, idealPoint);
  const referenceDistance = distance(darkBlue, darkRed);
  const maxError = referenceDistance * 0.5;

  const score = Math.max(0, 100 * (1 - userDistance / maxError));

  return {
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    distance: Math.round(userDistance * 10) / 10,
  };
}

// Get score color based on value
export function getScoreColor(score: number): string {
  if (score >= 80) return '#26a269'; // Green - excellent
  if (score >= 60) return '#e5a50a'; // Yellow - good
  if (score >= 40) return '#ff7800'; // Orange - fair
  return '#c01c28'; // Red - needs improvement
}

// Get feedback text based on score
export function getScoreFeedback(score: number): string {
  if (score >= 90) return 'Excellent !';
  if (score >= 80) return 'Très bien !';
  if (score >= 70) return 'Bien !';
  if (score >= 60) return 'Pas mal !';
  if (score >= 40) return 'Peut mieux faire';
  return 'Continuez à pratiquer';
}
