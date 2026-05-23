<template>
  <div class="area-lock">
    <div class="lock-overlay"></div>
    <div class="lock-content">
      <span class="lock-icon">🔒</span>
      <span class="lock-level">Lv.{{ requiredLevel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  requiredLevel: number
}>()
</script>

<style lang="scss" scoped>
.area-lock {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(60, 50, 40, 0.55);
  backdrop-filter: blur(2px);
}

.lock-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.lock-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
  animation: bounce 2s ease-in-out infinite;
}

.lock-level {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 248, 224, 0.85);
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  background: rgba(0,0,0,0.3);
  padding: 2px 8px;
  border-radius: 8px;
}
</style>
