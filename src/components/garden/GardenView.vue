<template>
  <div class="garden-view">
    <div class="section-header">
      <h2>🌷 我的花园</h2>
      <div class="sub-info">
        <span>🌸 {{ bloomingCount }}盆盛开</span>
      </div>
    </div>

    <div class="pots-grid">
      <div
        v-for="pot in game.gardenPots"
        :key="pot.id"
        class="pot-card"
        :class="'state-' + pot.state.toLowerCase()"
        @click="handlePotClick(pot)"
      >
        <template v-if="!pot.flowerId">
          <div class="pot-emoji">🏺</div>
          <div class="pot-label">空花盆</div>
        </template>
        <template v-else>
          <div class="pot-emoji">{{ getFlowerStageEmoji(pot) }}</div>
          <div class="pot-label">{{ getFlowerConfig(pot)?.name }}</div>
          <div v-if="pot.state === 'SEED' || pot.state === 'GROWING'" class="progress-bar">
            <div class="progress-fill" :style="{ width: (pot.growthProgress * 100) + '%' }"></div>
          </div>
          <div v-if="pot.state === 'BLOOM'" class="bloom-badge">💐 可采摘</div>
        </template>
      </div>
    </div>

    <button v-if="canExpand" class="expand-btn" @click="handleExpand">
      🏗️ 扩建花园 (🪙{{ expandPrice }})
    </button>

    <GameModal :visible="showPlantModal" title="🌷 选择花种" @close="showPlantModal = false">
      <div class="flower-list">
        <button
          v-for="flower in availableFlowers"
          :key="flower.id"
          class="flower-item"
          :class="{ disabled: game.coins < flower.seedPrice }"
          @click="handlePlant(flower.id)"
        >
          <span class="flower-emoji">{{ flower.emoji }}</span>
          <div class="flower-info">
            <span class="flower-name">{{ flower.name }}</span>
            <span class="flower-detail">⏱{{ formatTime(flower.growTimeSeconds) }} 💧{{ flower.waterCost }}</span>
          </div>
          <span class="flower-price">🪙{{ flower.seedPrice }}</span>
        </button>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'
import { FLOWER_CONFIGS } from '@/configs'
import type { FlowerId, FlowerConfig } from '@/configs/flowers'
import { GARDEN_POT_PRICES } from '@/configs/economy'
import type { FlowerPotData } from '@/systems/garden/state'
import GameModal from '@/components/common/GameModal.vue'
import { formatTime } from '@/utils'

const game = useGameStore()
const showPlantModal = ref(false)
const selectedPotIndex = ref(-1)

const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast', () => {})

const bloomingCount = computed(() => game.gardenPots.filter(p => p.state === 'BLOOM').length)

const availableFlowers = computed(() =>
  Object.values(FLOWER_CONFIGS).filter(f => f.unlockLevel <= game.level)
)

const canExpand = computed(() => {
  const nextPrice = GARDEN_POT_PRICES.find(p => p.potIndex === game.gardenPots.length)
  return !!nextPrice
})

const expandPrice = computed(() => {
  const nextPrice = GARDEN_POT_PRICES.find(p => p.potIndex === game.gardenPots.length)
  return nextPrice?.price ?? 0
})

function getFlowerConfig(pot: FlowerPotData): FlowerConfig | null {
  if (!pot.flowerId) return null
  return FLOWER_CONFIGS[pot.flowerId as FlowerId] ?? null
}

function getFlowerStageEmoji(pot: FlowerPotData): string {
  const config = getFlowerConfig(pot)
  if (!config) return '🌱'
  const stageIdx = Math.min(
    Math.floor(pot.growthProgress * config.stages.length),
    config.stages.length - 1
  )
  return config.stages[stageIdx]
}

function handlePotClick(pot: FlowerPotData) {
  if (!pot.flowerId) {
    selectedPotIndex.value = pot.id
    showPlantModal.value = true
  } else if (pot.state === 'SEED' || pot.state === 'GROWING') {
    if (!game.waterFlowerPot(pot.id)) {
      showToast('水不够了！', 'error')
    }
  } else if (pot.state === 'BLOOM') {
    game.pickFlowerPot(pot.id)
    showToast('采摘成功！', 'success')
  }
}

function handlePlant(flowerId: FlowerId) {
  if (selectedPotIndex.value < 0) return
  const success = game.plantFlowerPot(selectedPotIndex.value, flowerId)
  if (success) {
    showPlantModal.value = false
    showToast('种植成功！', 'success')
  } else {
    showToast('金币不足', 'error')
  }
}

function handleExpand() {
  const success = game.buyGardenPot()
  if (success) {
    showToast('花园扩建成功！', 'success')
  } else {
    showToast('金币不足', 'error')
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.garden-view {
  padding: $spacing-md;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
  h2 { font-size: $font-size-xl; }
}

.sub-info {
  font-size: $font-size-sm;
  color: $color-text-light;
}

.pots-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.pot-card {
  background: $color-card;
  border-radius: $radius-md;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  box-shadow: $shadow-soft;
  transition: all $transition-fast;
  cursor: pointer;
  min-height: 120px;

  &:active { transform: scale(0.97); }

  &.state-bloom {
    border: 2px solid rgba(#e91e63, 0.4);
    background: rgba(#e91e63, 0.05);
  }
}

.pot-emoji {
  font-size: 36px;
}

.pot-label {
  font-size: $font-size-sm;
  color: $color-text-light;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #e91e63;
  border-radius: 3px;
}

.bloom-badge {
  font-size: $font-size-xs;
  font-weight: 700;
  color: #e91e63;
  animation: bounce 1s infinite;
}

.expand-btn {
  width: 100%;
  padding: $spacing-md;
  background: rgba(#e91e63, 0.1);
  border-radius: $radius-md;
  color: #880e4f;
  font-weight: 600;
  transition: all $transition-fast;

  &:active { transform: scale(0.98); }
}

.flower-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.flower-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: rgba(0, 0, 0, 0.03);
  border-radius: $radius-sm;
  transition: all $transition-fast;

  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.5; }
}

.flower-emoji { font-size: 24px; }
.flower-info { flex: 1; display: flex; flex-direction: column; }
.flower-name { font-weight: 600; }
.flower-detail { font-size: $font-size-xs; color: $color-text-light; }
.flower-price { font-weight: 700; color: #8a6d1b; }
</style>
