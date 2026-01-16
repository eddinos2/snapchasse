/**
 * Statistics utilities for hunts
 */

export interface HuntStats {
  participant_count: number
  completion_count: number
  avg_time: number | null
  avg_score: number | null
  completion_rate: number
}

export function formatTime(seconds: number | null): string {
  if (seconds === null || seconds === 0) return 'N/A'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function formatCompletionRate(rate: number): string {
  return `${Math.round(rate)}%`
}
