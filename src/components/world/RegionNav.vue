<template>
  <div class="region-nav">
    <button
      v-for="item in regions"
      :key="item.key"
      class="rn-btn"
      @click="$emit('navigate', item.key)"
    >
      <span class="rn-icon">{{ item.icon }}</span>
      <span class="rn-label">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ navigate: [key: string] }>()

const regions = [
  { key: 'farm', icon: '🌾', label: '农田' },
  { key: 'ranch', icon: '🐄', label: '牧场' },
  { key: 'garden', icon: '🌷', label: '花园' },
  { key: 'workshop', icon: '🔨', label: '工坊' },
  { key: 'house', icon: '🏠', label: '家园' },
]
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as v;

.region-nav {
  position: fixed;
  top: 80px;
  left: 6px;
  z-index: 300;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rn-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 5px 5px;
  width: 44px;
  background: linear-gradient(180deg, rgba(196,154,44,0.85) 0%, rgba(160,120,32,0.9) 50%, rgba(120,90,20,0.9) 100%);
  border: 1.5px solid rgba(240,192,64,0.5);
  border-radius: 10px;
  box-shadow: 0 3px 0 rgba(74,53,8,0.5), 0 4px 8px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 2px; left: 4px; right: 4px; height: 3px;
    background: rgba(255,255,255,0.18);
    border-radius: 0 0 4px 4px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(74,53,8,0.5), 0 7px 12px rgba(0,0,0,0.35);
    border-color: rgba(240,192,64,0.8);
  }

  &:active {
    transform: translateY(1px) scale(0.95);
    box-shadow: 0 2px 0 rgba(74,53,8,0.5), 0 3px 6px rgba(0,0,0,0.3);
    background: linear-gradient(180deg, rgba(160,120,32,0.9) 0%, rgba(120,90,20,0.95) 50%, rgba(100,70,16,0.95) 100%);
  }
}

.rn-icon { font-size: 16px; line-height: 1; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3)); }
.rn-label {
  font-size: 7px;
  font-weight: 700;
  color: rgba(255,248,224,0.9);
  text-shadow: 0 1px 1px rgba(0,0,0,0.4);
  letter-spacing: 0.3px;
}
</style>
