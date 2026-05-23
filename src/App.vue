<template>
  <div class="game-app">
    <GameHeader />

    <main class="game-main">
      <WorldMap ref="worldRef" />
    </main>

    <!-- 左侧区域导航 -->
    <RegionNav @navigate="onNavigate" />

    <!-- 底部工具条 -->
    <ToolBelt ref="toolRef" />

    <!-- 弹出面板 -->
    <ShopView :visible="showShop" @close="showShop = false" />
    <InventoryView :visible="showInventory" @close="showInventory = false" />

    <GameToast :visible="toastVisible" :message="toastMessage" :type="toastType" />

    <!-- 新手引导 -->
    <GameModal
      v-if="showTutorial"
      :visible="showTutorial"
      title="👋 欢迎来到农场"
      @close="closeTutorial"
    >
      <div class="tutorial-content">
        <p v-if="tutorialStep === 1">🌱 欢迎来到你的农场世界！<strong>拖动屏幕</strong>可以探索整个地图。</p>
        <p v-else-if="tutorialStep === 2">🌾 点击<strong>空地</strong>种上种子——作物真的会在地里长大！缺水时会有💧提示。</p>
        <p v-else-if="tutorialStep === 3">💧 左侧<strong>区域导航</strong>可以快速跳转到不同区域。试试点击看看！</p>
        <p v-else-if="tutorialStep === 4">🔧 底部<strong>工具条</strong>可以切换工具。中间的大按钮会根据当前状态自动推荐操作！</p>
        <p v-else-if="tutorialStep === 5">🗺️ 地图上还有很多<strong>锁定区域</strong>——它们已经存在，升级后会自动解锁！</p>
        <div class="tutorial-actions">
          <button v-if="tutorialStep < 5" class="tutorial-next-btn" @click="nextTutorial">下一步</button>
          <button v-else class="tutorial-next-btn" @click="closeTutorial">开始冒险！</button>
        </div>
      </div>
    </GameModal>

    <!-- 快捷入口：商店/仓库 -->
    <div class="quick-actions">
      <button class="qa-btn" @click="showShop = true">🏪</button>
      <button class="qa-btn" @click="showInventory = true">📦</button>
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
import RegionNav from '@/components/world/RegionNav.vue'
import ToolBelt from '@/components/world/ToolBelt.vue'
import ShopView from '@/components/shop/ShopView.vue'
import InventoryView from '@/components/inventory/InventoryView.vue'

const game = useGameStore()

const worldRef = ref<InstanceType<typeof WorldMap>>()
const toolRef = ref<InstanceType<typeof ToolBelt>>()

const showTutorial = ref(false)
const tutorialStep = ref(1)

// Toast
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')

provide('showToast', (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 1800)
})

const showShop = ref(false)
const showInventory = ref(false)

function onNavigate(zone: string) {
  worldRef.value?.panTo(zone)
}

function nextTutorial() {
  tutorialStep.value++
}

function closeTutorial() {
  showTutorial.value = false
  game.tutorialCompleted = true
  game.tutorialStep = 6
}

// 游戏循环
let gameLoop: ReturnType<typeof setInterval> | null = null
let autoSaveTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const loaded = game.load()
  if (!loaded) {
    showTutorial.value = true
    tutorialStep.value = 1
  }

  gameLoop = setInterval(() => game.updateAllStates(), 1000)
  autoSaveTimer = setInterval(() => game.save(), 30000)
})

onUnmounted(() => {
  if (gameLoop) clearInterval(gameLoop)
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  game.save()
})
</script>

<style lang="scss">
@use '@/styles/variables' as v;

.game-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.game-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

// 快捷入口
.quick-actions {
  position: fixed;
  right: 6px;
  top: 90px;
  z-index: 300;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qa-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(196,154,44,0.8) 0%, rgba(139,105,20,0.85) 100%);
  border: 1.5px solid rgba(240,192,64,0.45);
  box-shadow: 0 3px 0 rgba(74,53,8,0.4), 0 4px 8px rgba(0,0,0,0.3);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { transform: translateY(-2px); box-shadow: 0 5px 0 rgba(74,53,8,0.4), 0 6px 12px rgba(0,0,0,0.35); }
  &:active { transform: translateY(1px) scale(0.92); box-shadow: 0 2px 0 rgba(74,53,8,0.4), 0 2px 4px rgba(0,0,0,0.3); }
}

// 新手引导
.tutorial-content {
  p {
    font-size: v.$font-size-md;
    line-height: 1.6;
    color: v.$color-text-dark;
    margin-bottom: v.$spacing-md;
  }
}

.tutorial-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: v.$spacing-lg;
}

.tutorial-next-btn {
  padding: v.$spacing-sm v.$spacing-xl;
  background: v.$wood-bg;
  border: 2px solid v.$wood-border;
  color: v.$wood-text;
  border-radius: v.$radius-md;
  font-weight: 700;
  font-size: v.$font-size-md;
  box-shadow: v.$wood-shadow;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  transition: all v.$transition-fast;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #4a3508;
  }
}
</style>
