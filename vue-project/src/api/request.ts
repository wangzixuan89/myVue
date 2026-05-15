/**
 * 模拟 HTTP 请求工具
 * 模拟真实 axios 的使用方式，但返回 mock 数据
 * 学习时可以把这个当作 axios 来理解
 */

import { mockUsers } from './mock/database'

// 模拟响应结构
interface MockResponse {
  data: any
  status: number
  message: string
}

// 存储 token（模拟浏览器的 cookie/session）
let authToken: string | null = null

/**
 * 模拟 GET 请求
 */
export const mockGet = async (url: string): Promise<MockResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))

  // 模拟 401 未授权
  if (!authToken && url !== '/login') {
    return {
      data: null,
      status: 401,
      message: '未登录或登录已过期'
    }
  }

  // GET /user/info - 获取用户信息
  if (url === '/user/info') {
    const tokenData = parseToken(authToken || '')
    if (tokenData) {
      const user = mockUsers.find(u => u.id === tokenData.userId)
      if (user) {
        const { password, ...userInfo } = user
        return {
          data: userInfo,
          status: 200,
          message: '获取成功'
        }
      }
    }
  }

  // GET /user/list - 获取用户列表
  if (url === '/user/list') {
    const users = mockUsers.map(({ password, ...rest }) => rest)
    return {
      data: users,
      status: 200,
      message: '获取成功'
    }
  }

  return {
    data: null,
    status: 404,
    message: '接口不存在'
  }
}

/**
 * 模拟 POST 请求
 */
export const mockPost = async (url: string, body: any): Promise<MockResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // POST /user/login - 登录
  if (url === '/user/login') {
    const { username, password } = body
    const user = mockUsers.find(u => u.username === username && u.password === password)

    if (user) {
      // 生成模拟 token
      authToken = `Bearer mock_token_${user.id}_${Date.now()}`
      const { password: _, ...userInfo } = user

      return {
        data: {
          token: authToken,
          user: userInfo
        },
        status: 200,
        message: '登录成功'
      }
    } else {
      return {
        data: null,
        status: 401,
        message: '用户名或密码错误'
      }
    }
  }

  // POST /user/logout - 退出登录
  if (url === '/user/logout') {
    authToken = null
    return {
      data: null,
      status: 200,
      message: '退出成功'
    }
  }

  // POST /user/register - 注册（预留）
  if (url === '/user/register') {
    const { username } = body
    const exists = mockUsers.some(u => u.username === username)

    if (exists) {
      return {
        data: null,
        status: 400,
        message: '用户名已存在'
      }
    }

    return {
      data: { id: mockUsers.length + 1, username },
      status: 201,
      message: '注册成功'
    }
  }

  return {
    data: null,
    status: 404,
    message: '接口不存在'
  }
}

// 解析 token
function parseToken(token: string): { userId: number } | null {
  const match = token.match(/mock_token_(\d+)_/)
  if (match && match[1]) {
    return { userId: parseInt(match[1]) }
  }
  return null
}

// 导出获取当前 token 的方法
export const getToken = () => authToken
export const setToken = (token: string) => { authToken = token }
export const clearToken = () => { authToken = null }
