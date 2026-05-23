<template>
  <div class="game-app">
    <GameHeader />
    <main class="game-main">
      <WorldMap ref="worldRef" />
    </main>

    <!-- 弹出面板 -->
    <ShopView :visible="showShop" @close="showShop = false" />
    <InventoryView :visible="showInventory" @close="showInventory = false" />

    <!-- 轻提示 -->
    <GameToast :visible="toastVisible" :message="toastMessage" :type="toastType" />

    <!-- 新手引导 -->
    <GameModal v-if="showTutorial" :visible="showTutorial" title="👋 欢迎来到农场" @close="closeTutorial">
      <div class="tutorial-content">
        <p v-if="tutorialStep === 1">🌱 拖动屏幕探索你的农场世界！</p>
        <p v-else-if="tutorialStep === 2">🌾 点击<strong>空地</strong>种作物；作物成熟后点击<strong>收获</strong>。</p>
        <p v-else-if="tutorialStep === 3">💧 缺水时地块会变黄并显示💧——点击即可浇水。</p>
        <p v-else-if="tutorialStep === 4">🔒 点击<strong>锁住的地块</strong>可以扩建。等级或金币不足会提示。</p>
        <p v-else>🏪 右上🛒打开商店 🐄牧场养动物 🌷花园种花 🔨工坊加工</p>
        <div class="tutorial-actions">
          <button v-if="tutorialStep < 5" class="tutorial-next-btn" @click="nextTutorial">下一步</button>
          <button v-else class="tutorial-next-btn" @click="closeTutorial">开始冒险！</button>
        </div>
      </div>
    </GameModal>

    <!-- 快捷按钮: 商店/仓库 -->
    <div class="quick-btns">
      <button class="qb" @click="showShop = true">🛒</button>
      <button class="qb" @click="showInventory = true">📦</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useGameStore } from '@/stores/game'
import GameHeader from '@/components/common/GameHeader.vue'
import GameToast from '@/components/common/GameToast.vue'
import GameModal from '@/components/common/GameModal.vue'
import WorldMap from '@/components/world/WorldMap.vue'
import ShopView from '@/components/shop/ShopView.vue'
import InventoryView from '@/components/inventory/InventoryView.vue'

const game = useGameStore()
const worldRef = ref<InstanceType<typeof WorldMap>>()

// Toast
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')
provide('showToast', (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastMessage.value = msg; toastType.value = type; toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 1800)
})

// 弹出
const showShop = ref(false)
const showInventory = ref(false)

// Tutorial
const showTutorial = ref(false)
const tutorialStep = ref(1)
function nextTutorial() { tutorialStep.value++ }
function closeTutorial() { showTutorial.value = false; game.tutorialCompleted = true; game.tutorialStep = 6 }

// Loop
let gameLoop: ReturnType<typeof setInterval> | null = null
let autoSave: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  if (!game.load()) { showTutorial.value = true; tutorialStep.value = 1 }
  gameLoop = setInterval(() => game.updateAllStates(), 1000)
  autoSave = setInterval(() => game.save(), 30000)
})
onUnmounted(() => { if (gameLoop) clearInterval(gameLoop); if (autoSave) clearInterval(autoSave); game.save() })
</script>

<style lang="scss">
.game-app { width: 100%; height: 100%; display: flex; flex-direction: column; position: relative; overflow: hidden; }
.game-main { flex: 1; position: relative; overflow: hidden; }

.quick-btns { position: fixed; top: 80px; right: 8px; z-index: 300; display: flex; flex-direction: column; gap: 4px; }
.qb { width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.2); font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(6px); transition: all 0.15s; }
.qb:hover { transform: scale(1.1); background: rgba(0,0,0,0.6); }
.qb:active { transform: scale(0.9); }

.tutorial-content p { font-size: 14px; line-height: 1.6; color: #4a3728; margin-bottom: 12px; }
.tutorial-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
.tutorial-next-btn { padding: 8px 24px; background: linear-gradient(180deg, #c49a2c, #8b6914); border: 2px solid #5c4510; color: #fff8e0; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 3px 0 #4a3508; text-shadow: 0 1px 2px rgba(0,0,0,.3); transition: all .15s; cursor: pointer; }
.tutorial-next-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 #4a3508; }
</style>
