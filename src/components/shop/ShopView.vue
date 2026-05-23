<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="shop-overlay" @click.self="$emit('close')">
        <div class="shop-panel">
          <div class="sp-header">
            <h3>🏪 商店</h3>
            <span class="sp-coins">🪙{{ game.coins }}</span>
            <button class="sp-close" @click="$emit('close')">✕</button>
          </div>

          <!-- Tabs -->
          <div class="sp-tabs">
            <button v-for="t in tabs" :key="t.key" class="sp-tab" :class="{ active: tab === t.key }" @click="tab = t.key">
              {{ t.label }}
            </button>
          </div>

          <!-- 种子 Tab -->
          <div v-if="tab === 'seed'" class="sp-body">
            <div class="sp-grid">
              <button v-for="c in seedItems" :key="c.id" class="sp-item" :class="{ locked: c.locked }" :disabled="c.locked || game.coins < c.price" @click="buy(c)">
                <span class="sp-emoji">{{ c.emoji }}</span>
                <span class="sp-name">{{ c.name }}</span>
                <span v-if="c.locked" class="sp-lock">Lv.{{ c.unlockLevel }}</span>
                <span v-else class="sp-price">💰{{ c.price }}</span>
              </button>
            </div>
          </div>

          <!-- 花种 Tab -->
          <div v-if="tab === 'flower'" class="sp-body">
            <div class="sp-grid">
              <button v-for="f in flowerItems" :key="f.id" class="sp-item" :class="{ locked: f.locked }" :disabled="f.locked || game.coins < f.price" @click="buy(f)">
                <span class="sp-emoji">{{ f.emoji }}</span>
                <span class="sp-name">{{ f.name }}</span>
                <span v-if="f.locked" class="sp-lock">Lv.{{ f.unlockLevel }}</span>
                <span v-else class="sp-price">💰{{ f.price }}</span>
              </button>
            </div>
          </div>

          <!-- 动物 Tab -->
          <div v-if="tab === 'animal'" class="sp-body">
            <div class="sp-grid">
              <button v-for="a in animalItems" :key="a.id" class="sp-item" :class="{ locked: a.locked }" :disabled="a.locked || game.coins < a.price" @click="buyAnimal(a)">
                <span class="sp-emoji">{{ a.emoji }}</span>
                <span class="sp-name">{{ a.name }}</span>
                <span v-if="a.locked" class="sp-lock">Lv.{{ a.unlockLevel }}</span>
                <span v-else class="sp-price">💰{{ a.price }}</span>
              </button>
            </div>
          </div>

          <!-- 工具 Tab -->
          <div v-if="tab === 'tool'" class="sp-body">
            <div class="sp-grid">
              <button class="sp-item" :disabled="!bucketNext" @click="upgradeBucket">
                <span class="sp-emoji">🪣</span>
                <span class="sp-name">水桶 Lv.{{ game.waterBucketLevel }}</span>
                <span v-if="bucketNext" class="sp-price">💰{{ bucketNext.price }}</span>
                <span v-else class="sp-price">已满级</span>
              </button>
              <button class="sp-item" :disabled="!whNext" @click="upgradeWarehouse">
                <span class="sp-emoji">📦</span>
                <span class="sp-name">仓库 Lv.{{ game.warehouseLevel }}</span>
                <span v-if="whNext" class="sp-price">💰{{ whNext.price }}</span>
                <span v-else class="sp-price">已满级</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useGameStore } from '@/stores/game'
import { CROP_CONFIGS, ANIMAL_CONFIGS, FLOWER_CONFIGS } from '@/configs'
import { WATER_BUCKET_UPGRADES, WAREHOUSE_UPGRADE_PRICES } from '@/configs/economy'

defineProps<{ visible: boolean }>()
defineEmits<{ close: [] }>()

const game = useGameStore()
const toast = inject<(msg: string, type?: string) => void>('showToast', () => {})
const tab = ref('seed')
const tabs = [
  { key: 'seed', label: '🌱 种子' },
  { key: 'flower', label: '🌷 花种' },
  { key: 'animal', label: '🐄 动物' },
  { key: 'tool', label: '🔧 工具' },
]

const seedItems = computed(() =>
  Object.values(CROP_CONFIGS).map(c => ({
    id: c.id, name: c.name, emoji: c.emoji, price: c.seedPrice,
    unlockLevel: c.unlockLevel, locked: game.level < c.unlockLevel,
  }))
)
const flowerItems = computed(() =>
  Object.values(FLOWER_CONFIGS).map(f => ({
    id: f.id, name: f.name, emoji: f.emoji, price: f.seedPrice,
    unlockLevel: f.unlockLevel, locked: game.level < f.unlockLevel,
  }))
)
const animalItems = computed(() =>
  Object.values(ANIMAL_CONFIGS).map(a => ({
    id: a.id, name: a.name, emoji: a.emoji, price: a.buyPrice,
    unlockLevel: a.unlockLevel, locked: game.level < a.unlockLevel,
  }))
)

const bucketNext = computed(() => WATER_BUCKET_UPGRADES.find(u => u.level === game.waterBucketLevel + 1))
const whNext = computed(() => WAREHOUSE_UPGRADE_PRICES.find(u => u.level === game.warehouseLevel + 1))

function buy(c: any) { toast(`去对应区域使用${c.name}吧！`.replace(/.{15}/, ''), 'info') }
function buyAnimal(a: any) {
  const idx = game.ranchSlots.findIndex((s: any) => !s.animalId)
  if (idx === -1) { toast('没有空栏位！点击🔒扩建', 'error'); return }
  game.buyAnimal(idx, a.id)
  toast('动物购入！', 'success')
}
function upgradeBucket() { game.upgradeWaterBucket() }
function upgradeWarehouse() { game.upgradeWarehouse() }
</script>

<style lang="scss" scoped>
.shop-overlay {
  position: fixed; inset: 0; z-index: 800;
  background: rgba(0,0,0,.4); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
}
.shop-panel {
  width: 320px; max-height: 75vh;
  background: linear-gradient(180deg, #fff8e8, #f0e4c8);
  border: 3px solid #a07840; border-radius: 16px;
  display: flex; flex-direction: column; overflow: hidden;
}
.sp-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-bottom: 2px solid rgba(160,120,64,.2);
  h3 { font-size: 15px; font-weight: 700; color: #4a3728; flex:1; margin:0; }
}
.sp-coins { font-size: 11px; font-weight: 700; color: #8a6d1b; background: rgba(160,120,64,.1); padding: 3px 10px; border-radius: 10px; }
.sp-close { width: 26px; height: 26px; border-radius: 50%; font-size: 13px; background: rgba(0,0,0,.08); border:none; cursor:pointer; }
.sp-tabs { display: flex; border-bottom: 1px solid rgba(160,120,64,.15); }
.sp-tab {
  flex:1; padding: 8px 4px; font-size: 11px; font-weight: 600;
  color: #8a7a68; background: none; border: none;
  border-bottom: 2px solid transparent; cursor: pointer;
  &.active { color: #4a3728; border-bottom-color: #a07840; }
}
.sp-body { flex:1; overflow-y: auto; padding: 10px 14px; }
.sp-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.sp-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 10px 6px; background: rgba(255,255,255,.5);
  border: 1.5px solid rgba(160,120,64,.2); border-radius: 10px;
  transition: all .12s; cursor: pointer;
  &:hover:not(:disabled) { background: #fff; border-color: #a07840; transform: scale(1.03); }
  &:active:not(:disabled) { transform: scale(.95); }
  &:disabled { opacity: .35; cursor: not-allowed; }
  &.locked { filter: grayscale(.6); }
}
.sp-emoji { font-size: 28px; }
.sp-name { font-size: 10px; font-weight: 600; color: #4a3728; text-align: center; }
.sp-price { font-size: 10px; font-weight: 700; color: #8a6d1b; }
.sp-lock { font-size: 9px; color: #c0392b; }

.modal-fade-enter-active,.modal-fade-leave-active { transition: opacity .2s; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity: 0; }
</style>
