// ============================================
// 等级配置
// ============================================

export interface LevelConfig {
  level: number
  expRequired: number       // 升到下一级所需经验
  expTotal: number           // 累计经验
  unlockContent: string      // 解锁内容描述
  estimatedTime: string      // 预计到达时间
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1,  expRequired: 0,    expTotal: 0,     unlockContent: '农场（2块地）',              estimatedTime: '—' },
  { level: 2,  expRequired: 50,   expTotal: 50,    unlockContent: '水桶升级开放',              estimatedTime: '10分钟' },
  { level: 3,  expRequired: 120,  expTotal: 170,   unlockContent: '商店解锁动物',              estimatedTime: '30分钟' },
  { level: 4,  expRequired: 200,  expTotal: 370,   unlockContent: '牧场栏位+1',               estimatedTime: '1小时' },
  { level: 5,  expRequired: 350,  expTotal: 720,   unlockContent: '花园解锁 + 常规活动资格',    estimatedTime: '半天' },
  { level: 6,  expRequired: 500,  expTotal: 1220,  unlockContent: '花盆扩容 + 花卉商店扩展',    estimatedTime: '1天' },
  { level: 7,  expRequired: 700,  expTotal: 1920,  unlockContent: '通用券转换解锁',            estimatedTime: '2天' },
  { level: 8,  expRequired: 1000, expTotal: 2920,  unlockContent: '花艺工坊解锁 + 仓库升级',   estimatedTime: '3天' },
  { level: 9,  expRequired: 1400, expTotal: 4320,  unlockContent: '广告亭升级 + 装饰商店解锁',  estimatedTime: '5天' },
  { level: 10, expRequired: 2000, expTotal: 6320,  unlockContent: '排行榜活动 + 全能农夫',      estimatedTime: '1周' },
  { level: 11, expRequired: 2800, expTotal: 9120,  unlockContent: '高级作物 + 花盆高级扩容',    estimatedTime: '2周' },
  { level: 12, expRequired: 3800, expTotal: 12920, unlockContent: '高级动物（绵羊/蜜蜂）',      estimatedTime: '3周' },
  { level: 13, expRequired: 5000, expTotal: 17920, unlockContent: '稀有花种商店',               estimatedTime: '1月' },
  { level: 14, expRequired: 6500, expTotal: 24420, unlockContent: '仓库高级升级',               estimatedTime: '5周' },
  { level: 15, expRequired: 8500, expTotal: 32920, unlockContent: '温室建筑（V1.5前置）',       estimatedTime: '6周+' },
]

export function getLevelConfig(level: number): LevelConfig {
  const idx = Math.min(level - 1, LEVEL_CONFIGS.length - 1)
  return LEVEL_CONFIGS[Math.max(0, idx)]
}

export function getExpForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_CONFIGS.length) return Infinity
  return LEVEL_CONFIGS[currentLevel].expRequired
}
