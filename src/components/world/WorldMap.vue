<template>
  <!-- ============================================================ -->
  <!--  BLOCKOUT — Hay Day 世界结构验证                           -->
  <!--  仅保留: 农田/房屋/牧场/花园/工坊/河流/主路               -->
  <!--  删除: 所有散落装饰 (花草石树灌木稻草堆)                  -->
  <!-- ============================================================ -->
  <div class="world-viewport" ref="viewportRef">
    <div
      class="world-canvas"
      :style="canvasStyle"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointerleave="onUp"
      @wheel.prevent="onWheel"
    >
      <!-- ════════════════════════════════════════════════ -->
      <!--  🟦 河流区 (左上)                               -->
      <!-- ════════════════════════════════════════════════ -->
      <div class="zone river-zone" :style="zoneStyle.river">
        <div class="zone-fill river-fill"></div>
        <div class="zone-label">🌊 河流</div>
      </div>

      <!-- ════════════════════════════════════════════════ -->
      <!--  🟫 工坊区 (房屋上方)                           -->
      <!-- ════════════════════════════════════════════════ -->
      <div class="zone workshop-zone" :style="zoneStyle.workshop">
        <div class="zone-fill workshop-fill"></div>
        <span class="block-icon">🔨</span>
        <div class="zone-label">🔧 工坊</div>
        <AreaLock v-if="!game.isWorkshopUnlocked" :required-level="8" />
      </div>

      <!-- ════════════════════════════════════════════════ -->
      <!--  🟨 房屋生活区 (中右)                           -->
      <!-- ════════════════════════════════════════════════ -->
      <div class="zone house-zone" :style="zoneStyle.house">
        <div class="zone-fill house-fill"></div>
        <div class="house-block">
          <span class="h-roof">🔺</span>
          <span class="h-body">🧱</span>
          <span class="h-door">🚪</span>
          <span class="h-chimney">🏭</span>
        </div>
        <span class="h-mailbox">📮</span>
        <div class="zone-label">🏠 家园</div>
      </div>

      <!-- ════════════════════════════════════════════════ -->
      <!--  🟩 牧场区 (右侧)                               -->
      <!-- ════════════════════════════════════════════════ -->
      <div class="zone ranch-zone" :style="zoneStyle.ranch">
        <div class="zone-fill ranch-fill"></div>
        <div class="ranch-fence-top"></div>
        <div class="ranch-fence-bottom"></div>
        <div class="ranch-fence-left"></div>
        <div class="ranch-fence-right"></div>
        <div class="ranch-grid">
          <div
            v-for="slot in ranchSlots"
            :key="slot.id"
            class="ranch-cell"
            :class="ranchCellClass(slot)"
            @click.stop="onSlotClick(slot)"
          >
            <span v-if="slot.locked" class="rc-lock">🔒</span>
            <span v-else-if="!slot.animalId" class="rc-empty">➕</span>
            <span v-else class="rc-animal" :class="{ ready: slot.state === 'READY', hungry: slot.state === 'HUNGRY' }">
              {{ animalEmoji(slot) }}
            </span>
            <span v-if="slot.state === 'HUNGRY'" class="rc-tag">🍖</span>
            <span v-if="slot.state === 'READY'" class="rc-tag">✨</span>
          </div>
        </div>
        <div class="zone-label">🐄 牧场</div>
      </div>

      <!-- ════════════════════════════════════════════════ -->
      <!--  🟪 花园区 (农田与房屋之间)                     -->
      <!-- ════════════════════════════════════════════════ -->
      <div class="zone garden-zone" :style="zoneStyle.garden">
        <div class="zone-fill garden-fill"></div>
        <div class="garden-shelf">
          <span class="gs-board">🪵</span>
          <div class="gs-pots">
            <div
              v-for="pot in gardenPots"
              :key="pot.id"
              class="gs-pot"
              :class="potClass(pot)"
              @click.stop="onPotClick(pot)"
            >
              <span v-if="!pot.flowerId" class="gp-empty">➕</span>
              <span v-else-if="pot.state === 'BLOOM'" class="gp-bloom">{{ flowerEmoji(pot) }}</span>
              <span v-else class="gp-growing">{{ flowerStageEmoji(pot) }}</span>
            </div>
          </div>
        </div>
        <div class="zone-label">🌷 花园</div>
        <AreaLock v-if="!game.isGardenUnlocked" :required-level="5" />
      </div>

      <!-- ════════════════════════════════════════════════ -->
      <!--  🟧 农田区 (左下 · 视觉核心 · 6×6)              -->
      <!-- ════════════════════════════════════════════════ -->
      <div class="zone farm-zone" :style="zoneStyle.farm">
        <div class="zone-fill farm-fill"></div>
        <div class="farm-grid">
          <div
            v-for="tile in farmTiles"
            :key="tile.id"
            class="farm-tile"
            :class="tileClass(tile)"
            @click.stop="onTileClick(tile)"
          >
            <div class="ft-dirt"></div>
            <div class="ft-crop">
              <span v-if="tile.locked" class="ftc-lock">🔒</span>
              <span v-else-if="tile.state === 'EMPTY'" class="ftc-empty">➕</span>
              <span v-else-if="tile.state === 'MATURE'" class="ftc-mature">{{ cropEmoji(tile) }}</span>
              <span v-else-if="tile.state === 'WITHERED'" class="ftc-wither">🥀</span>
              <span v-else class="ftc-growing">{{ cropStageEmoji(tile) }}</span>
            </div>
            <span v-if="isThirsty(tile)" class="ft-tag">💧</span>
            <span v-if="tile.state === 'MATURE'" class="ft-tag">✨</span>
          </div>
        </div>
        <div class="zone-label farm-lbl">🌾 农田</div>
      </div>

      <!-- ════════════════════════════════════════════════ -->
      <!--  🛤️ 主路系统                                   -->
      <!-- ════════════════════════════════════════════════ -->
      <div class="path path-main"></div>
      <div class="path path-ranch"></div>
      <div class="path path-garden"></div>
      <div class="path path-workshop"></div>
      <div class="path path-river"></div>
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
import type { AnimalSlotData } from '@/systems/animal/state'
import type { FlowerPotData } from '@/systems/garden/state'
import AreaLock from './AreaLock.vue'

// ================================================================
//  WORLD
// ================================================================
const WORLD_W = 2000
const WORLD_H = 1400

// 区域定义 (三角构图: 农田左下→房屋中右→河流左上)
const ZONES = {
  farm:      { left: 40,  top: 700,  w: 560, h: 560 },
  house:     { left: 860, top: 460,  w: 460, h: 480 },
  ranch:     { left: 1260, top: 700,  w: 440, h: 440 },
  garden:    { left: 520, top: 820,  w: 270, h: 220 },
  workshop:  { left: 880, top: 150,  w: 260, h: 220 },
  river:     { left: 40,  top: 20,   w: 500, h: 400 },
}

const zoneStyle = {
  farm:      { left: '40px',  top: '700px',  width: '560px', height: '560px' },
  house:     { left: '860px', top: '460px',  width: '460px', height: '480px' },
  ranch:     { left: '1260px',top: '700px',  width: '440px', height: '440px' },
  garden:    { left: '520px', top: '820px',  width: '270px', height: '220px' },
  workshop:  { left: '880px', top: '150px',  width: '260px', height: '220px' },
  river:     { left: '40px',  top: '20px',   width: '500px', height: '400px' },
}

// 区域中心 (镜头导航)
const zoneCenters: Record<string, { x: number; y: number }> = {
  farm:      { x: 320, y: 980 },
  house:     { x: 1090, y: 700 },
  ranch:     { x: 1480, y: 920 },
  garden:    { x: 655, y: 930 },
  workshop:  { x: 1010, y: 260 },
  river:     { x: 290, y: 220 },
}

// ================================================================
//  STORE
// ================================================================
const game = useGameStore()

// ================================================================
//  DRAG + CAMERA
// ================================================================
const viewportRef = ref<HTMLElement>()
const pan = ref({ x: -280, y: -140 })
const scale = ref(1)
let dragging = false, moved = false
let dragOrigin = { x: 0, y: 0 }, panOrigin = { x: 0, y: 0 }
let animFrame = 0

const canvasStyle = computed(() => ({
  transform: `translate3d(${pan.value.x}px, ${pan.value.y}px, 0) scale(${scale.value})`,
  cursor: dragging ? 'grabbing' : 'grab',
}))

function getViewport() {
  const el = viewportRef.value
  return { w: el?.clientWidth ?? window.innerWidth, h: el?.clientHeight ?? window.innerHeight }
}

function clampPan() {
  const vp = getViewport()
  const sw = WORLD_W * scale.value
  const sh = WORLD_H * scale.value
  pan.value.x = Math.max(-(sw - vp.w), Math.min(0, pan.value.x))
  pan.value.y = Math.max(-(sh - vp.h), Math.min(0, pan.value.y))
}

function onDown(e: PointerEvent) {
  dragging = true; moved = false
  dragOrigin = { x: e.clientX, y: e.clientY }
  panOrigin = { ...pan.value }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!dragging) return
  const dx = e.clientX - dragOrigin.x, dy = e.clientY - dragOrigin.y
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true
  pan.value.x = panOrigin.x + dx
  pan.value.y = panOrigin.y + dy
  clampPan()
}
function onUp() { dragging = false }

function onWheel(e: WheelEvent) {
  const vp = getViewport()
  const minS = Math.max(vp.w / WORLD_W, vp.h / WORLD_H)
  scale.value = Math.max(minS, Math.min(2, scale.value + (e.deltaY > 0 ? -0.06 : 0.06)))
  clampPan()
}

// 镜头动画
function panTo(zoneKey: string) {
  const el = viewportRef.value; if (!el) return
  const c = zoneCenters[zoneKey]; if (!c) return
  const vp = { w: el.clientWidth, h: el.clientHeight }
  const sw = WORLD_W * scale.value, sh = WORLD_H * scale.value
  const tx = -(c.x * scale.value - vp.w / 2)
  const ty = -(c.y * scale.value - vp.h / 2)
  const from = { x: pan.value.x, y: pan.value.y }
  const to = {
    x: Math.max(-(sw - vp.w), Math.min(0, tx)),
    y: Math.max(-(sh - vp.h), Math.min(0, ty)),
  }
  cancelAnimationFrame(animFrame)
  const start = performance.now()
  const dur = 500
  function step(now: number) {
    const t = Math.min(1, (now - start) / dur)
    const e = 1 - Math.pow(1 - t, 3)
    pan.value.x = from.x + (to.x - from.x) * e
    pan.value.y = from.y + (to.y - from.y) * e
    if (t < 1) animFrame = requestAnimationFrame(step)
  }
  animFrame = requestAnimationFrame(step)
}

// resize 时重新 clamp
onMounted(() => { window.addEventListener('resize', clampPan) })
onUnmounted(() => { window.removeEventListener('resize', clampPan) })

defineExpose({ panTo })

// ================================================================
//  FARM 6×6
// ================================================================
interface FarmTileDisplay {
  id: string; locked: boolean
  state?: string; cropId?: string; waterCount?: number; growthProgress?: number
}
const farmTiles = computed<FarmTileDisplay[]>(() => {
  const tiles: FarmTileDisplay[] = []
  const n = game.farmPlots.length
  for (let i = 0; i < 36; i++) {
    if (i < n) tiles.push({ id: game.farmPlots[i].id, locked: false, ...game.farmPlots[i] })
    else tiles.push({ id: `farm-l-${i}`, locked: true })
  }
  return tiles
})

// ================================================================
//  RANCH 3×3
// ================================================================
const ranchSlots = computed(() => {
  const n = game.ranchSlots.length
  return Array.from({ length: 9 }, (_, i) =>
    i < n ? { ...game.ranchSlots[i], locked: false }
          : { id: `ranch-l-${i}`, locked: true, animalId: '' as any, state: 'HUNGRY' as any, feedCount: 0, produceTimer: 0 }
  )
})

// ================================================================
//  GARDEN (6 visible pots)
// ================================================================
const gardenPots = computed(() => game.gardenPots.slice(0, 6))

// ================================================================
//  EMOJI HELPERS
// ================================================================
function cropEmoji(t: FarmTileDisplay) { return CROP_CONFIGS[t.cropId as CropId]?.emoji ?? '🌱' }
function cropStageEmoji(t: FarmTileDisplay) {
  const c = CROP_CONFIGS[t.cropId as CropId]; if (!c) return '🌱'
  return c.stages[Math.min(Math.floor((t.growthProgress ?? 0) * c.stages.length), c.stages.length - 1)]
}
function animalEmoji(s: AnimalSlotData) { return ANIMAL_CONFIGS[s.animalId as AnimalId]?.emoji ?? '🐄' }
function flowerEmoji(p: FlowerPotData) { return FLOWER_CONFIGS[p.flowerId as FlowerId]?.emoji ?? '🌷' }
function flowerStageEmoji(p: FlowerPotData) {
  const c = FLOWER_CONFIGS[p.flowerId as FlowerId]; if (!c) return '🌱'
  return c.stages[Math.min(Math.floor(p.growthProgress * c.stages.length), c.stages.length - 1)]
}

// ================================================================
//  CLASS HELPERS
// ================================================================
function isThirsty(t: FarmTileDisplay) { return !t.locked && (t.state === 'PLANTED' || t.state === 'GROWING') && (t.waterCount ?? 1) === 0 }
function tileClass(t: FarmTileDisplay) { return { locked: t.locked, empty: t.state === 'EMPTY', growing: t.state === 'PLANTED' || t.state === 'GROWING', mature: t.state === 'MATURE', withered: t.state === 'WITHERED', thirsty: isThirsty(t) } }
function ranchCellClass(s: any) { return { 'rc-locked': s.locked, 'rc-empty': !s.animalId && !s.locked, 'rc-hungry': s.state === 'HUNGRY', 'rc-ready': s.state === 'READY' } }
function potClass(p: FlowerPotData) { return { 'gp-empty': !p.flowerId, 'gp-growing': p.state === 'SEED' || p.state === 'GROWING', 'gp-bloom': p.state === 'BLOOM' } }

// ================================================================
//  CLICK HANDLERS
// ================================================================
function onTileClick(tile: FarmTileDisplay) {
  if (moved || tile.locked) return
  if (tile.state === 'MATURE') game.harvestPlot(tile.id)
  else if (tile.state === 'PLANTED' || tile.state === 'GROWING') { if ((tile.waterCount ?? 1) === 0) game.waterPlot(tile.id) }
  else if (tile.state === 'EMPTY') { const f = Object.values(CROP_CONFIGS).find(c => c.unlockLevel <= game.level); if (f) game.plantCrop(tile.id, f.id as CropId) }
}
function onSlotClick(s: any) { if (moved || s.locked) return; if (s.state === 'HUNGRY') game.feedAnimalSlot(s.id); else if (s.state === 'READY') game.collectAnimalProduct(s.id) }
function onPotClick(p: FlowerPotData) { if (moved) return; if (p.state === 'BLOOM') game.pickFlowerPot(p.id) }
</script>

<style lang="scss" scoped>
// ── Viewport ──
.world-viewport {
  position: absolute; inset: 0;
  overflow: hidden;
  background: #7ab840;
  touch-action: none;
  user-select: none;
}

// ── Canvas ──
.world-canvas {
  position: absolute; top: 0; left: 0;
  width: 2000px; height: 1400px;
  transform-origin: 0 0;
  will-change: transform;
}

// ── Zone base ──
.zone {
  position: absolute;
  z-index: 10;
}
.zone-fill {
  position: absolute; inset: 0;
  border-radius: 12px;
  border: 3px solid rgba(0,0,0,0.25);
}
.zone-label {
  position: absolute; bottom: -22px; left: 50%;
  transform: translateX(-50%);
  font-size: 11px; font-weight: 800;
  color: rgba(0,0,0,0.5);
  white-space: nowrap;
}

// ── River ──
.river-fill { background: #4aa8d8; border-radius: 0 50% 50% 30%/0 50% 60% 50%; }

// ── Workshop ──
.workshop-fill { background: #c4a870; }
.block-icon { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); font-size: 56px; }

// ── House ──
.house-fill { background: #e0d0a8; }
.house-block { position: absolute; top: 60px; left: 50%; transform: translateX(-50%); }
.h-roof { display: block; font-size: 72px; line-height: 0.7; margin-left: -14px; }
.h-body { display: block; font-size: 56px; line-height: 0.8; margin-top: -4px; }
.h-door { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); font-size: 18px; }
.h-chimney { position: absolute; top: -28px; right: 14px; font-size: 28px; }
.h-mailbox { position: absolute; bottom: 20px; left: 60px; font-size: 28px; }

// ── Ranch ──
.ranch-fill { background: #90c860; }
.ranch-fence-top, .ranch-fence-bottom {
  position: absolute; left: 20px; right: 20px; height: 4px;
  background: #8b6914; border-radius: 2px; z-index: 3;
}
.ranch-fence-top { top: 12px; } .ranch-fence-bottom { bottom: 12px; }
.ranch-fence-left, .ranch-fence-right {
  position: absolute; top: 20px; bottom: 20px; width: 4px;
  background: #8b6914; border-radius: 2px; z-index: 3;
}
.ranch-fence-left { left: 12px; } .ranch-fence-right { right: 12px; }
.ranch-grid {
  position: absolute; top: 40px; left: 50%; transform: translateX(-50%);
  display: grid;
  grid-template-columns: repeat(3, 78px);
  grid-template-rows: repeat(3, 78px);
  gap: 4px;
  z-index: 2;
}
.ranch-cell {
  position: relative; cursor: pointer;
  background: #a8d870; border-radius: 6px;
  border: 2px solid rgba(0,0,0,0.15);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s;
  &.rc-empty { border-style: dashed; }
  &.rc-hungry { background: #d8b860; }
  &.rc-ready { background: #b8e878; }
  &:active { transform: scale(0.92); }
}
.rc-lock { font-size: 18px; opacity: 0.6; }
.rc-empty { font-size: 14px; opacity: 0.3; }
.rc-animal { font-size: 22px; &.hungry { animation: bounce 0.8s infinite; } &.ready { animation: bounce 1.2s infinite; font-size: 26px; } }
.rc-tag { position: absolute; top: -10px; right: -4px; font-size: 10px; z-index: 4; }

// ── Garden ──
.garden-fill { background: #d4b8a8; }
.garden-shelf { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); }
.gs-board { display: block; font-size: 96px; line-height: 0.7; color: #a07840; }
.gs-pots { display: flex; gap: 6px; position: absolute; top: 5px; left: 50%; transform: translateX(-50%); }
.gs-pot {
  width: 32px; height: 32px;
  background: #e8a060; border-radius: 3px 3px 8px 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.12s;
  &.gp-bloom { background: #f0c040; }
  &:active { transform: scale(0.9); }
}
.gp-empty { font-size: 10px; opacity: 0.3; }
.gp-bloom { font-size: 20px; animation: bounce 1.2s infinite; }
.gp-growing { font-size: 14px; }

// ── Farm 6×6 (核心) ──
.farm-fill { background: #c4a070; border-radius: 14px; }
.farm-grid {
  position: absolute; top: 28px; left: 50%; transform: translateX(-50%);
  display: grid;
  grid-template-columns: repeat(6, 76px);
  grid-template-rows: repeat(6, 76px);
  gap: 5px;
  z-index: 2;
}
.farm-tile {
  position: relative; cursor: pointer;
  transition: transform 0.1s;
  &:active { transform: scale(0.93); }
  &.locked { cursor: not-allowed; }
}
.ft-dirt {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #b89860, #8b6a40);
  border-radius: 5px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15);
  .thirsty & { background: linear-gradient(135deg, #c49060, #a07040); }
  .mature & { background: linear-gradient(135deg, #a08850, #786030); }
  .withered & { background: linear-gradient(135deg, #807060, #605040); }
  .locked & { background: #9a8a70; }
}
.ft-crop {
  position: absolute; top: -10px; left: 50%;
  transform: translateX(-50%); z-index: 2;
  display: flex; align-items: center; justify-content: center;
}
.ftc-lock { font-size: 16px; opacity: 0.5; }
.ftc-empty { font-size: 12px; opacity: 0.25; }
.ftc-mature { font-size: 26px; animation: bounce 1.2s infinite; }
.ftc-wither { font-size: 18px; opacity: 0.5; }
.ftc-growing { font-size: 18px; animation: cropSway 3s infinite; }
.ft-tag { position: absolute; top: -12px; right: -4px; font-size: 10px; z-index: 4; }
.farm-lbl { bottom: -38px; }

// ── Paths ──
.path {
  position: absolute;
  background: #b89870;
  border-radius: 18px;
  border: 2px solid rgba(0,0,0,0.1);
  z-index: 5;
}
// 主路: 房屋左下 → 农田右上 (对角线)
.path-main   { top: 860px;  left: 620px;  width: 90px; height: 300px; transform: rotate(-42deg); transform-origin: center top; }
// 房屋 → 牧场 (水平连接)
.path-ranch  { top: 820px;  left: 1220px; width: 140px; height: 55px; }
// 农田 → 花园 (短连接)
.path-garden { top: 900px;  left: 480px;  width: 120px; height: 45px; transform: rotate(8deg); }
// 房屋 → 工坊 (竖直上连)
.path-workshop { top: 380px; left: 1020px; width: 45px; height: 140px; }
// 河流 → 农田 (左侧直连)
.path-river  { top: 400px;  left: 240px;  width: 45px; height: 310px; }

@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes cropSway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
</style>
