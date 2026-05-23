// ============================================
// 游戏核心 Store - Pinia
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  CROP_CONFIGS, ANIMAL_CONFIGS, FLOWER_CONFIGS,
  getLevelConfig, getExpForNextLevel,
  WATER_BUCKET_UPGRADES, FARM_PLOT_PRICES, RANCH_SLOT_PRICES, GARDEN_POT_PRICES,
  WAREHOUSE_INITIAL_CAPACITY, WAREHOUSE_UPGRADE_PRICES,
  INITIAL_FARM_PLOTS, INITIAL_RANCH_SLOTS, INITIAL_GARDEN_POTS,
  EXP_REWARDS, WATER_REGEN_RATE, WATER_REGEN_INTERVAL,
  SEASON_WATER_EFFECTS, SEASON_FARM_EFFECTS,
  CROP_WITHER_TIME,
} from '@/configs'
import type { CropId, CropConfig } from '@/configs/crops'
import type { AnimalId } from '@/configs/animals'
import type { FlowerId } from '@/configs/flowers'
import {
  createEmptyPlot, plantCrop as doPlant, waterCrop as doWater,
  updateCropGrowth, harvestCrop as doHarvest, clearWitheredPlot as doClear,
  type CropPlotData, type CropState,
} from '@/systems/crop/state'
import {
  createEmptySlot, buyAnimal as doBuyAnimal, feedAnimal as doFeed,
  updateAnimalState, collectProduct as doCollect,
  type AnimalSlotData,
} from '@/systems/animal/state'
import {
  createEmptyPot, plantFlower as doPlantFlower, waterFlower as doWaterFlower,
  updateFlowerGrowth, pickFlower as doPickFlower,
  type FlowerPotData,
} from '@/systems/garden/state'
import {
  addItem, removeItem, hasItem, getItemCount,
  type InventoryState, createEmptyInventory,
} from '@/systems/inventory'
import {
  createInitialSeasonState, getCurrentSeasonInfo, advanceSeason, getSeasonEmoji, getSeasonName,
  type SeasonState,
} from '@/systems/season'

// ---- 存档数据结构 ----
export interface GameSaveData {
  version: number
  coins: number
  exp: number
  level: number
  water: number
  waterBucketLevel: number
  lastWaterRegenAt: number
  farmPlots: CropPlotData[]
  ranchSlots: AnimalSlotData[]
  gardenPots: FlowerPotData[]
  inventory: InventoryState
  warehouseLevel: number
  season: SeasonState
  totalHarvestCount: number
  totalSellCount: number
  feedStock: number
  fertilizerStock: number
  unlockedAreas: string[]
  dailyTaskCompleted: string[]
  lastOnlineAt: number
}

const SAVE_KEY = 'farming_game_save_v1'

export const useGameStore = defineStore('game', () => {
  // ---- 基础资源 ----
  const coins = ref(100)
  const exp = ref(0)
  const level = ref(1)
  const water = ref(80)
  const waterBucketLevel = ref(1)
  const lastWaterRegenAt = ref(Date.now())

  // ---- 农场 ----
  const farmPlots = ref<CropPlotData[]>(
    Array.from({ length: INITIAL_FARM_PLOTS }, (_, i) => createEmptyPlot(i))
  )

  // ---- 牧场 ----
  const ranchSlots = ref<AnimalSlotData[]>(
    Array.from({ length: INITIAL_RANCH_SLOTS }, (_, i) => createEmptySlot(i))
  )

  // ---- 花园 ----
  const gardenPots = ref<FlowerPotData[]>(
    Array.from({ length: INITIAL_GARDEN_POTS }, (_, i) => createEmptyPot(i))
  )

  // ---- 仓库 ----
  const warehouseLevel = ref(0)
  const inventory = ref<InventoryState>(createEmptyInventory(WAREHOUSE_INITIAL_CAPACITY))

  // ---- 饲料/肥料 ----
  const feedStock = ref(0)
  const fertilizerStock = ref(0)

  // ---- 四季 ----
  const season = ref<SeasonState>(createInitialSeasonState())

  // ---- 统计 ----
  const totalHarvestCount = ref(0)
  const totalSellCount = ref(0)
  const lastOnlineAt = ref(Date.now())

  // ---- 解锁区域 ----
  const unlockedAreas = ref<string[]>(['farm'])

  // ---- 新手引导 ----
  const tutorialStep = ref(0) // 0=未开始, 1-5=引导步骤, 6=完成
  const tutorialCompleted = ref(false)

  // ---- 计算属性 ----
  const maxWater = computed(() => {
    const upgrade = WATER_BUCKET_UPGRADES.find(u => u.level === waterBucketLevel.value)
    return upgrade?.maxWater ?? 80
  })

  const currentSeasonInfo = computed(() => getCurrentSeasonInfo(season.value))

  const levelConfig = computed(() => getLevelConfig(level.value))

  const expToNextLevel = computed(() => {
    const nextExp = getExpForNextLevel(level.value)
    const currentLevelData = getLevelConfig(level.value)
    return nextExp - (exp.value - currentLevelData.expTotal)
  })

  const expProgress = computed(() => {
    const currentLevelData = getLevelConfig(level.value)
    const nextLevelExp = getExpForNextLevel(level.value)
    const base = currentLevelData.expTotal
    const range = nextLevelExp - base
    if (range <= 0) return 1
    return Math.min(1, (exp.value - base) / range)
  })

  const isGardenUnlocked = computed(() => level.value >= 5)
  const isWorkshopUnlocked = computed(() => level.value >= 8)

  // ---- 水系统 ----
  function regenWater() {
    const now = Date.now()
    const elapsed = now - lastWaterRegenAt.value
    const ticks = Math.floor(elapsed / WATER_REGEN_INTERVAL)
    if (ticks <= 0) return

    const seasonEffect = SEASON_WATER_EFFECTS[season.value.currentSeason]
    const bonus = 1 + seasonEffect.regenBonus
    const regenAmount = Math.floor(ticks * WATER_REGEN_RATE * bonus)

    water.value = Math.min(maxWater.value, water.value + regenAmount)
    lastWaterRegenAt.value = now
  }

  function consumeWater(amount: number): boolean {
    const seasonEffect = SEASON_WATER_EFFECTS[season.value.currentSeason]
    const adjustedAmount = Math.ceil(amount * (1 + seasonEffect.consumeBonus))

    if (water.value < adjustedAmount) return false
    water.value -= adjustedAmount
    return true
  }

  // ---- 经验与升级 ----
  function addExp(amount: number) {
    exp.value += amount
    checkLevelUp()
  }

  function checkLevelUp() {
    while (level.value < 15) {
      const nextExp = getExpForNextLevel(level.value)
      const currentLevelData = getLevelConfig(level.value)
      if (exp.value >= currentLevelData.expTotal + nextExp) {
        level.value++
        onLevelUp(level.value)
      } else {
        break
      }
    }
  }

  function onLevelUp(newLevel: number) {
    if (newLevel === 3 && !unlockedAreas.value.includes('ranch')) {
      unlockedAreas.value.push('ranch')
    }
    if (newLevel === 5 && !unlockedAreas.value.includes('garden')) {
      unlockedAreas.value.push('garden')
    }
    if (newLevel === 8 && !unlockedAreas.value.includes('workshop')) {
      unlockedAreas.value.push('workshop')
    }
  }

  // ---- 农场操作 ----
  function plantCrop(plotIndex: number, cropId: CropId): boolean {
    const plot = farmPlots.value[plotIndex]
    if (!plot || plot.state !== 'EMPTY') return false

    const config = CROP_CONFIGS[cropId]
    if (!config) return false
    if (config.unlockLevel > level.value) return false
    if (coins.value < config.seedPrice) return false

    coins.value -= config.seedPrice
    farmPlots.value[plotIndex] = doPlant(plot, cropId, config.growTimeSeconds)
    addExp(EXP_REWARDS.plant)
    return true
  }

  function waterPlot(plotIndex: number): boolean {
    const plot = farmPlots.value[plotIndex]
    if (!plot) return false
    if (plot.state !== 'PLANTED' && plot.state !== 'GROWING') return false

    const config = plot.cropId ? CROP_CONFIGS[plot.cropId as CropId] : null
    const waterCost = config?.waterCost ?? 2
    if (!consumeWater(waterCost)) return false

    farmPlots.value[plotIndex] = doWater(plot)
    addExp(EXP_REWARDS.water)
    return true
  }

  function harvestPlot(plotIndex: number): boolean {
    const plot = farmPlots.value[plotIndex]
    if (!plot || plot.state !== 'MATURE') return false

    const config = CROP_CONFIGS[plot.cropId as CropId]
    if (!config) return false

    // 收获加入仓库
    inventory.value = addItem(
      inventory.value, plot.cropId!, config.name, config.emoji, 'crop', 1, config.sellPrice
    )

    farmPlots.value[plotIndex] = doHarvest(plot)
    totalHarvestCount.value++
    addExp(EXP_REWARDS.harvest)
    return true
  }

  function clearWithered(plotIndex: number): boolean {
    const plot = farmPlots.value[plotIndex]
    if (!plot || plot.state !== 'WITHERED') return false
    farmPlots.value[plotIndex] = doClear(plot)
    return true
  }

  function buyFarmPlot(): boolean {
    const currentCount = farmPlots.value.length
    const priceConfig = FARM_PLOT_PRICES.find(p => p.plotIndex === currentCount)
    if (!priceConfig) return false
    if (coins.value < priceConfig.price) return false

    coins.value -= priceConfig.price
    farmPlots.value.push(createEmptyPlot(currentCount))
    return true
  }

  // ---- 牧场操作 ----
  function buyAnimal(slotIndex: number, animalId: AnimalId): boolean {
    const slot = ranchSlots.value[slotIndex]
    if (!slot || slot.animalId !== null) return false

    const config = ANIMAL_CONFIGS[animalId]
    if (!config) return false
    if (config.unlockLevel > level.value) return false
    if (coins.value < config.buyPrice) return false

    coins.value -= config.buyPrice
    ranchSlots.value[slotIndex] = doBuyAnimal(slot, animalId)
    return true
  }

  function feedAnimalSlot(slotIndex: number): boolean {
    const slot = ranchSlots.value[slotIndex]
    if (!slot || slot.state !== 'HUNGRY') return false

    const config = ANIMAL_CONFIGS[slot.animalId as AnimalId]
    if (!config) return false
    if (feedStock.value < config.feedCost) return false

    feedStock.value -= config.feedCost
    ranchSlots.value[slotIndex] = doFeed(slot, config.produceTimeSeconds)
    return true
  }

  function collectAnimalProduct(slotIndex: number): boolean {
    const slot = ranchSlots.value[slotIndex]
    if (!slot || slot.state !== 'READY') return false

    const config = ANIMAL_CONFIGS[slot.animalId as AnimalId]
    if (!config) return false

    inventory.value = addItem(
      inventory.value, slot.animalId! + '_product', config.productName, config.productEmoji,
      'animal_product', 1, config.productPrice
    )

    ranchSlots.value[slotIndex] = doCollect(slot)
    addExp(EXP_REWARDS.animalProduce)
    return true
  }

  function buyRanchSlot(): boolean {
    const currentCount = ranchSlots.value.length
    const priceConfig = RANCH_SLOT_PRICES.find(p => p.slotIndex === currentCount)
    if (!priceConfig) return false
    if (coins.value < priceConfig.price) return false

    coins.value -= priceConfig.price
    ranchSlots.value.push(createEmptySlot(currentCount))
    return true
  }

  // ---- 花园操作 ----
  function plantFlowerPot(potIndex: number, flowerId: FlowerId): boolean {
    const pot = gardenPots.value[potIndex]
    if (!pot || (pot.state !== 'PICKED' && pot.flowerId !== null)) return false

    const config = FLOWER_CONFIGS[flowerId]
    if (!config) return false
    if (config.unlockLevel > level.value) return false
    if (coins.value < config.seedPrice) return false

    coins.value -= config.seedPrice
    gardenPots.value[potIndex] = doPlantFlower(pot, flowerId, config.growTimeSeconds)
    addExp(EXP_REWARDS.plant)
    return true
  }

  function waterFlowerPot(potIndex: number): boolean {
    const pot = gardenPots.value[potIndex]
    if (!pot) return false
    if (pot.state !== 'SEED' && pot.state !== 'GROWING') return false

    const config = pot.flowerId ? FLOWER_CONFIGS[pot.flowerId as FlowerId] : null
    const waterCost = config?.waterCost ?? 3
    if (!consumeWater(waterCost)) return false

    gardenPots.value[potIndex] = doWaterFlower(pot)
    addExp(EXP_REWARDS.water)
    return true
  }

  function pickFlowerPot(potIndex: number): boolean {
    const pot = gardenPots.value[potIndex]
    if (!pot || pot.state !== 'BLOOM') return false

    const config = FLOWER_CONFIGS[pot.flowerId as FlowerId]
    if (!config) return false

    inventory.value = addItem(
      inventory.value, pot.flowerId!, config.name, config.emoji, 'flower', 1, config.sellPrice
    )

    gardenPots.value[potIndex] = doPickFlower(pot)
    addExp(EXP_REWARDS.harvest)
    return true
  }

  function buyGardenPot(): boolean {
    const currentCount = gardenPots.value.length
    const priceConfig = GARDEN_POT_PRICES.find(p => p.potIndex === currentCount)
    if (!priceConfig) return false
    if (coins.value < priceConfig.price) return false

    coins.value -= priceConfig.price
    gardenPots.value.push(createEmptyPot(currentCount))
    return true
  }

  // ---- 出售 ----
  function sellItem(itemId: string, count: number = 1): boolean {
    if (!hasItem(inventory.value, itemId, count)) return false

    const item = inventory.value.items[itemId]
    if (!item) return false

    const totalCoins = item.sellPrice * count
    coins.value += totalCoins
    inventory.value = removeItem(inventory.value, itemId, count)
    totalSellCount.value++
    addExp(EXP_REWARDS.sell)
    return true
  }

  function sellAllOfType(itemId: string): boolean {
    const count = getItemCount(inventory.value, itemId)
    if (count <= 0) return false
    return sellItem(itemId, count)
  }

  // ---- 加工 ----
  function processItem(itemId: string, processedId: string, processedName: string, processedEmoji: string, processedPrice: number): boolean {
    if (!hasItem(inventory.value, itemId, 1)) return false
    if (coins.value < 5) return false // 加工费

    inventory.value = removeItem(inventory.value, itemId, 1)
    coins.value -= 5
    inventory.value = addItem(
      inventory.value, processedId, processedName, processedEmoji, 'processed', 1, processedPrice
    )
    addExp(EXP_REWARDS.process)
    return true
  }

  // ---- 制作饲料 ----
  function craftFeed(cropId: CropId): boolean {
    if (!hasItem(inventory.value, cropId, 2)) return false

    inventory.value = removeItem(inventory.value, cropId, 2)
    feedStock.value += 1
    return true
  }

  // ---- 制作肥料 ----
  function craftFertilizer(): boolean {
    if (feedStock.value < 3) return false
    feedStock.value -= 3
    fertilizerStock.value += 1
    return true
  }

  // ---- 使用肥料 ----
  function useFertilizer(plotIndex: number): boolean {
    if (fertilizerStock.value <= 0) return false
    const plot = farmPlots.value[plotIndex]
    if (!plot || (plot.state !== 'PLANTED' && plot.state !== 'GROWING')) return false

    fertilizerStock.value--
    // 加速50%：将成熟时间提前
    if (plot.matureAt) {
      const config = CROP_CONFIGS[plot.cropId as CropId]
      const speedUp = (config?.growTimeSeconds ?? 60) * 500 // 减半
      farmPlots.value[plotIndex] = {
        ...plot,
        matureAt: plot.matureAt - speedUp,
      }
    }
    return true
  }

  // ---- 水桶升级 ----
  function upgradeWaterBucket(): boolean {
    const nextLevel = waterBucketLevel.value + 1
    const upgrade = WATER_BUCKET_UPGRADES.find(u => u.level === nextLevel)
    if (!upgrade) return false
    if (coins.value < upgrade.price) return false

    coins.value -= upgrade.price
    waterBucketLevel.value = nextLevel
    water.value = upgrade.maxWater // 升级时补满
    return true
  }

  // ---- 仓库升级 ----
  function upgradeWarehouse(): boolean {
    const nextLevel = warehouseLevel.value + 1
    const upgrade = WAREHOUSE_UPGRADE_PRICES.find(u => u.level === nextLevel)
    if (!upgrade) return false
    if (coins.value < upgrade.price) return false

    coins.value -= upgrade.price
    warehouseLevel.value = nextLevel
    inventory.value = { ...inventory.value, capacity: upgrade.capacity }
    return true
  }

  // ---- 更新所有状态 ----
  function updateAllStates() {
    regenWater()

    farmPlots.value = farmPlots.value.map(plot => updateCropGrowth(plot))
    ranchSlots.value = ranchSlots.value.map(slot => updateAnimalState(slot))
    gardenPots.value = gardenPots.value.map(pot => updateFlowerGrowth(pot))
  }

  // ---- 存档系统 ----
  function save() {
    const data: GameSaveData = {
      version: 1,
      coins: coins.value,
      exp: exp.value,
      level: level.value,
      water: water.value,
      waterBucketLevel: waterBucketLevel.value,
      lastWaterRegenAt: lastWaterRegenAt.value,
      farmPlots: farmPlots.value,
      ranchSlots: ranchSlots.value,
      gardenPots: gardenPots.value,
      inventory: inventory.value,
      warehouseLevel: warehouseLevel.value,
      season: season.value,
      totalHarvestCount: totalHarvestCount.value,
      totalSellCount: totalSellCount.value,
      feedStock: feedStock.value,
      fertilizerStock: fertilizerStock.value,
      unlockedAreas: unlockedAreas.value,
      dailyTaskCompleted: [],
      lastOnlineAt: Date.now(),
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  function load(): boolean {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false

    try {
      const data: GameSaveData = JSON.parse(raw)
      coins.value = data.coins ?? 100
      exp.value = data.exp ?? 0
      level.value = data.level ?? 1
      water.value = data.water ?? 80
      waterBucketLevel.value = data.waterBucketLevel ?? 1
      lastWaterRegenAt.value = data.lastWaterRegenAt ?? Date.now()
      farmPlots.value = data.farmPlots ?? farmPlots.value
      ranchSlots.value = data.ranchSlots ?? ranchSlots.value
      gardenPots.value = data.gardenPots ?? gardenPots.value
      inventory.value = data.inventory ?? inventory.value
      warehouseLevel.value = data.warehouseLevel ?? 0
      season.value = data.season ?? season.value
      totalHarvestCount.value = data.totalHarvestCount ?? 0
      totalSellCount.value = data.totalSellCount ?? 0
      feedStock.value = data.feedStock ?? 0
      fertilizerStock.value = data.fertilizerStock ?? 0
      unlockedAreas.value = data.unlockedAreas ?? ['farm']
      lastOnlineAt.value = data.lastOnlineAt ?? Date.now()
      return true
    } catch {
      return false
    }
  }

  function resetGame() {
    localStorage.removeItem(SAVE_KEY)
    coins.value = 100
    exp.value = 0
    level.value = 1
    water.value = 80
    waterBucketLevel.value = 1
    lastWaterRegenAt.value = Date.now()
    farmPlots.value = Array.from({ length: INITIAL_FARM_PLOTS }, (_, i) => createEmptyPlot(i))
    ranchSlots.value = Array.from({ length: INITIAL_RANCH_SLOTS }, (_, i) => createEmptySlot(i))
    gardenPots.value = Array.from({ length: INITIAL_GARDEN_POTS }, (_, i) => createEmptyPot(i))
    inventory.value = createEmptyInventory(WAREHOUSE_INITIAL_CAPACITY)
    warehouseLevel.value = 0
    season.value = createInitialSeasonState()
    totalHarvestCount.value = 0
    totalSellCount.value = 0
    feedStock.value = 0
    fertilizerStock.value = 0
    unlockedAreas.value = ['farm']
    tutorialStep.value = 0
    tutorialCompleted.value = false
  }

  return {
    // State
    coins, exp, level, water, waterBucketLevel,
    farmPlots, ranchSlots, gardenPots,
    inventory, warehouseLevel, feedStock, fertilizerStock,
    season, totalHarvestCount, totalSellCount, lastOnlineAt,
    unlockedAreas, tutorialStep, tutorialCompleted,

    // Computed
    maxWater, currentSeasonInfo, levelConfig, expToNextLevel, expProgress,
    isGardenUnlocked, isWorkshopUnlocked,

    // Actions
    regenWater, consumeWater, addExp,
    plantCrop, waterPlot, harvestPlot, clearWithered, buyFarmPlot,
    buyAnimal, feedAnimalSlot, collectAnimalProduct, buyRanchSlot,
    plantFlowerPot, waterFlowerPot, pickFlowerPot, buyGardenPot,
    sellItem, sellAllOfType, processItem,
    craftFeed, craftFertilizer, useFertilizer,
    upgradeWaterBucket, upgradeWarehouse,
    updateAllStates,
    save, load, resetGame,
  }
})
