<template>
  <div class="tool-belt">
    <!-- 工具按钮组 -->
    <div class="tb-tools">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tb-tool"
        :class="{ active: currentTool === tool.id }"
        @click="selectTool(tool.id)"
      >
        <span class="tb-tool-icon">{{ tool.emoji }}</span>
        <span class="tb-tool-name">{{ tool.label }}</span>
      </button>
    </div>

    <!-- 动态主操作按钮 -->
    <button class="tb-main" :class="mainBtn.class" @click="doMain">
      <span class="tb-main-glow"></span>
      <span class="tb-main-icon">{{ mainBtn.icon }}</span>
      <span class="tb-main-label">{{ mainBtn.label }}</span>
    </button>

    <!-- 扩建 -->
    <button
      v-if="showExpand"
      class="tb-tool tb-expand"
      @click="doExpand"
    >
      <span class="tb-tool-icon">🏗️</span>
      <span class="tb-tool-name">扩建</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'
import { CROP_CONFIGS, FARM_PLOT_PRICES, RANCH_SLOT_PRICES, GARDEN_POT_PRICES } from '@/configs'

type ToolId = 'plant' | 'water' | 'harvest' | 'remove' | 'build'

const game = useGameStore()
const currentTool = ref<ToolId>('harvest')
const showToast = inject<(msg: string, type?: string) => void>('showToast', () => {})

const tools = [
  { id: 'plant' as ToolId, emoji: '🌱', label: '播种' },
  { id: 'water' as ToolId, emoji: '💧', label: '浇水' },
  { id: 'harvest' as ToolId, emoji: '🌾', label: '收获' },
  { id: 'remove' as ToolId, emoji: '🔧', label: '铲除' },
]

function selectTool(id: ToolId) {
  currentTool.value = id
}

// ── 动态主按钮 ──
const mainBtn = computed(() => {
  const matureCrop = game.farmPlots.filter(p => p.state === 'MATURE').length
  const thirsty = game.farmPlots.filter(p => (p.state === 'PLANTED' || p.state === 'GROWING') && p.waterCount === 0).length
  const hungry = game.ranchSlots.filter(s => s.animalId && s.state === 'HUNGRY').length
  const readyAnimal = game.ranchSlots.filter(s => s.animalId && s.state === 'READY').length
  const blooming = game.gardenPots.filter(p => p.state === 'BLOOM').length

  if (matureCrop > 0) return { icon: '🌾', label: `收获(${matureCrop})`, class: 'harvest-glow' }
  if (thirsty > 0) return { icon: '💧', label: `浇水(${thirsty})`, class: 'water-glow' }
  if (readyAnimal > 0) return { icon: '🧺', label: `采集(${readyAnimal})`, class: 'harvest-glow' }
  if (hungry > 0) return { icon: '🍖', label: `喂食(${hungry})`, class: 'feed-glow' }
  if (blooming > 0) return { icon: '💐', label: `采摘(${blooming})`, class: 'pick-glow' }
  return { icon: '✋', label: '探索', class: 'neutral' }
})

function doMain() {
  let c = 0
  for (const p of game.farmPlots) {
    if (p.state === 'MATURE') { game.harvestPlot(p.id); c++ }
    else if ((p.state === 'PLANTED' || p.state === 'GROWING') && p.waterCount === 0) { game.waterPlot(p.id); c++ }
  }
  for (const s of game.ranchSlots) {
    if (s.state === 'READY') { game.collectAnimalProduct(s.id); c++ }
    else if (s.state === 'HUNGRY') { game.feedAnimalSlot(s.id); c++ }
  }
  for (const p of game.gardenPots) {
    if (p.state === 'BLOOM') { game.pickFlowerPot(p.id); c++ }
  }
  if (c > 0) showToast(`操作完成 ×${c}`, 'success')
}

const showExpand = computed(() => {
  return (
    FARM_PLOT_PRICES.find(p => p.plotIndex === game.farmPlots.length) ||
    RANCH_SLOT_PRICES.find(p => p.slotIndex === game.ranchSlots.length) ||
    GARDEN_POT_PRICES.find(p => p.potIndex === game.gardenPots.length)
  )
})

function doExpand() {
  const fp = FARM_PLOT_PRICES.find(p => p.plotIndex === game.farmPlots.length)
  if (fp && game.buyFarmPlot()) { showToast('农场扩建成功！', 'success'); return }
  const rs = RANCH_SLOT_PRICES.find(p => p.slotIndex === game.ranchSlots.length)
  if (rs && game.buyRanchSlot()) { showToast('牧场扩建成功！', 'success'); return }
  const gp = GARDEN_POT_PRICES.find(p => p.potIndex === game.gardenPots.length)
  if (gp && game.buyGardenPot()) { showToast('花园扩建成功！', 'success'); return }
  showToast('金币不足 💰', 'error')
}

defineExpose({ currentTool })
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as v;

.tool-belt {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 300;
  padding: 6px 8px;
  background: linear-gradient(180deg,
    rgba(58, 42, 18, 0.85) 0%,
    rgba(42, 30, 12, 0.88) 30%,
    rgba(32, 22, 8, 0.9) 100%
  );
  border: 2.5px solid rgba(196, 154, 44, 0.45);
  border-radius: 20px;
  box-shadow: 0 4px 0 rgba(20, 14, 4, 0.5), 0 8px 20px rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
}

// ── 工具按钮 ──
.tb-tools {
  display: flex;
  gap: 3px;
}

.tb-tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 42px;
  padding: 5px 6px 4px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(139, 105, 20, 0.5) 0%, rgba(100, 74, 14, 0.6) 100%);
  border: 1.5px solid rgba(196, 154, 44, 0.25);
  cursor: pointer;
  transition: all 0.15s cubic-bezier(.34,1.56,.64,1);

  &:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg, rgba(160, 120, 30, 0.6) 0%, rgba(120, 88, 18, 0.7) 100%);
    border-color: rgba(240, 192, 64, 0.5);
    box-shadow: 0 3px 0 rgba(74,53,8,0.4), 0 5px 10px rgba(0,0,0,0.3);
  }

  &:active {
    transform: translateY(1px) scale(0.93);
    transition: all 0.06s ease;
    background: linear-gradient(180deg, rgba(100, 74, 14, 0.7) 0%, rgba(80, 56, 10, 0.8) 100%);
  }

  // ── 激活态 ──
  &.active {
    background: linear-gradient(180deg, #c49a2c 0%, #a07820 40%, #8b6914 100%);
    border-color: #f0c040;
    box-shadow:
      0 0 14px rgba(240, 192, 64, 0.5),
      0 0 28px rgba(240, 192, 64, 0.2),
      0 3px 0 #4a3508,
      0 5px 10px rgba(0,0,0,0.35);
    transform: translateY(-3px) scale(1.05);

    .tb-tool-icon { filter: drop-shadow(0 0 4px rgba(255,255,200,0.6)); font-size: 20px; }
    .tb-tool-name { color: #fff8e0; font-weight: 800; }

    &:hover { transform: translateY(-4px) scale(1.06); }
    &:active { transform: translateY(0) scale(0.97); }
  }
}

.tb-tool-icon { font-size: 18px; line-height: 1; transition: all 0.15s; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3)); }
.tb-tool-name {
  font-size: 7px;
  font-weight: 600;
  color: rgba(255,248,224,0.65);
  letter-spacing: 0.3px;
  transition: all 0.15s;
}

.tb-expand {
  margin-left: 2px;
  .tb-tool-icon { filter: drop-shadow(0 0 3px rgba(240,192,64,0.4)); }
}

// ── 动态主按钮 ──
.tb-main {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 18px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 13px;
  color: #fff;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(.34,1.56,.64,1);
  box-shadow: 0 4px 0 rgba(0,0,0,0.35), 0 6px 14px rgba(0,0,0,0.3);
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 0 rgba(0,0,0,0.3), 0 8px 18px rgba(0,0,0,0.35);
  }
  &:active {
    transform: translateY(2px) scale(0.94);
    box-shadow: 0 2px 0 rgba(0,0,0,0.4), 0 3px 8px rgba(0,0,0,0.3);
    transition: all 0.05s ease;
  }

  // 顶部高光
  &::before {
    content: '';
    position: absolute;
    top: 2px; left: 8px; right: 8px; height: 3px;
    background: rgba(255,255,255,0.2);
    border-radius: 0 0 4px 4px;
  }
}

.tb-main-glow {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.tb-main:hover .tb-main-glow { opacity: 1; }

.tb-main-icon { font-size: 20px; line-height: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
.tb-main-label { text-shadow: 0 1px 2px rgba(0,0,0,0.4); }

// 颜色主题
.harvest-glow {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  border-color: #1a8a4a;
  .tb-main-glow { background: radial-gradient(ellipse, rgba(46,204,113,0.4), transparent 70%); }
}
.water-glow {
  background: linear-gradient(135deg, #2980b9, #3498db);
  border-color: #1a6a9a;
  .tb-main-glow { background: radial-gradient(ellipse, rgba(52,152,219,0.4), transparent 70%); }
}
.feed-glow {
  background: linear-gradient(135deg, #e67e22, #f39c12);
  border-color: #c06510;
  .tb-main-glow { background: radial-gradient(ellipse, rgba(243,156,18,0.4), transparent 70%); }
}
.pick-glow {
  background: linear-gradient(135deg, #e91e63, #ff80ab);
  border-color: #c4185a;
  .tb-main-glow { background: radial-gradient(ellipse, rgba(255,128,171,0.4), transparent 70%); }
}
.neutral {
  background: linear-gradient(135deg, #c49a2c, #a07820);
  border-color: #8b6914;
  .tb-main-glow { background: radial-gradient(ellipse, rgba(196,154,44,0.3), transparent 70%); }
}
</style>
