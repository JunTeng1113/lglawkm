const express = require('express');
const router = express.Router();

const db = require('../dbConfig');
// Batch update endpoint
router.post('/delete-article', (req, res) => {
  console.log('Received request to delete article:', req.body);
  const article = req.body;

  if (!article) {
    return res.status(400).json({ error: 'No article provided' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');

    // Delete the article
    const deleteArticle = (article, callback) => {
      const sql = `
        DELETE FROM constitution_articles WHERE uuid = ?
      `;
      const values = [
        article.uuid
      ];

      db.run(sql, values, function (err) {
        if (err) {
          console.error('Failed to delete article:', err.message);
          db.run('ROLLBACK;');
          return callback(err);
        }
        console.log(`Deleted article with uuid ${article.uuid}`);
        callback();
      });
    };

    deleteArticle(article, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete article' });
      }
      db.run('COMMIT;');
      res.status(200).json({ message: 'Article deleted successfully' });
    });
  });
});

module.exports = router;