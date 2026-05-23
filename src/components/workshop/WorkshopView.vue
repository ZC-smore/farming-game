<template>
  <div class="workshop-view">
    <div class="section-header">
      <h2>🔧 花艺工坊</h2>
      <div class="sub-info">
        <span>🪙 加工费: 5币/次</span>
      </div>
    </div>

    <!-- 作物加工 -->
    <div class="process-section">
      <h3>🌾 作物加工</h3>
      <div class="process-grid">
        <button
          v-for="crop in processableCrops"
          :key="crop.id"
          class="process-card"
          :class="{ disabled: !canProcess(crop.id) }"
          @click="handleProcessCrop(crop.id)"
        >
          <div class="process-flow">
            <span class="item-emoji">{{ crop.emoji }}</span>
            <span class="arrow">→</span>
            <span class="item-emoji">{{ crop.processedEmoji }}</span>
          </div>
          <div class="process-info">
            <div class="process-name">{{ crop.name }} → {{ crop.processedName }}</div>
            <div class="process-price">售价: 🪙{{ crop.processedPrice }}</div>
          </div>
          <div class="process-stock">库存: {{ getCropStock(crop.id) }}</div>
        </button>
      </div>
    </div>

    <!-- 动物产品加工 -->
    <div class="process-section">
      <h3>🐄 产品加工</h3>
      <div class="process-grid">
        <button
          v-for="animal in processableAnimals"
          :key="animal.id"
          class="process-card"
          :class="{ disabled: !canProcessAnimalProduct(animal.id) }"
          @click="handleProcessAnimal(animal.id)"
        >
          <div class="process-flow">
            <span class="item-emoji">{{ animal.productEmoji }}</span>
            <span class="arrow">→</span>
            <span class="item-emoji">{{ animal.processedEmoji }}</span>
          </div>
          <div class="process-info">
            <div class="process-name">{{ animal.productName }} → {{ animal.processedName }}</div>
            <div class="process-price">售价: 🪙{{ animal.processedPrice }}</div>
          </div>
          <div class="process-stock">库存: {{ getAnimalProductStock(animal.id) }}</div>
        </button>
      </div>
    </div>

    <!-- 花艺加工 -->
    <div class="process-section">
      <h3>🌷 花艺加工</h3>
      <div class="process-grid">
        <button
          v-for="flower in processableFlowers"
          :key="flower.id"
          class="process-card flower-card"
          :class="{ disabled: !canProcessFlower(flower.id) }"
          @click="handleProcessFlower(flower.id)"
        >
          <div class="process-flow">
            <span class="item-emoji">{{ flower.emoji }}</span>
            <span class="arrow">→</span>
            <span class="item-emoji">{{ flower.processedEmoji }}</span>
          </div>
          <div class="process-info">
            <div class="process-name">{{ flower.name }} → {{ flower.processedName }}</div>
            <div class="process-price">售价: 🪙{{ flower.processedPrice }}</div>
          </div>
          <div class="process-stock">库存: {{ getFlowerStock(flower.id) }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { CROP_CONFIGS, ANIMAL_CONFIGS, FLOWER_CONFIGS } from '@/configs'
import type { CropId } from '@/configs/crops'
import type { AnimalId } from '@/configs/animals'
import type { FlowerId } from '@/configs/flowers'
import { getItemCount } from '@/systems/inventory'

const game = useGameStore()

const processableCrops = computed(() =>
  Object.values(CROP_CONFIGS).filter(c => c.unlockLevel <= game.level)
)

const processableAnimals = computed(() =>
  Object.values(ANIMAL_CONFIGS).filter(a => a.unlockLevel <= game.level)
)

const processableFlowers = computed(() =>
  Object.values(FLOWER_CONFIGS).filter(f => f.unlockLevel <= game.level)
)

function getCropStock(cropId: CropId): number {
  return getItemCount(game.inventory, cropId)
}

function getAnimalProductStock(animalId: AnimalId): number {
  return getItemCount(game.inventory, animalId + '_product')
}

function getFlowerStock(flowerId: FlowerId): number {
  return getItemCount(game.inventory, flowerId)
}

function canProcess(cropId: CropId): boolean {
  return getItemCount(game.inventory, cropId) >= 1 && game.coins >= 5
}

function canProcessAnimalProduct(animalId: AnimalId): boolean {
  return getItemCount(game.inventory, animalId + '_product') >= 1 && game.coins >= 5
}

function canProcessFlower(flowerId: FlowerId): boolean {
  return getItemCount(game.inventory, flowerId) >= 1 && game.coins >= 5
}

function handleProcessCrop(cropId: CropId) {
  const config = CROP_CONFIGS[cropId]
  if (!config) return
  const success = game.processItem(
    cropId, cropId + '_processed', config.processedName, config.processedEmoji, config.processedPrice
  )
  if (!success) {
    // 材料不足或金币不足
  }
}

function handleProcessAnimal(animalId: AnimalId) {
  const config = ANIMAL_CONFIGS[animalId]
  if (!config) return
  const success = game.processItem(
    animalId + '_product', animalId + '_processed', config.processedName, config.processedEmoji, config.processedPrice
  )
  if (!success) {
    // 材料不足或金币不足
  }
}

function handleProcessFlower(flowerId: FlowerId) {
  const config = FLOWER_CONFIGS[flowerId]
  if (!config) return
  const success = game.processItem(
    flowerId, flowerId + '_processed', config.processedName, config.processedEmoji, config.processedPrice
  )
  if (!success) {
    // 材料不足或金币不足
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.workshop-view {
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
  font-size: $font-size-sm;
  color: $color-text-light;
}

.process-section {
  margin-bottom: $spacing-xl;

  h3 {
    font-size: $font-size-lg;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-xs;
    border-bottom: 1px solid $color-border;
  }
}

.process-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.process-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $color-card;
  border-radius: $radius-md;
  box-shadow: $shadow-soft;
  transition: all $transition-fast;

  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.4; }

  &.flower-card {
    border-left: 3px solid #e91e63;
  }
}

.process-flow {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.item-emoji {
  font-size: 24px;
}

.arrow {
  color: $color-text-light;
  font-size: $font-size-lg;
}

.process-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.process-name {
  font-size: $font-size-sm;
  font-weight: 600;
}

.process-price {
  font-size: $font-size-xs;
  color: #8a6d1b;
}

.process-stock {
  font-size: $font-size-xs;
  color: $color-text-light;
  white-space: nowrap;
}
</style>
