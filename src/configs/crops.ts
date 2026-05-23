// ============================================
// 作物配置
// 加品种=加数据，不改代码
// ============================================

export type CropId = 'wheat' | 'rice' | 'corn' | 'tomato' | 'carrot' | 'potato' | 'cabbage' | 'soybean'
export type CropRarity = 'common' | 'rare' | 'epic' | 'legend'
export type Season = 'all' | 'spring' | 'summer' | 'autumn' | 'winter'

export interface CropConfig {
  id: CropId
  name: string
  emoji: string
  rarity: CropRarity
  season: Season
  source: 'shop' | 'event' | 'rank' | 'voucher' | 'share'
  growTimeSeconds: number   // 总生长时间（秒）
  waterCost: number         // 每次浇水消耗
  sellPrice: number         // 原料售价
  processedName: string     // 加工品名
  processedEmoji: string
  processedPrice: number    // 加工品售价
  processTimeSeconds: number // 加工时间
  seedPrice: number         // 种子价格
  unlockLevel: number       // 解锁等级
  stages: string[]          // 生长阶段 emoji
}

export const CROP_CONFIGS: Record<CropId, CropConfig> = {
  wheat: {
    id: 'wheat',
    name: '小麦',
    emoji: '🌾',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 60,
    waterCost: 2,
    sellPrice: 5,
    processedName: '面粉',
    processedEmoji: '🍞',
    processedPrice: 12,
    processTimeSeconds: 30,
    seedPrice: 3,
    unlockLevel: 1,
    stages: ['🌱', '🌿', '🌾', '🌾'],
  },
  rice: {
    id: 'rice',
    name: '水稻',
    emoji: '🍚',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 90,
    waterCost: 3,
    sellPrice: 5,
    processedName: '大米',
    processedEmoji: '🍚',
    processedPrice: 12,
    processTimeSeconds: 30,
    seedPrice: 3,
    unlockLevel: 1,
    stages: ['🌱', '🌿', '🌾', '🍚'],
  },
  corn: {
    id: 'corn',
    name: '玉米',
    emoji: '🌽',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 120,
    waterCost: 2,
    sellPrice: 6,
    processedName: '玉米粉',
    processedEmoji: '🌽',
    processedPrice: 14,
    processTimeSeconds: 40,
    seedPrice: 4,
    unlockLevel: 1,
    stages: ['🌱', '🌿', '🌽', '🌽'],
  },
  tomato: {
    id: 'tomato',
    name: '番茄',
    emoji: '🍅',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 80,
    waterCost: 2,
    sellPrice: 7,
    processedName: '番茄酱',
    processedEmoji: '🫙',
    processedPrice: 16,
    processTimeSeconds: 35,
    seedPrice: 5,
    unlockLevel: 2,
    stages: ['🌱', '🌿', '🍅', '🍅'],
  },
  carrot: {
    id: 'carrot',
    name: '胡萝卜',
    emoji: '🥕',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 70,
    waterCost: 2,
    sellPrice: 6,
    processedName: '胡萝卜汁',
    processedEmoji: '🥤',
    processedPrice: 14,
    processTimeSeconds: 30,
    seedPrice: 4,
    unlockLevel: 2,
    stages: ['🌱', '🌿', '🥕', '🥕'],
  },
  potato: {
    id: 'potato',
    name: '土豆',
    emoji: '🥔',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 100,
    waterCost: 2,
    sellPrice: 6,
    processedName: '薯片',
    processedEmoji: '🍟',
    processedPrice: 15,
    processTimeSeconds: 35,
    seedPrice: 4,
    unlockLevel: 3,
    stages: ['🌱', '🌿', '🥔', '🥔'],
  },
  cabbage: {
    id: 'cabbage',
    name: '白菜',
    emoji: '🥬',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 80,
    waterCost: 2,
    sellPrice: 5,
    processedName: '泡菜',
    processedEmoji: '🥬',
    processedPrice: 13,
    processTimeSeconds: 40,
    seedPrice: 3,
    unlockLevel: 3,
    stages: ['🌱', '🌿', '🥬', '🥬'],
  },
  soybean: {
    id: 'soybean',
    name: '大豆',
    emoji: '🫘',
    rarity: 'common',
    season: 'all',
    source: 'shop',
    growTimeSeconds: 110,
    waterCost: 2,
    sellPrice: 6,
    processedName: '豆腐',
    processedEmoji: '🧈',
    processedPrice: 15,
    processTimeSeconds: 45,
    seedPrice: 4,
    unlockLevel: 4,
    stages: ['🌱', '🌿', '🫘', '🫘'],
  },
}
