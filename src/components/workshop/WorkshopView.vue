<template>
  <div class="workshop-world">
    <!-- 背景 -->
    <div class="world-decor">
      <div class="wall"></div>
      <div class="shelf">🪵</div>
      <div class="lamp">🏮</div>
      <div class="jar jar-1">🫙</div>
      <div class="jar jar-2">🫙</div>
      <div class="jar jar-3">🏺</div>
    </div>

    <!-- 加工台 -->
    <div class="workbench-area">
      <!-- 三类加工 -->
      <div class="bench-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="bench-tab wood-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span>{{ tab.emoji }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- 加工台面 -->
      <div class="bench-surface">
        <div class="bench-top"></div>

        <!-- 作物加工 -->
        <div v-if="activeTab === 'crop'" class="bench-items">
          <button
            v-for="crop in processableCrops"
            :key="crop.id"
            class="bench-item"
            :class="{ disabled: !canProcess(crop.id) }"
            @click="handleProcessCrop(crop.id)"
          >
            <div class="item-flow">
              <span class="item-emoji">{{ crop.emoji }}</span>
              <span class="flow-arrow">🔨</span>
              <span class="item-emoji result">{{ crop.processedEmoji }}</span>
            </div>
            <div class="item-info">
              <span class="item-name">{{ crop.processedName }}</span>
              <span class="item-price">🪙{{ crop.processedPrice }}</span>
            </div>
            <span class="item-stock">×{{ getCropStock(crop.id) }}</span>
          </button>
          <div v-if="processableCrops.length === 0" class="empty-bench">暂无可加工的作物</div>
        </div>

        <!-- 动物产品加工 -->
        <div v-if="activeTab === 'animal'" class="bench-items">
          <button
            v-for="animal in processableAnimals"
            :key="animal.id"
            class="bench-item"
            :class="{ disabled: !canProcessAnimalProduct(animal.id) }"
            @click="handleProcessAnimal(animal.id)"
          >
            <div class="item-flow">
              <span class="item-emoji">{{ animal.productEmoji }}</span>
              <span class="flow-arrow">🔨</span>
              <span class="item-emoji result">{{ animal.processedEmoji }}</span>
            </div>
            <div class="item-info">
              <span class="item-name">{{ animal.processedName }}</span>
              <span class="item-price">🪙{{ animal.processedPrice }}</span>
            </div>
            <span class="item-stock">×{{ getAnimalProductStock(animal.id) }}</span>
          </button>
          <div v-if="processableAnimals.length === 0" class="empty-bench">暂无可加工的产品</div>
        </div>

        <!-- 花艺加工 -->
        <div v-if="activeTab === 'flower'" class="bench-items">
          <button
            v-for="flower in processableFlowers"
            :key="flower.id"
            class="bench-item"
            :class="{ disabled: !canProcessFlower(flower.id) }"
            @click="handleProcessFlower(flower.id)"
          >
            <div class="item-flow">
              <span class="item-emoji">{{ flower.emoji }}</span>
              <span class="flow-arrow">🔨</span>
              <span class="item-emoji result">{{ flower.processedEmoji }}</span>
            </div>
            <div class="item-info">
              <span class="item-name">{{ flower.processedName }}</span>
              <span class="item-price">🪙{{ flower.processedPrice }}</span>
            </div>
            <span class="item-stock">×{{ getFlowerStock(flower.id) }}</span>
          </button>
          <div v-if="processableFlowers.length === 0" class="empty-bench">暂无可加工的花卉</div>
        </div>
      </div>

      <div class="bench-fee">加工费: 🪙5/次</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { CROP_CONFIGS, ANIMAL_CONFIGS, FLOWER_CONFIGS } from '@/configs'
import type { CropId } from '@/configs/crops'
import type { AnimalId } from '@/configs/animals'
import type { FlowerId } from '@/configs/flowers'
import { getItemCount } from '@/systems/inventory'

const game = useGameStore()

type BenchTab = 'crop' | 'animal' | 'flower'
const activeTab = ref<BenchTab>('crop')

const tabs = [
  { id: 'crop' as BenchTab, emoji: '🌾', label: '作物' },
  { id: 'animal' as BenchTab, emoji: '🐄', label: '产品' },
  { id: 'flower' as BenchTab, emoji: '🌷', label: '花艺' },
]

const processableCrops = computed(() =>
  Object.values(CROP_CONFIGS).filter(c => c.unlockLevel <= game.level)
)
const processableAnimals = computed(() =>
  Object.values(ANIMAL_CONFIGS).filter(a => a.unlockLevel <= game.level)
)
const processableFlowers = computed(() =>
  Object.values(FLOWER_CONFIGS).filter(f => f.unlockLevel <= game.level)
)

function getCropStock(cropId: CropId): number { return getItemCount(game.inventory, cropId) }
function getAnimalProductStock(animalId: AnimalId): number { return getItemCount(game.inventory, animalId + '_product') }
function getFlowerStock(flowerId: FlowerId): number { return getItemCount(game.inventory, flowerId) }
function canProcess(cropId: CropId): boolean { return getItemCount(game.inventory, cropId) >= 1 && game.coins >= 5 }
function canProcessAnimalProduct(animalId: AnimalId): boolean { return getItemCount(game.inventory, animalId + '_product') >= 1 && game.coins >= 5 }
function canProcessFlower(flowerId: FlowerId): boolean { return getItemCount(game.inventory, flowerId) >= 1 && game.coins >= 5 }

function handleProcessCrop(cropId: CropId) {
  const config = CROP_CONFIGS[cropId]
  if (!config) return
  game.processItem(cropId, cropId + '_processed', config.processedName, config.processedEmoji, config.processedPrice)
}

function handleProcessAnimal(animalId: AnimalId) {
  const config = ANIMAL_CONFIGS[animalId]
  if (!config) return
  game.processItem(animalId + '_product', animalId + '_processed', config.processedName, config.processedEmoji, config.processedPrice)
}

function handleProcessFlower(flowerId: FlowerId) {
  const config = FLOWER_CONFIGS[flowerId]
  if (!config) return
  game.processItem(flowerId, flowerId + '_processed', config.processedName, config.processedEmoji, config.processedPrice)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.workshop-world {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(255,200,100,0.12) 0%, transparent 60%),
    linear-gradient(180deg, #c8a868 0%, #a88848 30%, #8a6830 60%, #6a4818 100%);
}

.world-decor { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

.wall {
  position: absolute; top: 0; left: 0; right: 0; height: 40%;
  background: linear-gradient(180deg, #a08050 0%, #8a6838 100%);
  border-bottom: 4px solid $world-wood-dark;
}

.shelf { position: absolute; top: 12%; right: 10%; font-size: 40px; }
.lamp { position: absolute; top: 8%; left: 8%; font-size: 36px; animation: sway 3s ease-in-out infinite; }
.jar { position: absolute; font-size: 28px; filter: drop-shadow(1px 2px 1px rgba(0,0,0,0.2)); }
.jar-1 { top: 18%; left: 25%; }
.jar-2 { top: 22%; right: 22%; font-size: 24px; }
.jar-3 { top: 15%; left: 45%; font-size: 22px; }

// === 加工台区 ===
.workbench-area {
  position: absolute;
  bottom: $nav-height + 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 420px;
}

.bench-tabs {
  display: flex;
  gap: $spacing-xs;
  margin-bottom: -2px;
  position: relative;
  z-index: 2;
}

.bench-tab {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 6px 8px 5px;
  border-radius: 10px 10px 0 0;
  background: linear-gradient(180deg, #7a5818 0%, #604010 100%);
  border: 2px solid $world-wood-dark;
  border-bottom: none;
  position: relative;

  span:first-child { font-size: 18px; line-height: 1; }
  span:last-child { font-size: 9px; color: rgba(255,248,224,0.7); font-weight: 600; }

  &.active {
    background: $wood-bg;
    border-color: $wood-border;
    span:last-child { color: $wood-text; }

    &::after {
      content: '';
      position: absolute; bottom: -2px; left: 0; right: 0; height: 4px;
      background: #c49a2c;
    }
  }

  &:active { transform: translateY(1px); }
}

.bench-surface {
  background: linear-gradient(180deg, #c49a2c 0%, #a07820 60%, #8b6914 100%);
  border: 2px solid $world-wood-dark;
  border-radius: 0 0 $radius-lg $radius-lg;
  padding: $spacing-md;
  position: relative;
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.15),
    0 4px 12px rgba(0,0,0,0.3);
}

.bench-top {
  position: absolute; top: 0; left: 8px; right: 8px; height: 3px;
  background: rgba(255,255,255,0.1);
  border-radius: 0 0 2px 2px;
}

.bench-items {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  max-height: 280px;
  overflow-y: auto;
}

.bench-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: rgba(255,248,224,0.12);
  border-radius: $radius-md;
  border: 1.5px solid rgba(255,248,224,0.1);
  transition: all $transition-fast;
  text-align: left;

  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.4; }
}

.item-flow {
  display: flex; align-items: center; gap: 4px;
  min-width: 70px;
}

.item-emoji {
  font-size: 22px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
  &.result { font-size: 24px; }
}

.flow-arrow { font-size: 12px; opacity: 0.6; }

.item-info { flex: 1; display: flex; flex-direction: column; }
.item-name { font-size: $font-size-sm; font-weight: 700; color: #fff8e0; }
.item-price { font-size: $font-size-xs; color: rgba(255,248,224,0.7); }

.item-stock {
  font-size: $font-size-xs;
  color: rgba(255,248,224,0.6);
  font-weight: 600;
  white-space: nowrap;
}

.empty-bench {
  text-align: center;
  padding: $spacing-xxl;
  color: rgba(255,248,224,0.4);
  font-size: $font-size-sm;
}

.bench-fee {
  text-align: center;
  margin-top: $spacing-sm;
  font-size: $font-size-xs;
  color: rgba(255,248,224,0.5);
}
</style>
