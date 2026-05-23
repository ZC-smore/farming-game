// ============================================
// 经济配置
// ============================================

// 水桶升级
export const WATER_BUCKET_UPGRADES = [
  { level: 1, maxWater: 80,  price: 0 },
  { level: 2, maxWater: 105, price: 200 },
  { level: 3, maxWater: 130, price: 400 },
  { level: 4, maxWater: 155, price: 800 },
  { level: 5, maxWater: 180, price: 1600 },
  { level: 6, maxWater: 205, price: 3200 },
]

// 水自动恢复: 1单位/2分钟
export const WATER_REGEN_RATE = 1   // 每次恢复量
export const WATER_REGEN_INTERVAL = 120000 // 2分钟（毫秒）

// 土地扩建价格
export const FARM_PLOT_PRICES = [
  { plotIndex: 2, price: 100 },   // 第3块
  { plotIndex: 3, price: 200 },   // 第4块
  { plotIndex: 4, price: 400 },   // 第5块
  { plotIndex: 5, price: 800 },   // 第6块
  { plotIndex: 6, price: 1600 },  // 第7块
  { plotIndex: 7, price: 3200 },  // 第8块
]

// 牧场栏位扩建价格
export const RANCH_SLOT_PRICES = [
  { slotIndex: 1, price: 150 },
  { slotIndex: 2, price: 300 },
  { slotIndex: 3, price: 600 },
  { slotIndex: 4, price: 1200 },
]

// 花盆扩建价格
export const GARDEN_POT_PRICES = [
  { potIndex: 2, price: 200 },
  { potIndex: 3, price: 400 },
  { potIndex: 4, price: 800 },
  { potIndex: 5, price: 1500 },
]

// 仓库容量
export const WAREHOUSE_INITIAL_CAPACITY = 100
export const WAREHOUSE_UPGRADE_PRICES = [
  { level: 1, capacity: 150, price: 300 },
  { level: 2, capacity: 200, price: 600 },
  { level: 3, capacity: 300, price: 1200 },
  { level: 4, capacity: 500, price: 2400 },
]

// 经验值配置
export const EXP_REWARDS = {
  plant: 5,
  water: 2,
  harvest: 8,
  animalProduce: 10,
  process: 12,
  sell: 3,
}

// 仓库初始容量
export const INITIAL_FARM_PLOTS = 2
export const INITIAL_RANCH_SLOTS = 1
export const INITIAL_GARDEN_POTS = 2

// 作物枯萎时间（成熟后不收获，多久枯萎）
export const CROP_WITHER_TIME = 3600 // 1小时（秒）

// 四季系统
export const SEASON_DURATION_DAYS = 7
export const SEASON_ORDER: Array<'spring' | 'summer' | 'autumn' | 'winter'> = ['spring', 'summer', 'autumn', 'winter']

// 四季对水系统的影响
export const SEASON_WATER_EFFECTS = {
  spring: { regenBonus: 0.30, consumeBonus: 0 },
  summer: { regenBonus: -0.20, consumeBonus: 0.25 },
  autumn: { regenBonus: 0, consumeBonus: -0.10 },
  winter: { regenBonus: -0.40, consumeBonus: -0.30 },
}

// 四季对农场的影响
export const SEASON_FARM_EFFECTS = {
  spring: { growSpeedBonus: 0.10, sellPriceBonus: 0 },
  summer: { growSpeedBonus: 0, sellPriceBonus: 0.20 },
  autumn: { growSpeedBonus: 0, harvestBonus: 0.15 },
  winter: { growSpeedBonus: 0, sellPriceBonus: 0 },
}

// 四季对牧场的影响
export const SEASON_RANCH_EFFECTS = {
  spring: { produceSpeedBonus: 0.20 },
  summer: { produceSpeedBonus: 0 },
  autumn: { produceSpeedBonus: 0 },
  winter: { produceSpeedBonus: -0.20 },
}

// 四季对花园的影响
export const SEASON_GARDEN_EFFECTS = {
  spring: { growSpeedBonus: 0.10 },
  summer: { growSpeedBonus: 0 },
  autumn: { processPriceBonus: 0.20 },
  winter: { growSpeedBonus: 0 },
}
