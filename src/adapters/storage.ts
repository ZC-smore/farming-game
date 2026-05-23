// ============================================
// 平台抽象层 - 存储适配器
// 本地HTML: localStorage
// 微信小程序: wx.setStorageSync
// ============================================

export interface StorageAdapter {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
  clear(): void
}

class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    return localStorage.getItem(key)
  }
  set(key: string, value: string): void {
    localStorage.setItem(key, value)
  }
  remove(key: string): void {
    localStorage.removeItem(key)
  }
  clear(): void {
    localStorage.clear()
  }
}

// 小程序适配器占位
// class WxStorageAdapter implements StorageAdapter { ... }

export function createStorageAdapter(): StorageAdapter {
  // 后续根据平台切换
  return new LocalStorageAdapter()
}

export const storageAdapter = createStorageAdapter()
