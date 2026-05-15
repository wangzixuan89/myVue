/**
 * API 配置文件
 * 切换 USE_MOCK 为 false 即可切换到真实后端
 */

// API 环境配置
export const API_CONFIG = {
  // true: 使用模拟数据, false: 使用真实后端
  USE_MOCK: true,

  // 真实后端地址（以后接入时修改这里）
  BASE_URL: 'http://localhost:8080/api',

  // 请求超时时间（毫秒）
  TIMEOUT: 10000
}
