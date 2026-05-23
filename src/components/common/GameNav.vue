<template>
  <nav class="game-nav">
    <div class="nav-inner">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="wood-btn"
        :class="{ active: currentTab === tab.id, locked: !tab.unlocked }"
        @click="tab.unlocked && $emit('change', tab.id)"
      >
        <span class="wood-btn-emoji">{{ tab.emoji }}</span>
        <span class="wood-btn-label">{{ tab.label }}</span>
        <span v-if="!tab.unlocked" class="wood-btn-lock">🔒</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

export type TabId = 'farm' | 'ranch' | 'garden' | 'workshop' | 'shop' | 'inventory'

defineProps<{
  currentTab: TabId
}>()

defineEmits<{
  change: [tab: TabId]
}>()

const game = useGameStore()

const tabs = computed(() => [
  { id: 'farm' as TabId, emoji: '🌾', label: '农场', unlocked: true },
  { id: 'ranch' as TabId, emoji: '🐄', label: '牧场', unlocked: game.level >= 3 },
  { id: 'garden' as TabId, emoji: '🌷', label: '花园', unlocked: game.isGardenUnlocked },
  { id: 'workshop' as TabId, emoji: '🔧', label: '工坊', unlocked: game.isWorkshopUnlocked },
  { id: 'shop' as TabId, emoji: '🏪', label: '商店', unlocked: true },
  { id: 'inventory' as TabId, emoji: '📦', label: '仓库', unlocked: true },
])
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.game-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  padding: $spacing-xs $spacing-sm;
  padding-bottom: max(#{$spacing-xs}, env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(42,31,20,0.0) 0%, rgba(42,31,20,0.85) 30%);
}

.nav-inner {
  display: flex;
  justify-content: space-around;
  max-width: $max-content-width;
  margin: 0 auto;
}

.wood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px 5px;
  border-radius: 10px;
  background: $wood-bg;
  border: 2px solid $wood-border;
  box-shadow: $wood-shadow;
  position: relative;
  transition: all $transition-fast;
  min-width: 52px;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 6px;
    right: 6px;
    height: 4px;
    background: rgba(255,255,255,0.18);
    border-radius: 0 0 4px 4px;
  }

  &.active {
    background: $wood-bg-active;
    box-shadow: 0 1px 0 #4a3508, 0 2px 4px rgba(0,0,0,0.3);
    transform: translateY(2px);
    border-color: #3d2e08;

    .wood-btn-label { color: #ffe8a0; font-weight: 700; }
    .wood-btn-emoji { transform: scale(1.15); }

    &::before { opacity: 0.08; }
  }

  &.locked {
    opacity: 0.45;
    filter: grayscale(0.5);
  }

  &:not(.locked):active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #4a3508, 0 2px 4px rgba(0,0,0,0.3);
  }
}

.wood-btn-emoji {
  font-size: 20px;
  line-height: 1;
  transition: transform $transition-fast;
}

.wood-btn-label {
  font-size: 9px;
  color: $wood-text;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  letter-spacing: 0.5px;
}

.wood-btn-lock {
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 10px;
}
</style>
