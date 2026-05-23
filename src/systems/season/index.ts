// ============================================
// 四季系统
// ============================================

import { SEASON_ORDER, SEASON_DURATION_DAYS } from '@/configs/economy'
import type { Season } from '@/configs/crops'

export interface SeasonState {
  currentSeason: 'spring' | 'summer' | 'autumn' | 'winter'
  dayInSeason: number
  seasonStartedAt: number // 时间戳
}

export function createInitialSeasonState(): SeasonState {
  return {
    currentSeason: 'spring',
    dayInSeason: 1,
    seasonStartedAt: Date.now(),
  }
}

export function getCurrentSeasonInfo(state: SeasonState): {
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  dayInSeason: number
  daysRemaining: number
  isLastDay: boolean
} {
  const elapsed = Date.now() - state.seasonStartedAt
  const dayInSeason = Math.min(
    Math.floor(elapsed / (86400000)) + 1,
    SEASON_DURATION_DAYS
  )
  const currentSeason = state.currentSeason

  return {
    season: currentSeason,
    dayInSeason,
    daysRemaining: SEASON_DURATION_DAYS - dayInSeason,
    isLastDay: dayInSeason >= SEASON_DURATION_DAYS,
  }
}

export function advanceSeason(state: SeasonState): SeasonState {
  const currentIdx = SEASON_ORDER.indexOf(state.currentSeason)
  const nextIdx = (currentIdx + 1) % SEASON_ORDER.length
  return {
    currentSeason: SEASON_ORDER[nextIdx],
    dayInSeason: 1,
    seasonStartedAt: Date.now(),
  }
}

export function getSeasonEmoji(season: Season | 'spring' | 'summer' | 'autumn' | 'winter'): string {
  switch (season) {
    case 'spring': return '🌸'
    case 'summer': return '☀️'
    case 'autumn': return '🍂'
    case 'winter': return '❄️'
    default: return '🌿'
  }
}

export function getSeasonName(season: Season | 'spring' | 'summer' | 'autumn' | 'winter'): string {
  switch (season) {
    case 'spring': return '春天'
    case 'summer': return '夏天'
    case 'autumn': return '秋天'
    case 'winter': return '冬天'
    default: return '四季'
  }
}
