<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="inv-overlay" @click.self="$emit('close')">
        <div class="inv-panel">
          <div class="inv-header">
            <h3>📦 仓库</h3>
            <span class="inv-count">{{ totalCount }}/{{ game.inventory.capacity }}</span>
            <button class="inv-close" @click="$emit('close')">✕</button>
          </div>

          <!-- 筛选 -->
          <div class="inv-tabs">
            <button v-for="t in filterTabs" :key="t.key" class="inv-tab" :class="{ active: filter === t.key }" @click="filter = t.key">{{ t.label }}</button>
          </div>

          <!-- 物品网格 -->
          <div class="inv-body">
            <div v-if="filteredItems.length === 0" class="inv-empty">暂无物品</div>
            <div v-else class="inv-grid">
              <button
                v-for="item in filteredItems"
                :key="item.id"
                class="inv-item"
                :class="{ selected: selected.has(item.id) }"
                @click="toggle(item.id)"
              >
                <div class="inv-check" :class="{ on: selected.has(item.id) }">{{ selected.has(item.id) ? '✓' : '' }}</div>
                <span class="inv-emoji">{{ item.emoji }}</span>
                <span class="inv-name">{{ item.name }}</span>
                <span class="inv-qty">×{{ item.count }}</span>
              </button>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="inv-footer" v-if="filteredItems.length > 0">
            <button
              class="inv-select-all"
              @click="toggleAll"
            >{{ allSelected ? '取消全选' : '全选' }}</button>
            <button
              class="inv-sell"
              :class="{ active: selected.size > 0 }"
              :disabled="selected.size === 0"
              @click="sellSelected"
            >卖出 {{ selected.size }} 件 (💰{{ sellTotal }})</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'

defineProps<{ visible: boolean }>()
defineEmits<{ close: [] }>()

const game = useGameStore()
const toast = inject<(msg: string, type?: string) => void>('showToast', () => {})

const filter = ref('all')
const selected = ref(new Set<string>())

const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'crop', label: '🌾 作物' },
  { key: 'animal_product', label: '🥚 畜产' },
  { key: 'flower', label: '💐 花卉' },
  { key: 'processed', label: '🔧 加工品' },
]

const allItems = computed(() => {
  if (!game.inventory?.items) return []
  return Object.entries(game.inventory.items).map(([id, item]: [string, any]) => ({
    id, name: item.name, emoji: item.emoji, type: item.type,
    count: item.count, price: item.sellPrice,
  }))
})

const totalCount = computed(() => allItems.value.reduce((s: number, i: any) => s + i.count, 0))

const filteredItems = computed(() => {
  if (filter.value === 'all') return allItems.value
  return allItems.value.filter((i: any) => i.type === filter.value)
})

const allSelected = computed(() =>
  filteredItems.value.length > 0 && filteredItems.value.every((i: any) => selected.value.has(i.id))
)

const sellTotal = computed(() =>
  filteredItems.value.reduce((s: number, i: any) => selected.value.has(i.id) ? s + i.price * i.count : s, 0)
)

function toggle(id: string) {
  const s = new Set(selected.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selected.value = s
}

function toggleAll() {
  if (allSelected.value) { selected.value = new Set() }
  else { selected.value = new Set(filteredItems.value.map((i: any) => i.id)) }
}

function sellSelected() {
  let c = 0
  for (const id of selected.value) {
    const item = allItems.value.find((i: any) => i.id === id)
    if (item) { game.sellAllOfType(id); c++ }
  }
  selected.value = new Set()
  toast(`卖出 ${c} 种物品 💰`, 'success')
}
</script>

<style lang="scss" scoped>
.inv-overlay {
  position: fixed; inset: 0; z-index: 800;
  background: rgba(0,0,0,.4); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
}
.inv-panel {
  width: 320px; max-height: 75vh;
  background: linear-gradient(180deg, #fff8e8, #f0e4c8);
  border: 3px solid #a07840; border-radius: 16px;
  display: flex; flex-direction: column; overflow: hidden;
}
.inv-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-bottom: 2px solid rgba(160,120,64,.2);
  h3 { font-size: 15px; font-weight: 700; color: #4a3728; flex:1; margin:0; }
}
.inv-count { font-size: 11px; font-weight: 700; color: #8a6d1b; background: rgba(160,120,64,.1); padding: 3px 10px; border-radius: 10px; }
.inv-close { width: 26px; height: 26px; border-radius: 50%; font-size: 13px; background: rgba(0,0,0,.08); border:none; cursor:pointer; }
.inv-tabs { display: flex; border-bottom: 1px solid rgba(160,120,64,.15); overflow-x: auto; }
.inv-tab {
  padding: 6px 10px; font-size: 10px; font-weight: 600; white-space: nowrap;
  color: #8a7a68; background: none; border: none;
  border-bottom: 2px solid transparent; cursor: pointer;
  &.active { color: #4a3728; border-bottom-color: #a07840; }
}
.inv-body { flex:1; overflow-y: auto; padding: 10px 14px; }
.inv-empty { text-align: center; color: #8a7a68; font-size: 13px; padding: 32px 0; }
.inv-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.inv-item {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 10px 6px 8px; background: rgba(255,255,255,.5);
  border: 2px solid rgba(160,120,64,.2); border-radius: 10px;
  cursor: pointer; transition: all .12s;
  &:active { transform: scale(.95); }
  &.selected { background: rgba(240,192,64,.25); border-color: #d4a640; }
}
.inv-check {
  position: absolute; top: 4px; right: 4px;
  width: 18px; height: 18px; border-radius: 4px;
  border: 2px solid rgba(160,120,64,.3); background: rgba(255,255,255,.6);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #4a3728;
  &.on { background: #f0c040; border-color: #c49a2c; }
}
.inv-emoji { font-size: 26px; }
.inv-name { font-size: 10px; font-weight: 600; color: #4a3728; text-align: center; }
.inv-qty { font-size: 10px; font-weight: 700; color: #8a6d1b; }
.inv-footer {
  display: flex; gap: 8px; padding: 10px 14px;
  border-top: 2px solid rgba(160,120,64,.2);
}
.inv-select-all {
  padding: 8px 14px; font-size: 12px; font-weight: 600;
  background: rgba(0,0,0,.06); border: none; border-radius: 8px; color: #6a5a48; cursor: pointer;
}
.inv-sell {
  flex:1; padding: 8px 14px; font-size: 12px; font-weight: 700;
  background: rgba(0,0,0,.06); border: none; border-radius: 8px; color: #6a5a48; cursor: pointer;
  transition: all .15s;
  &.active { background: #c49a2c; color: #fff; }
  &:disabled { opacity: .4; cursor: not-allowed; }
}

.modal-fade-enter-active,.modal-fade-leave-active { transition: opacity .2s; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity: 0; }
</style>
