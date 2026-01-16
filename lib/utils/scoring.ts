/**
 * Scoring system utilities
 */

export interface ScoreCalculation {
  basePoints: number
  timeBonus: number
  totalScore: number
}

/**
 * Calculate score based on completion time and base points
 * @param basePoints - Base points for completing the step
 * @param timeInSeconds - Time taken to complete in seconds
 * @param maxTime - Maximum time for full bonus (in seconds)
 * @returns Score calculation object
 */
export function calculateScore(
  basePoints: number = 100,
  timeInSeconds: number = 0,
  maxTime: number = 300 // 5 minutes default
): ScoreCalculation {
  // Time bonus decreases linearly from 100% to 0%
  const timeBonus = Math.max(0, Math.floor((maxTime - timeInSeconds) / maxTime * 50))
  
  return {
    basePoints,
    timeBonus,
    totalScore: basePoints + timeBonus,
  }
}

/**
 * Calculate total hunt score from individual step scores
 */
export function calculateTotalScore(stepScores: number[]): number {
  return stepScores.reduce((total, score) => total + score, 0)
}
