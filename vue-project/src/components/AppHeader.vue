<template>
  <header class="app-header">
    <!-- ==================== 左侧：导航按钮 ==================== -->
    <div class="header-left">
      <router-link to="/home" class="nav-btn" :class="{ active: currentPage === 'home' }">
        🏠 主界面
      </router-link>
      <!-- 预留更多导航按钮 -->
      <!--
      <router-link to="/xxx" class="nav-btn" :class="{ active: currentPage === 'xxx' }">
        📋 其他页面
      </router-link>
      -->
    </div>

    <!-- ==================== 右侧：设置、用户信息、退出 ==================== -->
    <div class="header-right">
      <!-- 预留设置按钮 -->
      <el-button class="header-icon-btn" circle size="small" title="设置">
        ⚙️
      </el-button>

      <!-- 用户信息 -->
      <span class="welcome-text">{{ userName }}</span>

      <!-- 退出登录 -->
      <el-button @click="handleLogout" type="danger" size="small" plain>
        退出登录
      </el-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 当前页面标识（由父组件传入）
defineProps<{
  currentPage?: string
}>()

const router = useRouter()
const userName = ref('')

// 加载用户信息
function loadUserInfo() {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      userName.value = user.nickname || user.username || '用户'
    }
  } catch {
    userName.value = '用户'
  }
}

// 退出登录
function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('已退出登录')
  router.push('/login')
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
/* ==================== 顶栏整体 ==================== */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* ==================== 左侧导航 ==================== */
.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-btn:hover {
  background: #f0f0f0;
  color: #333;
}

/* 当前活跃按钮高亮 */
.nav-btn.active {
  background: #e6f0ff;
  color: #667eea;
  font-weight: 500;
}

/* ==================== 右侧区域 ==================== */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-btn {
  font-size: 16px;
}

.welcome-text {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}
</style>
