// ============================================
// 作物状态机
// EMPTY → PLANTED → GROWING → MATURE → WITHERED
// ============================================

export type CropState = 'EMPTY' | 'PLANTED' | 'GROWING' | 'MATURE' | 'WITHERED'

export interface CropPlotData {
  id: number
  state: CropState
  cropId: string | null
  plantedAt: number | null       // 种植时间戳(ms)
  lastWateredAt: number | null   // 上次浇水时间戳(ms)
  waterCount: number             // 已浇水次数
  growthProgress: number         // 0-1 生长进度
  matureAt: number | null        // 成熟时间戳(ms)
  witherAt: number | null        // 枯萎时间戳(ms)
}

export function createEmptyPlot(id: number): CropPlotData {
  return {
    id,
    state: 'EMPTY',
    cropId: null,
    plantedAt: null,
    lastWateredAt: null,
    waterCount: 0,
    growthProgress: 0,
    matureAt: null,
    witherAt: null,
  }
}

export function plantCrop(plot: CropPlotData, cropId: string, growTimeSeconds: number): CropPlotData {
  const now = Date.now()
  return {
    ...plot,
    state: 'PLANTED',
    cropId,
    plantedAt: now,
    lastWateredAt: null,
    waterCount: 0,
    growthProgress: 0,
    matureAt: now + growTimeSeconds * 1000,
    witherAt: null,
  }
}

export function waterCrop(plot: CropPlotData): CropPlotData {
  if (plot.state !== 'PLANTED' && plot.state !== 'GROWING') return plot
  const now = Date.now()
  return {
    ...plot,
    state: 'GROWING',
    lastWateredAt: now,
    waterCount: plot.waterCount + 1,
  }
}

export function updateCropGrowth(plot: CropPlotData): CropPlotData {
  if (plot.state === 'PLANTED' || plot.state === 'GROWING') {
    if (!plot.matureAt) return plot
    const now = Date.now()
    const totalTime = plot.matureAt - (plot.plantedAt ?? now)
    const elapsed = now - (plot.plantedAt ?? now)
    const progress = Math.min(1, Math.max(0, elapsed / totalTime))

    if (progress >= 1) {
      return {
        ...plot,
        state: 'MATURE',
        growthProgress: 1,
        witherAt: now + 3600000, // 1小时后枯萎
      }
    }
    return {
      ...plot,
      state: progress > 0 ? 'GROWING' : plot.state,
      growthProgress: progress,
    }
  }

  if (plot.state === 'MATURE' && plot.witherAt) {
    if (Date.now() >= plot.witherAt) {
      return {
        ...plot,
        state: 'WITHERED',
      }
    }
  }

  return plot
}

export function harvestCrop(plot: CropPlotData): CropPlotData {
  return createEmptyPlot(plot.id)
}

export function clearWitheredPlot(plot: CropPlotData): CropPlotData {
  if (plot.state !== 'WITHERED') return plot
  return createEmptyPlot(plot.id)
}
