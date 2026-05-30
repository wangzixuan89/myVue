import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import SnakeGame from '@/views/SnakeGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/game',
      name: 'game',
      component: SnakeGame,
      meta: { requiresAuth: true }
    }
  ]
})

// 【学习要点】beforeEach 路由守卫：
// 每次路由切换前执行，检查是否有 token。
// 未登录用户访问需要认证的页面 → 重定向到 /login。
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 目标页面需要认证 且 没有 token → 跳转登录页
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
