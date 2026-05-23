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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
}

.modal-content {
  background: $color-card;
  border-radius: $radius-lg;
  width: 100%;
  max-width: 380px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: popIn 0.25s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $color-border;

  h3 {
    font-size: $font-size-lg;
    color: $color-text;
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
  background: rgba(0, 0, 0, 0.05);

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.modal-body {
  padding: $spacing-lg;
  overflow-y: auto;
}
</style>
