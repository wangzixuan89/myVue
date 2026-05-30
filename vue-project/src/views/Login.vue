<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">登录</h1>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-item">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
          />
        </div>

        <div class="form-item">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
          />
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input v-model="loginForm.rememberMe" type="checkbox" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>

        <p v-if="errorMessage" class="error-tip">{{ errorMessage }}</p>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="login-footer">
        <span>还没有账号？</span>
        <a href="#">立即注册</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { loginAPI } from '@/api'
import { useRouter } from 'vue-router'
const router = useRouter()
import { ElMessage } from 'element-plus'

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 加载状态
const loading = ref(false)

// 错误提示
const errorMessage = ref('')

// 记住我的存储 key
const REMEMBER_KEY = 'remembered_credentials'

// 页面加载时：读取“记住我”保存的账号密码
onMounted(() => {
  try {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      const { username, password } = JSON.parse(saved)
      loginForm.username = username || ''
      loginForm.password = password || ''
      loginForm.rememberMe = true
    }
  } catch {
    // 数据损坏则忽略
  }
})

// 登录处理
const handleLogin = async () => {
  // 重置错误信息
  errorMessage.value = ''

  // 表单验证
  if (!loginForm.username.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }
  if (!loginForm.password.trim()) {
    errorMessage.value = '请输入密码'
    return
  }

  loading.value = true

  try {
    // 调用登录 API
    const result = await loginAPI({
      username: loginForm.username,
      password: loginForm.password,
      rememberMe: loginForm.rememberMe
    })

    if (result.success) {
      // 保存 token
      if (result.token) {
        localStorage.setItem('token', result.token)
      }
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      // 记住我：存账号密码；不记住则清除
      if (loginForm.rememberMe) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({
          username: loginForm.username,
          password: loginForm.password
        }))
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }

      router.push('/home')
      ElMessage.success('登录成功')
    
    } else {
      errorMessage.value = result.message || '登录失败'
    }
  } catch (error) {
    console.error('登录失败:', error)
    errorMessage.value = '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.form-item input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-item input:focus {
  outline: none;
  border-color: #667eea;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.remember-me input {
  cursor: pointer;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-tip {
  color: #ff4d4f;
  font-size: 14px;
  text-align: center;
  margin: -10px 0;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  margin-left: 4px;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
