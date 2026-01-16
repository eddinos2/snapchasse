/**
 * Achievements and badges system
 */

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon?: string
  category: 'hunt' | 'speed' | 'accuracy' | 'social' | 'streak'
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon?: string
  color?: string
  condition_type: string
  condition_value: number
}

export interface UserProgress {
  totalHunts: number
  totalScore: number
  winStreak: number
  perfectRuns: number
  totalTime: number
}

/**
 * Check if user qualifies for achievements based on progress
 */
export function checkAchievements(
  userProgress: UserProgress,
  completedHuntId: string,
  timeTaken: number,
  perfectRun: boolean
): string[] {
  const achieved: string[] = []

  // First hunt
  if (userProgress.totalHunts === 1) {
    achieved.push('first_hunt')
  }

  // Speed demon
  if (timeTaken < 600) { // Less than 10 minutes
    achieved.push('speed_demon')
  }

  // Perfect run
  if (perfectRun) {
    achieved.push('perfect_run')
  }

  // Explorer
  if (userProgress.totalHunts >= 10) {
    achieved.push('explorer')
  }

  // Early bird (check time, this should be done server-side)
  // This is just a placeholder

  return achieved
}

/**
 * Check if user qualifies for badges based on progress
 */
export function checkBadges(userProgress: UserProgress): string[] {
  const earned: string[] = []

  // Bronze hunter
  if (userProgress.totalHunts >= 5) {
    earned.push('bronze_hunter')
  }

  // Silver hunter
  if (userProgress.totalHunts >= 25) {
    earned.push('silver_hunter')
  }

  // Gold hunter
  if (userProgress.totalHunts >= 100) {
    earned.push('gold_hunter')
  }

  // Score master
  if (userProgress.totalScore >= 10000) {
    earned.push('score_master')
  }

  // Win streak 5
  if (userProgress.winStreak >= 5) {
    earned.push('win_streak_5')
  }

  // Win streak 10
  if (userProgress.winStreak >= 10) {
    earned.push('win_streak_10')
  }

  return earned
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  const colors = {
    common: 'text-gray-600 bg-gray-100',
    rare: 'text-blue-600 bg-blue-100',
    epic: 'text-purple-600 bg-purple-100',
    legendary: 'text-yellow-600 bg-yellow-100',
  }
  return colors[rarity]
}
