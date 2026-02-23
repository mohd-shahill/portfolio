import { showToast } from './main.js';

// ════════════════════════════════════════════════════════════
// SNAKE EASTER EGG
// ════════════════════════════════════════════════════════════
const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex] || e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      konamiIndex = 0;
      openApp('snake');
      showToast('🎮 Easter Egg Found! Snake unlocked.');
      initSnake();
    }
  } else {
    konamiIndex = 0;
  }
});

let snakeInterval = null;
let snake = [];
let food = {};
let direction = 'RIGHT';
let snakeScore = 0;
let isSnakePlaying = false;

function initSnake() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Reset state
  snake = [{ x: 10, y: 10 }];
  direction = 'RIGHT';
  snakeScore = 0;
  document.getElementById('snake-score').innerText = snakeScore;
  document.getElementById('snake-overlay').style.display = 'block';
  isSnakePlaying = false;
  clearInterval(snakeInterval);
  
  spawnFood();
  drawSnake(ctx);
  
  // Clear any old listeners so they don't stack
  document.removeEventListener('keydown', snakeKeyHandler);
  document.addEventListener('keydown', snakeKeyHandler);
}

function snakeKeyHandler(e) {
  if (!document.getElementById('window-snake') || document.getElementById('window-snake').classList.contains('hidden')) {
    isSnakePlaying = false;
    clearInterval(snakeInterval);
    return;
  }
  
  if (e.code === 'Space' && !isSnakePlaying) {
    e.preventDefault();
    isSnakePlaying = true;
    document.getElementById('snake-overlay').style.display = 'none';
    snakeInterval = setInterval(gameLoop, 100);
    return;
  }
  
  if (!isSnakePlaying) return;
  
  const keyMap = {
    'ArrowUp': 'UP',
    'ArrowDown': 'DOWN',
    'ArrowLeft': 'LEFT',
    'ArrowRight': 'RIGHT',
    'w': 'UP',
    'a': 'LEFT',
    's': 'DOWN',
    'd': 'RIGHT'
  };
  
  const newDir = keyMap[e.key] || keyMap[e.key.toLowerCase()];
  if (!newDir) return;
  
  // Prevent 180 degree turns
  if ((newDir === 'UP' && direction !== 'DOWN') ||
      (newDir === 'DOWN' && direction !== 'UP') ||
      (newDir === 'LEFT' && direction !== 'RIGHT') ||
      (newDir === 'RIGHT' && direction !== 'LEFT')) {
    e.preventDefault();
    direction = newDir;
  }
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20)
  };
}

function gameLoop() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas || document.getElementById('window-snake').classList.contains('hidden')) {
    clearInterval(snakeInterval);
    return;
  }
  const ctx = canvas.getContext('2d');
  
  let head = { ...snake[0] };
  
  if (direction === 'UP') head.y--;
  if (direction === 'DOWN') head.y++;
  if (direction === 'LEFT') head.x--;
  if (direction === 'RIGHT') head.x++;
  
  // Collision with walls
  if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
    return gameOver();
  }
  
  // Collision with self
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return gameOver();
  }
  
  snake.unshift(head);
  
  // Eating food
  if (head.x === food.x && head.y === food.y) {
    snakeScore += 10;
    document.getElementById('snake-score').innerText = snakeScore;
    spawnFood();
  } else {
    snake.pop();
  }
  
  drawSnake(ctx);
}

function drawSnake(ctx) {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, 400, 400);
  
  ctx.fillStyle = '#0f0';
  for (let i = 0; i < snake.length; i++) {
    const isHead = i === 0;
    if (isHead) ctx.fillStyle = '#fff'; // White head
    else ctx.fillStyle = '#0f0'; // Green body
    ctx.fillRect(snake[i].x * 20, snake[i].y * 20, 18, 18);
  }
  
  ctx.fillStyle = '#f00'; // Red food
  ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
}

function gameOver() {
  isSnakePlaying = false;
  clearInterval(snakeInterval);
  const overlay = document.getElementById('snake-overlay');
  overlay.innerHTML = `GAME OVER<br><br><span style="font-size: 0.8rem; color: #888;">Score: ${snakeScore}</span><br><br>Press SPACE to restart`;
  overlay.style.display = 'block';
  overlay.style.color = '#f00';
  snake = [{ x: 10, y: 10 }];
  direction = 'RIGHT';
  snakeScore = 0;
}

export { initSnake };
