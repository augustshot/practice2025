// Игра Змейка
const snakeCanvas = document.getElementById('snake-board');
const snakeCtx = snakeCanvas.getContext('2d');
const snakeScore = document.getElementById('snake-score');
const snakeStartBtn = document.getElementById('snake-start');
const snakePauseBtn = document.getElementById('snake-pause');
const snakeRestartBtn = document.getElementById('snake-restart');
const snakeGameOver = document.getElementById('snake-game-over');

const gridSize = 30;
const tileCount = snakeCanvas.width / gridSize;
let snake = [{x: 10, y: 10}];
let velocityX = 0;
let velocityY = 0;
let foodX = 5;
let foodY = 5;
let snakeScoreValue = 0;
let gameSpeed = 250;
let gameLoop;
let isPaused = false;
let isGameOver = false;

function drawCrystal(x, y) {
    // Размер кристалла (меньше чем размер клетки)
    const size = gridSize * 0.9;
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    
    // Сохраняем текущее состояние canvas
    snakeCtx.save();
    
    // Перемещаем начало координат в центр кристалла
    snakeCtx.translate(centerX, centerY);
    
    // Градиент для эффекта блеска
    const gradient = snakeCtx.createRadialGradient(
        0, 0, size * 0.2,
        0, 0, size * 0.5
    );
    gradient.addColorStop(0, 'rgba(251, 217, 226, 0.8)');
    gradient.addColorStop(0.5, 'rgba(245, 100, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(149, 0, 255, 0.4)');
    
    // Рисуем кристалл (ромб с эффектом грани)
    snakeCtx.fillStyle = gradient;
    snakeCtx.beginPath();
    
    // Верхняя точка
    snakeCtx.moveTo(0, -size / 2);
    
    // Правая точка
    snakeCtx.lineTo(size / 3, 0);
    
    // Нижняя точка
    snakeCtx.lineTo(0, size / 2);
    
    // Левая точка
    snakeCtx.lineTo(-size / 3, 0);
    
    // Замыкаем фигуру
    snakeCtx.closePath();
    snakeCtx.fill();
    
    // Добавляем блики
    snakeCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    snakeCtx.beginPath();
    snakeCtx.moveTo(-size / 6, -size / 4);
    snakeCtx.lineTo(0, -size / 6);
    snakeCtx.lineTo(size / 6, -size / 4);
    snakeCtx.lineTo(0, -size / 3);
    snakeCtx.closePath();
    snakeCtx.fill();
    
    // Восстанавливаем состояние canvas
    snakeCtx.restore();
}

snakeStartBtn.addEventListener('click', startSnakeGame);
snakePauseBtn.addEventListener('click', togglePause);
snakeRestartBtn.addEventListener('click', startSnakeGame);

document.addEventListener('keydown', changeDirection);

function startSnakeGame() {
    snake = [{x: 10, y: 10}];
    velocityX = 1;
    velocityY = 0;
    snakeScoreValue = 0;
    snakeScore.textContent = snakeScoreValue;
    isGameOver = false;
    snakeGameOver.classList.add('hidden');
    generateFood();
    
    clearInterval(gameLoop);
    gameLoop = setInterval(drawSnakeGame, gameSpeed);
    
    // Устанавливаем фокус на canvas для обработки клавиш
    snakeCanvas.focus();
}

function togglePause() {
    isPaused = !isPaused;
    snakePauseBtn.textContent = isPaused ? 'Продолжить' : 'Пауза';
    
    if (isPaused) {
        clearInterval(gameLoop);
    } else {
        gameLoop = setInterval(drawSnakeGame, gameSpeed);
    }
}

function drawSnakeGame() {
    if (isPaused || isGameOver) return;
    
    // Очищаем canvas
    snakeCtx.fillStyle = '#ecf0f1';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // Рисуем еду
    drawCrystal(foodX, foodY);
    
    // Обновляем позицию змейки
    const head = {x: snake[0].x + velocityX, y: snake[0].y + velocityY};
    
    // Проверяем столкновение с границами
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Проверяем столкновение с собой (начиная с 1 элемента, чтобы не проверять голову с головой)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // Добавляем новую голову
    snake.unshift(head);
    
    // Проверяем, съела ли змейка еду
    if (head.x === foodX && head.y === foodY) {
        snakeScoreValue++;
        snakeScore.textContent = snakeScoreValue;
        generateFood();
    } else {
        // Удаляем хвост, если не съели еду
        snake.pop();
    }
    
    // Рисуем змейку
    snakeCtx.fillStyle = '#2c3e50';
    snake.forEach(part => {
        snakeCtx.fillRect(part.x * gridSize, part.y * gridSize, gridSize*0.9, gridSize*0.9);
    });
}

function generateFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    
    // Убедимся, что еда не появилась на змейке
    for (let i = 0; i < snake.length; i++) {
        if (foodX === snake[i].x && foodY === snake[i].y) {
            generateFood();
            return;
        }
    }
}

function changeDirection(e) {
    if (isPaused || isGameOver) return;
    
    // Предотвращаем стандартное поведение браузера для стрелок
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    // Изменяем направление в зависимости от нажатой клавиши
    switch(e.key) {
        case 'ArrowUp':
            if (velocityY !== 1) { // Не позволяем развернуться на 180°
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 'ArrowDown':
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case 'ArrowLeft':
            if (velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 'ArrowRight':
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    snakeGameOver.classList.remove('hidden');
}