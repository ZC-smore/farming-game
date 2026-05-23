// ============================================
// 平台抽象层 - 广告适配器
// 本地HTML: 占位模拟
// 微信小程序: wx.createRewardedVideoAd
// ============================================

export interface AdAdapter {
  showRewardedVideo(): Promise<boolean>
  getDailyWatchCount(): number
  getMaxDailyWatchCount(): number
}

class MockAdAdapter implements AdAdapter {
  private dailyWatchCount = 0
  private readonly maxDaily = 12

  async showRewardedVideo(): Promise<boolean> {
    // 本地版：模拟广告观看
    if (this.dailyWatchCount >= this.maxDaily) return false
    this.dailyWatchCount++
    return true
  }

  getDailyWatchCount(): number {
    return this.dailyWatchCount
  }

  getMaxDailyWatchCount(): number {
    return this.maxDaily
  }
}

export function createAdAdapter(): AdAdapter {
  return new MockAdAdapter()
}

export const adAdapter = createAdAdapter()
