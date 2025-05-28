// Данные теста
const testData = {
    title: "Тест на общие знания",
    questions: [
        {
            question: "Какая планета самая большая в Солнечной системе?",
            options: ["Марс", "Венера", "Юпитер", "Земля"],
            correctAnswer: 2
        },
        {
            question: "Какой язык программирования считается самым популярным в 2023 году?",
            options: ["Python", "JavaScript", "Java", "C++", "C#"],
            correctAnswer: 1
        },
        {
            question: "Сколько континентов на Земле?",
            options: ["5", "6", "7", "4", "8"],
            correctAnswer: 2
        },
        {
            question: "Кто написал роман 'Война и мир'?",
            options: ["Фёдор Достоевский", "Александр Пушкин", "Лев Толстой", "Антон Чехов", "Иван Тургенев"],
            correctAnswer: 2
        },
        {
            question: "Какая самая длинная река в мире?",
            options: ["Амазонка", "Нил", "Янцзы", "Миссисипи", "Конго"],
            correctAnswer: 0
        }
    ]
};

// Состояние теста
const testState = {
    currentQuestion: 0,
    answers: [],
    completed: false
};

// Элементы DOM
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const resultsContainer = document.getElementById('results-container');
const resultsContent = document.getElementById('results-content');

// Инициализация теста
function initTest() {
    totalQuestionsSpan.textContent = testData.questions.length;
    loadQuestion(testState.currentQuestion);
}

// Загрузка вопроса
function loadQuestion(index) {
    const question = testData.questions[index];
    questionText.textContent = question.question;
    // Обновляем прогресс-бар
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        const progressPercent = ((index + 1) / testData.questions.length) * 100;
        progressFill.style.width = `${progressPercent}%`;
    }
        
    optionsContainer.innerHTML = '';
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        
        // Проверяем, был ли уже выбран этот вариант
        if (testState.answers[index] !== undefined && testState.answers[index] === i) {
            optionElement.classList.add('selected');
        }
        
        optionElement.addEventListener('click', () => selectOption(index, i));
        optionsContainer.appendChild(optionElement);
    });
    
    currentQuestionSpan.textContent = index + 1;
    
    // Обновляем состояние кнопок навигации
    prevBtn.disabled = index === 0;
    
    if (index === testData.questions.length - 1) {
        nextBtn.textContent = 'Завершить';
    } else {
        nextBtn.textContent = 'Далее';
    }
}

// Выбор варианта ответа
function selectOption(questionIndex, optionIndex) {
    // Снимаем выделение со всех вариантов
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Выделяем выбранный вариант
    options[optionIndex].classList.add('selected');
    
    // Сохраняем ответ
    testState.answers[questionIndex] = optionIndex;
}

// Переход к следующему вопросу
function nextQuestion() {
    if (testState.currentQuestion < testData.questions.length - 1) {
        testState.currentQuestion++;
        loadQuestion(testState.currentQuestion);
    } else {
        // Завершение теста
        completeTest();
    }
}

// Переход к предыдущему вопросу
function prevQuestion() {
    if (testState.currentQuestion > 0) {
        testState.currentQuestion--;
        loadQuestion(testState.currentQuestion);
    }
}

// Завершение теста
function completeTest() {
    testState.completed = true;
    
    // Скрываем вопросы и показываем результаты
    document.querySelector('.progress').style.display = 'none';
    document.querySelector('.question').style.display = 'none';
    optionsContainer.style.display = 'none';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    
    // Показываем результаты
    showResults();
    resultsContainer.style.display = 'block';
}

// Показать результаты
function showResults() {
    let correctAnswers = 0;
    let resultsHTML = '<ol>';
    
    testData.questions.forEach((question, index) => {
        const userAnswerIndex = testState.answers[index];
        const isCorrect = userAnswerIndex === question.correctAnswer;
        
        if (isCorrect) correctAnswers++;
        
        resultsHTML += `
            <li>
                <p><strong>Вопрос:</strong> ${question.question}</p>
                <p><strong>Ваш ответ:</strong> ${userAnswerIndex !== undefined ? question.options[userAnswerIndex] : 'Нет ответа'} 
                ${isCorrect ? '✔' : '✕'}</p>
                ${!isCorrect ? `<p><strong>Правильный ответ:</strong> ${question.options[question.correctAnswer]}</p>` : ''}
            </li>
        `;
    });
    
    resultsHTML += '</ol>';
    resultsHTML += `<p><strong>Итого:</strong> ${correctAnswers} из ${testData.questions.length} правильных ответов (${Math.round(correctAnswers / testData.questions.length * 100)}%)</p>`;
    
    resultsContent.innerHTML = resultsHTML;
}

// Скачать результаты в JSON
function downloadResults() {
    const results = {
        testTitle: testData.title,
        date: new Date().toISOString(),
        answers: testState.answers.map((answer, index) => ({
            question: testData.questions[index].question,
            userAnswer: answer !== undefined ? testData.questions[index].options[answer] : null,
            correctAnswer: testData.questions[index].options[testData.questions[index].correctAnswer],
            isCorrect: answer === testData.questions[index].correctAnswer
        })),
        totalCorrect: testState.answers.reduce((acc, answer, index) => 
            acc + (answer === testData.questions[index].correctAnswer ? 1 : 0), 0),
        totalQuestions: testData.questions.length
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `test_results_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Обработчики событий
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);

// Запуск теста
initTest();