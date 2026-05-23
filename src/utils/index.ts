// ============================================
// 工具函数
// ============================================

/**
 * 格式化时间（秒数→可读字符串）
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}秒`
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}分`
  const hours = seconds / 3600
  if (hours < 24) return `${hours.toFixed(1)}时`
  return `${(hours / 24).toFixed(1)}天`
}

/**
 * 格式化大数字
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return String(num)
}

/**
 * 生成唯一ID
 */
let _idCounter = 0
export function generateId(): string {
  return `id_${Date.now()}_${++_idCounter}`
}

/**
 * 限制数值范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 防抖
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}
