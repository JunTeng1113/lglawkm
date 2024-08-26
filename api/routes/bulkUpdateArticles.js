const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const path = require('path');

// Initialize SQLite database
const dbPath = path.resolve(__dirname, '../db/my-database.db');
const db = new sqlite3.Database(dbPath);
// Batch update endpoint
router.post('/bulk-update-articles', (req, res) => {
  console.log('Received request to update articles:', req.body);
  const articles = req.body;

  if (!Array.isArray(articles) || articles.length === 0) {
    return res.status(400).json({ error: 'No articles provided' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');

    let updatedCount = 0;
    let deletedCount = 0;

    // Update or insert the article
    const updateOrInsertArticle = (article, callback) => {
      const sql = `
        INSERT INTO constitution_articles (uuid, code, chapter_id, article_id, sub_article_id, 
          section_id, clause_id, item_id, sub_item_id, content, law_number, id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(uuid) DO UPDATE SET
          code = excluded.code,
          chapter_id = excluded.chapter_id,
          article_id = excluded.article_id,
          sub_article_id = excluded.sub_article_id,
          section_id = excluded.section_id,
          clause_id = excluded.clause_id,
          item_id = excluded.item_id,
          sub_item_id = excluded.sub_item_id,
          content = excluded.content,
          law_number = excluded.law_number,
          id = excluded.id
      `;

      const values = [
        article.uuid || null,
        article.code || null,
        article.chapter_id || null,
        article.article_id || null,
        article.sub_article_id || null,
        article.section_id || null,
        article.clause_id || null,
        article.item_id || null,
        article.sub_item_id || null,
        article.content || null,
        article.law_number || 4999, // Default to 4999 if law_number is not provided
        article.id || null,
      ];

      db.run(sql, values, function (err) {
        if (err) {
          console.error('Failed to update or insert article:', err.message);
          db.run('ROLLBACK;');
          return callback(err);
        }
        if (this.changes > 0) {
          updatedCount++;
        } else {
          deletedCount++;
        }
        callback();
      });
    };

    let i = 0;
    const nextUpdate = () => {
      if (i < articles.length) {
        updateOrInsertArticle(articles[i], (err) => {
          if (err) return;
          i++;
          nextUpdate();
        });
      } else {
        db.run('COMMIT;', (err) => {
          if (err) {
            console.error('Failed to commit transaction:', err.message);
            return res.status(500).json({ error: 'Failed to commit transaction' });
          }
          res.status(200).json({ message: `${updatedCount} articles updated successfully, ${deletedCount} articles deleted` });
        });
      }
    };

    nextUpdate();
  });
});


module.exports = router;
