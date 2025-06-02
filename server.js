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

app.get('/tests', (request, response) => {
    pool.query(select_query, (error, result) => {
        if (error) throw error;
        response.send(result);
    });
});

app.get('/rating', (request, response) => {
    pool.query("SELECT * FROM rating", (error, result) => {
        if (error) throw error;
        response.send(result);
    });
});

app.post('/api/rating', async (req, res) => {
  try {
    const { name, score } = req.body;
    await pool.query('INSERT INTO rating (name, score) VALUES (?, ?)', [name, score]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});
