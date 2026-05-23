<template>
  <div class="farm-world">
    <!-- 背景装饰层 -->
    <div class="world-decor">
      <div class="sky-gradient"></div>
      <div class="cloud cloud-1">☁️</div>
      <div class="cloud cloud-2">☁️</div>
      <div class="cloud cloud-3">⛅</div>
      <div class="tree tree-1">🌳</div>
      <div class="tree tree-2">🌲</div>
      <div class="tree tree-3">🌳</div>
      <div class="house">🏠</div>
      <div class="fence-left"></div>
      <div class="fence-right"></div>
    </div>

    <!-- 等距农田区 -->
    <div class="iso-container">
      <div class="iso-grid">
        <div
          v-for="(plot, idx) in game.farmPlots"
          :key="plot.id"
          class="iso-tile"
          :class="plotStateClass(plot)"
          :style="tilePosition(idx)"
          @click="handlePlotClick(plot)"
        >
          <!-- 泥土底座 -->
          <div class="tile-ground">
            <div class="dirt-top"></div>
            <div class="dirt-front"></div>
          </div>

          <!-- 作物层 -->
          <div class="tile-crop">
            <!-- 空地 -->
            <template v-if="plot.state === 'EMPTY'">
              <span class="empty-icon">➕</span>
            </template>

            <!-- 生长中 -->
            <template v-else-if="plot.state === 'PLANTED' || plot.state === 'GROWING'">
              <span class="crop-emoji" :class="{ 'crop-watered': !needsWater(plot) }">
                {{ getCropStageEmoji(plot) }}
              </span>
              <div class="growth-bar">
                <div class="growth-fill" :style="{ width: (plot.growthProgress * 100) + '%' }"></div>
              </div>
              <span v-if="needsWater(plot)" class="water-badge">💧</span>
              <span v-else class="time-badge">{{ getTimeRemaining(plot) }}</span>
            </template>

            <!-- 成熟 -->
            <template v-else-if="plot.state === 'MATURE'">
              <span class="crop-emoji crop-mature">{{ getCropEmoji(plot) }}</span>
              <span class="harvest-sparkle">✨</span>
            </template>

            <!-- 枯萎 -->
            <template v-else-if="plot.state === 'WITHERED'">
              <span class="crop-emoji crop-withered">🥀</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="farm-toolbar">
      <button class="wood-btn tool-btn" @click="showPlantModal = true">
        <span>🌱</span><span>播种</span>
      </button>
      <button class="wood-btn tool-btn" @click="waterAll">
        <span>💧</span><span>浇水</span>
      </button>
      <button class="wood-btn tool-btn" @click="harvestAll">
        <span>🌾</span><span>收获</span>
      </button>
      <button v-if="canExpand" class="wood-btn tool-btn expand" @click="handleExpand">
        <span>🏗️</span><span>扩建🪙{{ expandPrice }}</span>
      </button>
    </div>

    <!-- 种植弹窗 -->
    <GameModal :visible="showPlantModal" title="🌱 选择种子" @close="showPlantModal = false">
      <div class="seed-list">
        <button
          v-for="crop in availableCrops"
          :key="crop.id"
          class="seed-item"
          :class="{ disabled: game.coins < crop.seedPrice }"
          @click="handlePlantSelect(crop.id)"
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

    <!-- 选择地块弹窗 -->
    <GameModal v-if="showPlotSelectModal" :visible="showPlotSelectModal" title="🟫 选择地块" @close="showPlotSelectModal = false">
      <div class="plot-select-grid">
        <button
          v-for="plot in emptyPlots"
          :key="plot.id"
          class="plot-select-item"
          @click="handlePlantToPlot(plot.id)"
        >
          <span>🟫</span>
          <span>地块 {{ plot.id + 1 }}</span>
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
import type { CropPlotData } from '@/systems/crop/state'
import GameModal from '@/components/common/GameModal.vue'
import { formatTime } from '@/utils'

const game = useGameStore()
const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast', () => {})

const showPlantModal = ref(false)
const showPlotSelectModal = ref(false)
const selectedCropId = ref<CropId | null>(null)

// 等距布局参数（与SCSS变量保持同步）
const COLS = 3
const TILE_W = 110
const TILE_H = 55
const GAP_X = 10
const GAP_Y = 8

const availableCrops = computed(() =>
  Object.values(CROP_CONFIGS).filter(c => c.unlockLevel <= game.level)
)

const emptyPlots = computed(() =>
  game.farmPlots.filter(p => p.state === 'EMPTY')
)

const canExpand = computed(() => {
  const nextPrice = FARM_PLOT_PRICES.find(p => p.plotIndex === game.farmPlots.length)
  return !!nextPrice
})

const expandPrice = computed(() => {
  const nextPrice = FARM_PLOT_PRICES.find(p => p.plotIndex === game.farmPlots.length)
  return nextPrice?.price ?? 0
})

function tilePosition(idx: number) {
  const row = Math.floor(idx / COLS)
  const col = idx % COLS
  // 等距投影：x = (col - row) * halfW, y = (col + row) * halfH
  const x = (col - row) * (TILE_W / 2 + GAP_X)
  const y = (col + row) * (TILE_H / 2 + GAP_Y)
  return {
    transform: `translate(${x}px, ${y}px)`,
    zIndex: row + col,
  }
}

function plotStateClass(plot: CropPlotData) {
  return {
    'tile-empty': plot.state === 'EMPTY',
    'tile-planted': plot.state === 'PLANTED',
    'tile-growing': plot.state === 'GROWING',
    'tile-mature': plot.state === 'MATURE',
    'tile-withered': plot.state === 'WITHERED',
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
      selectedCropId.value = null
      showPlantModal.value = true
      // 存储当前选中的空地块
      pendingPlotId.value = plot.id
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

const pendingPlotId = ref(-1)

function handlePlantSelect(cropId: CropId) {
  selectedCropId.value = cropId
  showPlantModal.value = false
  // 直接种到 pendingPlotId
  if (pendingPlotId.value >= 0 && selectedCropId.value) {
    const success = game.plantCrop(pendingPlotId.value, selectedCropId.value)
    if (success) {
      showToast('播种成功！', 'success')
    } else {
      showToast('金币不足', 'error')
    }
    pendingPlotId.value = -1
    selectedCropId.value = null
  }
}

function handlePlantToPlot(plotId: number) {
  if (!selectedCropId.value) return
  const success = game.plantCrop(plotId, selectedCropId.value)
  if (success) {
    showToast('播种成功！', 'success')
  } else {
    showToast('金币不足', 'error')
  }
  showPlotSelectModal.value = false
}

function waterAll() {
  let count = 0
  for (const plot of game.farmPlots) {
    if (needsWater(plot)) {
      const ok = game.waterPlot(plot.id)
      if (ok) count++
    }
  }
  if (count > 0) showToast(`浇了${count}块地！`, 'success')
  else showToast('没有需要浇水的作物', 'info')
}

function harvestAll() {
  let count = 0
  for (const plot of game.farmPlots) {
    if (plot.state === 'MATURE') {
      game.harvestPlot(plot.id)
      count++
    }
  }
  if (count > 0) showToast(`收获了${count}块！`, 'success')
  else showToast('没有可收获的作物', 'info')
}

function handleExpand() {
  const success = game.buyFarmPlot()
  if (success) showToast('农田扩建成功！', 'success')
  else showToast('金币不足', 'error')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.farm-world {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(255,255,200,0.12) 0%, transparent 60%),
    linear-gradient(180deg, #b5e8a0 0%, $world-grass-light 20%, $world-grass-mid 50%, $world-grass-dark 100%);
}

// === 背景装饰 ===
.world-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.sky-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(180,220,255,0.3) 0%, transparent 100%);
}

.cloud {
  position: absolute;
  font-size: 32px;
  opacity: 0.7;
  animation: cloudFloat linear infinite;
}
.cloud-1 { top: 5%; left: 10%; animation-duration: 25s; }
.cloud-2 { top: 8%; left: 60%; font-size: 24px; animation-duration: 35s; }
.cloud-3 { top: 3%; left: 80%; font-size: 20px; animation-duration: 30s; }

@keyframes cloudFloat {
  0% { transform: translateX(0); }
  50% { transform: translateX(30px); }
  100% { transform: translateX(0); }
}

.tree {
  position: absolute;
  font-size: 48px;
  filter: drop-shadow(2px 4px 3px rgba(0,0,0,0.2));
  animation: sway 4s ease-in-out infinite;
}
.tree-1 { bottom: 35%; left: 3%; animation-delay: 0s; }
.tree-2 { bottom: 45%; right: 5%; animation-delay: 1.5s; font-size: 40px; }
.tree-3 { bottom: 25%; left: 8%; animation-delay: 0.8s; font-size: 36px; }

.house {
  position: absolute;
  top: 12%;
  right: 10%;
  font-size: 56px;
  filter: drop-shadow(3px 5px 4px rgba(0,0,0,0.2));
}

.fence-left, .fence-right {
  position: absolute;
  bottom: 15%;
  width: 6px;
  height: 60%;
  &::before, &::after {
    content: '🪵';
    position: absolute;
    font-size: 14px;
  }
}
.fence-left {
  left: 0;
  &::before { top: 20%; left: -4px; }
  &::after { top: 60%; left: -4px; }
}
.fence-right {
  right: 0;
  &::before { top: 30%; right: -4px; }
  &::after { top: 70%; right: -4px; }
}

// === 等距网格 ===
.iso-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  overflow: visible;
}

.iso-grid {
  position: relative;
  width: 0;
  height: 0;
}

$tile-w: 110px;
$tile-h: 55px;

.iso-tile {
  position: absolute;
  width: $tile-w;
  height: $tile-h;
  cursor: pointer;
  transition: all $transition-fast;

  &:active {
    filter: brightness(1.1);
  }

  &.tile-mature {
    .dirt-top { background: linear-gradient(135deg, #c4a882 0%, #b89870 50%, #d4b896 100%); }
  }

  &.tile-withered {
    filter: saturate(0.4) brightness(0.85);
  }
}

.tile-ground {
  position: absolute;
  inset: 0;
}

// 等距菱形顶面
.dirt-top {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, $world-dirt-light 0%, $world-dirt 50%, $world-dirt-wet 100%);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  border-radius: 2px;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.1);
  transition: background $transition-normal;

  .tile-empty & {
    background: linear-gradient(135deg, #d4b896 0%, $world-path 50%, #c4a882 100%);
  }

  .tile-planted &, .tile-growing & {
    background: linear-gradient(135deg, #8b6b40 0%, $world-dirt 50%, #6b4f35 100%);
  }
}

// 侧面立体感
.dirt-front {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(180deg, $world-dirt 0%, #7a5f42 100%);
  clip-path: polygon(0% 0%, 50% 100%, 100% 0%, 50% -5%);
  opacity: 0.5;
}

// 作物层
.tile-crop {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 2;
}

.crop-emoji {
  font-size: 28px;
  line-height: 1;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
  animation: grow 0.5s ease backwards;
  transition: all $transition-normal;

  &.crop-watered {
    filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2)) brightness(1.1);
  }

  &.crop-mature {
    animation: bounce 1.2s ease-in-out infinite;
    font-size: 32px;
  }

  &.crop-withered {
    animation: none;
    opacity: 0.7;
  }
}

.empty-icon {
  font-size: 18px;
  opacity: 0.4;
  line-height: 1;
}

.growth-bar {
  width: 40px;
  height: 4px;
  background: rgba(0,0,0,0.2);
  border-radius: 2px;
  overflow: hidden;
}

.growth-fill {
  height: 100%;
  background: linear-gradient(90deg, #6ab04c, #a8d86e);
  border-radius: 2px;
  transition: width $transition-normal;
}

.water-badge, .time-badge {
  font-size: 8px;
  line-height: 1;
}

.water-badge {
  animation: bounce 0.8s ease-in-out infinite;
}

.time-badge {
  color: rgba(255,255,255,0.8);
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  font-weight: 600;
}

.harvest-sparkle {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 12px;
  animation: sparkle 1.5s ease-in-out infinite;
}

// === 底部工具栏 ===
.farm-toolbar {
  position: fixed;
  bottom: $nav-height + 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: $spacing-sm;
  z-index: 150;
  padding: $spacing-xs;
  background: rgba(42, 31, 20, 0.65);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  border: 2px solid rgba(196, 154, 44, 0.3);
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 14px 5px;
  border-radius: 10px;
  background: $wood-bg;
  border: 2px solid $wood-border;
  box-shadow: $wood-shadow;
  min-width: 48px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 8px;
    right: 8px;
    height: 3px;
    background: rgba(255,255,255,0.15);
    border-radius: 0 0 3px 3px;
  }

  span:first-child { font-size: 18px; line-height: 1; }
  span:last-child {
    font-size: 9px;
    color: $wood-text;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #4a3508;
  }

  &.expand span:last-child { font-size: 8px; }
}

// === 种子列表 ===
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
  background: rgba(139, 105, 20, 0.06);
  border-radius: $radius-md;
  border: 1.5px solid rgba(139, 105, 20, 0.12);
  transition: all $transition-fast;

  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.45; }
}

.seed-emoji { font-size: 28px; }

.seed-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.seed-name {
  font-weight: 700;
  font-size: $font-size-md;
  color: $color-text-dark;
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

// === 地块选择网格 ===
.plot-select-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
}

.plot-select-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: $spacing-md;
  background: rgba(139, 105, 20, 0.06);
  border-radius: $radius-md;
  border: 1.5px solid rgba(139, 105, 20, 0.12);
  font-size: $font-size-sm;
  color: $color-text;
  font-weight: 600;

  &:active { transform: scale(0.95); }
  span:first-child { font-size: 24px; }
}
</style>
