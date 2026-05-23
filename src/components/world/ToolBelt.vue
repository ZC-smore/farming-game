<template>
  <div class="tool-belt">
    <!-- 左侧工具 -->
    <div class="tools-left">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-slot"
        :class="{ active: currentTool === tool.id }"
        @click="selectTool(tool.id)"
      >
        <span class="tool-icon">{{ tool.emoji }}</span>
        <span class="tool-label">{{ tool.label }}</span>
      </button>
    </div>

    <!-- 中间主按钮（动态） -->
    <button class="main-action-btn" :class="mainAction.cls" @click="doMainAction">
      <span class="main-icon">{{ mainAction.icon }}</span>
      <span class="main-label">{{ mainAction.label }}</span>
    </button>

    <!-- 右侧扩建 -->
    <div class="tools-right">
      <button
        v-if="canExpandAny"
        class="tool-slot expand"
        @click="doExpand"
      >
        <span class="tool-icon">🏗️</span>
        <span class="tool-label">扩建</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'
import { FARM_PLOT_PRICES, RANCH_SLOT_PRICES, GARDEN_POT_PRICES } from '@/configs/economy'

type ToolId = 'move' | 'plant' | 'water' | 'harvest'

const game = useGameStore()
const currentTool = ref<ToolId>('move')
const showToast = inject<(msg: string, type?: string) => void>('showToast', () => {})

const tools = [
  { id: 'move' as ToolId, emoji: '✋', label: '移动' },
  { id: 'plant' as ToolId, emoji: '🌱', label: '种植' },
  { id: 'water' as ToolId, emoji: '💧', label: '浇水' },
  { id: 'harvest' as ToolId, emoji: '🌾', label: '收获' },
]

function selectTool(tool: ToolId) {
  currentTool.value = tool
}

// 主按钮逻辑
const mainAction = computed(() => {
  const mature = game.farmPlots.filter(p => p.state === 'MATURE').length
  const thirsty = game.farmPlots.filter(p => p.state === 'PLANTED' || p.state === 'GROWING').filter(p => p.waterCount === 0).length
  const hungry = game.ranchSlots.filter(s => s.animalId && s.state === 'HUNGRY').length
  const ready = game.ranchSlots.filter(s => s.animalId && s.state === 'READY').length
  const blooming = game.gardenPots.filter(p => p.state === 'BLOOM').length

  if (mature > 0) return { icon: '🌾', label: `收获(${mature})`, cls: 'action-harvest' }
  if (thirsty > 0) return { icon: '💧', label: `浇水(${thirsty})`, cls: 'action-water' }
  if (ready > 0) return { icon: '🧺', label: `收获(${ready})`, cls: 'action-harvest' }
  if (hungry > 0) return { icon: '🍖', label: `喂食(${hungry})`, cls: 'action-feed' }
  if (blooming > 0) return { icon: '💐', label: `采摘(${blooming})`, cls: 'action-pick' }
  return { icon: '✋', label: '探索', cls: 'action-explore' }
})

function doMainAction() {
  // 收获全部成熟作物
  if (mainAction.value.cls) {
    let count = 0
    for (const p of game.farmPlots) {
      if (p.state === 'MATURE') { game.harvestPlot(p.id); count++ }
    }
    for (const s of game.ranchSlots) {
      if (s.state === 'READY') { game.collectAnimalProduct(s.id); count++ }
    }
    for (const p of game.gardenPots) {
      if (p.state === 'BLOOM') { game.pickFlowerPot(p.id); count++ }
    }
    if (count > 0) showToast(`操作了${count}项！`, 'success')
  }
}

const canExpandAny = computed(() => {
  return (
    !!FARM_PLOT_PRICES.find(p => p.plotIndex === game.farmPlots.length) ||
    !!RANCH_SLOT_PRICES.find(p => p.slotIndex === game.ranchSlots.length) ||
    !!GARDEN_POT_PRICES.find(p => p.potIndex === game.gardenPots.length)
  )
})

function doExpand() {
  // 优先扩建农场，然后牧场，然后花园
  if (FARM_PLOT_PRICES.find(p => p.plotIndex === game.farmPlots.length)) {
    if (game.buyFarmPlot()) { showToast('农场扩建成功！', 'success'); return }
  }
  if (RANCH_SLOT_PRICES.find(p => p.slotIndex === game.ranchSlots.length)) {
    if (game.buyRanchSlot()) { showToast('牧场扩建成功！', 'success'); return }
  }
  if (GARDEN_POT_PRICES.find(p => p.potIndex === game.gardenPots.length)) {
    if (game.buyGardenPot()) { showToast('花园扩建成功！', 'success'); return }
  }
  showToast('金币不足', 'error')
}

defineExpose({ currentTool })
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.tool-belt {
  position: fixed;
  bottom: $nav-height + 4px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: $spacing-xs;
  z-index: 150;
  padding: 6px $spacing-sm;
  background: rgba(42, 31, 20, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  border: 2px solid rgba(196, 154, 44, 0.35);
}

.tools-left {
  display: flex;
  gap: 3px;
}

.tool-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 5px 7px 4px;
  border-radius: 8px;
  background: rgba(255, 248, 224, 0.08);
  border: 1.5px solid rgba(255, 248, 224, 0.12);
  transition: all $transition-fast;
  min-width: 40px;

  &.active {
    background: $wood-bg;
    border-color: $wood-border;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transform: translateY(-2px);

    .tool-label { color: $wood-text; font-weight: 700; }
  }

  &:active { transform: translateY(0); }

  .tool-icon { font-size: 16px; line-height: 1; }
  .tool-label {
    font-size: 7px;
    color: rgba(255,248,224,0.6);
    font-weight: 600;
    letter-spacing: 0.3px;
  }
}

// --- 主按钮 ---
.main-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px 7px;
  border-radius: 14px;
  font-weight: 700;
  font-size: $font-size-sm;
  color: #fff;
  border: 2px solid transparent;
  transition: all $transition-fast;
  animation: dropBounce 0.4s ease backwards;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 2px; left: 8px; right: 8px; height: 3px;
    background: rgba(255,255,255,0.2);
    border-radius: 0 0 3px 3px;
  }

  .main-icon { font-size: 18px; line-height: 1; }
  .main-label { white-space: nowrap; }
}

.action-harvest {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  border-color: #1a8a4a;
  box-shadow: 0 3px 10px rgba(39,174,96,0.4);
}
.action-water {
  background: linear-gradient(135deg, #2980b9, #3498db);
  border-color: #1a6a9a;
  box-shadow: 0 3px 10px rgba(41,128,185,0.4);
}
.action-feed {
  background: linear-gradient(135deg, #e67e22, #f39c12);
  border-color: #c06510;
  box-shadow: 0 3px 10px rgba(230,126,34,0.4);
}
.action-pick {
  background: linear-gradient(135deg, #e91e63, #ff80ab);
  border-color: #c4185a;
  box-shadow: 0 3px 10px rgba(233,30,99,0.4);
}
.action-explore {
  background: $wood-bg;
  border-color: $wood-border;
  box-shadow: $wood-shadow;
  .main-label { color: $wood-text; }
}

.tools-right {
  display: flex;
}

.expand {
  background: rgba(240, 192, 64, 0.15) !important;
  border-color: rgba(240, 192, 64, 0.3) !important;
  .tool-label { color: #f0c040 !important; }
}
</style>
