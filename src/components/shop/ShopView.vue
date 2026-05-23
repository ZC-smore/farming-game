<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="shop-overlay" @click.self="$emit('close')">
        <Transition name="slide-up">
          <div v-if="visible" class="shop-panel">
            <div class="panel-header">
              <h3>🏪 商店</h3>
              <div class="header-coins">🪙 {{ game.coins }}</div>
              <button class="close-btn" @click="$emit('close')">✕</button>
            </div>

            <div class="panel-body">
              <!-- 种子 -->
              <div class="shop-group">
                <div class="group-title">🌱 种子</div>
                <div class="shop-grid">
                  <button
                    v-for="crop in availableCrops"
                    :key="'seed-' + crop.id"
                    class="shop-item"
                    :class="{ disabled: game.coins < crop.seedPrice }"
                    @click="handleBuySeed(crop)"
                  >
                    <span class="shop-emoji">{{ crop.emoji }}</span>
                    <span class="shop-name">{{ crop.name }}</span>
                    <span class="shop-price">🪙{{ crop.seedPrice }}</span>
                  </button>
                </div>
              </div>

              <!-- 花种 -->
              <div class="shop-group">
                <div class="group-title">🌷 花种</div>
                <div class="shop-grid">
                  <button
                    v-for="flower in availableFlowers"
                    :key="'fseed-' + flower.id"
                    class="shop-item"
                    :class="{ disabled: game.coins < flower.seedPrice }"
                    @click="handleBuyFlower(flower)"
                  >
                    <span class="shop-emoji">{{ flower.emoji }}</span>
                    <span class="shop-name">{{ flower.name }}</span>
                    <span class="shop-price">🪙{{ flower.seedPrice }}</span>
                  </button>
                </div>
              </div>

              <!-- 工具 -->
              <div class="shop-group">
                <div class="group-title">🔧 工具</div>
                <div class="shop-grid">
                  <button
                    class="shop-item wide"
                    :class="{ disabled: game.coins < bucketUpgradePrice }"
                    @click="handleUpgradeBucket"
                  >
                    <span class="shop-emoji">🪣</span>
                    <span class="shop-name">水桶升级</span>
                    <span class="shop-price">🪙{{ bucketUpgradePrice }}</span>
                  </button>
                  <button
                    class="shop-item wide"
                    :class="{ disabled: game.coins < warehouseUpgradePrice }"
                    @click="handleUpgradeWarehouse"
                  >
                    <span class="shop-emoji">📦</span>
                    <span class="shop-name">仓库升级</span>
                    <span class="shop-price">🪙{{ warehouseUpgradePrice }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'
import { CROP_CONFIGS, FLOWER_CONFIGS } from '@/configs'
import { WATER_BUCKET_UPGRADES, WAREHOUSE_UPGRADE_PRICES } from '@/configs/economy'
import type { CropConfig, FlowerConfig } from '@/configs'

defineProps<{ visible: boolean }>()
defineEmits<{ close: [] }>()

const game = useGameStore()
const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast', () => {})

const availableCrops = computed(() =>
  Object.values(CROP_CONFIGS).filter(c => c.unlockLevel <= game.level)
)

const availableFlowers = computed(() =>
  Object.values(FLOWER_CONFIGS).filter(f => f.unlockLevel <= game.level)
)

const bucketUpgradePrice = computed(() => {
  const next = WATER_BUCKET_UPGRADES.find(u => u.level === game.waterBucketLevel + 1)
  return next?.price ?? 0
})

const warehouseUpgradePrice = computed(() => {
  const next = WAREHOUSE_UPGRADE_PRICES.find(u => u.level === game.warehouseLevel + 1)
  return next?.price ?? 0
})

function handleBuySeed(crop: CropConfig) {
  if (game.coins < crop.seedPrice) return
  showToast(`请到农场选择土地种植${crop.name}`, 'info')
}

function handleBuyFlower(flower: FlowerConfig) {
  if (game.coins < flower.seedPrice) return
  showToast(`请到花园选择花盆种植${flower.name}`, 'info')
}

function handleUpgradeBucket() {
  game.upgradeWaterBucket()
}

function handleUpgradeWarehouse() {
  game.upgradeWarehouse()
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.shop-overlay {
  position: fixed;
  inset: 0;
  z-index: 800;
  background: rgba(42, 31, 20, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.shop-panel {
  width: 100%;
  max-width: $max-content-width;
  max-height: 75vh;
  background: linear-gradient(180deg, #fff8e8 0%, #f5ecd4 100%);
  border: 3px solid $world-wood;
  border-bottom: none;
  border-radius: $radius-xl $radius-xl 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2px solid rgba(139, 105, 20, 0.2);
  background: linear-gradient(180deg, rgba(196, 154, 44, 0.15) 0%, transparent 100%);

  h3 { font-size: $font-size-lg; color: $color-text-dark; font-weight: 700; flex: 1; }

  .header-coins {
    font-size: $font-size-sm;
    font-weight: 700;
    color: #8a6d1b;
    background: rgba(139, 105, 20, 0.1);
    padding: 3px 10px;
    border-radius: 12px;
  }
}

.close-btn {
  width: 28px; height: 28px;
  border-radius: $radius-round;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: $color-text-light;
  background: rgba(139, 105, 20, 0.12);
  &:hover { background: rgba(139, 105, 20, 0.25); }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md $spacing-lg;
}

.shop-group { margin-bottom: $spacing-lg; }

.group-title {
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-text-dark;
  margin-bottom: $spacing-sm;
  padding-left: $spacing-xs;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
}

.shop-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: $spacing-sm;
  background: rgba(139, 105, 20, 0.05);
  border: 1.5px solid rgba(139, 105, 20, 0.1);
  border-radius: $radius-md;
  transition: all $transition-fast;

  &.wide {
    grid-column: span 1;
    flex-direction: row;
    gap: $spacing-sm;
    justify-content: flex-start;
  }

  &:active { transform: scale(0.95); }
  &.disabled { opacity: 0.4; }
}

.shop-emoji { font-size: 24px; }

.shop-name {
  font-size: $font-size-xs;
  font-weight: 600;
  color: $color-text-dark;
  text-align: center;
  .wide & { text-align: left; flex: 1; }
}

.shop-price {
  font-size: $font-size-xs;
  font-weight: 700;
  color: #8a6d1b;
}
</style>
