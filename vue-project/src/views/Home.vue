<template>
  <div class="home-container">
    <!-- ==================== 通用顶栏 ==================== -->
    <AppHeader current-page="home" />

    <!-- ==================== 主内容区域 ==================== -->
    <main class="home-main">
      <div class="home-grid">
        <!-- 贪吃蛇游戏入口 -->
        <router-link to="/game" class="game-card">
          <div class="card-icon">🐍</div>
          <div class="card-title">贪吃蛇</div>
          <div class="card-desc">经典小游戏，控制蛇吃食物变长</div>
        </router-link>

        <!-- 预留更多游戏入口 -->
        <!--
        <router-link to="/xxx" class="game-card">
          <div class="card-icon">🎯</div>
          <div class="card-title">新游戏</div>
          <div class="card-desc">描述信息</div>
        </router-link>
        -->
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<style scoped>
/* ==================== 整体布局 ==================== */
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* ==================== 主内容区域 ==================== */
.home-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  max-width: 800px;
  width: 100%;
}

/* ==================== 游戏入口卡片 ==================== */
.game-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 24px;
  background: white;
  border-radius: 12px;
  border: 2px solid #e8e8e8;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
}

.game-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}

.card-icon {
  font-size: 48px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.card-desc {
  font-size: 13px;
  color: #999;
  text-align: center;
  line-height: 1.5;
}
</style>
