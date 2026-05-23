// ============================================
// 动物状态机
// HUNGRY → FEEDING → PRODUCING → READY
// ============================================

export type AnimalState = 'HUNGRY' | 'FEEDING' | 'PRODUCING' | 'READY'

export interface AnimalSlotData {
  id: number
  animalId: string | null
  state: AnimalState
  lastFedAt: number | null
  produceReadyAt: number | null
}

export function createEmptySlot(id: number): AnimalSlotData {
  return {
    id,
    animalId: null,
    state: 'HUNGRY',
    lastFedAt: null,
    produceReadyAt: null,
  }
}

export function buyAnimal(slot: AnimalSlotData, animalId: string): AnimalSlotData {
  return {
    ...slot,
    animalId,
    state: 'HUNGRY',
    lastFedAt: null,
    produceReadyAt: null,
  }
}

export function feedAnimal(slot: AnimalSlotData, produceTimeSeconds: number): AnimalSlotData {
  if (slot.state !== 'HUNGRY') return slot
  const now = Date.now()
  return {
    ...slot,
    state: 'PRODUCING',
    lastFedAt: now,
    produceReadyAt: now + produceTimeSeconds * 1000,
  }
}

export function updateAnimalState(slot: AnimalSlotData): AnimalSlotData {
  if (slot.state === 'PRODUCING' && slot.produceReadyAt) {
    if (Date.now() >= slot.produceReadyAt) {
      return {
        ...slot,
        state: 'READY',
      }
    }
  }
  return slot
}

export function collectProduct(slot: AnimalSlotData): AnimalSlotData {
  if (slot.state !== 'READY') return slot
  return {
    ...slot,
    state: 'HUNGRY',
    lastFedAt: null,
    produceReadyAt: null,
  }
}
