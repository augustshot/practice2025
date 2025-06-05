const pool = require('./db');
const bodyParser = require('body-parser');
const express = require('express');
const port = 3000;
const app = express();
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(express.static(path.join(__dirname, 'public')));
const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
    console.log(`Server listening on port ${server.address().port}`);
});

const select_query = 'SELECT t.title as test_title, q.question AS question_text, q.correct_ans AS correct_answer, GROUP_CONCAT(v.text ORDER BY v.id) AS options FROM tests t JOIN questions q ON t.id = q.test_id' +
" JOIN variants v ON q.id = v.question_id GROUP BY t.title, q.question, q.correct_ans"

// получить json-файл бд тестов
app.get('/tests', (request, response) => {
    pool.query(select_query, (error, result) => {
        if (error) throw error;
        response.send(result);
    });
});

// получить json-файл рейтинга
app.get('/rating', (request, response) => {
    pool.query("SELECT * FROM rating", (error, result) => {
        if (error) throw error;
        response.send(result);
    });
});

// добавить нового пользователя в рейтинг
app.post('/rating', (request, response) => {
    pool.query('INSERT INTO rating SET ?', request.body, (error, result) => {
        if (error) throw error;
        response.status(201).send(`User added with ID: ${result.insertId}`);
    });
});

// обновить счет существующего пользователя в рейтинге
app.put('/rating/:name', (request, response) => {
    const name = request.params.name;
    pool.query('UPDATE rating SET ? WHERE name = ?', [request.body, name], (error, result) => {
        if (error) throw error;
        response.send('User updated successfully.');
    });
});
