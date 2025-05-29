let testsDatabase = {};
const appState = {
    currentTest: null,
    currentQuestion: 0,
    answers: [],
    completed: false
};

// Получаем элементы DOM
const testSelection = document.getElementById('test-selection');
const testContainer = document.getElementById('test-container');
const testCategories = document.getElementById('test-categories');
const backButton = document.getElementById('back-button');
const testTitle = document.getElementById('test-title');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const resultsContainer = document.getElementById('results-container');
const resultsContent = document.getElementById('results-content');
const restartBtn = document.getElementById('restart-btn');

async function loadTests() {
    try {
        const response = await fetch('questinos.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить тесты');
        }
        testsDatabase = await response.json();
        initTestSelection();
    } catch (error) {
        console.error('Ошибка загрузки тестов:', error);
        testCategories.innerHTML = '<p class="error">Не удалось загрузить тесты. Пожалуйста, попробуйте позже.</p>';
    }
}

// Инициализация выбора теста
function initTestSelection() {
    testCategories.innerHTML = '';
    
    for (const [testId, testData] of Object.entries(testsDatabase)) {
        const testElement = document.createElement('div');
        testElement.className = 'test-category';
        testElement.innerHTML = `
            <h3>${testData.title}</h3>
            <p>${testData.description}</p>
            <p>Вопросов: ${testData.questions.length}</p>
        `;
        
        testElement.addEventListener('click', () => startTest(testId));
        testCategories.appendChild(testElement);
    }
}


// Начало теста
function startTest(testId, resetProgress = true) {
    appState.currentTest = testId;
    
    if (resetProgress) {
        appState.currentQuestion = 0;
        appState.answers = [];
        appState.completed = false;
    }
    
    testTitle.textContent = testsDatabase[testId].title;
    testSelection.style.display = 'none';
    testContainer.style.display = 'grid';
    
    // Показываем все элементы вопроса (на случай повторного прохождения)
    document.querySelector('.progress').style.display = 'grid';
    questionText.style.display = 'grid';
    optionsContainer.style.display = 'grid';
    prevBtn.style.display = 'grid';
    nextBtn.style.display = 'grid';
    testContainer.style.gap= "1.5rem";
    
    loadQuestion(appState.currentQuestion);
}

// Возврат к выбору теста
function backToSelection() {
    testSelection.style.display = 'block';
    testContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
}

// Загрузка вопроса
function loadQuestion(index) {
    const test = testsDatabase[appState.currentTest];
    const question = test.questions[index];
    
    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        
        if (appState.answers[index] !== undefined && appState.answers[index] === i) {
            optionElement.classList.add('selected');
        }
        
        optionElement.addEventListener('click', () => selectOption(index, i));
        optionsContainer.appendChild(optionElement);
    });
    
    currentQuestionSpan.textContent = index + 1;
    totalQuestionsSpan.textContent = test.questions.length;
    
    // Обновляем прогресс-бар
    updateProgressBar(index, test.questions.length);
    
    // Обновляем кнопки навигации
    updateNavigationButtons(index, test.questions.length);
    
    // Скрываем результаты если они были показаны
    resultsContainer.style.display = 'none';
}

// Обновление прогресс-бара
function updateProgressBar(currentIndex, totalQuestions) {
    const progressFill = document.querySelector('.progress-fill');
    const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
    progressFill.style.width = `${progressPercent}%`;
}

// Обновление кнопок навигации
function updateNavigationButtons(currentIndex, totalQuestions) {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.textContent = currentIndex === totalQuestions - 1 ? 'Завершить' : 'Далее';
}

// Выбор варианта ответа
function selectOption(questionIndex, optionIndex) {
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    options[optionIndex].classList.add('selected');
    appState.answers[questionIndex] = optionIndex;
}

// Переход к следующему вопросу
function nextQuestion() {
    const test = testsDatabase[appState.currentTest];
    
    if (appState.currentQuestion < test.questions.length - 1) {
        appState.currentQuestion++;
        loadQuestion(appState.currentQuestion);
    } else {
        completeTest();
    }
}

// Переход к предыдущему вопросу
function prevQuestion() {
    if (appState.currentQuestion > 0) {
        appState.currentQuestion--;
        loadQuestion(appState.currentQuestion);
    }
}

// Завершение теста
function completeTest() {
    appState.completed = true;
    
    // Скрываем элементы вопроса
    document.querySelector('.progress').style.display = 'none';
    questionText.style.display = 'none';
    optionsContainer.style.display = 'none';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    
    // Показываем результаты
    showResults();
    resultsContainer.style.display = 'grid';
}

// Обработчик кнопки "Пройти заново" (обновленный)
restartBtn.addEventListener('click', () => {
    // Полностью сбрасываем прогресс при перезапуске
    startTest(appState.currentTest, true);
});

// Показать результаты
function showResults() {
    const test = testsDatabase[appState.currentTest];
    let correctAnswers = 0;
    
    // Создаем более компактный HTML для результатов
    let resultsHTML = `
        <h3>Результаты:</h3>
        <ol style="margin-top: 0.5rem;">
    `;
    
    test.questions.forEach((question, index) => {
        const userAnswerIndex = appState.answers[index];
        const isCorrect = userAnswerIndex === question.correctAnswer;
        
        if (isCorrect) correctAnswers++;
        
        resultsHTML += `
            <li style="margin-bottom: 0.8rem;">
                <p style="margin: 0.2rem 0;"><strong>Вопрос:</strong> ${question.question}</p>
                <p style="margin: 0.2rem 0;"><strong>Ваш ответ:</strong> 
                ${userAnswerIndex !== undefined ? question.options[userAnswerIndex] : 'Нет ответа'} 
                ${isCorrect ? '✅' : '❌'}</p>
                ${!isCorrect ? `<p style="margin: 0.2rem 0;"><strong>Правильно:</strong> ${question.options[question.correctAnswer]}</p>` : ''}
            </li>
        `;
    });
    
    resultsHTML += `</ol>`;
    resultsHTML += `<p style="margin: 0.5rem 0 0 0;"><strong>Итого:</strong> ${correctAnswers} из ${test.questions.length} `;
    resultsHTML += `(${Math.round(correctAnswers / test.questions.length * 100)}%)</p>`;
    testContainer.style.gap=0;
    resultsContent.innerHTML = resultsHTML;
    saveResults();
}

// Скачать результаты в JSON
function saveResults() {
    const test = testsDatabase[appState.currentTest];
    
    const results = {
        testTitle: test.title,
        date: new Date().toISOString(),
        answers: appState.answers.map((answer, index) => ({
            question: test.questions[index].question,
            userAnswer: answer !== undefined ? test.questions[index].options[answer] : null,
            correctAnswer: test.questions[index].options[test.questions[index].correctAnswer],
            isCorrect: answer === test.questions[index].correctAnswer
        })),
        totalCorrect: appState.answers.reduce((acc, answer, index) => 
            acc + (answer === test.questions[index].correctAnswer ? 1 : 0), 0),
        totalQuestions: test.questions.length,
        percentage: Math.round((appState.answers.reduce((acc, answer, index) => 
            acc + (answer === test.questions[index].correctAnswer ? 1 : 0), 0) / test.questions.length) * 100)
    };
    
    //saveResultsToFile(results);
}

/*async function sendResultsToServer(results) {
    try {
        const response = await fetch('/api/save-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results)
        });
        if (!response.ok) throw new Error('Ошибка сохранения');
        console.log('Результаты сохранены на сервере');
    } catch (error) {
        console.error('Ошибка:', error);
    }
}*/

// Обработчики событий
backButton.addEventListener('click', backToSelection);
prevBtn.addEventListener('click', prevQuestion);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', () => startTest(appState.currentTest));

document.addEventListener('DOMContentLoaded', loadTests);