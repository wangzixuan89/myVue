<template>
  <div class="snake-container">
    <!-- ==================== 通用顶栏 ==================== -->
    <AppHeader current-page="game" />

    <!-- ==================== 游戏主区域 ==================== -->
    <main class="game-main">
      <div class="game-panel">
        <!-- 分数和关卡 -->
        <div class="game-stats">
          <div class="stat-card">
            <span class="stat-label">🏆 得分</span>
            <span class="stat-value">{{ score }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">📈 关卡</span>
            <span class="stat-value">{{ level }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">⚡ 速度</span>
            <span class="stat-value">{{ tickInterval }}ms</span>
          </div>
        </div>

        <!-- 棋盘区域 + 覆盖层 -->
        <div class="board-wrapper">
          <div class="game-board" :style="boardStyle">
            <div
              v-for="row in gridRows"
              :key="'row-' + row"
              class="board-row"
            >
              <div
                v-for="col in gridCols"
                :key="'cell-' + row + '-' + col"
                class="cell"
                :class="getCellClass(row - 1, col - 1)"
              ></div>
            </div>
          </div>

          <!-- 覆盖层：非 playing 状态时显示 -->
          <div v-if="gameStatus !== 'playing'" class="game-overlay">
            <div class="overlay-text">
              <template v-if="gameStatus === 'idle'">
                <p class="overlay-title">🐍 贪吃蛇</p>
                <p class="overlay-desc">点击「开始游戏」启动</p>
              </template>
              <template v-else-if="gameStatus === 'paused'">
                <p class="overlay-title">⏸️ 游戏暂停中</p>
                <p class="overlay-desc">点击「继续」恢复</p>
              </template>
              <template v-else-if="gameStatus === 'over'">
                <p class="overlay-title">💀 游戏结束！</p>
                <p class="overlay-desc">最终得分：{{ score }}</p>
              </template>
              <template v-else-if="gameStatus === 'win'">
                <p class="overlay-title">🎉 恭喜通关！</p>
                <p class="overlay-desc">最终得分：{{ score }}</p>
              </template>
            </div>
          </div>
        </div>

        <!-- 游戏控制按钮 -->
        <div class="game-controls">
          <el-button
            v-if="gameStatus === 'idle'"
            type="primary"
            size="large"
            @click="startGame"
          >
            🎮 开始游戏
          </el-button>

          <el-button
            v-if="gameStatus === 'playing'"
            type="warning"
            size="large"
            @click="pauseGame"
          >
            ⏸️ 暂停
          </el-button>

          <el-button
            v-if="gameStatus === 'paused'"
            type="success"
            size="large"
            @click="resumeGame"
          >
            ▶️ 继续
          </el-button>

          <el-button
            v-if="gameStatus === 'over' || gameStatus === 'win'"
            type="primary"
            size="large"
            @click="startGame"
          >
            🔄 再来一局
          </el-button>

          <el-button
            v-if="gameStatus !== 'idle'"
            size="large"
            @click="backToHome"
          >
            🏠 返回主界面
          </el-button>
        </div>

        <!-- 操作提示 -->
        <div class="game-tips">
          <p>⌨️ 操作：方向键 ↑↓←→ 或 WASD</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// ==================== 导入 ====================
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()

// ==================== 类型定义 ====================
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type GameStatus = 'idle' | 'playing' | 'paused' | 'over' | 'win'

interface Position {
  row: number
  col: number
}

// ==================== 常量配置 ====================
const GRID_ROWS = 20
const GRID_COLS = 20
const gridRows = GRID_ROWS
const gridCols = GRID_COLS
const BASE_INTERVAL = 200
const MIN_INTERVAL = 60
const SPEED_STEP = 5

const OPPOSITES: Record<Direction, Direction> = {
  UP: 'DOWN', DOWN: 'UP',
  LEFT: 'RIGHT', RIGHT: 'LEFT',
}

const DELTAS: Record<Direction, Position> = {
  UP: { row: -1, col: 0 },
  DOWN: { row: 1, col: 0 },
  LEFT: { row: 0, col: -1 },
  RIGHT: { row: 0, col: 1 },
}

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'UP', ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  w: 'UP', W: 'UP',
  s: 'DOWN', S: 'DOWN',
  a: 'LEFT', A: 'LEFT',
  d: 'RIGHT', D: 'RIGHT',
}

// ==================== 游戏状态 ====================
const snake = ref<Position[]>([])
const food = ref<Position>({ row: 0, col: 0 })
const direction = ref<Direction>('RIGHT')
const gameStatus = ref<GameStatus>('idle')
const score = ref(0)
const directionQueue = ref<Direction[]>([])
let timerId: ReturnType<typeof setInterval> | null = null

// ==================== 计算属性 ====================
const level = computed(() => Math.floor(score.value / 5) + 1)
const tickInterval = computed(() =>
  Math.max(MIN_INTERVAL, BASE_INTERVAL - score.value * SPEED_STEP)
)
const boardStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
  gridTemplateRows: `repeat(${gridRows}, 1fr)`,
}))

// ==================== 棋盘渲染 ====================
function getCellClass(row: number, col: number): string {
  if (snake.value.length > 0) {
    const head = snake.value[0]!
    if (head.row === row && head.col === col) return 'cell-head'
  }
  if (snake.value.some((s) => s.row === row && s.col === col)) return 'cell-body'
  if (food.value.row === row && food.value.col === col) return 'cell-food'
  return 'cell-empty'
}

// ==================== 游戏核心逻辑 ====================
function initGame() {
  stopLoop()
  const midRow = Math.floor(GRID_ROWS / 2)
  const midCol = Math.floor(GRID_COLS / 2)
  snake.value = [
    { row: midRow, col: midCol },
    { row: midRow, col: midCol - 1 },
    { row: midRow, col: midCol - 2 },
  ]
  direction.value = 'RIGHT'
  directionQueue.value = []
  score.value = 0
  gameStatus.value = 'idle'
  generateFood()
}

function generateFood() {
  const occupied = new Set(snake.value.map((s) => `${s.row},${s.col}`))
  const total = GRID_ROWS * GRID_COLS
  if (occupied.size >= total) {
    gameStatus.value = 'win'
    stopLoop()
    return
  }
  let pos: Position
  let tries = 0
  do {
    pos = {
      row: Math.floor(Math.random() * GRID_ROWS),
      col: Math.floor(Math.random() * GRID_COLS),
    }
    tries++
    if (tries > 1000) {
      outer:
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (!occupied.has(`${r},${c}`)) {
            pos = { row: r, col: c }
            break outer
          }
        }
      }
      break
    }
  } while (occupied.has(`${pos.row},${pos.col}`))
  food.value = pos
}

function tick() {
  if (gameStatus.value !== 'playing') return
  const cur = direction.value
  let next = cur
  while (directionQueue.value.length > 0) {
    const d = directionQueue.value.shift()!
    if (OPPOSITES[d] !== cur && d !== cur) {
      next = d
      break
    }
  }
  direction.value = next
  const head = snake.value[0]!
  const delta = DELTAS[next]
  const newHead: Position = {
    row: head.row + delta.row,
    col: head.col + delta.col,
  }
  if (newHead.row < 0 || newHead.row >= GRID_ROWS ||
      newHead.col < 0 || newHead.col >= GRID_COLS) {
    gameOver()
    return
  }
  if (snake.value.some((s) => s.row === newHead.row && s.col === newHead.col)) {
    gameOver()
    return
  }
  snake.value.unshift(newHead)
  if (newHead.row === food.value.row && newHead.col === food.value.col) {
    score.value++
    generateFood()
  } else {
    snake.value.pop()
  }
}

function gameOver() {
  gameStatus.value = 'over'
  stopLoop()
}

// ==================== 游戏循环 ====================
function startLoop() {
  stopLoop()
  timerId = setInterval(tick, tickInterval.value)
}

function stopLoop() {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

watch(tickInterval, () => {
  if (gameStatus.value === 'playing') startLoop()
})

// ==================== 游戏控制 ====================
function startGame() {
  if (gameStatus.value === 'idle' || gameStatus.value === 'over' || gameStatus.value === 'win') {
    initGame()
  }
  gameStatus.value = 'playing'
  startLoop()
}

function pauseGame() {
  if (gameStatus.value === 'playing') {
    gameStatus.value = 'paused'
    stopLoop()
  }
}

function resumeGame() {
  if (gameStatus.value === 'paused') {
    gameStatus.value = 'playing'
    startLoop()
  }
}

function resetGame() {
  initGame()
  gameStatus.value = 'idle'
}

function backToHome() {
  stopLoop()
  router.push('/home')
}

// ==================== 键盘事件 ====================
function handleKeydown(e: KeyboardEvent) {
  const dir = KEY_MAP[e.key]
  if (!dir) return
  e.preventDefault()
  if (gameStatus.value !== 'playing') return
  if (directionQueue.value.length >= 3) return
  directionQueue.value.push(dir)
}

// ==================== 生命周期 ====================
onMounted(() => {
  initGame()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopLoop()
})
</script>

<style scoped>
/* ==================== 整体布局 ==================== */
.snake-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
}

/* ==================== 游戏主区域 ==================== */
.game-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* ==================== 分数统计卡片 ==================== */
.game-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 24px;
  text-align: center;
  min-width: 100px;
}

.stat-label {
  display: block;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  color: #fff;
  font-size: 22px;
  font-weight: bold;
}

/* ==================== 棋盘 ==================== */
.board-wrapper {
  position: relative;
}

.game-board {
  display: grid;
  gap: 1px;
  width: 420px;
  height: 420px;
  background: #1a1a2e;
  border: 2px solid #2a2a4a;
  border-radius: 4px;
  padding: 1px;
}

.board-row {
  display: contents;
}

/* ==================== 单元格 ==================== */
.cell {
  border-radius: 2px;
  transition: background-color 0.06s;
}

.cell-empty {
  background: #16213e;
}

.cell-head {
  background: #00e676;
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(0, 230, 118, 0.5);
}

.cell-body {
  background: #00c853;
  border-radius: 3px;
}

.cell-food {
  background: #ff5252;
  border-radius: 50%;
  animation: food-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes food-pulse {
  from { box-shadow: 0 0 4px rgba(255, 82, 82, 0.4); transform: scale(0.8); }
  to   { box-shadow: 0 0 10px rgba(255, 82, 82, 0.8); transform: scale(1); }
}

/* ==================== 覆盖层 ==================== */
.game-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 4px;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.overlay-text {
  color: #fff;
  text-align: center;
}

.overlay-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 8px;
}

.overlay-desc {
  font-size: 16px;
  opacity: 0.7;
}

/* ==================== 控制按钮 ==================== */
.game-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* ==================== 操作提示 ==================== */
.game-tips {
  margin-top: 4px;
}

.game-tips p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  margin: 0;
}
</style>
