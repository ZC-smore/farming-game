<template>
  <div class="game-app">
    <GameHeader />

    <main class="game-main">
      <FarmView v-if="currentTab === 'farm'" />
      <RanchView v-else-if="currentTab === 'ranch'" />
      <GardenView v-else-if="currentTab === 'garden'" />
      <WorkshopView v-else-if="currentTab === 'workshop'" />
      <ShopView v-else-if="currentTab === 'shop'" />
      <InventoryView v-else-if="currentTab === 'inventory'" />
    </main>

    <GameNav :current-tab="currentTab" @change="handleTabChange" />

    <GameToast :visible="toastVisible" :message="toastMessage" :type="toastType" />

    <!-- 新手引导 -->
    <GameModal
      v-if="showTutorial"
      :visible="showTutorial"
      title="👋 欢迎来到农场"
      @close="closeTutorial"
    >
      <div class="tutorial-content">
        <p v-if="tutorialStep === 1">🌱 欢迎继承这座小农场！让我教你基本的种植方法。</p>
        <p v-else-if="tutorialStep === 2">🌾 点击<strong>空地</strong>可以选择作物种子进行种植。种下后记得<strong>浇水</strong>哦！</p>
        <p v-else-if="tutorialStep === 3">💧 水是珍贵资源，用完会自动恢复。水不够时作物只是暂停生长，不会死亡。</p>
        <p v-else-if="tutorialStep === 4">🐄 等级3可以养动物，等级5可以种花。收菜卖钱升级扩建吧！</p>
        <p v-else-if="tutorialStep === 5">💰 作物可以加工成更值钱的商品。快去尝试吧！</p>
        <div class="tutorial-actions">
          <button v-if="tutorialStep < 5" class="tutorial-next-btn" @click="nextTutorial">下一步</button>
          <button v-else class="tutorial-next-btn" @click="closeTutorial">开始种田！</button>
        </div>
      </div>
    </GameModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useGameStore } from '@/stores/game'
import GameHeader from '@/components/common/GameHeader.vue'
import GameNav from '@/components/common/GameNav.vue'
import type { TabId } from '@/components/common/GameNav.vue'
import GameToast from '@/components/common/GameToast.vue'
import GameModal from '@/components/common/GameModal.vue'
import FarmView from '@/components/farm/FarmView.vue'
import RanchView from '@/components/ranch/RanchView.vue'
import GardenView from '@/components/garden/GardenView.vue'
import WorkshopView from '@/components/workshop/WorkshopView.vue'
import ShopView from '@/components/shop/ShopView.vue'
import InventoryView from '@/components/inventory/InventoryView.vue'

const game = useGameStore()

const currentTab = ref<TabId>('farm')
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

function handleTabChange(tab: TabId) {
  currentTab.value = tab
}

function nextTutorial() {
  tutorialStep.value++
}

function closeTutorial() {
  showTutorial.value = false
  game.tutorialCompleted = true
  game.tutorialStep = 6
}

// 游戏主循环
let gameLoop: ReturnType<typeof setInterval> | null = null
let autoSaveTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const loaded = game.load()
  if (!loaded) {
    showTutorial.value = true
    tutorialStep.value = 1
  }

  gameLoop = setInterval(() => {
    game.updateAllStates()
  }, 1000)

  autoSaveTimer = setInterval(() => {
    game.save()
  }, 30000)
})

onUnmounted(() => {
  if (gameLoop) clearInterval(gameLoop)
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  game.save()
})
</script>

<style lang="scss">
@use '@/styles/variables' as *;

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

.tutorial-content {
  p {
    font-size: $font-size-md;
    line-height: 1.6;
    color: $color-text-dark;
    margin-bottom: $spacing-md;
  }
}

.tutorial-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-lg;
}

.tutorial-next-btn {
  padding: $spacing-sm $spacing-xl;
  background: $wood-bg;
  border: 2px solid $wood-border;
  color: $wood-text;
  border-radius: $radius-md;
  font-weight: 700;
  font-size: $font-size-md;
  box-shadow: $wood-shadow;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  transition: all $transition-fast;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 #4a3508;
  }
}
</style>
