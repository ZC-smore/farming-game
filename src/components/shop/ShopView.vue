<template>
  <div class="shop-view">
    <div class="section-header">
      <h2>🏪 商店</h2>
      <div class="sub-info">🪙 {{ game.coins }}</div>
    </div>

    <!-- 种子/花种 -->
    <div class="shop-section">
      <h3>🌱 种子商店</h3>
      <div class="shop-grid">
        <button
          v-for="crop in availableCrops"
          :key="'seed-' + crop.id"
          class="shop-card"
          :class="{ disabled: game.coins < crop.seedPrice }"
          @click="handleBuySeed(crop)"
        >
          <span class="shop-emoji">{{ crop.emoji }}</span>
          <div class="shop-info">
            <span class="shop-name">{{ crop.name }}种子</span>
            <span class="shop-desc">⏱{{ formatTime(crop.growTimeSeconds) }}</span>
          </div>
          <span class="shop-price">🪙{{ crop.seedPrice }}</span>
        </button>
      </div>
    </div>

    <div class="shop-section">
      <h3>🌷 花种商店</h3>
      <div class="shop-grid">
        <button
          v-for="flower in availableFlowers"
          :key="'seed-' + flower.id"
          class="shop-card"
          :class="{ disabled: game.coins < flower.seedPrice }"
          @click="handleBuySeedFlower(flower)"
        >
          <span class="shop-emoji">{{ flower.emoji }}</span>
          <div class="shop-info">
            <span class="shop-name">{{ flower.name }}花种</span>
            <span class="shop-desc">⏱{{ formatTime(flower.growTimeSeconds) }} 💧{{ flower.waterCost }}</span>
          </div>
          <span class="shop-price">🪙{{ flower.seedPrice }}</span>
        </button>
      </div>
    </div>

    <!-- 动物 -->
    <div class="shop-section">
      <h3>🐄 动物商店</h3>
      <div class="shop-grid">
        <button
          v-for="animal in availableAnimals"
          :key="'animal-' + animal.id"
          class="shop-card"
          :class="{ disabled: game.coins < animal.buyPrice }"
          @click="showAnimalHint(animal)"
        >
          <span class="shop-emoji">{{ animal.emoji }}</span>
          <div class="shop-info">
            <span class="shop-name">{{ animal.name }}</span>
            <span class="shop-desc">🍖{{ animal.feedCost }}/次</span>
          </div>
          <span class="shop-price">🪙{{ animal.buyPrice }}</span>
        </button>
      </div>
      <p class="shop-hint">💡 购买动物请在「牧场」界面点击空栏位</p>
    </div>

    <!-- 工具 -->
    <div class="shop-section">
      <h3>🔧 工具商店</h3>
      <div class="shop-grid">
        <button
          class="shop-card"
          :class="{ disabled: game.coins < 200 }"
          @click="handleUpgradeBucket"
        >
          <span class="shop-emoji">🪣</span>
          <div class="shop-info">
            <span class="shop-name">水桶升级 (Lv.{{ game.waterBucketLevel }})</span>
            <span class="shop-desc">容量: {{ game.maxWater }}</span>
          </div>
          <span class="shop-price">🪙{{ bucketUpgradePrice }}</span>
        </button>

        <button
          class="shop-card"
          :class="{ disabled: game.coins < warehouseUpgradePrice }"
          @click="handleUpgradeWarehouse"
        >
          <span class="shop-emoji">📦</span>
          <div class="shop-info">
            <span class="shop-name">仓库升级 (Lv.{{ game.warehouseLevel + 1 }})</span>
            <span class="shop-desc">容量: {{ nextWarehouseCapacity }}</span>
          </div>
          <span class="shop-price">🪙{{ warehouseUpgradePrice }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { CROP_CONFIGS, FLOWER_CONFIGS, ANIMAL_CONFIGS } from '@/configs'
import { WATER_BUCKET_UPGRADES, WAREHOUSE_UPGRADE_PRICES } from '@/configs/economy'
import type { CropConfig, FlowerConfig, AnimalConfig } from '@/configs'

const game = useGameStore()

const availableCrops = computed(() =>
  Object.values(CROP_CONFIGS).filter(c => c.unlockLevel <= game.level)
)

const availableFlowers = computed(() =>
  Object.values(FLOWER_CONFIGS).filter(f => f.unlockLevel <= game.level)
)

const availableAnimals = computed(() =>
  Object.values(ANIMAL_CONFIGS).filter(a => a.unlockLevel <= game.level)
)

const bucketUpgradePrice = computed(() => {
  const next = WATER_BUCKET_UPGRADES.find(u => u.level === game.waterBucketLevel + 1)
  return next?.price ?? 0
})

const warehouseUpgradePrice = computed(() => {
  const next = WAREHOUSE_UPGRADE_PRICES.find(u => u.level === game.warehouseLevel + 1)
  return next?.price ?? 0
})

const nextWarehouseCapacity = computed(() => {
  const next = WAREHOUSE_UPGRADE_PRICES.find(u => u.level === game.warehouseLevel + 1)
  return next?.capacity ?? game.inventory.capacity
})

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}秒`
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}分`
  return `${(seconds / 3600).toFixed(1)}时`
}

function handleBuySeed(crop: CropConfig) {
  if (game.coins < crop.seedPrice) return
  // 种子直接消耗金币，收获时用种子价格代替
  // 实际游戏中种子是消耗品，这里简化为直接种植时扣金币
  showToast(`请到农场选择土地种植${crop.name}`, 'info')
}

function handleBuySeedFlower(flower: FlowerConfig) {
  if (game.coins < flower.seedPrice) return
  showToast(`请到花园选择花盆种植${flower.name}`, 'info')
}

function handleUpgradeBucket() {
  game.upgradeWaterBucket()
}

function handleUpgradeWarehouse() {
  game.upgradeWarehouse()
}

function showAnimalHint(animal: AnimalConfig) {
  showToast(`请到牧场点击空栏位购买${animal.name}`, 'info')
}

function showToast(msg: string, type: string) {
  // 使用全局 toast
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.shop-view {
  padding: $spacing-md;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-lg;

  h2 { font-size: $font-size-xl; }
}

.sub-info {
  font-size: $font-size-md;
  font-weight: 700;
  color: #8a6d1b;
}

.shop-section {
  margin-bottom: $spacing-xl;

  h3 {
    font-size: $font-size-lg;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-xs;
    border-bottom: 1px solid $color-border;
  }
}

.shop-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.shop-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $color-card;
  border-radius: $radius-md;
  box-shadow: $shadow-soft;
  transition: all $transition-fast;
  width: 100%;
  text-align: left;

  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.5; }
}

.shop-emoji {
  font-size: 28px;
}

.shop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-weight: 600;
  font-size: $font-size-md;
}

.shop-desc {
  font-size: $font-size-xs;
  color: $color-text-light;
}

.shop-price {
  font-weight: 700;
  color: #8a6d1b;
  font-size: $font-size-sm;
  white-space: nowrap;
}

.shop-hint {
  font-size: $font-size-xs;
  color: $color-text-light;
  margin-top: $spacing-sm;
  padding: $spacing-sm;
  background: rgba(0, 0, 0, 0.02);
  border-radius: $radius-sm;
}
</style>
