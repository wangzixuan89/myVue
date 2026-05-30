// 模拟数据库 - 用户数据
export interface User {
  id: number
  username: string
  password: string
  nickname: string
  avatar?: string
  token?: string
}

export interface LoginData {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResult {
  success: boolean
  token?: string
  user?: Omit<User, 'password'>
  message?: string
}

// 模拟用户列表
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    nickname: '普通用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
  },
  {
    id: 3,
    username: 'lwx',
    password: '123456',
    nickname: '专属账号',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lwx'
  }
]

// 模拟 API 延迟（毫秒）
const MOCK_DELAY = 500
