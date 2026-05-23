<template>
  <nav class="game-nav">
    <div class="nav-inner">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-btn"
        :class="{ active: currentTab === tab.id, locked: !tab.unlocked }"
        @click="tab.unlocked && $emit('change', tab.id)"
      >
        <span class="nav-emoji">{{ tab.emoji }}</span>
        <span class="nav-label">{{ tab.label }}</span>
        <span v-if="!tab.unlocked" class="nav-lock">🔒</span>
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
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid $color-border;
  padding: $spacing-xs 0 env(safe-area-inset-bottom, 0);
}

.nav-inner {
  display: flex;
  justify-content: space-around;
  max-width: $max-content-width;
  margin: 0 auto;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  transition: all $transition-fast;
  position: relative;

  &.active {
    background: rgba($color-primary, 0.12);
    .nav-label { color: $color-primary; font-weight: 700; }
    .nav-emoji { transform: scale(1.1); }
  }

  &.locked {
    opacity: 0.5;
    .nav-label { color: $color-text-light; }
  }

  &:not(.locked):active {
    transform: scale(0.95);
  }
}

.nav-emoji {
  font-size: 22px;
  transition: transform $transition-fast;
}

.nav-label {
  font-size: $font-size-xs;
  color: $color-text;
  font-weight: 500;
}

.nav-lock {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
}
</style>
