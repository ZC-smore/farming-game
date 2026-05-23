<template>
  <Transition name="float-up">
    <div v-if="visible" class="toast" :class="type">
      <span class="toast-emoji">{{ typeEmoji }}</span>
      <span class="toast-text">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  message: string
  type?: 'success' | 'error' | 'info'
}>()

const typeEmoji = computed(() => {
  switch (props.type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'info': return 'ℹ️'
    default: return '✅'
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-md;
  background: $color-card;
  box-shadow: $shadow-card;
  font-size: $font-size-md;
  white-space: nowrap;
  animation: fadeIn 0.2s ease;

  &.success { border-left: 3px solid $color-primary; }
  &.error { border-left: 3px solid $color-danger; }
  &.info { border-left: 3px solid #4a8aff; }
}

.toast-emoji {
  font-size: 16px;
}

.toast-text {
  color: $color-text;
  font-weight: 500;
}

.float-up-enter-active {
  transition: all 0.3s ease;
}
.float-up-leave-active {
  transition: all 0.3s ease;
}
.float-up-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
.float-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>
