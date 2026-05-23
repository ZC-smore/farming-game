<template>
  <div class="ranch-world">
    <!-- 背景装饰 -->
    <div class="world-decor">
      <div class="sky-gradient"></div>
      <div class="cloud cloud-1">☁️</div>
      <div class="cloud cloud-2">☁️</div>
      <div class="tree tree-1">🌲</div>
      <div class="tree tree-2">🌳</div>
      <div class="haystack">🌾</div>
      <div class="trough">🪣</div>
    </div>

    <!-- 等距栏位区 -->
    <div class="iso-container">
      <div class="iso-grid">
        <div
          v-for="(slot, idx) in game.ranchSlots"
          :key="slot.id"
          class="iso-pen"
          :class="penStateClass(slot)"
          :style="penPosition(idx)"
          @click="handleSlotClick(slot)"
        >
          <!-- 栅栏底座 -->
          <div class="pen-ground">
            <div class="grass-top"></div>
            <div class="grass-front"></div>
          </div>

          <!-- 栅栏装饰 -->
          <div class="fence-post left"></div>
          <div class="fence-post right"></div>
          <div class="fence-rail"></div>

          <!-- 动物层 -->
          <div class="pen-animal">
            <template v-if="!slot.animalId">
              <span class="empty-hint">➕</span>
            </template>
            <template v-else>
              <span class="animal-emoji" :class="{ 'animal-ready': slot.state === 'READY', 'animal-hungry': slot.state === 'HUNGRY' }">
                {{ getAnimalConfig(slot)?.emoji }}
              </span>
              <div class="animal-status">
                <span v-if="slot.state === 'HUNGRY'" class="status-badge hungry">🍖饿了</span>
                <span v-else-if="slot.state === 'FEEDING'" class="status-badge feeding">😋进食</span>
                <span v-else-if="slot.state === 'PRODUCING'" class="status-badge producing">⏳生产</span>
                <span v-else-if="slot.state === 'READY'" class="status-badge ready">🥚收获</span>
              </div>
              <div v-if="slot.state === 'READY'" class="collect-sparkle">✨</div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="ranch-toolbar">
      <button class="wood-btn tool-btn" @click="showBuyModal = true">
        <span>🐄</span><span>购买</span>
      </button>
      <button class="wood-btn tool-btn" @click="feedAll">
        <span>🍖</span><span>喂食</span>
      </button>
      <button class="wood-btn tool-btn" @click="collectAll">
        <span>🧺</span><span>收获</span>
      </button>
      <button v-if="canExpand" class="wood-btn tool-btn expand" @click="handleExpand">
        <span>🏗️</span><span>扩建🪙{{ expandPrice }}</span>
      </button>
    </div>

    <!-- 购买动物弹窗 -->
    <GameModal :visible="showBuyModal" title="🐄 购买动物" @close="showBuyModal = false">
      <div class="animal-list">
        <button
          v-for="animal in availableAnimals"
          :key="animal.id"
          class="animal-item"
          :class="{ disabled: game.coins < animal.buyPrice }"
          @click="handleBuy(animal.id)"
        >
          <span class="animal-emoji-lg">{{ animal.emoji }}</span>
          <div class="animal-info">
            <span class="animal-name">{{ animal.name }}</span>
            <span class="animal-detail">🍖{{ animal.feedCost }} ⏱{{ formatTime(animal.produceTimeSeconds) }}</span>
          </div>
          <span class="animal-price">🪙{{ animal.buyPrice }}</span>
        </button>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'
import { ANIMAL_CONFIGS } from '@/configs'
import type { AnimalId, AnimalConfig } from '@/configs/animals'
import { RANCH_SLOT_PRICES } from '@/configs/economy'
import type { AnimalSlotData } from '@/systems/animal/state'
import GameModal from '@/components/common/GameModal.vue'
import { formatTime } from '@/utils'

const game = useGameStore()
const showBuyModal = ref(false)
const selectedSlotIndex = ref(-1)
const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast', () => {})

const availableAnimals = computed(() =>
  Object.values(ANIMAL_CONFIGS).filter(a => a.unlockLevel <= game.level)
)

const canExpand = computed(() => {
  const nextPrice = RANCH_SLOT_PRICES.find(p => p.slotIndex === game.ranchSlots.length)
  return !!nextPrice
})

const expandPrice = computed(() => {
  const nextPrice = RANCH_SLOT_PRICES.find(p => p.slotIndex === game.ranchSlots.length)
  return nextPrice?.price ?? 0
})

const COLS = 3
const TILE_W = 110
const TILE_H = 55

function penPosition(idx: number) {
  const row = Math.floor(idx / COLS)
  const col = idx % COLS
  const x = (col - row) * (TILE_W / 2 + 10)
  const y = (col + row) * (TILE_H / 2 + 8)
  return { transform: `translate(${x}px, ${y}px)`, zIndex: row + col }
}

function penStateClass(slot: AnimalSlotData) {
  return {
    'pen-empty': !slot.animalId,
    'pen-hungry': slot.state === 'HUNGRY',
    'pen-feeding': slot.state === 'FEEDING',
    'pen-producing': slot.state === 'PRODUCING',
    'pen-ready': slot.state === 'READY',
  }
}

function getAnimalConfig(slot: AnimalSlotData): AnimalConfig | null {
  if (!slot.animalId) return null
  return ANIMAL_CONFIGS[slot.animalId as AnimalId] ?? null
}

function handleSlotClick(slot: AnimalSlotData) {
  if (!slot.animalId) {
    selectedSlotIndex.value = slot.id
    showBuyModal.value = true
  } else if (slot.state === 'HUNGRY') {
    if (game.feedAnimalSlot(slot.id)) {
      showToast('喂食成功！', 'success')
    } else {
      showToast('饲料不足！', 'error')
    }
  } else if (slot.state === 'READY') {
    game.collectAnimalProduct(slot.id)
    showToast('收获成功！', 'success')
  }
}

function handleBuy(animalId: AnimalId) {
  if (selectedSlotIndex.value < 0) {
    // 找到第一个空栏位
    const emptySlot = game.ranchSlots.find(s => !s.animalId)
    if (!emptySlot) { showToast('没有空栏位', 'error'); return }
    selectedSlotIndex.value = emptySlot.id
  }
  const success = game.buyAnimal(selectedSlotIndex.value, animalId)
  if (success) {
    showBuyModal.value = false
    showToast('购买成功！', 'success')
  } else {
    showToast('金币不足', 'error')
  }
}

function feedAll() {
  let count = 0
  for (const slot of game.ranchSlots) {
    if (slot.state === 'HUNGRY' && game.feedAnimalSlot(slot.id)) count++
  }
  if (count > 0) showToast(`喂了${count}只动物！`, 'success')
  else showToast('没有需要喂食的动物', 'info')
}

function collectAll() {
  let count = 0
  for (const slot of game.ranchSlots) {
    if (slot.state === 'READY') { game.collectAnimalProduct(slot.id); count++ }
  }
  if (count > 0) showToast(`收获了${count}份产品！`, 'success')
  else showToast('没有可收获的产品', 'info')
}

function handleExpand() {
  if (game.buyRanchSlot()) showToast('牧场扩建成功！', 'success')
  else showToast('金币不足', 'error')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

$tile-w: 110px;
$tile-h: 55px;

.ranch-world {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(255,255,200,0.1) 0%, transparent 60%),
    linear-gradient(180deg, #c8e8a0 0%, #90c860 20%, #70a840 50%, #508828 100%);
}

.world-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.sky-gradient {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 35%;
  background: linear-gradient(180deg, rgba(180,220,255,0.25) 0%, transparent 100%);
}

.cloud { position: absolute; font-size: 28px; opacity: 0.6; }
.cloud-1 { top: 6%; left: 15%; animation: cloudFloat 28s linear infinite; }
.cloud-2 { top: 4%; left: 65%; font-size: 22px; animation: cloudFloat 35s linear infinite; }

@keyframes cloudFloat {
  0% { transform: translateX(0); }
  50% { transform: translateX(25px); }
  100% { transform: translateX(0); }
}

.tree { position: absolute; font-size: 44px; filter: drop-shadow(2px 4px 3px rgba(0,0,0,0.2)); animation: sway 4s ease-in-out infinite; }
.tree-1 { bottom: 30%; left: 5%; animation-delay: 0s; }
.tree-2 { bottom: 40%; right: 8%; animation-delay: 1.2s; font-size: 38px; }

.haystack { position: absolute; bottom: 22%; right: 15%; font-size: 36px; filter: drop-shadow(2px 3px 2px rgba(0,0,0,0.15)); }
.trough { position: absolute; bottom: 25%; left: 12%; font-size: 28px; filter: drop-shadow(2px 3px 2px rgba(0,0,0,0.15)); }

// === 等距栏位 ===
.iso-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
}

.iso-grid { position: relative; width: 0; height: 0; }

.iso-pen {
  position: absolute;
  width: $tile-w;
  height: $tile-h;
  cursor: pointer;
  transition: all $transition-fast;

  &:active { filter: brightness(1.1); }
}

.pen-ground { position: absolute; inset: 0; }

.grass-top {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #90c860 0%, #70a840 50%, #609030 100%);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  box-shadow: inset 0 0 8px rgba(0,0,0,0.08);

  .pen-empty & {
    background: linear-gradient(135deg, #a0d870 0%, #80b848 50%, #70a838 100%);
  }
  .pen-hungry & {
    background: linear-gradient(135deg, #c8a850 0%, #a08838 50%, #887028 100%);
  }
  .pen-ready & {
    background: linear-gradient(135deg, #90c860 0%, #78b848 50%, #60a030 100%);
  }
}

.grass-front {
  position: absolute;
  top: 50%; left: 0; right: 0;
  height: 8px;
  background: linear-gradient(180deg, #609030 0%, #507828 100%);
  clip-path: polygon(0% 0%, 50% 100%, 100% 0%, 50% -5%);
  opacity: 0.4;
}

// 栅栏
.fence-post {
  position: absolute;
  bottom: 50%;
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, $world-wood-light 0%, $world-wood 100%);
  border-radius: 2px;
  &.left { left: 10%; }
  &.right { right: 10%; }
}

.fence-rail {
  position: absolute;
  bottom: 62%;
  left: 10%;
  right: 10%;
  height: 3px;
  background: $world-wood;
  border-radius: 1.5px;
}

.pen-animal {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 2;
}

.animal-emoji {
  font-size: 28px;
  line-height: 1;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
  animation: grow 0.4s ease backwards;

  &.animal-hungry { animation: bounce 0.8s ease-in-out infinite; }
  &.animal-ready { animation: bounce 1.2s ease-in-out infinite; font-size: 32px; }
}

.empty-hint {
  font-size: 16px;
  opacity: 0.35;
}

.animal-status { position: relative; }

.status-badge {
  font-size: 8px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 8px;
  white-space: nowrap;
  line-height: 1.4;

  &.hungry { background: rgba(255, 152, 0, 0.25); color: #fff; }
  &.feeding { background: rgba(106, 176, 76, 0.25); color: #fff; }
  &.producing { background: rgba(91, 184, 245, 0.25); color: #fff; }
  &.ready { background: rgba(106, 176, 76, 0.35); color: #fff; animation: bounce 1s infinite; }
}

.collect-sparkle {
  position: absolute;
  top: -12px;
  right: -10px;
  font-size: 10px;
  animation: sparkle 1.5s ease-in-out infinite;
}

// === 工具栏 ===
.ranch-toolbar {
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
    top: 3px; left: 8px; right: 8px;
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

// === 购买列表 ===
.animal-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.animal-item {
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

.animal-emoji-lg { font-size: 28px; }
.animal-info { flex: 1; display: flex; flex-direction: column; text-align: left; }
.animal-name { font-weight: 700; color: $color-text-dark; }
.animal-detail { font-size: $font-size-xs; color: $color-text-light; }
.animal-price { font-weight: 700; color: #8a6d1b; font-size: $font-size-sm; }
</style>
