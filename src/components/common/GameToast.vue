<template>
  <div class="toast-container">
    <Transition name="slide-up">
      <div v-if="visible" class="toast" :class="type">
        <span class="toast-icon">{{ typeIcon }}</span>
        <span class="toast-msg">{{ message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  visible: boolean
  message: string
  type?: 'success' | 'error' | 'info'
}>(), {
  type: 'success'
})

const typeIcon = computed(() => {
  switch (props.type) {
    case 'success': return '✨'
    case 'error': return '❌'
    case 'info': return '💡'
    default: return '✨'
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.toast-container {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  border-radius: 24px;
  background: $color-hud-bg;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  white-space: nowrap;

  &.success {
    border: 1px solid rgba(106, 176, 76, 0.4);
  }
  &.error {
    border: 1px solid rgba(231, 76, 60, 0.4);
  }
  &.info {
    border: 1px solid rgba(91, 184, 245, 0.4);
  }
}

.toast-icon {
  font-size: 16px;
}

.toast-msg {
  font-size: $font-size-sm;
  color: $color-hud-text;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
</style>
