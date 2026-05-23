// ============================================
// 花卉状态机
// SEED → GROWING → BLOOM → PICKED
// ============================================

export type FlowerState = 'SEED' | 'GROWING' | 'BLOOM' | 'PICKED'

export interface FlowerPotData {
  id: number
  flowerId: string | null
  state: FlowerState
  plantedAt: number | null
  lastWateredAt: number | null
  growthProgress: number
  bloomAt: number | null
}

export function createEmptyPot(id: number): FlowerPotData {
  return {
    id,
    flowerId: null,
    state: 'PICKED',
    plantedAt: null,
    lastWateredAt: null,
    growthProgress: 0,
    bloomAt: null,
  }
}

export function plantFlower(pot: FlowerPotData, flowerId: string, growTimeSeconds: number): FlowerPotData {
  const now = Date.now()
  return {
    ...pot,
    flowerId,
    state: 'SEED',
    plantedAt: now,
    lastWateredAt: null,
    growthProgress: 0,
    bloomAt: now + growTimeSeconds * 1000,
  }
}

export function waterFlower(pot: FlowerPotData): FlowerPotData {
  if (pot.state !== 'SEED' && pot.state !== 'GROWING') return pot
  return {
    ...pot,
    state: 'GROWING',
    lastWateredAt: Date.now(),
  }
}

export function updateFlowerGrowth(pot: FlowerPotData): FlowerPotData {
  if (pot.state === 'SEED' || pot.state === 'GROWING') {
    if (!pot.bloomAt || !pot.plantedAt) return pot
    const now = Date.now()
    const totalTime = pot.bloomAt - pot.plantedAt
    const elapsed = now - pot.plantedAt
    const progress = Math.min(1, Math.max(0, elapsed / totalTime))

    if (progress >= 1) {
      return { ...pot, state: 'BLOOM', growthProgress: 1 }
    }
    return { ...pot, state: progress > 0 ? 'GROWING' : pot.state, growthProgress: progress }
  }
  return pot
}

export function pickFlower(pot: FlowerPotData): FlowerPotData {
  if (pot.state !== 'BLOOM') return pot
  return createEmptyPot(pot.id)
}
