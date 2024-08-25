const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // 用於處理跨域請求
const bodyParser = require('body-parser');
const bulkAddArticles = require('./routes/bulkAddArticles');
const bulkUpdateArticles = require('./routes/bulkUpdateArticles');
const deleteArticle = require('./routes/DeleteArticle');
const regulations = require('./routes/regulations');

const app = express();
const port = 3000; // 後端伺服器的端口

app.use(cors()); // 啟用 CORS
app.use(express.json());

app.use('/api', bulkAddArticles);
// Use the bulk update route
app.use('/api', bulkUpdateArticles);
app.use('/api', deleteArticle);
app.use('/api', regulations);

// 打開資料庫
const db = new sqlite3.Database('./db/my-database.db');


// 解析 application/json
app.use(bodyParser.json());

// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// 獲取所有條文
app.get('/law', (req, res) => {
  db.all('SELECT * FROM constitution_articles', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post('/api/add-article', (req, res) => {
  const {
    id, code, chapter_id, article_id, sub_article_id, section_id,
    clause_id, item_id, sub_item_id, content, law_number
  } = req.body;

  const query = `
    INSERT INTO constitution_articles (id, code, chapter_id, article_id, sub_article_id, section_id, clause_id, item_id, sub_item_id, content, law_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    id, code, chapter_id, article_id, sub_article_id, section_id,
    clause_id, item_id, sub_item_id, content, law_number
  ], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Failed to add article');
    } else {
      res.status(200).send('Article added successfully');
    }
  });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
