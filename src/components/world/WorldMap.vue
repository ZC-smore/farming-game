<template>
  <div class="world-map" ref="mapRef"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @wheel.prevent="onWheel"
    :style="mapStyle"
  >
    <!-- ===== 背景层 ===== -->
    <div class="world-bg">
      <div class="sky-layer"></div>
      <div class="cloud cloud-1">☁️</div>
      <div class="cloud cloud-2">⛅</div>
      <div class="cloud cloud-3">🌤️</div>
      <div class="river"></div>
      <div class="path-main"></div>
      <div class="path-branch-1"></div>
      <div class="path-branch-2"></div>
    </div>

    <!-- ===== 装饰层 ===== -->
    <div class="world-decor">
      <!-- 左上：河流区（装饰） -->
      <div class="river-area">
        <div class="river-water">💧</div>
        <div class="river-water ripple">💧</div>
        <div class="rocks">
          <span class="rock">🪨</span>
          <span class="rock">🪨</span>
          <span class="rock">🪨</span>
        </div>
        <div class="willow">🌿</div>
        <div class="willow">🌿</div>
      </div>

      <!-- 房屋区（右上） -->
      <div class="house-area">
        <div class="house-main">🏠</div>
        <div class="house-smoke"></div>
        <div class="house-tree">🌳</div>
        <div class="house-tree sm">🌲</div>
        <div class="fence-h">🪵</div><div class="fence-h">🪵</div><div class="fence-h">🪵</div>
      </div>

      <!-- 草丛和小花（随机散布） -->
      <div class="grass-cluster" style="left: 20%; top: 35%">🌿</div>
      <div class="grass-cluster" style="left: 45%; top: 20%">🌱</div>
      <div class="grass-cluster" style="left: 60%; top: 65%">🌿</div>
      <div class="grass-cluster" style="left: 15%; top: 70%">🌱</div>
      <div class="grass-cluster" style="left: 80%; top: 40%">🌿</div>
      <div class="grass-cluster" style="left: 35%; top: 85%">🌱</div>
      <div class="grass-cluster" style="left: 70%; top: 90%">🌿</div>

      <!-- 小花 -->
      <div class="flower-decor" style="left: 25%; top: 50%">🌼</div>
      <div class="flower-decor" style="left: 50%; top: 75%">🌸</div>
      <div class="flower-decor" style="left: 72%; top: 55%">🌼</div>
      <div class="flower-decor" style="left: 10%; top: 55%">🌸</div>
      <div class="flower-decor" style="left: 85%; top: 70%">🌼</div>

      <!-- 木桶 -->
      <div class="barrel" style="left: 8%; top: 40%">🪣</div>
      <div class="barrel" style="left: 88%; top: 85%">🪣</div>

      <!-- 石头 -->
      <div class="rock-decor" style="left: 5%; top: 75%">🪨</div>
      <div class="rock-decor" style="left: 92%; top: 30%">🪨</div>
      <div class="rock-decor" style="left: 40%; top: 95%">🪨</div>

      <!-- 前景植物 -->
      <div class="fg-plant" style="left: -1%; top: 60%">🌾</div>
      <div class="fg-plant" style="left: 96%; top: 50%">🌾</div>
      <div class="fg-plant" style="left: 30%; top: 98%">🌿</div>
      <div class="fg-plant" style="left: 65%; top: 97%">🌿</div>
    </div>

    <!-- ===== 农田区域（左下） ===== -->
    <div class="area farm-area" :style="{ left: farmPos.x + 'px', top: farmPos.y + 'px' }">
      <div class="area-bg farm-grass"></div>
      <!-- 4x4 农田 -->
      <div class="farm-grid">
        <div
          v-for="(plot, idx) in game.farmPlots"
          :key="plot.id"
          class="plot-tile"
          :class="plotClass(plot)"
          @click="handlePlotClick(plot)"
        >
          <div class="plot-dirt">
            <div class="plot-top"></div>
          </div>
          <div class="plot-crop">
            <span v-if="plot.state === 'EMPTY'" class="plot-empty">➕</span>
            <span v-else-if="plot.state === 'MATURE'" class="crop-mature">{{ getCropEmoji(plot) }}</span>
            <span v-else-if="plot.state === 'WITHERED'" class="crop-wither">🥀</span>
            <span v-else class="crop-growing">{{ getCropStageEmoji(plot) }}</span>
          </div>
          <div v-if="(plot.state === 'PLANTED' || plot.state === 'GROWING') && plot.waterCount === 0" class="water-need">💧</div>
          <div v-if="plot.state === 'MATURE'" class="harvest-star">✨</div>
        </div>
      </div>
      <div class="area-label farm-label">🌾 农场</div>
      <!-- 栅栏围边 -->
      <div class="farm-fence fence-top"></div>
      <div class="farm-fence fence-left"></div>
      <div class="farm-fence fence-right"></div>
      <div class="farm-fence fence-bottom"></div>
    </div>

    <!-- ===== 花园区域（左中偏上） ===== -->
    <div class="area garden-area" :style="{ left: gardenPos.x + 'px', top: gardenPos.y + 'px' }">
      <div class="area-bg garden-grass"></div>
      <div class="garden-shelf">
        <div class="shelf-board">🪵</div>
        <div class="shelf-pots">
          <div
            v-for="pot in visibleGardenPots"
            :key="pot.id"
            class="shelf-pot"
            :class="potClass(pot)"
            @click="handlePotClick(pot)"
          >
            <span v-if="!pot.flowerId" class="pot-empty">➕</span>
            <span v-else-if="pot.state === 'BLOOM'" class="pot-bloom">{{ getFlowerEmoji(pot) }}</span>
            <span v-else class="pot-growing">{{ getFlowerStageEmoji(pot) }}</span>
          </div>
        </div>
      </div>
      <div class="area-label garden-label">🌷 花园</div>
      <AreaLock v-if="!game.isGardenUnlocked" :required-level="5" />
    </div>

    <!-- ===== 温室（花园旁装饰，固定位置） ===== -->
    <div class="area greenhouse-area" :style="{ left: greenhousePos.x + 'px', top: greenhousePos.y + 'px' }">
      <div class="area-bg greenhouse-bg"></div>
      <div class="greenhouse-glass">🏛️</div>
      <div class="area-label greenhouse-label">🏛️ 温室</div>
      <AreaLock v-if="game.level < 8" :required-level="8" />
    </div>

    <!-- ===== 牧场区域（右侧） ===== -->
    <div class="area ranch-area" :style="{ left: ranchPos.x + 'px', top: ranchPos.y + 'px' }">
      <div class="area-bg ranch-grass"></div>
      <div class="ranch-grid">
        <div
          v-for="slot in game.ranchSlots"
          :key="slot.id"
          class="ranch-slot"
          :class="slotClass(slot)"
          @click="handleSlotClick(slot)"
        >
          <div class="ranch-fence"></div>
          <div class="ranch-animal">
            <span v-if="!slot.animalId" class="slot-empty">➕</span>
            <span v-else class="animal-emoji" :class="{ 'animal-ready': slot.state === 'READY', 'animal-hungry': slot.state === 'HUNGRY' }">
              {{ getAnimalEmoji(slot) }}
            </span>
          </div>
          <div v-if="slot.state === 'HUNGRY'" class="status-tag hungry">🍖</div>
          <div v-if="slot.state === 'READY'" class="status-tag ready">✨</div>
        </div>
      </div>
      <!-- 围栏装饰 -->
      <div class="ranch-corner top-left">🪵</div>
      <div class="ranch-corner top-right">🪵</div>
      <div class="ranch-corner bottom-left">🪵</div>
      <div class="ranch-corner bottom-right">🪵</div>
      <div class="area-label ranch-label">🐄 牧场</div>
    </div>

    <!-- ===== 鱼塘（右下装饰区域） ===== -->
    <div class="area pond-area" :style="{ left: pondPos.x + 'px', top: pondPos.y + 'px' }">
      <div class="pond-water">🐟</div>
      <div class="pond-ripple"></div>
      <div class="pond-reeds">🌾</div>
      <div class="area-label pond-label">🐟 鱼塘</div>
      <AreaLock v-if="game.level < 10" :required-level="10" />
    </div>

    <!-- ===== 地图坐标指示 ===== -->
    <div class="map-hint">
      <span v-if="isDragging">✋ 拖动中</span>
      <span v-else>✋ 拖动探索</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { CROP_CONFIGS, ANIMAL_CONFIGS, FLOWER_CONFIGS } from '@/configs'
import type { CropId } from '@/configs/crops'
import type { AnimalId } from '@/configs/animals'
import type { FlowerId } from '@/configs/flowers'
import type { CropPlotData } from '@/systems/crop/state'
import type { AnimalSlotData } from '@/systems/animal/state'
import type { FlowerPotData } from '@/systems/garden/state'
import AreaLock from './AreaLock.vue'

const game = useGameStore()

// ===== 拖动状态 =====
const mapRef = ref<HTMLElement>()
const pos = ref({ x: -120, y: -60 }) // 初始偏移：让农场在左下可见
const scale = ref(1)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const lastPos = ref({ x: 0, y: 0 })

const mapStyle = computed(() => ({
  transform: `translate(${pos.value.x}px, ${pos.value.y}px) scale(${scale.value})`,
  transformOrigin: 'center center',
  cursor: isDragging.value ? 'grabbing' : 'grab',
}))

function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
  lastPos.value = { ...pos.value }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y
  pos.value = {
    x: lastPos.value.x + dx,
    y: lastPos.value.y + dy,
  }
}

function onPointerUp() {
  isDragging.value = false
}

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.05 : 0.05
  scale.value = Math.min(Math.max(0.5, scale.value + delta), 1.5)
}

// ===== 世界尺寸 =====
const WORLD_W = 960
const WORLD_H = 720

// ===== 区域固定坐标 =====
const farmPos = { x: 20, y: 480 }
const gardenPos = { x: 20, y: 240 }
const greenhousePos = { x: 280, y: 120 }
const ranchPos = { x: 560, y: 320 }
const pondPos = { x: 620, y: 540 }

// ===== 可见花盆（最多显示6个） =====
const visibleGardenPots = computed(() => game.gardenPots.slice(0, 6))

// ===== 作物辅助 =====
function getCropEmoji(plot: CropPlotData): string {
  return CROP_CONFIGS[plot.cropId as CropId]?.emoji ?? '🌱'
}

function getCropStageEmoji(plot: CropPlotData): string {
  const config = CROP_CONFIGS[plot.cropId as CropId]
  if (!config) return '🌱'
  const idx = Math.min(Math.floor(plot.growthProgress * config.stages.length), config.stages.length - 1)
  return config.stages[idx]
}

function getAnimalEmoji(slot: AnimalSlotData): string {
  return ANIMAL_CONFIGS[slot.animalId as AnimalId]?.emoji ?? '🐄'
}

function getFlowerEmoji(pot: FlowerPotData): string {
  return FLOWER_CONFIGS[pot.flowerId as FlowerId]?.emoji ?? '🌷'
}

function getFlowerStageEmoji(pot: FlowerPotData): string {
  const config = FLOWER_CONFIGS[pot.flowerId as FlowerId]
  if (!config) return '🌱'
  const idx = Math.min(Math.floor(pot.growthProgress * config.stages.length), config.stages.length - 1)
  return config.stages[idx]
}

// ===== 样式类 =====
function plotClass(plot: CropPlotData) {
  return {
    'plot-empty': plot.state === 'EMPTY',
    'plot-growing': plot.state === 'PLANTED' || plot.state === 'GROWING',
    'plot-mature': plot.state === 'MATURE',
    'plot-withered': plot.state === 'WITHERED',
    'thirsty': (plot.state === 'PLANTED' || plot.state === 'GROWING') && plot.waterCount === 0,
  }
}

function potClass(pot: FlowerPotData) {
  return {
    'pot-empty': !pot.flowerId,
    'pot-growing': pot.state === 'SEED' || pot.state === 'GROWING',
    'pot-bloom': pot.state === 'BLOOM',
  }
}

function slotClass(slot: AnimalSlotData) {
  return {
    'slot-empty': !slot.animalId,
    'slot-hungry': slot.state === 'HUNGRY',
    'slot-ready': slot.state === 'READY',
  }
}

// ===== 点击处理 =====
function handlePlotClick(plot: CropPlotData) {
  if (plot.state === 'MATURE') {
    game.harvestPlot(plot.id)
  } else if (plot.state === 'PLANTED' || plot.state === 'GROWING') {
    if (plot.waterCount === 0) {
      game.waterPlot(plot.id)
    }
  } else if (plot.state === 'EMPTY') {
    // 自动种第一颗可种的
    const first = Object.values(CROP_CONFIGS).find(c => c.unlockLevel <= game.level)
    if (first) game.plantCrop(plot.id, first.id as CropId)
  }
}

function handlePotClick(pot: FlowerPotData) {
  if (pot.state === 'BLOOM') {
    game.pickFlowerPot(pot.id)
  } else if (pot.state === 'SEED' || pot.state === 'GROWING') {
    game.waterFlowerPot(pot.id)
  }
}

function handleSlotClick(slot: AnimalSlotData) {
  if (slot.state === 'HUNGRY') {
    game.feedAnimalSlot(slot.id)
  } else if (slot.state === 'READY') {
    game.collectAnimalProduct(slot.id)
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

// ===== 世界地图容器 =====
.world-map {
  position: absolute;
  inset: 0;
  width: 960px;
  height: 720px;
  background:
    radial-gradient(ellipse at 40% 30%, rgba(255,255,200,0.08) 0%, transparent 50%),
    linear-gradient(180deg, #b5e8a0 0%, $world-grass-light 15%, $world-grass-mid 40%, $world-grass-dark 100%);
  overflow: hidden;
  touch-action: none;
  user-select: none;
  transition: none;
}

// ===== 背景层 =====
.world-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sky-layer {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(180,220,255,0.2) 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
}

.cloud { position: absolute; font-size: 28px; opacity: 0.65; animation: cloudFloat linear infinite; }
.cloud-1 { top: 5%; left: 15%; animation-duration: 28s; }
.cloud-2 { top: 10%; left: 55%; font-size: 22px; animation-duration: 36s; animation-delay: -10s; }
.cloud-3 { top: 3%; left: 78%; font-size: 20px; animation-duration: 32s; animation-delay: -20s; }

@keyframes cloudFloat {
  0% { transform: translateX(0); }
  50% { transform: translateX(25px); }
  100% { transform: translateX(0); }
}

// 小路
.path-main {
  position: absolute;
  bottom: 0; left: 35%;
  width: 30%;
  height: 75%;
  background: $world-path;
  clip-path: polygon(35% 0%, 65% 0%, 80% 100%, 20% 100%);
  opacity: 0.6;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 18px,
      rgba(0,0,0,0.05) 18px,
      rgba(0,0,0,0.05) 22px
    );
  }
}

.path-branch-1 {
  position: absolute;
  top: 50%; left: 32%;
  width: 15%;
  height: 10%;
  background: $world-path;
  clip-path: polygon(0% 30%, 100% 0%, 100% 100%, 0% 70%);
  opacity: 0.5;
}

.path-branch-2 {
  position: absolute;
  top: 70%; right: 20%;
  width: 12%;
  height: 8%;
  background: $world-path;
  clip-path: polygon(30% 0%, 100% 0%, 70% 100%, 0% 100%);
  opacity: 0.45;
}

// 河流
.river {
  position: absolute;
  top: 0; left: 0;
  width: 28%;
  height: 55%;
  background: linear-gradient(180deg, $world-water 0%, rgba(91,184,245,0.6) 100%);
  clip-path: polygon(40% 0%, 80% 0%, 100% 50%, 80% 100%, 40% 100%, 0% 50%);
  opacity: 0.5;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 8px,
      rgba(255,255,255,0.1) 8px,
      rgba(255,255,255,0.1) 12px
    );
    animation: riverFlow 3s linear infinite;
  }
}

@keyframes riverFlow {
  from { background-position: 0 0; }
  to { background-position: 0 24px; }
}

// ===== 装饰层 =====
.world-decor { position: absolute; inset: 0; pointer-events: none; }

// 河流区
.river-area { position: absolute; top: 0; left: 0; width: 25%; height: 50%; }
.river-water { position: absolute; top: 20%; left: 35%; font-size: 20px; animation: ripple 2s ease-in-out infinite; }
.river-water.ripple { top: 35%; left: 55%; animation-delay: -1s; }
@keyframes ripple { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.3); opacity: 0.3; } }
.rocks { position: absolute; top: 60%; left: 10%; display: flex; gap: 10px; }
.rock { font-size: 18px; }
.willow { position: absolute; font-size: 26px; top: 5%; left: 5%; animation: sway 4s ease-in-out infinite; }

// 房屋区
.house-area { position: absolute; top: 8%; right: 12%; }
.house-main { font-size: 60px; filter: drop-shadow(3px 5px 4px rgba(0,0,0,0.2)); animation: sway 5s ease-in-out infinite; }
.house-smoke {
  position: absolute; top: -10px; right: 15px;
  width: 20px; height: 30px;
  background: rgba(200,200,200,0.4);
  border-radius: 50%;
  animation: smoke 3s ease-out infinite;
}
@keyframes smoke {
  0% { opacity: 0.6; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-30px) scale(1.5); }
}
.house-tree { position: absolute; font-size: 44px; filter: drop-shadow(2px 3px 2px rgba(0,0,0,0.2)); }
.house-tree.sm { font-size: 34px; top: 20px; right: -20px; }
.house-tree:not(.sm) { top: 30px; right: -10px; }
.fence-h { position: absolute; font-size: 16px; }

// 草丛
.grass-cluster {
  position: absolute;
  font-size: 18px;
  animation: sway 3.5s ease-in-out infinite;
}

// 小花
.flower-decor {
  position: absolute;
  font-size: 14px;
  opacity: 0.7;
  animation: sway 4s ease-in-out infinite;
}

// 木桶
.barrel { position: absolute; font-size: 26px; filter: drop-shadow(1px 2px 1px rgba(0,0,0,0.2)); }

// 石头
.rock-decor { position: absolute; font-size: 22px; filter: drop-shadow(1px 2px 1px rgba(0,0,0,0.15)); }

// 前景植物
.fg-plant { position: absolute; font-size: 30px; filter: drop-shadow(1px 2px 1px rgba(0,0,0,0.1)); }

// ===== 通用区域 =====
.area {
  position: absolute;
  border-radius: 12px;
}

.area-bg {
  position: absolute;
  inset: -4px;
  border-radius: 14px;
  border: 2px solid rgba(139, 105, 20, 0.2);
}

.area-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 700;
  color: rgba(42, 31, 20, 0.6);
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
}

// ===== 农田（左下）=====
.farm-area {
  width: 220px;
  height: 220px;
  position: relative;
}

.farm-grass {
  background: linear-gradient(135deg, rgba(110, 185, 60, 0.3), rgba(80, 150, 40, 0.2));
}

.farm-grid {
  display: grid;
  grid-template-columns: repeat(4, 48px);
  grid-template-rows: repeat(4, 48px);
  gap: 4px;
  padding: 12px;
  position: relative;
  z-index: 2;
}

.plot-tile {
  position: relative;
  cursor: pointer;
  transition: all $transition-fast;

  &:active { transform: scale(0.92); }

  &.plot-mature .plot-top { background: linear-gradient(135deg, #c4a882, #b89870); }
  &.plot-withered .plot-top { filter: saturate(0.3) brightness(0.8); }
  &.thirsty .plot-top { background: linear-gradient(135deg, #c49060, #a07040); }
}

.plot-dirt { position: absolute; inset: 0; }

.plot-top {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, $world-dirt-light, $world-dirt, $world-dirt-wet);
  border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.15);
  transition: background $transition-normal;
}

.plot-crop {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.plot-empty { font-size: 12px; opacity: 0.3; }
.crop-mature { font-size: 24px; animation: bounce 1.2s ease-in-out infinite; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2)); }
.crop-growing { font-size: 18px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); animation: grow 0.4s ease backwards; }
.crop-wither { font-size: 18px; opacity: 0.6; }

.water-need {
  position: absolute;
  top: -14px;
  right: -4px;
  font-size: 10px;
  animation: bounce 0.8s ease-in-out infinite;
  z-index: 4;
}

.harvest-star {
  position: absolute;
  top: -10px;
  right: -6px;
  font-size: 9px;
  animation: sparkle 1.5s ease-in-out infinite;
  z-index: 4;
}

// 栅栏
.farm-fence {
  position: absolute;
  background: rgba($world-wood, 0.6);
  z-index: 1;
  &.fence-top { top: 2px; left: 10px; right: 10px; height: 3px; border-radius: 2px; }
  &.fence-left { top: 10px; left: 2px; bottom: 10px; width: 3px; border-radius: 2px; }
  &.fence-right { top: 10px; right: 2px; bottom: 10px; width: 3px; border-radius: 2px; }
  &.fence-bottom { bottom: 2px; left: 10px; right: 10px; height: 3px; border-radius: 2px; }
}

// ===== 花园（左中）=====
.garden-area {
  width: 200px;
  height: 120px;
  position: relative;
}

.garden-grass {
  background: linear-gradient(135deg, rgba(200, 150, 100, 0.2), rgba(160, 100, 60, 0.15));
}

.garden-shelf {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.shelf-board {
  font-size: 140px;
  line-height: 0.6;
  color: #a07840;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 4px; left: 8px; right: 8px; height: 3px;
    background: rgba(255,255,255,0.12);
    border-radius: 2px;
  }
}

.shelf-pots {
  display: flex;
  gap: 6px;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.shelf-pot {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #e8a060, #c47830);
  border-radius: 4px 4px 8px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all $transition-fast;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  position: relative;

  &.pot-bloom {
    background: linear-gradient(135deg, #f0c040, #e8a820);
    .pot-bloom { animation: bounce 1.2s ease-in-out infinite; }
  }

  &:active { transform: scale(0.9); }
}

.pot-empty { font-size: 10px; opacity: 0.35; }
.pot-bloom { font-size: 18px; }
.pot-growing { font-size: 14px; }

// ===== 温室 ======
.greenhouse-area {
  width: 120px;
  height: 100px;
  position: relative;
}

.greenhouse-bg {
  background: linear-gradient(135deg, rgba(200, 230, 200, 0.2), rgba(100, 180, 100, 0.1));
}

.greenhouse-glass {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 56px;
  filter: drop-shadow(2px 3px 3px rgba(0,0,0,0.2));
  z-index: 2;
}

// ===== 牧场（右侧）=====
.ranch-area {
  width: 200px;
  height: 200px;
  position: relative;
}

.ranch-grass {
  background: linear-gradient(135deg, rgba(100, 170, 60, 0.25), rgba(70, 130, 40, 0.15));
}

.ranch-grid {
  display: grid;
  grid-template-columns: repeat(3, 56px);
  grid-template-rows: repeat(3, 56px);
  gap: 4px;
  padding: 12px;
  position: relative;
  z-index: 2;
}

.ranch-slot {
  position: relative;
  cursor: pointer;
  transition: all $transition-fast;
  &:active { transform: scale(0.92); }
}

.ranch-fence {
  position: absolute;
  inset: 0;
  border: 2px solid rgba($world-wood, 0.5);
  border-radius: 4px;
  background: linear-gradient(135deg, #90c860, #70a840);

  .slot-empty & { background: linear-gradient(135deg, #a0d870, #80b848); }
  .slot-hungry & { background: linear-gradient(135deg, #c8a850, #a08838); }
  .slot-ready & { background: linear-gradient(135deg, #90c860, #78b848); }
}

.ranch-animal {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.slot-empty { font-size: 14px; opacity: 0.3; }

.animal-emoji {
  font-size: 24px;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
  &.animal-hungry { animation: bounce 0.8s ease-in-out infinite; }
  &.animal-ready { animation: bounce 1.2s ease-in-out infinite; font-size: 28px; }
}

.status-tag {
  position: absolute;
  top: -8px;
  right: -4px;
  font-size: 10px;
  z-index: 4;
  &.hungry { animation: bounce 0.8s ease-in-out infinite; }
  &.ready { animation: sparkle 1.5s ease-in-out infinite; }
}

// 围栏角
.ranch-corner {
  position: absolute;
  font-size: 16px;
  z-index: 1;
  &.top-left { top: 0; left: 0; }
  &.top-right { top: 0; right: 0; }
  &.bottom-left { bottom: 0; left: 0; }
  &.bottom-right { bottom: 0; right: 0; }
}

// ===== 鱼塘（右下）=====
.pond-area {
  width: 140px;
  height: 80px;
  position: relative;
}

.pond-water {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(91, 184, 245, 0.4), rgba(58, 143, 212, 0.3));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  animation: floatUp 3s ease-in-out infinite;
}

.pond-ripple {
  position: absolute;
  inset: 4px;
  border: 2px solid rgba(91, 184, 245, 0.3);
  border-radius: 50%;
  animation: rippleRing 2s ease-in-out infinite;
}

@keyframes rippleRing {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.1; }
}

.pond-reeds {
  position: absolute;
  bottom: -2px;
  right: 8px;
  font-size: 18px;
  opacity: 0.7;
}

// ===== 地图提示 =====
.map-hint {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 9px;
  color: rgba(42, 31, 20, 0.35);
  pointer-events: none;
  z-index: 100;
}
</style>
