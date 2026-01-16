/**
 * Badge system utilities
 */

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

export type BadgeType = 
  | 'first_hunt' 
  | 'ten_hunts' 
  | 'speed_demon' 
  | 'perfect_score'
  | 'explorer'

const BADGE_DEFINITIONS: Record<BadgeType, Omit<Badge, 'unlocked' | 'unlockedAt'>> = {
  first_hunt: {
    id: 'first_hunt',
    name: 'Premier pas',
    description: 'Complétez votre premier jeu de piste',
    icon: '🎯',
  },
  ten_hunts: {
    id: 'ten_hunts',
    name: 'Explorateur',
    description: 'Complétez 10 jeux de piste',
    icon: '🏆',
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Rapide comme l\'éclair',
    description: 'Complétez un jeu en moins de 5 minutes',
    icon: '⚡',
  },
  perfect_score: {
    id: 'perfect_score',
    name: 'Parfait',
    description: 'Obtenez un score parfait sur un jeu',
    icon: '⭐',
  },
  explorer: {
    id: 'explorer',
    name: 'Explorateur',
    description: 'Visitez 5 emplacements différents',
    icon: '🗺️',
  },
}

export function getBadgeDefinition(type: BadgeType): Omit<Badge, 'unlocked' | 'unlockedAt'> {
  return BADGE_DEFINITIONS[type]
}

export function getAllBadges(): Omit<Badge, 'unlocked' | 'unlockedAt'>[] {
  return Object.values(BADGE_DEFINITIONS)
}

/**
 * Check if badge should be unlocked based on user stats
 * This is a simplified version - in production, this would check against actual user data
 */
export function checkBadgeEligibility(
  badgeType: BadgeType,
  stats: {
    completedHunts: number
    fastestTime?: number
    bestScore?: number
    locationsVisited?: number
  }
): boolean {
  switch (badgeType) {
    case 'first_hunt':
      return stats.completedHunts >= 1
    case 'ten_hunts':
      return stats.completedHunts >= 10
    case 'speed_demon':
      return stats.fastestTime !== undefined && stats.fastestTime < 300 // 5 minutes
    case 'perfect_score':
      return stats.bestScore !== undefined && stats.bestScore >= 1000 // Example threshold
    case 'explorer':
      return (stats.locationsVisited || 0) >= 5
    default:
      return false
  }
}
