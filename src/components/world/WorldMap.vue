<template>
  <!-- ============================================================ -->
  <!--  HAY DAY STYLE WORLD MAP — 2000×1400 可拖动农场世界         -->
  <!-- ============================================================ -->
  <div class="world-viewport" ref="viewportRef">
    <!-- ── 前景遮挡层 (fixed to viewport) ── -->
    <div class="viewport-fg">
      <span class="fg-plant fgl">🌾</span>
      <span class="fg-plant fgl2">🌿</span>
      <span class="fg-plant fgr">🌾</span>
      <span class="fg-plant fgr2">🌿</span>
      <span class="fg-plant fgc">🌸</span>
    </div>

    <!-- ── 世界容器 ── -->
    <div
      class="world-canvas"
      :style="canvasStyle"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointerleave="onUp"
      @wheel.prevent="onWheel"
    >
      <!-- ============================================ -->
      <!--  LAYER 1: 天空 + 云                        -->
      <!-- ============================================ -->
      <div class="sky-band"></div>
      <span class="cloud c1">☁️</span>
      <span class="cloud c2">⛅</span>
      <span class="cloud c3">☁️</span>
      <span class="cloud c4">🌤️</span>

      <!-- ============================================ -->
      <!--  LAYER 2: 河流 (左上)                      -->
      <!-- ============================================ -->
      <div class="river-body">
        <div class="river-surface"></div>
        <span class="river-rock r1">🪨</span>
        <span class="river-rock r2">🪨</span>
        <span class="river-rock r3">🪨</span>
        <span class="river-reed rd1">🌿</span>
        <span class="river-reed rd2">🌿</span>
        <span class="river-reed rd3">🌿</span>
        <span class="river-lily">🪷</span>
      </div>

      <!-- ============================================ -->
      <!--  LAYER 3: 小路系统                          -->
      <!-- ============================================ -->
      <!-- 主路: 房屋 → 农田 (对角线) -->
      <div class="path path-main"></div>
      <!-- 分支: 房屋 → 牧场 -->
      <div class="path path-ranch"></div>
      <!-- 分支: 农田 → 花园 -->
      <div class="path path-garden"></div>
      <!-- 分支: 房屋 → 工坊 -->
      <div class="path path-workshop"></div>
      <!-- 分支: 河流 → 农田 -->
      <div class="path path-river"></div>

      <!-- ============================================ -->
      <!--  LAYER 4: 🪭 工坊 (房屋上方)                -->
      <!-- ============================================ -->
      <div class="zone workshop-zone" :style="zonePos.workshop">
        <div class="zone-bg workshop-bg"></div>
        <span class="ws-building">🔨</span>
        <span class="ws-bench">🪵</span>
        <span class="ws-barrel">🪣</span>
        <span class="ws-lantern">🏮</span>
        <div class="zone-label">🔧 工坊</div>
        <AreaLock v-if="!game.isWorkshopUnlocked" :required-level="8" />
      </div>

      <!-- ============================================ -->
      <!--  LAYER 4: 🏠 房屋生活区 (中右)              -->
      <!-- ============================================ -->
      <div class="zone house-zone" :style="zonePos.house">
        <div class="zone-bg house-bg"></div>
        <!-- 主屋 -->
        <div class="house-body">
          <span class="house-roof">🔺</span>
          <span class="house-wall">🧱</span>
          <span class="house-door">🚪</span>
          <span class="house-window">🪟</span>
          <span class="house-window w2">🪟</span>
          <span class="house-chimney">🏭</span>
          <div class="house-smoke"></div>
          <div class="house-smoke s2"></div>
        </div>
        <!-- 生活区装饰 -->
        <span class="h-mailbox">📮</span>
        <span class="h-tree t1">🌳</span>
        <span class="h-tree t2">🌲</span>
        <span class="h-tree t3">🌳</span>
        <span class="h-barrel b1">🪣</span>
        <span class="h-barrel b2">🪣</span>
        <span class="h-flower">🌻</span>
        <span class="h-flower f2">🌸</span>
        <span class="h-fence-seg">🪵</span>
        <span class="h-fence-seg f2">🪵</span>
        <span class="h-fence-seg f3">🪵</span>
        <span class="h-fence-seg f4">🪵</span>
        <span class="h-fence-seg f5">🪵</span>
        <div class="zone-label">🏠 家园</div>
      </div>

      <!-- ============================================ -->
      <!--  LAYER 4: 🐄 牧场 (右侧)                    -->
      <!-- ============================================ -->
      <div class="zone ranch-zone" :style="zonePos.ranch">
        <div class="zone-bg ranch-bg"></div>
        <!-- 围栏边框 -->
        <div class="ranch-fence-top"></div>
        <div class="ranch-fence-bottom"></div>
        <div class="ranch-fence-left"></div>
        <div class="ranch-fence-right"></div>
        <!-- 动物栏位 -->
        <div class="ranch-grid">
          <div
            v-for="slot in ranchSlots"
            :key="slot.id"
            class="ranch-cell"
            :class="ranchCellClass(slot)"
            @click.stop="onSlotClick(slot)"
          >
            <span v-if="!slot.animalId" class="rc-empty">➕</span>
            <span v-else class="rc-animal" :class="{ ready: slot.state === 'READY', hungry: slot.state === 'HUNGRY' }">
              {{ animalEmoji(slot) }}
            </span>
            <span v-if="slot.state === 'HUNGRY'" class="rc-tag tag-hungry">🍖</span>
            <span v-if="slot.state === 'READY'" class="rc-tag tag-ready">✨</span>
          </div>
        </div>
        <!-- 牧场装饰 -->
        <span class="rn-hay">🌾</span>
        <span class="rn-hay h2">🌾</span>
        <span class="rn-trough">🪣</span>
        <span class="rn-grass">🌿</span>
        <span class="rn-grass g2">🌱</span>
        <div class="zone-label ranch-lbl">🐄 牧场</div>
      </div>

      <!-- ============================================ -->
      <!--  LAYER 4: 🌷 花园 (农田与房屋之间)         -->
      <!-- ============================================ -->
      <div class="zone garden-zone" :style="zonePos.garden">
        <div class="zone-bg garden-bg"></div>
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
        <span class="gd-flower">🌼</span>
        <span class="gd-flower f2">🌸</span>
        <span class="gd-butterfly">🦋</span>
        <div class="zone-label">🌷 花园</div>
        <AreaLock v-if="!game.isGardenUnlocked" :required-level="5" />
      </div>

      <!-- ============================================ -->
      <!--  LAYER 4: 🌾 农田 (左下·视觉核心)            -->
      <!-- ============================================ -->
      <div class="zone farm-zone" :style="zonePos.farm">
        <div class="zone-bg farm-bg"></div>
        <!-- 栅栏围边 -->
        <div class="farm-fence-rail top"></div>
        <div class="farm-fence-rail bottom"></div>
        <div class="farm-fence-rail left"></div>
        <div class="farm-fence-rail right"></div>
        <span class="farm-fence-post p1">🪵</span>
        <span class="farm-fence-post p2">🪵</span>
        <span class="farm-fence-post p3">🪵</span>
        <span class="farm-fence-post p4">🪵</span>
        <!-- 4×4 地块网格 -->
        <div class="farm-grid">
          <div
            v-for="tile in farmTiles"
            :key="tile.id"
            class="farm-tile"
            :class="tileClass(tile)"
            @click.stop="onTileClick(tile)"
          >
            <!-- 泥土 -->
            <div class="ft-dirt">
              <div class="ft-dirt-top"></div>
              <div class="ft-ridges"></div>
            </div>
            <!-- 作物 -->
            <div class="ft-crop">
              <span v-if="tile.state === 'EMPTY' && !tile.locked" class="ftc-empty">➕</span>
              <span v-else-if="tile.state === 'MATURE'" class="ftc-mature">{{ cropEmoji(tile) }}</span>
              <span v-else-if="tile.state === 'WITHERED'" class="ftc-wither">🥀</span>
              <span v-else-if="!tile.locked" class="ftc-growing">{{ cropStageEmoji(tile) }}</span>
            </div>
            <!-- 缺水提示 -->
            <span v-if="isThirsty(tile)" class="ft-tag water">💧</span>
            <span v-if="tile.state === 'MATURE'" class="ft-tag harvest">✨</span>
            <!-- 锁定 -->
            <div v-if="tile.locked" class="ft-lock">
              <span>🔒</span>
            </div>
          </div>
        </div>
        <!-- 农田装饰 -->
        <span class="fm-decor scarecrow">🎋</span>
        <span class="fm-decor bucket">🪣</span>
        <span class="fm-decor basket">🧺</span>
        <div class="zone-label farm-lbl">🌾 农田</div>
      </div>

      <!-- ============================================ -->
      <!--  LAYER 4: 🏛️ 温室 (花园旁)                  -->
      <!-- ============================================ -->
      <div class="zone greenhouse-zone" :style="zonePos.greenhouse">
        <div class="zone-bg gh-bg"></div>
        <span class="gh-building">🏛️</span>
        <span class="gh-flower">🌺</span>
        <span class="gh-flower f2">🌷</span>
        <div class="zone-label">🏛️ 温室</div>
        <AreaLock v-if="game.level < 8" :required-level="8" />
      </div>

      <!-- ============================================ -->
      <!--  LAYER 4: 🐟 鱼塘 (右下角)                  -->
      <!-- ============================================ -->
      <div class="zone pond-zone" :style="zonePos.pond">
        <div class="pond-water-bg">
          <span class="pw-fish">🐟</span>
          <div class="pw-ripple"></div>
        </div>
        <span class="pd-reed">🌾</span>
        <span class="pd-reed r2">🌾</span>
        <span class="pd-rock">🪨</span>
        <div class="zone-label">🐟 鱼塘</div>
        <AreaLock v-if="game.level < 10" :required-level="10" />
      </div>

      <!-- ============================================ -->
      <!--  LAYER 5: 世界装饰 (高密度散布)             -->
      <!-- ============================================ -->
      <!-- 大树 (地图边缘) -->
      <span v-for="t in bigTrees" :key="'t'+t.i" class="decor tree" :style="pos(t)">{{ t.e }}</span>
      <!-- 草丛 -->
      <span v-for="g in grasses" :key="'g'+g.i" class="decor grass" :style="pos(g)">{{ g.e }}</span>
      <!-- 小花 -->
      <span v-for="f in flowers" :key="'f'+f.i" class="decor flower" :style="pos(f)">{{ f.e }}</span>
      <!-- 石头 -->
      <span v-for="r in rocks" :key="'r'+r.i" class="decor rock" :style="pos(r)">{{ r.e }}</span>
      <!-- 灌木 -->
      <span v-for="b in bushes" :key="'b'+b.i" class="decor bush" :style="pos(b)">{{ b.e }}</span>
      <!-- 稻草堆 -->
      <span v-for="h in hays" :key="'h'+h.i" class="decor hay" :style="pos(h)">{{ h.e }}</span>
      <!-- 木桩 -->
      <span v-for="s in stumps" :key="'s'+s.i" class="decor stump" :style="pos(s)">{{ s.e }}</span>
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

// ================================================================
//  WORLD CONSTANTS
// ================================================================
const WORLD_W = 2000
const WORLD_H = 1400

// 各区域锚点
const zonePos = {
  farm:      { left: '80px', top: '820px', width: '500px', height: '480px' },
  house:     { left: '1000px', top: '420px', width: '480px', height: '460px' },
  ranch:     { left: '1380px', top: '820px', width: '440px', height: '420px' },
  garden:    { left: '500px', top: '890px', width: '280px', height: '210px' },
  workshop:  { left: '900px', top: '200px', width: '280px', height: '210px' },
  greenhouse:{ left: '720px', top: '790px', width: '160px', height: '130px' },
  pond:      { left: '1700px', top: '1100px', width: '180px', height: '130px' },
}

// 区域中心 (用于镜头移动)
const zoneCenters: Record<string, { x: number; y: number }> = {
  farm:      { x: 330, y: 1060 },
  house:     { x: 1240, y: 650 },
  ranch:     { x: 1600, y: 1030 },
  garden:    { x: 640, y: 995 },
  workshop:  { x: 1040, y: 305 },
  river:     { x: 280, y: 180 },
  pond:      { x: 1790, y: 1165 },
}

// ================================================================
//  STORE
// ================================================================
const game = useGameStore()

// ================================================================
//  DRAG SYSTEM
// ================================================================
const viewportRef = ref<HTMLElement>()
const pan = ref({ x: -260, y: -120 })
const scale = ref(1)
let dragging = false
let dragOrigin = { x: 0, y: 0 }
let panOrigin = { x: 0, y: 0 }
let moved = false

const canvasStyle = computed(() => ({
  transform: `translate3d(${pan.value.x}px, ${pan.value.y}px, 0) scale(${scale.value})`,
  cursor: dragging ? 'grabbing' : 'grab',
}))

function clampPan() {
  const el = viewportRef.value
  if (!el) return
  const vw = el.clientWidth / scale.value
  const vh = el.clientHeight / scale.value
  pan.value.x = Math.max(-(WORLD_W - vw), Math.min(0, pan.value.x))
  pan.value.y = Math.max(-(WORLD_H - vh), Math.min(0, pan.value.y))
}

function onDown(e: PointerEvent) {
  dragging = true
  moved = false
  dragOrigin = { x: e.clientX, y: e.clientY }
  panOrigin = { ...pan.value }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onMove(e: PointerEvent) {
  if (!dragging) return
  const dx = e.clientX - dragOrigin.x
  const dy = e.clientY - dragOrigin.y
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true
  pan.value.x = panOrigin.x + dx
  pan.value.y = panOrigin.y + dy
  clampPan()
}

function onUp() {
  dragging = false
}

function onWheel(e: WheelEvent) {
  scale.value = Math.max(0.4, Math.min(1.6, scale.value + (e.deltaY > 0 ? -0.06 : 0.06)))
  clampPan()
}

// ================================================================
//  CAMERA PAN (region navigation)
// ================================================================
let animFrame = 0
function panTo(zoneKey: string) {
  const el = viewportRef.value
  if (!el) return
  const center = zoneCenters[zoneKey]
  if (!center) return

  const vw = el.clientWidth / scale.value
  const vh = el.clientHeight / scale.value
  const tx = -(center.x - vw / 2)
  const ty = -(center.y - vh / 2)
  const from = { x: pan.value.x, y: pan.value.y }
  const to = {
    x: Math.max(-(WORLD_W - vw), Math.min(0, tx)),
    y: Math.max(-(WORLD_H - vh), Math.min(0, ty)),
  }

  cancelAnimationFrame(animFrame)
  const start = performance.now()
  const dur = 500
  function step(now: number) {
    const t = Math.min(1, (now - start) / dur)
    const ease = 1 - Math.pow(1 - t, 3) // ease-out
    pan.value.x = from.x + (to.x - from.x) * ease
    pan.value.y = from.y + (to.y - from.y) * ease
    if (t < 1) animFrame = requestAnimationFrame(step)
  }
  animFrame = requestAnimationFrame(step)
}

defineExpose({ panTo, scale })

// ================================================================
//  FARM TILES (4×4 = 16, locked beyond unlocked count)
// ================================================================
interface FarmTileDisplay {
  id: string
  locked: boolean
  unlockLevel?: number
  state?: string
  cropId?: string
  waterCount?: number
  growthProgress?: number
}

const farmTiles = computed<FarmTileDisplay[]>(() => {
  const tiles: FarmTileDisplay[] = []
  const n = game.farmPlots.length
  for (let i = 0; i < 16; i++) {
    if (i < n) {
      tiles.push({ id: game.farmPlots[i].id, locked: false, ...game.farmPlots[i] })
    } else {
      tiles.push({ id: `farm-locked-${i}`, locked: true })
    }
  }
  return tiles
})

// ================================================================
//  RANCH SLOTS (3×3 = 9)
// ================================================================
const ranchSlots = computed(() => {
  const slots: (AnimalSlotData & { locked?: boolean })[] = []
  const n = game.ranchSlots.length
  for (let i = 0; i < 9; i++) {
    if (i < n) {
      slots.push({ ...game.ranchSlots[i], locked: false })
    } else {
      slots.push({ id: `ranch-locked-${i}`, locked: true, animalId: '' as any, state: 'HUNGRY' as any, feedCount: 0, produceTimer: 0 })
    }
  }
  return slots
})

// ================================================================
//  GARDEN POTS (6 visible)
// ================================================================
const gardenPots = computed(() => game.gardenPots.slice(0, 6))

// ================================================================
//  EMOJI HELPERS
// ================================================================
function cropEmoji(t: FarmTileDisplay) {
  return CROP_CONFIGS[t.cropId as CropId]?.emoji ?? '🌱'
}
function cropStageEmoji(t: FarmTileDisplay) {
  const c = CROP_CONFIGS[t.cropId as CropId]
  if (!c) return '🌱'
  const i = Math.min(Math.floor((t.growthProgress ?? 0) * c.stages.length), c.stages.length - 1)
  return c.stages[i]
}
function animalEmoji(s: AnimalSlotData) {
  return ANIMAL_CONFIGS[s.animalId as AnimalId]?.emoji ?? '🐄'
}
function flowerEmoji(p: FlowerPotData) {
  return FLOWER_CONFIGS[p.flowerId as FlowerId]?.emoji ?? '🌷'
}
function flowerStageEmoji(p: FlowerPotData) {
  const c = FLOWER_CONFIGS[p.flowerId as FlowerId]
  if (!c) return '🌱'
  const i = Math.min(Math.floor(p.growthProgress * c.stages.length), c.stages.length - 1)
  return c.stages[i]
}

// ================================================================
//  STYLE HELPERS
// ================================================================
function isThirsty(t: FarmTileDisplay) {
  return !t.locked && (t.state === 'PLANTED' || t.state === 'GROWING') && (t.waterCount ?? 1) === 0
}
function tileClass(t: FarmTileDisplay) {
  return {
    locked: t.locked,
    empty: t.state === 'EMPTY',
    growing: t.state === 'PLANTED' || t.state === 'GROWING',
    mature: t.state === 'MATURE',
    withered: t.state === 'WITHERED',
    thirsty: isThirsty(t),
  }
}
function ranchCellClass(s: AnimalSlotData & { locked?: boolean }) {
  return {
    'rc-locked': s.locked,
    'rc-empty': !s.animalId && !s.locked,
    'rc-hungry': s.state === 'HUNGRY',
    'rc-ready': s.state === 'READY',
  }
}
function potClass(p: FlowerPotData) {
  return {
    'gp-empty': !p.flowerId,
    'gp-growing': p.state === 'SEED' || p.state === 'GROWING',
    'gp-bloom': p.state === 'BLOOM',
  }
}

// ================================================================
//  CLICK HANDLERS
// ================================================================
function onTileClick(tile: FarmTileDisplay) {
  if (moved || tile.locked) return
  if (tile.state === 'MATURE') {
    game.harvestPlot(tile.id)
  } else if (tile.state === 'PLANTED' || tile.state === 'GROWING') {
    if ((tile.waterCount ?? 1) === 0) game.waterPlot(tile.id)
  } else if (tile.state === 'EMPTY') {
    const first = Object.values(CROP_CONFIGS).find(c => c.unlockLevel <= game.level)
    if (first) game.plantCrop(tile.id, first.id as CropId)
  }
}

function onSlotClick(slot: AnimalSlotData & { locked?: boolean }) {
  if (moved || slot.locked) return
  if (slot.state === 'HUNGRY') {
    game.feedAnimalSlot(slot.id)
  } else if (slot.state === 'READY') {
    game.collectAnimalProduct(slot.id)
  }
}

function onPotClick(pot: FlowerPotData) {
  if (moved) return
  if (pot.state === 'BLOOM') game.pickFlowerPot(pot.id)
}

// ================================================================
//  DECORATION DATA (high density, positioned manually)
// ================================================================
interface Deco { i: number; x: number; y: number; e: string; s: number }

const bigTrees: Deco[] = [
  { i:1, x:20, y:60, e:'🌳', s:52 }, { i:2, x:1880, y:50, e:'🌲', s:48 },
  { i:3, x:1920, y:600, e:'🌳', s:52 }, { i:4, x:1900, y:1200, e:'🌲', s:48 },
  { i:5, x:30, y:1260, e:'🌳', s:52 }, { i:6, x:1880, y:850, e:'🌳', s:50 },
  { i:7, x:40, y:700, e:'🌲', s:44 }, { i:8, x:1440, y:60, e:'🌳', s:46 },
]

const grasses: Deco[] = [
  { i:1, x:200, y:580, e:'🌿', s:20 }, { i:2, x:350, y:650, e:'🌱', s:18 },
  { i:3, x:180, y:750, e:'🌿', s:20 }, { i:4, x:620, y:700, e:'🌱', s:18 },
  { i:5, x:850, y:720, e:'🌿', s:22 }, { i:6, x:1100, y:900, e:'🌱', s:18 },
  { i:7, x:1300, y:760, e:'🌿', s:20 }, { i:8, x:1550, y:680, e:'🌱', s:18 },
  { i:9, x:1720, y:780, e:'🌿', s:20 }, { i:10, x:400, y:560, e:'🌱', s:16 },
  { i:11, x:700, y:620, e:'🌿', s:20 }, { i:12, x:950, y:560, e:'🌱', s:18 },
  { i:13, x:1200, y:380, e:'🌿', s:20 }, { i:14, x:1450, y:500, e:'🌱', s:18 },
  { i:15, x:1650, y:600, e:'🌿', s:20 }, { i:16, x:500, y:500, e:'🌱', s:16 },
  { i:17, x:780, y:500, e:'🌿', s:18 }, { i:18, x:300, y:450, e:'🌱', s:16 },
  { i:19, x:600, y:1100, e:'🌿', s:20 }, { i:20, x:1000, y:1100, e:'🌱', s:18 },
  { i:21, x:1600, y:1100, e:'🌿', s:20 }, { i:22, x:150, y:1050, e:'🌱', s:16 },
  { i:23, x:750, y:1080, e:'🌿', s:20 }, { i:24, x:1200, y:1180, e:'🌱', s:18 },
  { i:25, x:1750, y:1000, e:'🌿', s:20 },
]

const flowers: Deco[] = [
  { i:1, x:420, y:720, e:'🌸', s:16 }, { i:2, x:650, y:680, e:'🌼', s:15 },
  { i:3, x:550, y:780, e:'🌺', s:16 }, { i:4, x:780, y:850, e:'🌸', s:14 },
  { i:5, x:920, y:800, e:'🌼', s:15 }, { i:6, x:1060, y:920, e:'🌻', s:16 },
  { i:7, x:680, y:950, e:'🌸', s:14 }, { i:8, x:1120, y:700, e:'🌺', s:15 },
  { i:9, x:1260, y:820, e:'🌼', s:14 }, { i:10, x:380, y:600, e:'🌸', s:15 },
  { i:11, x:860, y:450, e:'🌼', s:14 }, { i:12, x:1050, y:360, e:'🌸', s:15 },
  { i:13, x:280, y:820, e:'🌺', s:14 }, { i:14, x:1580, y:780, e:'🌸', s:14 },
  { i:15, x:1700, y:950, e:'🌼', s:15 },
]

const rocks: Deco[] = [
  { i:1, x:220, y:280, e:'🪨', s:28 }, { i:2, x:180, y:450, e:'🪨', s:22 },
  { i:3, x:320, y:350, e:'🪨', s:20 }, { i:4, x:1300, y:280, e:'🪨', s:24 },
  { i:5, x:1600, y:420, e:'🪨', s:22 }, { i:6, x:440, y:430, e:'🪨', s:20 },
  { i:7, x:820, y:320, e:'🪨', s:18 }, { i:8, x:1750, y:700, e:'🪨', s:24 },
  { i:9, x:50, y:950, e:'🪨', s:22 }, { i:10, x:1650, y:1260, e:'🪨', s:22 },
]

const bushes: Deco[] = [
  { i:1, x:150, y:500, e:'🪴', s:28 }, { i:2, x:600, y:550, e:'🪴', s:26 },
  { i:3, x:1150, y:500, e:'🪴', s:28 }, { i:4, x:1500, y:550, e:'🪴', s:26 },
  { i:5, x:850, y:650, e:'🪴', s:24 }, { i:6, x:450, y:900, e:'🪴', s:24 },
  { i:7, x:1350, y:700, e:'🪴', s:26 }, { i:8, x:300, y:550, e:'🪴', s:24 },
]

const hays: Deco[] = [
  { i:1, x:1360, y:880, e:'🌾', s:24 }, { i:2, x:1480, y:920, e:'🌾', s:22 },
  { i:3, x:1600, y:880, e:'🌾', s:24 }, { i:4, x:440, y:880, e:'🌾', s:22 },
]

const stumps: Deco[] = [
  { i:1, x:700, y:580, e:'🪵', s:24 }, { i:2, x:960, y:680, e:'🪵', s:22 },
  { i:3, x:1400, y:700, e:'🪵', s:24 }, { i:4, x:520, y:550, e:'🪵', s:22 },
]

function pos(d: Deco) {
  return {
    position: 'absolute',
    left: d.x + 'px',
    top: d.y + 'px',
    fontSize: d.s + 'px',
  } as any
}
</script>

<!-- ================================================================ -->
<!--  STYLES                                                          -->
<!-- ================================================================ -->
<style lang="scss" scoped>
@use '@/styles/variables' as v;

// ── Viewport ──
.world-viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #c8e8b0 0%, #8dc850 30%, #5ea832 70%, #4a8820 100%);
  touch-action: none;
  user-select: none;
}

// ── Foreground plants (sticky to viewport) ──
.viewport-fg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 200;
}
.fg-plant {
  position: absolute;
  font-size: 40px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
  animation: fgSway 5s ease-in-out infinite;
}
.fgl { bottom: -5px; left: -5px; }
.fgl2 { bottom: 8px; left: 20px; font-size: 32px; animation-delay: -2s; }
.fgr { bottom: -5px; right: -5px; }
.fgr2 { bottom: 8px; right: 20px; font-size: 32px; animation-delay: -2.5s; }
.fgc { bottom: -8px; left: 50%; font-size: 24px; animation-delay: -4s; }
@keyframes fgSway {
  0%,100% { transform: rotate(-2deg); }
  50% { transform: rotate(3deg); }
}

// ── World Canvas ──
.world-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 2000px;
  height: 1400px;
  transform-origin: 0 0;
  will-change: transform;
}

// ── Sky ──
.sky-band {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 160px;
  background: linear-gradient(180deg, rgba(180,220,255,0.45) 0%, rgba(200,230,200,0.2) 50%, transparent 100%);
}
.cloud { position: absolute; font-size: 30px; opacity: 0.7; animation: cloudDrift linear infinite; pointer-events: none; }
.c1 { top: 30px; left: 10%; animation-duration: 40s; }
.c2 { top: 50px; left: 40%; font-size: 24px; animation-duration: 34s; animation-delay: -14s; }
.c3 { top: 20px; left: 65%; font-size: 28px; animation-duration: 38s; animation-delay: -8s; }
.c4 { top: 40px; left: 82%; font-size: 22px; animation-duration: 44s; animation-delay: -22s; }
@keyframes cloudDrift {
  0% { transform: translateX(0); }
  50% { transform: translateX(40px); }
  100% { transform: translateX(0); }
}

// ── River ──
.river-body {
  position: absolute;
  top: 10px; left: 40px;
  width: 480px; height: 300px;
}
.river-surface {
  width: 100%; height: 100%;
  background: linear-gradient(180deg, #7ec8f0 0%, #4aa8d8 60%, #3a8fc8 100%);
  border-radius: 0 60% 60% 40% / 0 50% 60% 50%;
  box-shadow: inset 0 2px 12px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.1);
  &::after {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 12px);
    animation: riverFlow 4s linear infinite;
    border-radius: inherit;
  }
}
@keyframes riverFlow { from { background-position: 0 0; } to { background-position: 0 24px; } }
.river-rock { position: absolute; font-size: 24px; }
.r1 { top: 60%; left: 20%; }
.r2 { top: 72%; left: 55%; }
.r3 { top: 45%; left: 70%; }
.river-reed { position: absolute; font-size: 26px; animation: sway 5s ease-in-out infinite; }
.rd1 { top: 5%; left: 60%; }
.rd2 { top: 10%; left: 75%; }
.rd3 { bottom: 5%; left: 35%; }
.river-lily { position: absolute; bottom: 15%; left: 42%; font-size: 22px; animation: floatUp 4s ease-in-out infinite; }
@keyframes floatUp { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

// ── Paths ──
.path { position: absolute; background: linear-gradient(180deg, #d4b896 0%, #b89870 100%); border-radius: 22px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.1); &::after { content: ''; position: absolute; inset: 3px; border-radius: 19px; background: repeating-linear-gradient(90deg, transparent, transparent 14px, rgba(255,255,255,0.07) 14px, rgba(255,255,255,0.07) 16px); } }
.path-main {
  top: 730px; left: 620px;
  width: 100px; height: 340px;
  transform: rotate(-38deg);
  transform-origin: center top;
}
.path-ranch {
  top: 880px; left: 1100px;
  width: 340px; height: 72px;
}
.path-garden {
  top: 940px; left: 320px;
  width: 260px; height: 56px;
  transform: rotate(12deg);
}
.path-workshop {
  top: 440px; left: 1020px;
  width: 56px; height: 140px;
  transform: rotate(25deg);
}
.path-river {
  top: 420px; left: 280px;
  width: 56px; height: 320px;
}

// ── Zones ──
.zone {
  position: absolute;
  z-index: 10;
}
.zone-bg {
  position: absolute; inset: 0;
  border-radius: 16px;
  border: 2px solid rgba(139, 105, 20, 0.18);
}
.zone-label {
  position: absolute;
  bottom: -22px; left: 50%;
  transform: translateX(-50%);
  font-size: 10px; font-weight: 700;
  color: rgba(42, 31, 20, 0.45);
  white-space: nowrap;
  text-shadow: 0 1px 1px rgba(255,255,255,0.5);
}

// ── Workshop ──
.workshop-bg { background: linear-gradient(135deg, rgba(180,160,120,0.3), rgba(120,100,60,0.2)); }
.ws-building { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); font-size: 64px; filter: drop-shadow(2px 3px 3px rgba(0,0,0,0.2)); }
.ws-bench { position: absolute; top: 90px; left: 50%; transform: translateX(-50%); font-size: 72px; }
.ws-barrel { position: absolute; bottom: 20px; left: 20px; font-size: 28px; }
.ws-lantern { position: absolute; top: 10px; right: 30px; font-size: 24px; animation: sway 3s ease-in-out infinite; }

// ── House ──
.house-bg { background: linear-gradient(135deg, rgba(200,180,140,0.25), rgba(140,110,70,0.18)); }
.house-body {
  position: absolute;
  top: 60px; left: 50%;
  transform: translateX(-50%);
}
.house-roof { display: block; font-size: 72px; line-height: 0.7; margin-left: -16px; filter: drop-shadow(2px 3px 2px rgba(0,0,0,0.2)); }
.house-wall { display: block; font-size: 56px; line-height: 0.8; margin-top: -4px; }
.house-door { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); font-size: 18px; }
.house-window { position: absolute; top: 4px; left: 10px; font-size: 14px; }
.house-window.w2 { left: auto; right: 10px; }
.house-chimney { position: absolute; top: -28px; right: 16px; font-size: 28px; }
.house-smoke {
  position: absolute; top: -32px; right: 32px;
  width: 16px; height: 24px;
  background: rgba(180,180,180,0.4);
  border-radius: 50%;
  animation: smokeRise 3s ease-out infinite;
}
.house-smoke.s2 { animation-delay: 1.5s; top: -40px; }
@keyframes smokeRise {
  0% { opacity: 0.6; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-28px) scale(1.8); }
}
.h-mailbox { position: absolute; top: 210px; left: 60px; font-size: 24px; }
.h-tree { position: absolute; font-size: 44px; filter: drop-shadow(2px 3px 2px rgba(0,0,0,0.15)); animation: sway 6s ease-in-out infinite; }
.h-tree.t1 { top: 20px; left: 10px; }
.h-tree.t2 { top: 30px; right: -5px; font-size: 36px; }
.h-tree.t3 { bottom: 40px; right: 20px; font-size: 40px; }
.h-barrel { position: absolute; font-size: 24px; }
.h-barrel.b1 { top: 200px; right: 40px; }
.h-barrel.b2 { bottom: 30px; left: 80px; }
.h-flower { position: absolute; font-size: 18px; animation: sway 4s ease-in-out infinite; }
.h-flower.f2 { top: 230px; left: 120px; }
.h-flower:not(.f2) { bottom: 20px; right: 80px; }
.h-fence-seg { position: absolute; font-size: 16px; top: 260px; }
.h-fence-seg:nth-child(1) { left: 80px; }
.h-fence-seg:nth-child(2) { left: 100px; }
.h-fence-seg:nth-child(3) { left: 120px; }
.h-fence-seg:nth-child(4) { left: 140px; }
.h-fence-seg:nth-child(5) { left: 160px; }

// ── Ranch ──
.ranch-bg { background: linear-gradient(135deg, rgba(130,200,70,0.25), rgba(80,140,40,0.18)); }
.ranch-fence-top, .ranch-fence-bottom { position: absolute; left: 16px; right: 16px; height: 5px; background: linear-gradient(90deg, #a07840, #c49a2c, #a07840); border-radius: 3px; z-index: 3; }
.ranch-fence-top { top: 10px; }
.ranch-fence-bottom { bottom: 10px; }
.ranch-fence-left, .ranch-fence-right { position: absolute; top: 16px; bottom: 16px; width: 5px; background: linear-gradient(180deg, #a07840, #c49a2c, #a07840); border-radius: 3px; z-index: 3; }
.ranch-fence-left { left: 10px; }
.ranch-fence-right { right: 10px; }
.ranch-grid {
  position: absolute;
  top: 50px; left: 50%;
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: repeat(3, 78px);
  grid-template-rows: repeat(3, 78px);
  gap: 4px;
  z-index: 2;
}
.ranch-cell {
  position: relative;
  cursor: pointer;
  background: linear-gradient(135deg, #a8d870, #7ab840);
  border-radius: 8px;
  border: 2px solid rgba(139,105,20,0.3);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  &.rc-empty { border-style: dashed; }
  &.rc-hungry { background: linear-gradient(135deg, #d8b860, #a88038); }
  &.rc-ready { background: linear-gradient(135deg, #b8e878, #88c848); }
  &:active { transform: scale(0.92); }
}
.rc-empty { font-size: 14px; opacity: 0.3; }
.rc-animal { font-size: 22px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2)); &.hungry { animation: bounce 0.8s ease-in-out infinite; } &.ready { animation: bounce 1.2s ease-in-out infinite; font-size: 26px; } }
.rc-tag { position: absolute; top: -10px; right: -6px; font-size: 10px; z-index: 5; }
.tag-hungry { animation: bounce 0.8s ease-in-out infinite; }
.tag-ready { animation: sparkle 1.5s ease-in-out infinite; }
.rn-hay { position: absolute; font-size: 22px; }
.rn-hay:not(.h2) { bottom: 40px; left: 20px; }
.rn-hay.h2 { bottom: 40px; right: 20px; }
.rn-trough { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); font-size: 24px; }
.rn-grass { position: absolute; font-size: 18px; }
.rn-grass:not(.g2) { top: 30px; left: 20px; }
.rn-grass.g2 { top: 30px; right: 20px; }
.ranch-lbl { bottom: -26px; }

// ── Garden ──
.garden-bg { background: linear-gradient(135deg, rgba(220,180,150,0.25), rgba(180,120,80,0.18)); }
.garden-shelf { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); }
.gs-board { display: block; font-size: 100px; line-height: 0.7; color: #a07840; text-shadow: 0 2px 3px rgba(0,0,0,0.2); }
.gs-pots { display: flex; gap: 6px; position: absolute; top: 6px; left: 50%; transform: translateX(-50%); }
.gs-pot {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #e8a060, #c47830);
  border-radius: 3px 3px 8px 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.15s;
  &.gp-bloom { background: linear-gradient(135deg, #f0c040, #d8a020); }
  &.gp-growing { background: linear-gradient(135deg, #d89050, #b86828); }
  &:active { transform: scale(0.88); }
}
.gp-empty { font-size: 10px; opacity: 0.3; }
.gp-bloom { font-size: 20px; animation: bounce 1.2s ease-in-out infinite; }
.gp-growing { font-size: 14px; }
.gd-flower { position: absolute; font-size: 16px; animation: sway 4s ease-in-out infinite; }
.gd-flower:not(.f2) { bottom: 8px; left: 10px; }
.gd-flower.f2 { bottom: 8px; right: 10px; }
.gd-butterfly { position: absolute; top: 4px; right: 10px; font-size: 16px; animation: butterfly 6s ease-in-out infinite; }
@keyframes butterfly { 0%,100% { transform: translate(0,0); } 25% { transform: translate(24px,-8px); } 50% { transform: translate(40px,0); } 75% { transform: translate(16px,-12px); } }

// ── Farm (视觉核心) ──
.farm-bg {
  background: radial-gradient(ellipse at center, rgba(120,190,60,0.4) 0%, rgba(80,150,40,0.2) 100%);
  border-radius: 18px;
}
.farm-fence-rail {
  position: absolute; z-index: 3;
  background: linear-gradient(90deg, #8b6914, #c49a2c, #8b6914);
  border-radius: 3px;
  &.top { top: 6px; left: 20px; right: 20px; height: 4px; }
  &.bottom { bottom: 6px; left: 20px; right: 20px; height: 4px; }
  &.left { top: 20px; left: 6px; bottom: 20px; width: 4px; background: linear-gradient(180deg, #8b6914, #c49a2c, #8b6914); }
  &.right { top: 20px; right: 6px; bottom: 20px; width: 4px; background: linear-gradient(180deg, #8b6914, #c49a2c, #8b6914); }
}
.farm-fence-post { position: absolute; font-size: 12px; z-index: 4; }
.farm-fence-post.p1 { top: 4px; left: 16px; }
.farm-fence-post.p2 { top: 4px; right: 16px; }
.farm-fence-post.p3 { bottom: 4px; left: 16px; }
.farm-fence-post.p4 { bottom: 4px; right: 16px; }

.farm-grid {
  position: absolute;
  top: 36px; left: 50%;
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: repeat(4, 92px);
  grid-template-rows: repeat(4, 92px);
  gap: 6px;
  z-index: 2;
}

// ── Farm Tile ──
.farm-tile {
  position: relative;
  cursor: pointer;
  transition: transform 0.12s;

  &:active { transform: scale(0.93); }
  &.locked { cursor: not-allowed; }
}

.ft-dirt {
  position: absolute; inset: 0;
  border-radius: 6px;
  overflow: hidden;
}
.ft-dirt-top {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #c4a070, #9b7653, #7a5c3a);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.15);
  transition: background 0.3s;
  .thirsty & { background: linear-gradient(135deg, #c49060, #a07040, #7a4c28); }
  .mature & { background: linear-gradient(135deg, #b89860, #8b6a40, #6a4c28); }
  .withered & { background: linear-gradient(135deg, #908070, #706050, #504030); filter: saturate(0.4); }
  .empty & { background: linear-gradient(135deg, #c8a878, #a08058, #7a5c38); }
}
.ft-ridges {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 9px);
  border-radius: 6px;
}

.ft-crop {
  position: absolute;
  top: -12px; left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex; align-items: center; justify-content: center;
}
.ftc-empty { font-size: 14px; opacity: 0.25; }
.ftc-mature {
  font-size: 28px;
  animation: cropBounce 1.2s ease-in-out infinite;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,0.25));
}
.ftc-wither { font-size: 22px; opacity: 0.5; }
.ftc-growing {
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
  animation: cropSway 3s ease-in-out infinite;
}
@keyframes cropBounce { 0%,100% { transform: translateY(0) scale(1); } 40% { transform: translateY(-4px) scale(1.08); } }
@keyframes cropSway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }

.ft-tag {
  position: absolute;
  top: -14px;
  right: -4px;
  font-size: 10px;
  z-index: 5;
  &.water { animation: bounce 0.8s ease-in-out infinite; }
  &.harvest { animation: sparkle 1.5s ease-in-out infinite; }
}

.ft-lock {
  position: absolute;
  inset: 0;
  background: rgba(60, 50, 40, 0.5);
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  backdrop-filter: blur(1.5px);
  z-index: 4;
}

.fm-decor { position: absolute; }
.fm-decor.scarecrow { top: 10px; left: 14px; font-size: 18px; }
.fm-decor.bucket { bottom: 40px; right: 10px; font-size: 22px; }
.fm-decor.basket { bottom: 14px; right: 10px; font-size: 18px; }
.farm-lbl { bottom: -40px; }

// ── Greenhouse ──
.gh-bg { background: linear-gradient(135deg, rgba(180,210,190,0.25), rgba(120,160,130,0.15)); }
.gh-building { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); font-size: 64px; filter: drop-shadow(2px 3px 3px rgba(0,0,0,0.2)); }
.gh-flower { position: absolute; font-size: 16px; animation: sway 4s ease-in-out infinite; }
.gh-flower:not(.f2) { bottom: 8px; left: 10px; }
.gh-flower.f2 { bottom: 8px; right: 10px; }

// ── Pond ──
.pond-water-bg {
  position: absolute;
  inset: 8px 12px;
  background: linear-gradient(135deg, #6ab0e0, #3a8fc8);
  border-radius: 50%;
  box-shadow: inset 0 2px 8px rgba(255,255,255,0.2), 0 3px 8px rgba(0,0,0,0.15);
}
.pw-fish { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 28px; animation: fishSwim 4s ease-in-out infinite; }
.pw-ripple {
  position: absolute; inset: 6px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  animation: rippleRing 3s ease-in-out infinite;
}
@keyframes fishSwim { 0%,100% { transform: translate(-50%, -50%) rotate(0deg); } 25% { transform: translate(-40%, -60%) rotate(-5deg); } 50% { transform: translate(-60%, -40%) rotate(0deg); } 75% { transform: translate(-40%, -50%) rotate(5deg); } }
@keyframes rippleRing { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.15); opacity: 0.1; } }
.pd-reed { position: absolute; font-size: 18px; opacity: 0.7; animation: sway 5s ease-in-out infinite; }
.pd-reed:not(.r2) { bottom: -4px; right: 14px; }
.pd-reed.r2 { bottom: 0; right: 28px; font-size: 16px; }
.pd-rock { position: absolute; top: -8px; right: 4px; font-size: 20px; }

// ── Decor (scattered) ──
.decor { position: absolute; pointer-events: none; }
.tree, .bush { filter: drop-shadow(2px 3px 2px rgba(0,0,0,0.18)); animation: sway 6s ease-in-out infinite; }
.grass { animation: sway 4s ease-in-out infinite; }
.flower { animation: sway 4.5s ease-in-out infinite; opacity: 0.8; }
.rock { filter: drop-shadow(1px 2px 1px rgba(0,0,0,0.15)); }
.hay { filter: drop-shadow(1px 2px 1px rgba(0,0,0,0.1)); }
.stump { filter: drop-shadow(1px 2px 1px rgba(0,0,0,0.12)); }

@keyframes sway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes sparkle { 0%,80%,100% { opacity: 1; transform: scale(1); } 40% { opacity: 0.5; transform: scale(1.4); } }
</style>
