<template>
  <div class="game-header">
    <div class="resource-bar">
      <div class="resource-item coins">
        <span class="resource-emoji">🪙</span>
        <span class="resource-value">{{ game.coins }}</span>
      </div>
      <div class="resource-item water" @click="showWaterDetail = !showWaterDetail">
        <span class="resource-emoji">💧</span>
        <span class="resource-value">{{ game.water }}/{{ game.maxWater }}</span>
        <div class="water-bar">
          <div class="water-bar-fill" :style="{ width: waterPercent + '%' }"></div>
        </div>
      </div>
      <div class="resource-item level">
        <span class="resource-emoji">⭐</span>
        <span class="resource-value">Lv.{{ game.level }}</span>
        <div class="exp-bar">
          <div class="exp-bar-fill" :style="{ width: (game.expProgress * 100) + '%' }"></div>
        </div>
      </div>
      <div class="resource-item season">
        <span class="season-emoji">{{ seasonEmoji }}</span>
        <span class="resource-value season-text">{{ seasonName }} Day{{ seasonDay }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { getSeasonEmoji, getSeasonName } from '@/systems/season'

const game = useGameStore()
const showWaterDetail = ref(false)

const waterPercent = computed(() => Math.round((game.water / game.maxWater) * 100))
const seasonEmoji = computed(() => getSeasonEmoji(game.currentSeasonInfo.season))
const seasonName = computed(() => getSeasonName(game.currentSeasonInfo.season))
const seasonDay = computed(() => game.currentSeasonInfo.dayInSeason)
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.game-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: $spacing-sm $spacing-md;
  box-shadow: $shadow-soft;
}

.resource-bar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  max-width: $max-content-width;
  margin: 0 auto;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: $radius-sm;
  background: rgba(0, 0, 0, 0.04);
  font-size: $font-size-sm;
  white-space: nowrap;

  &.coins {
    background: rgba(240, 192, 64, 0.15);
    .resource-value { color: #8a6d1b; font-weight: 700; }
  }
  &.water {
    background: rgba(106, 176, 76, 0.1);
    .resource-value { color: #4a8a3a; }
  }
  &.level {
    background: rgba(106, 76, 176, 0.1);
    .resource-value { color: #5a3a9a; }
  }
  &.season {
    margin-left: auto;
  }
}

.resource-emoji {
  font-size: 14px;
}

.resource-value {
  font-weight: 600;
  font-size: $font-size-xs;
}

.season-emoji {
  font-size: 14px;
}

.season-text {
  font-size: $font-size-xs;
  color: $color-text-light;
}

.water-bar, .exp-bar {
  width: 40px;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.water-bar-fill {
  height: 100%;
  background: #4a8aff;
  border-radius: 2px;
  transition: width $transition-normal;
}

.exp-bar-fill {
  height: 100%;
  background: #9b59b6;
  border-radius: 2px;
  transition: width $transition-normal;
}
</style>
