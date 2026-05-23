<template>
  <div class="region-nav">
    <button
      v-for="r in regions"
      :key="r.key"
      class="rn-btn"
      @click="$emit('zoom', r.key)"
    >{{ r.icon }}</button>
    <button class="rn-btn rn-reset" @click="$emit('reset')">🔍</button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ zoom: [key: string]; reset: [] }>()
const regions = [
  { key: 'farm', icon: '🌾' },
  { key: 'ranch', icon: '🐄' },
  { key: 'garden', icon: '🌷' },
  { key: 'workshop', icon: '🔨' },
]
</script>

<style lang="scss" scoped>
.region-nav {
  position: fixed; top: 80px; left: 6px; z-index: 300;
  display: flex; flex-direction: column; gap: 4px;
}
.rn-btn {
  width: 40px; height: 40px; border-radius: 10px; font-size: 18px;
  background: rgba(0,0,0,.45); border: 1px solid rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; backdrop-filter: blur(6px);
  &:hover { transform: scale(1.1); background: rgba(0,0,0,.6); }
  &:active { transform: scale(.9); }
}
.rn-reset { font-size: 13px; margin-top: 4px; background: rgba(0,0,0,.3); }
</style>
