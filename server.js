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

// Роут для получения данных из БД
app.get('/tests', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT "
+"    t.id AS test_id,"
+"    t.title AS test_title,"
+"    q.id AS question_id,"
+"    q.text AS question_text,"
+"    q.correct_ans AS correct_answer,"
+"    ("
+"        SELECT JSON_ARRAYAGG(v.text ORDER BY v.id)"
+"        FROM variants v"
+"        WHERE v.question_id = q.id"
+"    ) AS variant_options"
+"FROM "
+"    tests t"
+"JOIN "
+"    questions q ON t.id = q.test_id"
+"GROUP BY "
+"    t.id, t.title, t.description, q.id, q.text, q.correct_ans"
+"ORDER BY "
+"    t.id, q.id;");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Роут для добавления данных
// app.post('/api/data', async (req, res) => {
//   try {
//     const { name, score } = req.body;
//     await pool.query('INSERT INTO test_results (name, score) VALUES (?, ?)', [name, score]);
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Insert failed' });
//   }
// });