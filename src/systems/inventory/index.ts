// ============================================
// 背包系统
// ============================================

export interface InventoryItem {
  id: string
  name: string
  emoji: string
  count: number
  type: 'crop' | 'animal_product' | 'flower' | 'feed' | 'fertilizer' | 'processed'
  sellPrice: number
}

export interface InventoryState {
  items: Record<string, InventoryItem>
  capacity: number
  usedCapacity: number
}

export function createEmptyInventory(capacity: number): InventoryState {
  return { items: {}, capacity, usedCapacity: 0 }
}

export function addItem(
  inventory: InventoryState,
  id: string,
  name: string,
  emoji: string,
  type: InventoryItem['type'],
  count: number,
  sellPrice: number
): InventoryState {
  const existing = inventory.items[id]
  const newCount = (existing?.count ?? 0) + count

  if (newCount > inventory.capacity - inventory.usedCapacity + (existing?.count ?? 0)) {
    return inventory // 容量不足
  }

  const newItems = {
    ...inventory.items,
    [id]: {
      id,
      name,
      emoji,
      count: newCount,
      type,
      sellPrice,
    },
  }

  // 重新计算已用容量
  const usedCapacity = Object.values(newItems).reduce((sum, item) => sum + item.count, 0)

  return { ...inventory, items: newItems, usedCapacity }
}

export function removeItem(inventory: InventoryState, id: string, count: number): InventoryState {
  const existing = inventory.items[id]
  if (!existing || existing.count < count) return inventory

  const newCount = existing.count - count
  const newItems = { ...inventory.items }

  if (newCount <= 0) {
    delete newItems[id]
  } else {
    newItems[id] = { ...existing, count: newCount }
  }

  const usedCapacity = Object.values(newItems).reduce((sum, item) => sum + item.count, 0)

  return { ...inventory, items: newItems, usedCapacity }
}

export function hasItem(inventory: InventoryState, id: string, count: number): boolean {
  return (inventory.items[id]?.count ?? 0) >= count
}

export function getItemCount(inventory: InventoryState, id: string): number {
  return inventory.items[id]?.count ?? 0
}
