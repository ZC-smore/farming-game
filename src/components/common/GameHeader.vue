<template>
  <div class="game-hud">
    <div class="hud-top">
      <!-- 金币 -->
      <div class="hud-item hud-coins">
        <span class="hud-icon">🪙</span>
        <span class="hud-val">{{ game.coins }}</span>
      </div>
      <!-- 水 -->
      <div class="hud-item hud-water">
        <span class="hud-icon">💧</span>
        <span class="hud-val">{{ game.water }}/{{ game.maxWater }}</span>
        <div class="hud-bar">
          <div class="hud-bar-fill water-fill" :style="{ width: waterPercent + '%' }"></div>
        </div>
      </div>
      <!-- 等级 -->
      <div class="hud-item hud-level">
        <span class="hud-icon">⭐</span>
        <span class="hud-val">Lv.{{ game.level }}</span>
        <div class="hud-bar">
          <div class="hud-bar-fill exp-fill" :style="{ width: (game.expProgress * 100) + '%' }"></div>
        </div>
      </div>
      <!-- 季节 -->
      <div class="hud-item hud-season">
        <span class="hud-icon">{{ seasonEmoji }}</span>
        <span class="hud-val">{{ seasonName }} Day{{ seasonDay }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { getSeasonEmoji, getSeasonName } from '@/systems/season'

const game = useGameStore()

const waterPercent = computed(() => Math.round((game.water / game.maxWater) * 100))
const seasonEmoji = computed(() => getSeasonEmoji(game.currentSeasonInfo.season))
const seasonName = computed(() => getSeasonName(game.currentSeasonInfo.season))
const seasonDay = computed(() => game.currentSeasonInfo.dayInSeason)
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.game-hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  pointer-events: none;
  padding: $spacing-sm $spacing-md;
  padding-top: max(#{$spacing-sm}, env(safe-area-inset-top));
}

.hud-top {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  max-width: $max-content-width;
  margin: 0 auto;
}

.hud-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 20px;
  background: $color-hud-bg;
  backdrop-filter: blur(8px);
  pointer-events: auto;
  animation: dropBounce 0.4s ease backwards;

  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.05s; }
  &:nth-child(3) { animation-delay: 0.1s; }
  &:nth-child(4) { animation-delay: 0.15s; }
}

.hud-icon {
  font-size: 14px;
  line-height: 1;
}

.hud-val {
  font-size: $font-size-xs;
  font-weight: 700;
  color: $color-hud-text;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.hud-bar {
  width: 36px;
  height: 5px;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  overflow: hidden;
}

.hud-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width $transition-normal;
}

.water-fill {
  background: linear-gradient(90deg, #4a8aff, #7bc0ff);
}

.exp-fill {
  background: linear-gradient(90deg, #9b59b6, #c88ef5);
}

.hud-season {
  margin-left: auto;
  .hud-val {
    font-size: 10px;
    opacity: 0.85;
  }
}
</style>
