// ============================================
// 动物配置
// ============================================

export type AnimalId = 'chicken' | 'duck' | 'pig' | 'cow'
export type AnimalRarity = 'common' | 'rare' | 'epic' | 'legend'

export interface AnimalConfig {
  id: AnimalId
  name: string
  emoji: string
  rarity: AnimalRarity
  source: 'shop' | 'event' | 'rank' | 'voucher'
  buyPrice: number
  feedCost: number         // 每次喂食消耗饲料
  produceTimeSeconds: number // 产出间隔
  productName: string
  productEmoji: string
  productPrice: number
  processedName: string
  processedEmoji: string
  processedPrice: number
  processTimeSeconds: number
  unlockLevel: number
}

export const ANIMAL_CONFIGS: Record<AnimalId, AnimalConfig> = {
  chicken: {
    id: 'chicken',
    name: '鸡',
    emoji: '🐔',
    rarity: 'common',
    source: 'shop',
    buyPrice: 50,
    feedCost: 2,
    produceTimeSeconds: 120,
    productName: '鸡蛋',
    productEmoji: '🥚',
    productPrice: 6,
    processedName: '蛋糕',
    processedEmoji: '🎂',
    processedPrice: 25,
    processTimeSeconds: 60,
    unlockLevel: 3,
  },
  duck: {
    id: 'duck',
    name: '鸭',
    emoji: '🦆',
    rarity: 'common',
    source: 'shop',
    buyPrice: 80,
    feedCost: 3,
    produceTimeSeconds: 150,
    productName: '鸭蛋',
    productEmoji: '🥚',
    productPrice: 7,
    processedName: '咸鸭蛋',
    processedEmoji: '🥚',
    processedPrice: 20,
    processTimeSeconds: 60,
    unlockLevel: 4,
  },
  pig: {
    id: 'pig',
    name: '猪',
    emoji: '🐷',
    rarity: 'common',
    source: 'shop',
    buyPrice: 150,
    feedCost: 4,
    produceTimeSeconds: 240,
    productName: '猪肉',
    productEmoji: '🥩',
    productPrice: 10,
    processedName: '火腿',
    processedEmoji: '🍖',
    processedPrice: 30,
    processTimeSeconds: 90,
    unlockLevel: 4,
  },
  cow: {
    id: 'cow',
    name: '牛',
    emoji: '🐮',
    rarity: 'common',
    source: 'shop',
    buyPrice: 200,
    feedCost: 5,
    produceTimeSeconds: 180,
    productName: '牛奶',
    productEmoji: '🥛',
    productPrice: 8,
    processedName: '奶酪',
    processedEmoji: '🧀',
    processedPrice: 22,
    processTimeSeconds: 70,
    unlockLevel: 5,
  },
}
