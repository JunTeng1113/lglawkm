const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const path = require('path');

// 初始化 SQLite 資料庫
const dbPath = '../db/my-database.db';
const db = new sqlite3.Database(dbPath);

// 批量新增文章的端點
router.post('/bulk-add-articles', (req, res) => {
  console.log('Received request to add articles:', req.body);
  const articles = req.body;

  if (!Array.isArray(articles) || articles.length === 0) {
    return res.status(400).json({ error: 'No articles provided' });
  }

  const placeholders = articles.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
  const values = articles.flatMap(article => [
    article.id,
    article.code,
    article.chapter_id,
    article.article_id,
    article.sub_article_id,
    article.section_id,
    article.clause_id,
    article.item_id,
    article.sub_item_id,
    article.content,
    article.law_number,
  ]);

  const sql = `
    INSERT INTO constitution_articles (
      id, code, chapter_id, article_id, sub_article_id, section_id, 
      clause_id, item_id, sub_item_id, content, law_number
    ) VALUES ${placeholders}
  `;

  db.run(sql, values, function (err) {
    if (err) {
      console.error('Failed to insert articles:', err.message);
      return res.status(500).json({ error: 'Failed to add articles' });
    }

    res.status(200).json({ message: `${this.changes} articles added successfully` });
  });
});

module.exports = router;
