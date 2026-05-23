<template>
  <div class="ranch-view">
    <div class="section-header">
      <h2>🐄 我的牧场</h2>
      <div class="sub-info">
        <span>🦆 {{ animalCount }}只动物</span>
        <span>🌾 饲料: {{ game.feedStock }}</span>
      </div>
    </div>

    <div class="slots-grid">
      <div
        v-for="slot in game.ranchSlots"
        :key="slot.id"
        class="slot-card"
        :class="'state-' + slot.state.toLowerCase()"
        @click="handleSlotClick(slot)"
      >
        <template v-if="!slot.animalId">
          <div class="slot-emoji">👻</div>
          <div class="slot-label">空栏位</div>
        </template>
        <template v-else>
          <div class="slot-emoji">{{ getAnimalConfig(slot)?.emoji }}</div>
          <div class="slot-label">{{ getAnimalConfig(slot)?.name }}</div>
          <div class="slot-status">{{ getStatusLabel(slot) }}</div>
          <div v-if="slot.state === 'READY'" class="ready-badge">🉑 收获</div>
        </template>
      </div>
    </div>

    <button v-if="canExpand" class="expand-btn" @click="handleExpand">
      🏗️ 扩建牧场 (🪙{{ expandPrice }})
    </button>

    <GameModal :visible="showBuyModal" title="🐄 购买动物" @close="showBuyModal = false">
      <div class="animal-list">
        <button
          v-for="animal in availableAnimals"
          :key="animal.id"
          class="animal-item"
          :class="{ disabled: game.coins < animal.buyPrice }"
          @click="handleBuy(animal.id)"
        >
          <span class="animal-emoji">{{ animal.emoji }}</span>
          <div class="animal-info">
            <span class="animal-name">{{ animal.name }}</span>
            <span class="animal-detail">🍖{{ animal.feedCost }} ⏱{{ formatTime(animal.produceTimeSeconds) }}</span>
          </div>
          <span class="animal-price">🪙{{ animal.buyPrice }}</span>
        </button>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'
import { ANIMAL_CONFIGS } from '@/configs'
import type { AnimalId, AnimalConfig } from '@/configs/animals'
import { RANCH_SLOT_PRICES } from '@/configs/economy'
import type { AnimalSlotData } from '@/systems/animal/state'
import GameModal from '@/components/common/GameModal.vue'
import { formatTime } from '@/utils'

const game = useGameStore()
const showBuyModal = ref(false)
const selectedSlotIndex = ref(-1)

const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast', () => {})

const animalCount = computed(() => game.ranchSlots.filter(s => s.animalId).length)

const availableAnimals = computed(() =>
  Object.values(ANIMAL_CONFIGS).filter(a => a.unlockLevel <= game.level)
)

const canExpand = computed(() => {
  const nextPrice = RANCH_SLOT_PRICES.find(p => p.slotIndex === game.ranchSlots.length)
  return !!nextPrice
})

const expandPrice = computed(() => {
  const nextPrice = RANCH_SLOT_PRICES.find(p => p.slotIndex === game.ranchSlots.length)
  return nextPrice?.price ?? 0
})

function getAnimalConfig(slot: AnimalSlotData): AnimalConfig | null {
  if (!slot.animalId) return null
  return ANIMAL_CONFIGS[slot.animalId as AnimalId] ?? null
}

function getStatusLabel(slot: AnimalSlotData): string {
  switch (slot.state) {
    case 'HUNGRY': return '饿了，快喂食！'
    case 'FEEDING': return '吃食物中...'
    case 'PRODUCING': return '生产中...'
    case 'READY': return '可以收获了！'
    default: return ''
  }
}

function handleSlotClick(slot: AnimalSlotData) {
  if (!slot.animalId) {
    selectedSlotIndex.value = slot.id
    showBuyModal.value = true
  } else if (slot.state === 'HUNGRY') {
    if (game.feedAnimalSlot(slot.id)) {
      showToast('喂食成功！', 'success')
    } else {
      showToast('饲料不足！', 'error')
    }
  } else if (slot.state === 'READY') {
    game.collectAnimalProduct(slot.id)
    showToast('收获成功！', 'success')
  }
}

function handleBuy(animalId: AnimalId) {
  if (selectedSlotIndex.value < 0) return
  const success = game.buyAnimal(selectedSlotIndex.value, animalId)
  if (success) {
    showBuyModal.value = false
    showToast('购买成功！', 'success')
  } else {
    showToast('金币不足', 'error')
  }
}

function handleExpand() {
  const success = game.buyRanchSlot()
  if (success) {
    showToast('牧场扩建成功！', 'success')
  } else {
    showToast('金币不足', 'error')
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.ranch-view { padding: $spacing-md; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
  h2 { font-size: $font-size-xl; }
}

.sub-info {
  display: flex;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-text-light;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.slot-card {
  background: $color-card;
  border-radius: $radius-md;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  box-shadow: $shadow-soft;
  transition: all $transition-fast;
  cursor: pointer;
  min-height: 120px;

  &:active { transform: scale(0.97); }

  &.state-hungry {
    border: 2px solid rgba(#ff9800, 0.4);
    background: rgba(#ff9800, 0.05);
  }
  &.state-ready {
    border: 2px solid rgba($color-primary, 0.4);
    background: rgba($color-primary, 0.08);
  }
}

.slot-emoji { font-size: 36px; }
.slot-label { font-size: $font-size-md; font-weight: 600; }
.slot-status { font-size: $font-size-xs; color: $color-text-light; }

.ready-badge {
  font-size: $font-size-xs;
  font-weight: 700;
  color: $color-primary;
  animation: bounce 1s infinite;
}

.expand-btn {
  width: 100%;
  padding: $spacing-md;
  background: rgba($color-secondary, 0.15);
  border-radius: $radius-md;
  color: #8a6d1b;
  font-weight: 600;
  margin-bottom: $spacing-lg;
  transition: all $transition-fast;
  &:active { transform: scale(0.98); }
}

.animal-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.animal-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: rgba(0, 0, 0, 0.03);
  border-radius: $radius-sm;
  transition: all $transition-fast;
  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.5; }
}

.animal-emoji { font-size: 28px; }
.animal-info { flex: 1; display: flex; flex-direction: column; }
.animal-name { font-weight: 600; }
.animal-detail { font-size: $font-size-xs; color: $color-text-light; }
.animal-price { font-weight: 700; color: #8a6d1b; }
</style>
