<template>
  <!-- ============================================================ -->
  <!--  BLOCKOUT v2 — 四区田字格                                  -->
  <!--  农田 | 牧场                                                -->
  <!--  ────┼────                                                 -->
  <!--  花园 | 工坊                                                -->
  <!--  点击锁定地块=扩建, 条件不足=提示                          -->
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
      <!-- ═══════════════════════════════════ -->
      <!--  🌾 农田 6×6 (左上)                -->
      <!-- ═══════════════════════════════════ -->
      <div class="zone farm-zone" :style="zoneStyle.farm">
        <div class="zone-fill farm-fill"></div>
        <div class="zone-label">🌾 农田</div>
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
      </div>

      <!-- ═══════════════════════════════════ -->
      <!--  🐄 牧场 3×3 (右上)                -->
      <!-- ═══════════════════════════════════ -->
      <div class="zone ranch-zone" :style="zoneStyle.ranch">
        <div class="zone-fill ranch-fill"></div>
        <div class="zone-label">🐄 牧场</div>
        <div class="ranch-fence-top"></div><div class="ranch-fence-bottom"></div>
        <div class="ranch-fence-left"></div><div class="ranch-fence-right"></div>
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
      </div>

      <!-- ═══════════════════════════════════ -->
      <!--  🌷 花园 (左下)                    -->
      <!-- ═══════════════════════════════════ -->
      <div class="zone garden-zone" :style="zoneStyle.garden">
        <div class="zone-fill garden-fill"></div>
        <div class="zone-label">🌷 花园</div>
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
            <!-- 空花盆 (= 可扩建) -->
            <div
              v-if="gardenCanExpand"
              class="gs-pot gs-pot-locked"
              @click.stop="expandGarden"
            >
              <span>🔒</span>
            </div>
          </div>
        </div>
        <AreaLock v-if="!game.isGardenUnlocked" :required-level="5" />
      </div>

      <!-- ═══════════════════════════════════ -->
      <!--  🔨 工坊 (右下)                    -->
      <!-- ═══════════════════════════════════ -->
      <div class="zone workshop-zone" :style="zoneStyle.workshop">
        <div class="zone-fill workshop-fill"></div>
        <div class="zone-label">🔧 工坊</div>
        <span class="ws-icon">🔨</span>
        <div class="ws-bench">🪵</div>
        <AreaLock v-if="!game.isWorkshopUnlocked" :required-level="8" />
      </div>
    </div>

    <!-- 种子选择弹窗 -->
    <Teleport to="body">
      <div v-if="seedPicker.visible" class="seed-picker-overlay" @click.self="seedPicker.visible=false">
        <div class="seed-picker">
          <div class="sp-title">🌱 选择背包中的种子</div>
          <div v-if="availableSeeds.length === 0" style="text-align:center;padding:16px;color:#8a7a68;font-size:13px">背包中没有种子，去商店购买吧 🏪</div>
          <div v-else class="sp-list">
            <div
              v-for="c in availableSeeds"
              :key="c.id"
              class="sp-item"
              @click="plantSeed(c.id)"
            >
              <span class="sp-emoji">{{ c.emoji }}</span>
              <div class="sp-info">
                <span class="sp-name">{{ c.name }}</span>
                <span class="sp-price">⏱{{ c.timeStr }} · ×{{ c.count }}</span>
              </div>
            </div>
          </div>
          <button class="sp-cancel" @click="seedPicker.visible=false">取消</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'
import { CROP_CONFIGS, ANIMAL_CONFIGS, FLOWER_CONFIGS } from '@/configs'
import { FARM_PLOT_PRICES, RANCH_SLOT_PRICES, GARDEN_POT_PRICES } from '@/configs/economy'
import { removeItem } from '@/systems/inventory'
import type { CropId } from '@/configs/crops'
import type { AnimalId } from '@/configs/animals'
import type { FlowerId } from '@/configs/flowers'
import type { AnimalSlotData } from '@/systems/animal/state'
import type { FlowerPotData } from '@/systems/garden/state'
import AreaLock from './AreaLock.vue'

// ================================================================
const WORLD_W = 1100; const WORLD_H = 1080

const zoneStyle = {
  farm:     { left: '20px',  top: '20px',  width: '480px', height: '480px' },
  ranch:    { left: '510px', top: '20px',  width: '480px', height: '480px' },
  garden:   { left: '20px',  top: '510px', width: '480px', height: '480px' },
  workshop: { left: '510px', top: '510px', width: '480px', height: '480px' },
}

const game = useGameStore()
const toast = inject<(msg: string, type?: string) => void>('showToast', () => {})

// ================================================================
//  CAMERA
// ================================================================
const viewportRef = ref<HTMLElement>()
const pan = ref({ x: 0, y: 0 })
const scale = ref(1)
let dragging = false, moved = false
let dragOrigin = { x: 0, y: 0 }, panOrigin = { x: 0, y: 0 }

const canvasStyle = computed(() => ({
  transform: `translate3d(${pan.value.x}px, ${pan.value.y}px, 0) scale(${scale.value})`,
  cursor: dragging ? 'grabbing' : 'grab',
}))

function vp() { const e = viewportRef.value; return { w: e?.clientWidth ?? window.innerWidth, h: e?.clientHeight ?? window.innerHeight } }
function clamp() {
  const v = vp(); const sw = WORLD_W * scale.value; const sh = WORLD_H * scale.value
  pan.value.x = Math.max(-(sw - v.w), Math.min(0, pan.value.x))
  pan.value.y = Math.max(-(sh - v.h), Math.min(0, pan.value.y))
}
function onDown(e: PointerEvent) {
  dragging = true; moved = false
  dragOrigin = { x: e.clientX, y: e.clientY }; panOrigin = { ...pan.value }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!dragging) return; const dx = e.clientX - dragOrigin.x; const dy = e.clientY - dragOrigin.y
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true
  pan.value.x = panOrigin.x + dx; pan.value.y = panOrigin.y + dy; clamp()
}
function onUp() { dragging = false }
function onWheel(e: WheelEvent) {
  const v = vp(); const ms = Math.max(v.w / WORLD_W, v.h / WORLD_H)
  scale.value = Math.max(ms, Math.min(2, scale.value + (e.deltaY > 0 ? -0.06 : 0.06)))
  clamp()
}

// ── Zone Zoom ──
const ZONE_ZOOM = {
  farm:     { x: 260, y: 260, w: 480, h: 480 },
  ranch:    { x: 750, y: 260, w: 480, h: 480 },
  garden:   { x: 260, y: 750, w: 480, h: 480 },
  workshop: { x: 750, y: 750, w: 480, h: 480 },
}
function zoomToZone(key: string) {
  const z = ZONE_ZOOM[key as keyof typeof ZONE_ZOOM]; if (!z) return
  const v = vp()
  const targetScale = Math.min(v.w / (z.w + 20), v.h / (z.h + 20))
  const tx = -(z.x * targetScale - v.w / 2)
  const ty = -(z.y * targetScale - v.h / 2)
  const fromS = scale.value; const fromX = pan.value.x; const fromY = pan.value.y
  cancelAnimationFrame(animFrame)
  const start = performance.now(); const dur = 400
  function step(now: number) {
    const t = Math.min(1, (now - start) / dur); const e = 1 - Math.pow(1 - t, 3)
    scale.value = fromS + (targetScale - fromS) * e
    pan.value.x = fromX + (tx - fromX) * e
    pan.value.y = fromY + (ty - fromY) * e
    if (t < 1) animFrame = requestAnimationFrame(step)
  }
  animFrame = requestAnimationFrame(step)
}

function resetView() { scale.value = 1; pan.value = { x: 0, y: 0 } }
defineExpose({ zoomToZone, resetView })

// ================================================================
//  FARM 6×6
// ================================================================
interface TD { id: string; idx: number; locked: boolean; state?: string; cropId?: string; waterCount?: number; growthProgress?: number }
const farmTiles = computed<TD[]>(() => {
  const tiles: TD[] = []; const n = game.farmPlots.length
  for (let i = 0; i < 36; i++) tiles.push(i < n ? { id: game.farmPlots[i].id, idx: i, locked: false, ...game.farmPlots[i] } : { id: `f-${i}`, idx: i, locked: true })
  return tiles
})

// ================================================================
//  RANCH 3×3
// ================================================================
const ranchSlots = computed(() => {
  const n = game.ranchSlots.length
  return Array.from({ length: 9 }, (_, i) => {
    if (i < n) return { id: game.ranchSlots[i].id, idx: i, locked: false, ...game.ranchSlots[i] }
    return { id: `r-${i}`, idx: i, locked: true, animalId: '' as any, state: 'HUNGRY' as any, feedCount: 0, produceTimer: 0 }
  })
})

// ================================================================
//  GARDEN
// ================================================================
const gardenPots = computed(() => game.gardenPots.map((p: any, i: number) => ({ ...p, idx: i })).slice(0, 6))
const gardenCanExpand = computed(() => {
  return game.isGardenUnlocked && game.gardenPots.length < GARDEN_POT_PRICES.length
})

// ── Seed Picker ──
const seedPicker = reactive({ visible: false, tileIdx: -1 })
const availableSeeds = computed(() => {
  if (!game.inventory?.items) return []
  return Object.entries(game.inventory.items)
    .filter(([id, item]: [string, any]) => CROP_CONFIGS[id as CropId] && item.count > 0)
    .map(([id, item]: [string, any]) => {
      const c = CROP_CONFIGS[id as CropId]
      return { id: id as CropId, name: c.name, emoji: c.emoji, count: item.count, timeStr: `${c.growTimeSeconds}s` }
    })
})
function plantSeed(cropId: CropId) {
  if (seedPicker.tileIdx >= 0) {
    if (game.plantCrop(seedPicker.tileIdx, cropId)) {
      game.inventory = removeItem(game.inventory, cropId, 1)
      toast('已种植！🌱', 'success')
    }
  }
  seedPicker.visible = false
}

// ================================================================
//  EMOJI
// ================================================================
function cropEmoji(t: TD) { return CROP_CONFIGS[t.cropId as CropId]?.emoji ?? '🌱' }
function cropStageEmoji(t: TD) { const c = CROP_CONFIGS[t.cropId as CropId]; if (!c) return '🌱'; return c.stages[Math.min(Math.floor((t.growthProgress??0)*c.stages.length), c.stages.length-1)] }
function animalEmoji(s: AnimalSlotData) { return ANIMAL_CONFIGS[s.animalId as AnimalId]?.emoji ?? '🐄' }
function flowerEmoji(p: FlowerPotData) { return FLOWER_CONFIGS[p.flowerId as FlowerId]?.emoji ?? '🌷' }
function flowerStageEmoji(p: FlowerPotData) { const c = FLOWER_CONFIGS[p.flowerId as FlowerId]; if (!c) return '🌱'; return c.stages[Math.min(Math.floor(p.growthProgress*c.stages.length), c.stages.length-1)] }

// ================================================================
//  CLASSES
// ================================================================
function isThirsty(t: TD) { return !t.locked && (t.state==='PLANTED'||t.state==='GROWING') && (t.waterCount??1)===0 }
function tileClass(t: TD) { return { locked:t.locked, empty:t.state==='EMPTY', growing:t.state==='PLANTED'||t.state==='GROWING', mature:t.state==='MATURE', withered:t.state==='WITHERED', thirsty:isThirsty(t) } }
function ranchCellClass(s:any) { return { 'rc-locked':s.locked, 'rc-empty':!s.animalId&&!s.locked, 'rc-hungry':s.state==='HUNGRY', 'rc-ready':s.state==='READY' } }
function potClass(p:FlowerPotData) { return { 'gp-empty':!p.flowerId, 'gp-growing':p.state==='SEED'||p.state==='GROWING', 'gp-bloom':p.state==='BLOOM' } }

// ================================================================
//  CLICKS
// ================================================================
function onTileClick(tile: TD) {
  if (moved) return
  if (tile.locked) { expandFarm(); return }
  if (tile.state==='MATURE') game.harvestPlot(tile.idx)
  else if (tile.state==='PLANTED'||tile.state==='GROWING') { if ((tile.waterCount??1)===0) game.waterPlot(tile.idx) }
  else if (tile.state==='EMPTY') { seedPicker.tileIdx = tile.idx; seedPicker.visible = true }
}
function onSlotClick(s:any) {
  if (moved) return
  if (s.locked) { expandRanch(); return }
  if (s.state==='HUNGRY') game.feedAnimalSlot(s.idx); else if (s.state==='READY') game.collectAnimalProduct(s.idx)
}
function onPotClick(p:any) { if (moved) return; if (p.state==='BLOOM') game.pickFlowerPot(p.idx) }

// 扩建
function expandFarm() {
  const idx = game.farmPlots.length
  const p = FARM_PLOT_PRICES.find((x: any) => x.plotIndex === idx)
  if (!p) { toast('农田已全部解锁', 'info'); return }
  if (game.coins < p.price) { toast(`金币不足 💰${p.price}`, 'error'); return }
  if (game.buyFarmPlot()) toast('地块 +1', 'success')
}
function expandRanch() {
  const idx = game.ranchSlots.length
  const p = RANCH_SLOT_PRICES.find((x: any) => x.slotIndex === idx)
  if (!p) { toast('牧场已满', 'info'); return }
  if (game.coins < p.price) { toast(`金币不足 💰${p.price}`, 'error'); return }
  if (game.buyRanchSlot()) toast('栏位 +1', 'success')
}
function expandGarden() {
  const idx = game.gardenPots.length
  const p = GARDEN_POT_PRICES.find((x: any) => x.potIndex === idx)
  if (!p) { toast('花园已满', 'info'); return }
  if (game.coins < p.price) { toast(`金币不足 💰${p.price}`, 'error'); return }
  if (game.buyGardenPot()) toast('花盆 +1', 'success')
}
</script>

<style lang="scss" scoped>
.world-viewport {
  position: absolute; inset: 0; overflow: hidden;
  background: #7ab840; touch-action: none; user-select: none;
}
.world-canvas {
  position: absolute; top:0; left:0;
  width: 1100px; height: 1080px;
  transform-origin: 0 0; will-change: transform;
}

// ── Zone base ──
.zone { position: absolute; z-index: 10; }
.zone-fill { position: absolute; inset:0; border-radius: 12px; border: 3px solid rgba(0,0,0,0.25); }
.zone-label { position: absolute; top: 8px; left: 12px; font-size: 11px; font-weight: 800; color: rgba(0,0,0,0.45); }
.farm-fill { background: #c4a070; }
.ranch-fill { background: #90c860; }
.garden-fill { background: #d4b8a8; }
.workshop-fill { background: #c4a870; }

// ── Workshop ──
.ws-icon { position: absolute; top:50%; left:50%; transform: translate(-50%,-50%); font-size: 72px; }
.ws-bench { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); font-size: 80px; }

// ── Ranch ──
.ranch-fence-top,.ranch-fence-bottom { position:absolute; left:20px; right:20px; height:4px; background:#8b6914; border-radius:2px; z-index:3; }
.ranch-fence-top{top:12px}.ranch-fence-bottom{bottom:12px}
.ranch-fence-left,.ranch-fence-right{position:absolute;top:20px;bottom:20px;width:4px;background:#8b6914;border-radius:2px;z-index:3}
.ranch-fence-left{left:12px}.ranch-fence-right{right:12px}
.ranch-grid{
  position:absolute; top:40px; left:50%; transform:translateX(-50%);
  display:grid; grid-template-columns:repeat(3,78px); grid-template-rows:repeat(3,78px); gap:4px; z-index:2;
}
.ranch-cell{position:relative;cursor:pointer;background:#a8d870;border-radius:6px;border:2px solid rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;transition:all .12s}
.ranch-cell.rc-empty{border-style:dashed}.ranch-cell.rc-hungry{background:#d8b860}.ranch-cell.rc-ready{background:#b8e878}
.ranch-cell:active{transform:scale(.92)}
.rc-lock{font-size:18px;opacity:.6}.rc-empty{font-size:14px;opacity:.3}
.rc-animal{font-size:22px;&.hungry{animation:bounce .8s infinite}&.ready{animation:bounce 1.2s infinite;font-size:26px}}
.rc-tag{position:absolute;top:-10px;right:-4px;font-size:10px;z-index:4}

// ── Garden ──
.garden-shelf{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
.gs-board{display:block;font-size:110px;line-height:.7;color:#a07840}
.gs-pots{display:flex;gap:6px;position:absolute;top:5px;left:50%;transform:translateX(-50%)}
.gs-pot{width:36px;height:36px;background:#e8a060;border-radius:3px 3px 8px 8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .12s}
.gs-pot.gp-bloom{background:#f0c040}.gs-pot:active{transform:scale(.9)}
.gs-pot-locked{opacity:.5;border:2px dashed rgba(0,0,0,.2)}
.gp-empty{font-size:10px;opacity:.3}.gp-bloom{font-size:20px;animation:bounce 1.2s infinite}.gp-growing{font-size:14px}

// ── Farm 6×6 ──
.farm-grid{
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  display:grid; grid-template-columns:repeat(6,72px); grid-template-rows:repeat(6,72px); gap:5px; z-index:2;
}
.farm-tile{position:relative;cursor:pointer;transition:transform .1s;display:flex;align-items:center;justify-content:center}
.farm-tile:active{transform:scale(.93)}.farm-tile.locked{cursor:pointer}
.ft-dirt{position:absolute;inset:0;background:linear-gradient(135deg,#b89860,#8b6a40);border-radius:5px;box-shadow:inset 0 1px 2px rgba(0,0,0,.2),0 1px 3px rgba(0,0,0,.15)}
.thirsty .ft-dirt{background:linear-gradient(135deg,#c49060,#a07040)}
.mature .ft-dirt{background:linear-gradient(135deg,#a08850,#786030)}
.withered .ft-dirt{background:linear-gradient(135deg,#807060,#605040)}
.locked .ft-dirt{background:#9a8a70}
.ft-crop{position:relative;z-index:2;display:flex;align-items:center;justify-content:center}
.ftc-lock{font-size:18px;opacity:.75}.ftc-empty{font-size:12px;opacity:.25}
.ftc-mature{font-size:28px;animation:bounce 1.2s infinite}.ftc-wither{font-size:18px;opacity:.5}
.ftc-growing{font-size:20px;animation:cropSway 3s infinite}
.ft-tag{position:absolute;top:2px;right:2px;font-size:10px;z-index:4}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes cropSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}

// ── Seed Picker ──
.seed-picker-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:400; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); }
.seed-picker { background:linear-gradient(180deg,#f5ead0,#e8d8b0); border:3px solid #a07840; border-radius:16px; padding:16px; min-width:240px; max-width:300px; box-shadow:0 8px 32px rgba(0,0,0,.35); }
.sp-title { font-size:15px; font-weight:800; color:#4a3728; text-align:center; margin-bottom:12px; }
.sp-list { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.sp-item { display:flex; align-items:center; gap:10px; padding:10px 12px; background:rgba(255,255,255,.6); border:2px solid rgba(160,120,64,.3); border-radius:10px; cursor:pointer; transition:all .12s; }
.sp-item:hover { background:#fff; border-color:#a07840; transform:scale(1.02); }
.sp-item:active { transform:scale(.96); }
.sp-emoji { font-size:28px; width:36px; text-align:center; }
.sp-info { flex:1; display:flex; flex-direction:column; }
.sp-name { font-size:13px; font-weight:700; color:#4a3728; }
.sp-price { font-size:11px; color:#8a6a48; }
.sp-locked { opacity:.35; cursor:not-allowed; pointer-events:none; filter:grayscale(1); }
.sp-locked-tag { font-size:10px; color:#c0392b; }
.sp-cancel { width:100%; padding:8px; background:rgba(0,0,0,.08); border:none; border-radius:8px; font-size:13px; font-weight:600; color:#6a5a48; cursor:pointer; }
</style>
