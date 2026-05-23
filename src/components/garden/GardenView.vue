<template>
  <div class="garden-world">
    <!-- 背景装饰 -->
    <div class="world-decor">
      <div class="sky-gradient"></div>
      <div class="cloud cloud-1">☁️</div>
      <div class="bird bird-1">🕊️</div>
      <div class="bird bird-2">🕊️</div>
      <div class="bench">🪑</div>
      <div class="awning">🌸</div>
    </div>

    <!-- 花盆等距网格 -->
    <div class="iso-container">
      <div class="iso-grid">
        <div
          v-for="(pot, idx) in game.gardenPots"
          :key="pot.id"
          class="iso-pot"
          :class="potStateClass(pot)"
          :style="potPosition(idx)"
          @click="handlePotClick(pot)"
        >
          <!-- 花盆底座 -->
          <div class="pot-body">
            <div class="pot-top"></div>
            <div class="pot-front"></div>
          </div>

          <!-- 花层 -->
          <div class="pot-flower">
            <template v-if="!pot.flowerId">
              <span class="empty-hint">➕</span>
            </template>
            <template v-else>
              <span class="flower-emoji" :class="{ 'flower-bloom': pot.state === 'BLOOM' }">
                {{ getFlowerStageEmoji(pot) }}
              </span>
              <div v-if="pot.state === 'SEED' || pot.state === 'GROWING'" class="grow-bar">
                <div class="grow-fill" :style="{ width: (pot.growthProgress * 100) + '%' }"></div>
              </div>
              <span v-if="pot.state === 'BLOOM'" class="bloom-badge">💐</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="garden-toolbar">
      <button class="wood-btn tool-btn" @click="showPlantModal = true">
        <span>🌷</span><span>种花</span>
      </button>
      <button class="wood-btn tool-btn" @click="waterAll">
        <span>💧</span><span>浇水</span>
      </button>
      <button class="wood-btn tool-btn" @click="pickAll">
        <span>🌸</span><span>采摘</span>
      </button>
      <button v-if="canExpand" class="wood-btn tool-btn expand" @click="handleExpand">
        <span>🏗️</span><span>扩建🪙{{ expandPrice }}</span>
      </button>
    </div>

    <!-- 选花种弹窗 -->
    <GameModal :visible="showPlantModal" title="🌷 选择花种" @close="showPlantModal = false">
      <div class="flower-list">
        <button
          v-for="flower in availableFlowers"
          :key="flower.id"
          class="flower-item"
          :class="{ disabled: game.coins < flower.seedPrice }"
          @click="handlePlantSelect(flower.id)"
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
const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast', () => {})

const showPlantModal = ref(false)
const selectedFlowerId = ref<FlowerId | null>(null)

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

const COLS = 3
const TILE_W = 110
const TILE_H = 55
const GAP_X = 10
const GAP_Y = 8

function potPosition(idx: number) {
  const row = Math.floor(idx / COLS)
  const col = idx % COLS
  const x = (col - row) * (TILE_W / 2 + GAP_X)
  const y = (col + row) * (TILE_H / 2 + GAP_Y)
  return { transform: `translate(${x}px, ${y}px)`, zIndex: row + col }
}

function potStateClass(pot: FlowerPotData) {
  return {
    'pot-empty': !pot.flowerId,
    'pot-seed': pot.state === 'SEED',
    'pot-growing': pot.state === 'GROWING',
    'pot-bloom': pot.state === 'BLOOM',
    'pot-picked': pot.state === 'PICKED',
  }
}

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
    showPlantModal.value = true
  } else if (pot.state === 'SEED' || pot.state === 'GROWING') {
    if (!game.waterFlowerPot(pot.id)) showToast('水不够了！', 'error')
  } else if (pot.state === 'BLOOM') {
    game.pickFlowerPot(pot.id)
    showToast('采摘成功！', 'success')
  }
}

function handlePlantSelect(flowerId: FlowerId) {
  selectedFlowerId.value = flowerId
  showPlantModal.value = false
  // 找第一个空花盆
  const empty = game.gardenPots.find(p => !p.flowerId)
  if (!empty) { showToast('没有空花盆', 'error'); return }
  const success = game.plantFlowerPot(empty.id, flowerId)
  if (success) showToast('种植成功！', 'success')
  else showToast('金币不足', 'error')
}

function waterAll() {
  let count = 0
  for (const pot of game.gardenPots) {
    if (pot.state === 'SEED' || pot.state === 'GROWING') {
      if (game.waterFlowerPot(pot.id)) count++
    }
  }
  if (count > 0) showToast(`浇了${count}盆花！`, 'success')
  else showToast('没有需要浇水的花', 'info')
}

function pickAll() {
  let count = 0
  for (const pot of game.gardenPots) {
    if (pot.state === 'BLOOM') { game.pickFlowerPot(pot.id); count++ }
  }
  if (count > 0) showToast(`采摘了${count}朵花！`, 'success')
  else showToast('没有可采摘的花', 'info')
}

function handleExpand() {
  if (game.buyGardenPot()) showToast('花园扩建成功！', 'success')
  else showToast('金币不足', 'error')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

$wood-dark: #6b4a20;

$tile-w: 110px;
$tile-h: 55px;

.garden-world {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(255,220,240,0.14) 0%, transparent 60%),
    linear-gradient(180deg, #c8e8a0 0%, #a0d860 20%, #80c040 50%, #60a828 100%);
}

.world-decor { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

.sky-gradient {
  position: absolute; top: 0; left: 0; right: 0; height: 35%;
  background: linear-gradient(180deg, rgba(200,230,255,0.2) 0%, transparent 100%);
}

.cloud { position: absolute; font-size: 26px; opacity: 0.6; animation: cloudFloat linear infinite; }
.cloud-1 { top: 5%; left: 18%; animation-duration: 30s; }

@keyframes cloudFloat {
  0% { transform: translateX(0); } 50% { transform: translateX(22px); } 100% { transform: translateX(0); }
}

.bird {
  position: absolute; font-size: 16px; opacity: 0.5;
  animation: birdFly 6s ease-in-out infinite;
}
.bird-1 { top: 12%; left: 20%; animation-delay: 0s; }
.bird-2 { top: 16%; left: 55%; animation-delay: 2s; font-size: 14px; }

@keyframes birdFly {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(15px, -8px); }
  50% { transform: translate(30px, 2px); }
  75% { transform: translate(10px, -5px); }
}

.bench { position: absolute; bottom: 28%; right: 8%; font-size: 38px; filter: drop-shadow(2px 3px 2px rgba(0,0,0,0.15)); }
.awning { position: absolute; top: 10%; left: 6%; font-size: 32px; opacity: 0.7; }

// === 等距花盆 ===
.iso-container {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -55%);
}
.iso-grid { position: relative; width: 0; height: 0; }

.iso-pot {
  position: absolute;
  width: $tile-w;
  height: $tile-h;
  cursor: pointer;
  transition: all $transition-fast;
  &:active { filter: brightness(1.1); }
}

.pot-body { position: absolute; inset: 0; }

.pot-top {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #e8a060 0%, #c47830 50%, #a05818 100%);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  box-shadow: inset 0 0 6px rgba(0,0,0,0.1);
  border-radius: 2px;

  .pot-empty & { background: linear-gradient(135deg, #d8b888 0%, #c0a068 50%, #a88848 100%); }
  .pot-bloom & { background: linear-gradient(135deg, #f0c040 0%, #e8a820 50%, #c89018 100%); }
}

.pot-front {
  position: absolute; top: 50%; left: 0; right: 0; height: 10px;
  background: linear-gradient(180deg, #a05818 0%, #804010 100%);
  clip-path: polygon(0% 0%, 50% 100%, 100% 0%, 50% -5%);
  opacity: 0.45;
}

.pot-flower {
  position: absolute;
  top: -24px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  z-index: 2;
}

.flower-emoji {
  font-size: 26px; line-height: 1;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
  animation: grow 0.5s ease backwards;
  transition: all $transition-fast;
  &.flower-bloom { animation: bounce 1.2s ease-in-out infinite; font-size: 30px; }
}

.empty-hint { font-size: 16px; opacity: 0.35; }

.grow-bar {
  width: 36px; height: 4px;
  background: rgba(0,0,0,0.2); border-radius: 2px; overflow: hidden;
}
.grow-fill {
  height: 100%;
  background: linear-gradient(90deg, #e91e63, #ff80ab);
  border-radius: 2px; transition: width $transition-normal;
}

.bloom-badge {
  position: absolute; top: -10px; right: -10px; font-size: 11px;
  animation: sparkle 1.5s ease-in-out infinite;
}

// === 工具栏 ===
.garden-toolbar {
  position: fixed; bottom: $nav-height + 8px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: $spacing-sm; z-index: 150;
  padding: $spacing-xs;
  background: rgba(42, 31, 20, 0.65);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  border: 2px solid rgba(196, 154, 44, 0.3);
}

.tool-btn {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 6px 14px 5px; border-radius: 10px;
  background: $wood-bg; border: 2px solid $wood-border;
  box-shadow: $wood-shadow; min-width: 48px; position: relative;

  &::before {
    content: ''; position: absolute; top: 3px; left: 8px; right: 8px; height: 3px;
    background: rgba(255,255,255,0.15); border-radius: 0 0 3px 3px;
  }
  span:first-child { font-size: 18px; line-height: 1; }
  span:last-child { font-size: 9px; color: $wood-text; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
  &:active { transform: translateY(2px); box-shadow: 0 1px 0 #4a3508; }
  &.expand span:last-child { font-size: 8px; }
}

// === 花种列表 ===
.flower-list { display: flex; flex-direction: column; gap: $spacing-sm; }

.flower-item {
  display: flex; align-items: center; gap: $spacing-sm;
  padding: $spacing-md;
  background: rgba(139, 105, 20, 0.06);
  border-radius: $radius-md;
  border: 1.5px solid rgba(139, 105, 20, 0.12);
  transition: all $transition-fast;
  text-align: left;
  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.45; }
}

.flower-emoji { font-size: 28px; }
.flower-info { flex: 1; display: flex; flex-direction: column; }
.flower-name { font-weight: 700; font-size: $font-size-md; color: $color-text-dark; }
.flower-detail { font-size: $font-size-xs; color: $color-text-light; }
.flower-price { font-weight: 700; color: #8a6d1b; font-size: $font-size-sm; }
</style>
