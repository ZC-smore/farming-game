<template>
  <div class="inventory-view">
    <div class="section-header">
      <h2>📦 仓库</h2>
      <div class="sub-info">
        <span>{{ game.inventory.usedCapacity }}/{{ game.inventory.capacity }}</span>
      </div>
    </div>

    <div class="capacity-bar">
      <div class="capacity-fill" :style="{ width: capacityPercent + '%' }"></div>
    </div>

    <!-- 按类型分组 -->
    <div v-for="group in itemGroups" :key="group.type" class="item-group">
      <h3>{{ group.label }}</h3>
      <div class="item-list">
        <div v-if="group.items.length === 0" class="empty-hint">暂无物品</div>
        <div
          v-for="item in group.items"
          :key="item.id"
          class="item-card"
        >
          <span class="item-emoji">{{ item.emoji }}</span>
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-sell-price">售价 🪙{{ item.sellPrice }}/个</span>
          </div>
          <span class="item-count">×{{ item.count }}</span>
          <div class="item-actions">
            <button class="sell-btn" @click="game.sellItem(item.id)">卖1个</button>
            <button class="sell-all-btn" @click="game.sellAllOfType(item.id)">全卖</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 饲料/肥料 -->
    <div class="item-group">
      <h3>🧪 加工材料</h3>
      <div class="item-list">
        <div class="item-card material">
          <span class="item-emoji">🌾</span>
          <div class="item-info">
            <span class="item-name">饲料</span>
          </div>
          <span class="item-count">×{{ game.feedStock }}</span>
        </div>
        <div class="item-card material">
          <span class="item-emoji">🌱</span>
          <div class="item-info">
            <span class="item-name">肥料</span>
          </div>
          <span class="item-count">×{{ game.fertilizerStock }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import type { InventoryItem } from '@/systems/inventory'

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
    {
      type: 'crop',
      label: '🌾 农作物',
      items: allItems.filter(i => i.type === 'crop'),
    },
    {
      type: 'animal_product',
      label: '🐄 动物产品',
      items: allItems.filter(i => i.type === 'animal_product'),
    },
    {
      type: 'flower',
      label: '🌷 花卉',
      items: allItems.filter(i => i.type === 'flower'),
    },
    {
      type: 'processed',
      label: '🔧 加工品',
      items: allItems.filter(i => i.type === 'processed'),
    },
  ]
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.inventory-view {
  padding: $spacing-md;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;

  h2 { font-size: $font-size-xl; }
}

.sub-info {
  font-size: $font-size-sm;
  color: $color-text-light;
}

.capacity-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: $spacing-lg;
}

.capacity-fill {
  height: 100%;
  background: $color-primary;
  border-radius: 4px;
  transition: width $transition-normal;
}

.item-group {
  margin-bottom: $spacing-xl;

  h3 {
    font-size: $font-size-lg;
    margin-bottom: $spacing-sm;
    padding-bottom: $spacing-xs;
    border-bottom: 1px solid $color-border;
  }
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.item-card {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: $color-card;
  border-radius: $radius-md;
  box-shadow: $shadow-soft;

  &.material {
    background: rgba($color-primary, 0.05);
  }
}

.item-emoji {
  font-size: 24px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 600;
  font-size: $font-size-md;
}

.item-sell-price {
  font-size: $font-size-xs;
  color: #8a6d1b;
}

.item-count {
  font-weight: 700;
  font-size: $font-size-lg;
  color: $color-primary;
}

.item-actions {
  display: flex;
  gap: $spacing-xs;
}

.sell-btn, .sell-all-btn {
  padding: 4px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 600;
}

.sell-btn {
  background: rgba($color-primary, 0.12);
  color: $color-primary;
}

.sell-all-btn {
  background: rgba(#8a6d1b, 0.12);
  color: #8a6d1b;
}

.empty-hint {
  font-size: $font-size-sm;
  color: $color-text-light;
  padding: $spacing-lg;
  text-align: center;
}
</style>
