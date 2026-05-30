/**
 * API 模块统一导出
 */

export { API_CONFIG } from './config'
export { loginAPI, getUserInfoAPI, logoutAPI, getUserListAPI } from './user'
export { mockGet, mockPost, getToken, clearToken } from './request'
export type { User, LoginData, LoginResult } from './mock/database'
