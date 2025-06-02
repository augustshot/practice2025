// Игра в запоминалки
const memoryBoard = document.getElementById('memory-board');
const memoryTime = document.getElementById('memory-time');
const memoryMoves = document.getElementById('memory-moves');
const memoryStartBtn = document.getElementById('memory-start');
const memoryStopBtn = document.getElementById('memory-stop');

let memorySize = 4; 
let memoryCards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let timer;
let seconds = 0;
let matchedPairs = 0;
let totalPairs = 0;

memoryStartBtn.addEventListener('click', startMemoryGame);
memoryStopBtn.addEventListener('click', stopMemoryGame);

function createMemoryBoard() {
    memoryBoard.innerHTML = '';
    memoryBoard.style.gridTemplateColumns = `repeat(${memorySize}, 70px)`;
    
    // Создаем пары карточек
    totalPairs = Math.floor(memorySize * memorySize / 2);
    const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const selectedSymbols = symbols.slice(0, totalPairs);
    const cards = [...selectedSymbols, ...selectedSymbols];
    
    // Перемешиваем карточки
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    // Создаем элементы карточек
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        
        // Добавляем span для символа
        const symbolSpan = document.createElement('span');
        symbolSpan.textContent = symbol;
        symbolSpan.style.display = 'none'; // Сначала скрываем
        
        card.appendChild(symbolSpan);
        memoryBoard.appendChild(card);
    });
    
    memoryCards = Array.from(document.querySelectorAll('.memory-card'));
}

function startMemoryGame() {
    resetMemoryGame();
    memoryCards.forEach(card => {
        card.querySelector('span').style.display = 'block'; // Показываем символы
        card.classList.add('flipped');
        setTimeout(() => {
            card.classList.remove('flipped');
            card.querySelector('span').style.display = 'none'; // Скрываем снова
        }, 1500);
    });
    
    // Запускаем таймер
    seconds = 0;
    memoryTime.textContent = seconds;
    clearInterval(timer);
    timer = setInterval(() => {
        seconds++;
        memoryTime.textContent = seconds;
    }, 1000);
}

function stopMemoryGame(){
    createMemoryBoard();
    resetBoard();
    clearInterval(timer);
    moves = 0;
    seconds = 0;
    memoryTime.innerText = 0;
    memoryMoves.innerText = 0;
}

function resetMemoryGame() {
    moves = 0;
    matchedPairs = 0;
    memoryMoves.textContent = moves;
    lockBoard = false;
    hasFlippedCard = false;
    [firstCard, secondCard] = [null, null];
    memoryCards.forEach(card => {
        card.classList.remove('flipped', 'matched');
        card.querySelector('span').style.display = 'none';
        card.addEventListener('click', flipCard);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (this.classList.contains('matched')) return;
    
    this.classList.add('flipped');
    this.querySelector('span').style.display = 'block'; // Показываем символ при перевороте
    
    if (!hasFlippedCard) {
        // Первый клик
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    
    // Второй клик
    secondCard = this;
    moves++;
    memoryMoves.textContent = moves;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
    
    if (isMatch) {
        disableCards();
        matchedPairs++;
        if (matchedPairs === totalPairs) {
            clearInterval(timer);
            alert(`Поздравляем! Вы победили за ${seconds} секунд и ${moves} ходов!`);
            addResult();
        }
    } else {
        unflipCards();
    }
}

function addResult(){

    showRating();
}

async function loadRating() {
    try {
        const response = await fetch('/rating');
        if (!response.ok) {
            throw new Error('Не удалось загрузить тесты');
        }
        ratingDatabase = await response.json();
        // ratingDatabase = SQLtoJson(testsDatabase);
        // console.log(testsDatabase);
    } catch (error) {
        console.error('Ошибка загрузки тестов:', error);
        testCategories.innerHTML = '<p class="error">Не удалось загрузить тесты. Пожалуйста, попробуйте позже.</p>';
    }
}

function showRating(){
    loadRating();

}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        firstCard.querySelector('span').style.display = 'none';
        secondCard.querySelector('span').style.display = 'none';
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

createMemoryBoard();
showRating();