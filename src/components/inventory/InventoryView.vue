<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="inv-overlay" @click.self="$emit('close')">
        <Transition name="slide-up">
          <div v-if="visible" class="inv-panel">
            <div class="panel-header">
              <h3>📦 仓库</h3>
              <div class="header-capacity">
                <span>{{ game.inventory.usedCapacity }}/{{ game.inventory.capacity }}</span>
                <div class="cap-bar">
                  <div class="cap-fill" :style="{ width: capacityPercent + '%' }"></div>
                </div>
              </div>
              <button class="close-btn" @click="$emit('close')">✕</button>
            </div>

            <div class="panel-body">
              <div v-for="group in itemGroups" :key="group.type" class="inv-group">
                <div class="group-title">{{ group.label }}</div>
                <div v-if="group.items.length === 0" class="empty-hint">暂无</div>
                <div v-else class="inv-grid">
                  <div v-for="item in group.items" :key="item.id" class="inv-item">
                    <span class="inv-emoji">{{ item.emoji }}</span>
                    <span class="inv-name">{{ item.name }}</span>
                    <span class="inv-count">×{{ item.count }}</span>
                    <div class="inv-actions">
                      <button class="sell-btn" @click="game.sellItem(item.id)">💰</button>
                      <button class="sell-all-btn" @click="game.sellAllOfType(item.id)">全卖</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 材料 -->
              <div class="inv-group">
                <div class="group-title">🧪 材料</div>
                <div class="inv-grid">
                  <div class="inv-item material">
                    <span class="inv-emoji">🌾</span>
                    <span class="inv-name">饲料</span>
                    <span class="inv-count">×{{ game.feedStock }}</span>
                  </div>
                  <div class="inv-item material">
                    <span class="inv-emoji">🌱</span>
                    <span class="inv-name">肥料</span>
                    <span class="inv-count">×{{ game.fertilizerStock }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { InventoryItem } from '@/systems/inventory'

defineProps<{ visible: boolean }>()
defineEmits<{ close: [] }>()

const game = useGameStore()

const capacityPercent = computed(() =>
  Math.round((game.inventory.usedCapacity / game.inventory.capacity) * 100)
)

interface ItemGroup {
  type: string
  label: string
  items: InventoryItem[]
}

const itemGroups = computed<ItemGroup[]>(() => {
  const allItems = Object.values(game.inventory.items)
  return [
    { type: 'crop', label: '🌾 农作物', items: allItems.filter(i => i.type === 'crop') },
    { type: 'animal_product', label: '🐄 动物产品', items: allItems.filter(i => i.type === 'animal_product') },
    { type: 'flower', label: '🌷 花卉', items: allItems.filter(i => i.type === 'flower') },
    { type: 'processed', label: '🔧 加工品', items: allItems.filter(i => i.type === 'processed') },
  ]
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.inv-overlay {
  position: fixed;
  inset: 0;
  z-index: 800;
  background: rgba(42, 31, 20, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.inv-panel {
  width: 100%;
  max-width: $max-content-width;
  max-height: 70vh;
  background: linear-gradient(180deg, #fff8e8 0%, #f5ecd4 100%);
  border: 3px solid $world-wood;
  border-bottom: none;
  border-radius: $radius-xl $radius-xl 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2px solid rgba(139, 105, 20, 0.2);
  background: linear-gradient(180deg, rgba(196, 154, 44, 0.15) 0%, transparent 100%);

  h3 { font-size: $font-size-lg; color: $color-text-dark; font-weight: 700; flex: 1; }
}

.header-capacity {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-xs;
  font-weight: 700;
  color: #8a6d1b;
}

.cap-bar {
  width: 50px; height: 5px;
  background: rgba(139, 105, 20, 0.12);
  border-radius: 3px;
  overflow: hidden;
}

.cap-fill {
  height: 100%;
  background: linear-gradient(90deg, $color-primary, #a8d86e);
  border-radius: 3px;
  transition: width $transition-normal;
}

.close-btn {
  width: 28px; height: 28px;
  border-radius: $radius-round;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: $color-text-light;
  background: rgba(139, 105, 20, 0.12);
  &:hover { background: rgba(139, 105, 20, 0.25); }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md $spacing-lg;
}

.inv-group { margin-bottom: $spacing-lg; }

.group-title {
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-text-dark;
  margin-bottom: $spacing-sm;
  padding-left: $spacing-xs;
}

.empty-hint {
  font-size: $font-size-xs;
  color: $color-text-light;
  text-align: center;
  padding: $spacing-md;
}

.inv-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.inv-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: rgba(139, 105, 20, 0.04);
  border: 1.5px solid rgba(139, 105, 20, 0.08);
  border-radius: $radius-md;

  &.material {
    background: rgba(106, 176, 76, 0.06);
    border-color: rgba(106, 176, 76, 0.12);
  }
}

.inv-emoji { font-size: 22px; }

.inv-name {
  flex: 1;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-text-dark;
  text-align: left;
}

.inv-count {
  font-size: $font-size-sm;
  font-weight: 700;
  color: $color-primary;
}

.inv-actions {
  display: flex;
  gap: $spacing-xs;
}

.sell-btn, .sell-all-btn {
  padding: 3px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 600;
}

.sell-btn {
  background: rgba(106, 176, 76, 0.15);
  color: $color-primary;
}

.sell-all-btn {
  background: rgba(139, 105, 20, 0.12);
  color: #8a6d1b;
}
</style>
