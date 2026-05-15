/**
 * 用户相关 API
 * 使用 mockGet/mockPost 模拟真实的 RESTful API 调用
 */

import { mockGet, mockPost, getToken, clearToken } from './request'
import type { LoginData } from './mock/database'

// ==================== 真实后端请求示例（以后使用） ====================
// import axios from 'axios'
//
// const request = axios.create({
//   baseURL: API_CONFIG.BASE_URL,
//   timeout: API_CONFIG.TIMEOUT
// })
//
// // 请求拦截器 - 添加 token
// request.interceptors.request.use(config => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = token
//   }
//   return config
// })
//
// // 响应拦截器 - 处理错误
// request.interceptors.response.use(
//   response => response.data,
//   error => {
//     if (error.response?.status === 401) {
//       // token 过期，跳转登录
//     }
//     return Promise.reject(error)
//   }
// )
// ==================== 真实后端请求示例 END ====================

// ==================== Mock 实现 ====================

/**
 * POST /user/login - 用户登录
 */
export const loginAPI = async (data: LoginData) => {
  const response = await mockPost('/user/login', data)

  return {
    success: response.status === 200,
    token: response.data?.token,
    user: response.data?.user,
    message: response.message
  }
}

/**
 * POST /user/logout - 退出登录
 */
export const logoutAPI = async () => {
  const response = await mockPost('/user/logout', {})
  return {
    success: response.status === 200,
    message: response.message
  }
}

/**
 * GET /user/info - 获取当前用户信息
 */
export const getUserInfoAPI = async () => {
  const token = getToken()
  if (!token) {
    return {
      success: false,
      message: '未登录'
    }
  }

  const response = await mockGet('/user/info')

  return {
    success: response.status === 200,
    user: response.data,
    message: response.message
  }
}

/**
 * GET /user/list - 获取用户列表
 */
export const getUserListAPI = async () => {
  const response = await mockGet('/user/list')

  return {
    success: response.status === 200,
    data: response.data,
    message: response.message
  }
}

// ==================== Mock 实现 END ====================
