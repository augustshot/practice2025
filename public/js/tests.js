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
        const response = await fetch('/tests');
        if (!response.ok) {
            throw new Error('Не удалось загрузить тесты');
        }
        testsDatabase = await response.json();
        testsDatabase = SQLtoJson(testsDatabase);
        // console.log(testsDatabase);
        initTestSelection();
    } catch (error) {
        console.error('Ошибка загрузки тестов:', error);
        testCategories.innerHTML = '<p class="error">Не удалось загрузить тесты. Пожалуйста, попробуйте позже.</p>';
    }
}

// Выбор теста
function initTestSelection() {
    testCategories.innerHTML = '';
    
    for (const [testId, testData] of Object.entries(testsDatabase)) {
        const testElement = document.createElement('div');
        testElement.className = 'test-category';
        testElement.innerHTML = `
            <h3>${testData.title}${localStorage.getItem(testData.title) == 1 ? ' <span class="correct">(100%)</span>' : ''}</h3>
            <p style="font-size:20px;">Вопросов: ${testData.questions.length}</p>
        `;
        
        testElement.addEventListener('click', () => startTest(testId));
        testCategories.appendChild(testElement);
    }
}

function SQLtoJson(data) {
  const result = {};
  
  data.forEach(item => {
    const testTitle = item.test_title;
    
    // Если теста еще нет в результате, добавляем его
    if (!result[testTitle]) {
      result[testTitle] = {
        title: testTitle,
        questions: []
      };
    }
    
    // Добавляем вопрос в соответствующий тест
    result[testTitle].questions.push({
      question: item.question_text,
      correctAnswer: item.correct_answer,
      options: item.options.split(',') // Преобразуем строку в массив
    });
  });
  
  // Преобразуем объект в массив
  return Object.values(result);
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
        initTestSelection();
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
        <ol style="margin-top: 0.5rem;">
    `;
    
    test.questions.forEach((question, index) => {
        const userAnswerIndex = appState.answers[index];
        const isCorrect = userAnswerIndex === question.correctAnswer;
        
        if (isCorrect) correctAnswers++;
        
        resultsHTML += `
            <li style="margin-bottom: 0.8rem;">
                <p style="margin: 0.2rem 0;"><strong>Вопрос:</strong> ${question.question}</p>
                <p style="margin: 0.2rem 0;"><strong>Ваш ответ:</strong><span class=${isCorrect ? 'correct' : 'incorrect'}>
                ${userAnswerIndex !== undefined ? question.options[userAnswerIndex] : 'Нет ответа'}</span></p>
                ${!isCorrect ? `<p style="margin: 0.2rem 0;"><strong>Правильный ответ:</strong> ${question.options[question.correctAnswer]}</p>` : ''}
            <p></li>
        `;
    });
    
    resultsHTML += `</ol>`;
    resultsHTML += `<h3><p style="margin: 0.5rem 0 0 0; text-align: center;"><strong>Итого:</strong> ${correctAnswers} из ${test.questions.length} `;
    resultPercent = Math.round(correctAnswers / test.questions.length * 100);
    resultsHTML += `(` + resultPercent + `%)</p></h3>`;
    if(resultPercent == 100) localStorage.setItem(testsDatabase[appState.currentTest].title, 1);
    testContainer.style.gap=0;
    resultsContent.innerHTML = resultsHTML;
}

// Обработчики событий
backButton.addEventListener('click', backToSelection);
prevBtn.addEventListener('click', prevQuestion);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', () => startTest(appState.currentTest));

document.addEventListener('DOMContentLoaded', loadTests);