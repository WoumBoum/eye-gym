import { Point } from '../types';
import { distance } from './geometry';

// Calculate score based on distance from ideal position
// Uses Gaussian decay: score = 100 × exp(-(distance/σ)²)
// This gives:
// - 100 for pixel perfect
// - Quick drop for small errors
// - Slower drop for larger errors (asymptotic to 0)
// - Score 0 is as improbable as score 100
export function calculateScore(
  userPoint: Point,
  idealPoint: Point,
  darkBlue: Point,
  darkRed: Point
): { score: number; distance: number } {
  const userDistance = distance(userPoint, idealPoint);
  const referenceDistance = distance(darkBlue, darkRed);

  // Sigma controls the spread - at distance = sigma, score ≈ 37
  // At distance = 2*sigma, score ≈ 1.8
  const sigma = referenceDistance * 0.4;

  const normalizedDistance = userDistance / sigma;
  const score = 100 * Math.exp(-normalizedDistance * normalizedDistance);

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
