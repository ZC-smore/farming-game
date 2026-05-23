// ============================================
// 花卉配置
// ============================================

export type FlowerId = 'daisy' | 'rose' | 'sunflower' | 'lavender' | 'tulip' | 'lily'
export type FlowerRarity = 'common' | 'rare' | 'epic' | 'legend'
import type { Season } from './crops'

export interface FlowerConfig {
  id: FlowerId
  name: string
  emoji: string
  rarity: FlowerRarity
  season: Season
  source: 'shop' | 'event' | 'rank' | 'voucher' | 'share'
  growTimeSeconds: number
  waterCost: number
  sellPrice: number
  processedName: string
  processedEmoji: string
  processedPrice: number
  processTimeSeconds: number
  seedPrice: number
  unlockLevel: number
  stages: string[]
}

export const FLOWER_CONFIGS: Record<FlowerId, FlowerConfig> = {
  daisy: {
    id: 'daisy',
    name: '雏菊',
    emoji: '🌼',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 90,
    waterCost: 3,
    sellPrice: 8,
    processedName: '雏菊束',
    processedEmoji: '💐',
    processedPrice: 20,
    processTimeSeconds: 45,
    seedPrice: 8,
    unlockLevel: 5,
    stages: ['🌱', '🌿', '🌼', '🌼'],
  },
  rose: {
    id: 'rose',
    name: '玫瑰',
    emoji: '🌹',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 120,
    waterCost: 3,
    sellPrice: 12,
    processedName: '香水',
    processedEmoji: '🧴',
    processedPrice: 35,
    processTimeSeconds: 60,
    seedPrice: 12,
    unlockLevel: 5,
    stages: ['🌱', '🌿', '🌹', '🌹'],
  },
  sunflower: {
    id: 'sunflower',
    name: '向日葵',
    emoji: '🌻',
    rarity: 'common',
    season: 'summer',
    source: 'shop',
    growTimeSeconds: 100,
    waterCost: 3,
    sellPrice: 10,
    processedName: '葵花籽',
    processedEmoji: '🌻',
    processedPrice: 24,
    processTimeSeconds: 50,
    seedPrice: 10,
    unlockLevel: 6,
    stages: ['🌱', '🌿', '🌻', '🌻'],
  },
  lavender: {
    id: 'lavender',
    name: '薰衣草',
    emoji: '💜',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 140,
    waterCost: 3,
    sellPrice: 10,
    processedName: '花茶',
    processedEmoji: '🍵',
    processedPrice: 28,
    processTimeSeconds: 55,
    seedPrice: 10,
    unlockLevel: 6,
    stages: ['🌱', '🌿', '💜', '💜'],
  },
  tulip: {
    id: 'tulip',
    name: '郁金香',
    emoji: '🌷',
    rarity: 'rare',
    season: 'spring',
    source: 'shop',
    growTimeSeconds: 160,
    waterCost: 3,
    sellPrice: 15,
    processedName: '郁金香束',
    processedEmoji: '💐',
    processedPrice: 38,
    processTimeSeconds: 65,
    seedPrice: 15,
    unlockLevel: 7,
    stages: ['🌱', '🌿', '🌷', '🌷'],
  },
  lily: {
    id: 'lily',
    name: '百合',
    emoji: '🤍',
    rarity: 'rare',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 180,
    waterCost: 4,
    sellPrice: 18,
    processedName: '百合花束',
    processedEmoji: '💐',
    processedPrice: 45,
    processTimeSeconds: 70,
    seedPrice: 18,
    unlockLevel: 8,
    stages: ['🌱', '🌿', '🤍', '🤍'],
  },
}
