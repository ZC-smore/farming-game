<template>
  <div class="farm-view">
    <div class="section-header">
      <h2>🌾 我的农场</h2>
      <div class="sub-info">
        <span>🌱 {{ plantableCount }}块可种</span>
        <span>🌾 饲料: {{ game.feedStock }}</span>
      </div>
    </div>

    <div class="plots-grid">
      <div
        v-for="plot in game.farmPlots"
        :key="plot.id"
        class="plot-card"
        :class="plotStateClass(plot)"
        @click="handlePlotClick(plot)"
      >
        <!-- 空地 -->
        <template v-if="plot.state === 'EMPTY'">
          <div class="plot-emoji">➕</div>
          <div class="plot-label">空地</div>
        </template>

        <!-- 已种植 -->
        <template v-else-if="plot.state === 'PLANTED' || plot.state === 'GROWING'">
          <div class="plot-emoji">{{ getCropStageEmoji(plot) }}</div>
          <div class="plot-label">{{ getCropName(plot) }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (plot.growthProgress * 100) + '%' }"></div>
          </div>
          <div v-if="needsWater(plot)" class="water-indicator">💧需要浇水</div>
          <div v-else class="time-remaining">{{ getTimeRemaining(plot) }}</div>
        </template>

        <!-- 成熟 -->
        <template v-else-if="plot.state === 'MATURE'">
          <div class="plot-emoji harvest-ready">{{ getCropEmoji(plot) }}</div>
          <div class="plot-label harvest-label">可收获!</div>
        </template>

        <!-- 枯萎 -->
        <template v-else-if="plot.state === 'WITHERED'">
          <div class="plot-emoji">🥀</div>
          <div class="plot-label withered">已枯萎</div>
        </template>
      </div>
    </div>

    <!-- 扩建 -->
    <button v-if="canExpand" class="expand-btn" @click="handleExpand">
      🏗️ 扩建农田 (🪙{{ expandPrice }})
    </button>

    <!-- 制作区 -->
    <div class="craft-section">
      <h3>🧪 制作</h3>
      <div class="craft-buttons">
        <button class="craft-btn" @click="showCraftFeedModal = true">
          🌾 制作饲料
          <span class="craft-cost">2作物→1饲料</span>
        </button>
        <button class="craft-btn" @click="handleCraftFertilizer" :disabled="game.feedStock < 3">
          🌱 制作肥料
          <span class="craft-cost">3饲料→1肥料</span>
        </button>
      </div>
    </div>

    <!-- 种植选择弹窗 -->
    <GameModal :visible="showPlantModal" title="🌱 选择种子" @close="showPlantModal = false">
      <div class="seed-list">
        <button
          v-for="crop in availableCrops"
          :key="crop.id"
          class="seed-item"
          :class="{ disabled: game.coins < crop.seedPrice }"
          @click="handlePlant(crop.id)"
        >
          <span class="seed-emoji">{{ crop.emoji }}</span>
          <div class="seed-info">
            <span class="seed-name">{{ crop.name }}</span>
            <span class="seed-detail">⏱{{ formatTime(crop.growTimeSeconds) }} 💧{{ crop.waterCost }}</span>
          </div>
          <span class="seed-price">🪙{{ crop.seedPrice }}</span>
        </button>
      </div>
    </GameModal>

    <!-- 饲料制作弹窗 -->
    <GameModal :visible="showCraftFeedModal" title="🌾 制作饲料" @close="showCraftFeedModal = false">
      <div class="seed-list">
        <button
          v-for="crop in cropsInInventory"
          :key="crop.id"
          class="seed-item"
          :disabled="getItemCount(crop.id) < 2"
          @click="handleCraftFeed(crop.id)"
        >
          <span class="seed-emoji">{{ crop.emoji }}</span>
          <div class="seed-info">
            <span class="seed-name">{{ crop.name }}</span>
            <span class="seed-detail">库存: {{ getItemCount(crop.id) }}</span>
          </div>
          <span class="seed-price">2→1饲料</span>
        </button>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'
import { CROP_CONFIGS } from '@/configs'
import type { CropId, CropConfig } from '@/configs/crops'
import { FARM_PLOT_PRICES } from '@/configs/economy'
import { getItemCount } from '@/systems/inventory'
import type { CropPlotData } from '@/systems/crop/state'
import GameModal from '@/components/common/GameModal.vue'
import { formatTime } from '@/utils'

const game = useGameStore()

const showPlantModal = ref(false)
const showCraftFeedModal = ref(false)
const selectedPlotIndex = ref(-1)

const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast', () => {})

const plantableCount = computed(() => game.farmPlots.filter(p => p.state === 'EMPTY').length)

const availableCrops = computed(() =>
  Object.values(CROP_CONFIGS).filter(c => c.unlockLevel <= game.level)
)

const cropsInInventory = computed(() =>
  Object.values(CROP_CONFIGS).filter(c => getItemCount(game.inventory, c.id) > 0)
)

const canExpand = computed(() => {
  const nextPrice = FARM_PLOT_PRICES.find(p => p.plotIndex === game.farmPlots.length)
  return !!nextPrice
})

const expandPrice = computed(() => {
  const nextPrice = FARM_PLOT_PRICES.find(p => p.plotIndex === game.farmPlots.length)
  return nextPrice?.price ?? 0
})

function plotStateClass(plot: CropPlotData) {
  return {
    'plot-empty': plot.state === 'EMPTY',
    'plot-growing': plot.state === 'PLANTED' || plot.state === 'GROWING',
    'plot-mature': plot.state === 'MATURE',
    'plot-withered': plot.state === 'WITHERED',
  }
}

function getCropConfig(plot: CropPlotData): CropConfig | null {
  if (!plot.cropId) return null
  return CROP_CONFIGS[plot.cropId as CropId] ?? null
}

function getCropStageEmoji(plot: CropPlotData): string {
  const config = getCropConfig(plot)
  if (!config) return '🌱'
  const stageIdx = Math.min(
    Math.floor(plot.growthProgress * config.stages.length),
    config.stages.length - 1
  )
  return config.stages[stageIdx]
}

function getCropEmoji(plot: CropPlotData): string {
  return getCropConfig(plot)?.emoji ?? '🌱'
}

function getCropName(plot: CropPlotData): string {
  return getCropConfig(plot)?.name ?? '未知'
}

function needsWater(plot: CropPlotData): boolean {
  return plot.waterCount === 0 && (plot.state === 'PLANTED' || plot.state === 'GROWING')
}

function getTimeRemaining(plot: CropPlotData): string {
  if (!plot.matureAt) return '--'
  const remaining = Math.max(0, plot.matureAt - Date.now())
  return formatTime(remaining / 1000)
}

function handlePlotClick(plot: CropPlotData) {
  switch (plot.state) {
    case 'EMPTY':
      selectedPlotIndex.value = plot.id
      showPlantModal.value = true
      break
    case 'PLANTED':
    case 'GROWING':
      if (needsWater(plot)) {
        const success = game.waterPlot(plot.id)
        if (!success) showToast('水不够了！', 'error')
      }
      break
    case 'MATURE':
      game.harvestPlot(plot.id)
      showToast('收获成功！', 'success')
      break
    case 'WITHERED':
      game.clearWithered(plot.id)
      break
  }
}

function handlePlant(cropId: CropId) {
  if (selectedPlotIndex.value < 0) return
  const success = game.plantCrop(selectedPlotIndex.value, cropId)
  if (success) {
    showPlantModal.value = false
    showToast('播种成功！', 'success')
  } else {
    showToast('金币不足或条件不满足', 'error')
  }
}

function handleExpand() {
  const success = game.buyFarmPlot()
  if (success) {
    showToast('农田扩建成功！', 'success')
  } else {
    showToast('金币不足', 'error')
  }
}

function handleCraftFeed(cropId: CropId) {
  const success = game.craftFeed(cropId)
  if (success) {
    showToast('制作饲料成功！', 'success')
  } else {
    showToast('材料不足', 'error')
  }
}

function handleCraftFertilizer() {
  const success = game.craftFertilizer()
  if (success) {
    showToast('制作肥料成功！', 'success')
  } else {
    showToast('饲料不足（需要3份）', 'error')
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.farm-view {
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
  display: flex;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-text-light;
}

.plots-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.plot-card {
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

  &.plot-empty {
    border: 2px dashed $color-border;
    background: rgba($color-primary, 0.03);
  }

  &.plot-mature {
    background: rgba($color-primary, 0.08);
    border: 2px solid rgba($color-primary, 0.3);
  }

  &.plot-withered {
    opacity: 0.6;
  }
}

.plot-emoji {
  font-size: 36px;
  line-height: 1;

  &.harvest-ready {
    animation: bounce 1s infinite;
  }
}

.plot-label {
  font-size: $font-size-sm;
  color: $color-text-light;
  font-weight: 500;

  &.harvest-label {
    color: $color-primary;
    font-weight: 700;
  }

  &.withered {
    color: $color-danger;
  }
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
  background: $color-primary;
  border-radius: 3px;
  transition: width $transition-normal;
}

.water-indicator {
  font-size: $font-size-xs;
  color: #4a8aff;
  font-weight: 600;
}

.time-remaining {
  font-size: $font-size-xs;
  color: $color-text-light;
}

.expand-btn {
  width: 100%;
  padding: $spacing-md;
  background: rgba($color-secondary, 0.15);
  border-radius: $radius-md;
  color: #8a6d1b;
  font-weight: 600;
  font-size: $font-size-md;
  margin-bottom: $spacing-lg;
  transition: all $transition-fast;

  &:active { transform: scale(0.98); }
}

.craft-section {
  margin-bottom: $spacing-lg;

  h3 {
    font-size: $font-size-lg;
    margin-bottom: $spacing-sm;
  }
}

.craft-buttons {
  display: flex;
  gap: $spacing-sm;
}

.craft-btn {
  flex: 1;
  padding: $spacing-md;
  background: rgba($color-primary, 0.08);
  border-radius: $radius-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  transition: all $transition-fast;

  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.5; }
}

.craft-cost {
  font-size: $font-size-xs;
  color: $color-text-light;
  font-weight: 400;
}

.seed-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.seed-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: rgba(0, 0, 0, 0.03);
  border-radius: $radius-sm;
  transition: all $transition-fast;

  &:active { transform: scale(0.98); }
  &.disabled, &:disabled { opacity: 0.5; }
}

.seed-emoji { font-size: 24px; }

.seed-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.seed-name {
  font-weight: 600;
  font-size: $font-size-md;
}

.seed-detail {
  font-size: $font-size-xs;
  color: $color-text-light;
}

.seed-price {
  font-weight: 700;
  color: #8a6d1b;
  font-size: $font-size-sm;
}
</style>
