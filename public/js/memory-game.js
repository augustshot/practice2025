// Игра в запоминалки
const memoryBoard = document.getElementById('memory-board');
const memoryTime = document.getElementById('memory-time');
const memoryMoves = document.getElementById('memory-moves');
const memoryStartBtn = document.getElementById('memory-start');
const memoryStopBtn = document.getElementById('memory-stop');
const form = document.getElementById('addUserForm');
const fine = document.getElementById("fine");

let memorySize = 4; 
let memoryCards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let timer;
let seconds = 0;
let matchedPairs = 0;
let totalPairs = 8;
let ratingDatabase = {};
let fineTimer;

memoryStartBtn.addEventListener('click', startMemoryGame);
memoryStopBtn.addEventListener('click', stopMemoryGame);
form.addEventListener('submit', addRating);

function createMemoryBoard() {
    memoryBoard.innerHTML = '';
    memoryBoard.style.gridTemplateColumns = `repeat(${memorySize}, 70px)`;
    
    // Создаем пары карточек
    let minerals = [];
    for(let index = 1; index<9; index++){
        minerals.push("../img/game/" + index + ".PNG");
    }
    const cards = [...minerals, ...minerals];
    // Перемешиваем карточки
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    // Создаем элементы карточек
    cards.forEach((mineral, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.mineral = mineral;
        card.dataset.index = index;
        
        // Добавляем img для минерала
        const mineralimg = document.createElement('img');
        mineralimg.src = mineral;
        mineralimg.style.display = 'none'; // Сначала скрываем
        
        card.appendChild(mineralimg);
        memoryBoard.appendChild(card);
    });
    
    memoryCards = Array.from(document.querySelectorAll('.memory-card'));
}

function startMemoryGame() {
    stopMemoryGame();
    resetMemoryGame();
    memoryCards.forEach(card => {
        card.querySelector('img').style.display = 'block'; // Показываем минералы
        card.classList.add('flipped');
        setTimeout(() => {
            card.classList.remove('flipped');
            card.querySelector('img').style.display = 'none'; // Скрываем снова
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
        card.querySelector('img').style.display = 'none';
        card.addEventListener('click', flipCard);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (this.classList.contains('matched')) return;
    
    this.classList.add('flipped');
    this.querySelector('img').style.display = 'block'; // Показываем минерал при перевороте
    
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
    const isMatch = firstCard.dataset.mineral === secondCard.dataset.mineral;
    
    if (isMatch) {
        disableCards();
        matchedPairs++;
        if (matchedPairs === totalPairs) {
            clearInterval(timer);
            form.classList.remove("hidden");
        }
    } else {
        unflipCards();
        seconds+=2;
        fine.classList.remove("hidden");
        setTimeout(() => {
            fine.classList.add('hidden');
        }, 1000);
    }
}

async function addRating(e) {
    e.preventDefault(); // Предотвращаем стандартную отправку формы
    form.classList.add("hidden");
    const name = document.getElementById('name').value;
    const score = seconds;
    try {
        const names = ratingDatabase.map(item => item.name);
        if(names.includes(name)){
            // есть пользователь - обновляем данные
            const response = await fetch(`http://localhost:3000/rating/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: score
                })
            });
            if (!response.ok) {
                throw new Error('Ошибка при обновлении данных пользователя');
            }
        }
        else{
            // нет пользователя - создаем нового
            const response = await fetch('http://localhost:3000/rating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    score: score
                })
            });
            if (!response.ok) {
                throw new Error('Ошибка при добавлении пользователя');
            }
        }
        // const result = await response.text();
        // Очищаем форму после успешного добавления
        document.getElementById('addUserForm').reset();
        getRating();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function getRating() {
    try {
        const response = await fetch('/rating');
        if (!response.ok) {
            throw new Error('Не удалось загрузить рейтинг');
        }
        ratingDatabase = await response.json();
    } catch (error) {
        console.error('Ошибка загрузки рейтинга:', error);
    }
    const sortedParticipants = [...ratingDatabase].sort((a, b) => a.score - b.score);
    const top10 = sortedParticipants.slice(0, 10);
    let tableHTML = `<table><thead><tr><th>Место</th><th>Имя</th><th>Время</th></tr></thead><tbody>`;
    if(ratingDatabase.length == 0){
        tableHTML += `<tr><td colimg=3 >Здесь пока никого нет!</td></tr>`;
    }
    else{
        top10.forEach((participant, index) => {
            tableHTML += `<tr>
                    <td>${index + 1}</td>
                    <td>${participant.name}</td>
                    <td>${participant.score}</td></tr> `;
    });
    }
    tableHTML += `</tbody></table>`;
    document.getElementById("table").innerHTML = tableHTML;
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
        firstCard.querySelector('img').style.display = 'none';
        secondCard.querySelector('img').style.display = 'none';
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

createMemoryBoard();
getRating();