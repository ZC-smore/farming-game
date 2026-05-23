<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(42, 31, 20, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
}

.modal-content {
  background: linear-gradient(180deg, #fff8e8 0%, #f5ecd4 100%);
  border: 3px solid $world-wood;
  border-radius: $radius-xl;
  width: 100%;
  max-width: 380px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255,255,255,0.5);
  animation: popIn 0.25s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2px solid rgba(139, 105, 20, 0.2);
  background: linear-gradient(180deg, rgba(196, 154, 44, 0.15) 0%, transparent 100%);

  h3 {
    font-size: $font-size-lg;
    color: $color-text-dark;
    font-weight: 700;
  }
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: $radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: $color-text-light;
  background: rgba(139, 105, 20, 0.12);

  &:hover {
    background: rgba(139, 105, 20, 0.25);
  }
}

.modal-body {
  padding: $spacing-lg;
  overflow-y: auto;
}
</style>
