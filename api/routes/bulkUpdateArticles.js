const express = require('express');
const router = express.Router();
const db = require('../dbConfig');

router.post('/bulk-update-articles/:id', (req, res) => {
  const { id } = req.params;
  const articles = req.body;

  if (!Array.isArray(articles) || articles.length === 0) {
    return res.status(400).json({ error: 'No articles provided' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');

    let updatedCount = 0;
    let addedCount = 0;

    const processArticle = (article, callback) => {
      // 檢查是否存在相同的條文內容
      const checkSql = `
        SELECT uuid FROM constitution_articles 
        WHERE law_number = ? AND
              code = ? AND
              chapter_id = ? AND 
              article_id = ? AND
              sub_article_id = ? AND
              section_id = ? AND
              clause_id = ? AND
              item_id = ? AND
              sub_item_id = ? AND
              content = ?
      `;

      const checkValues = [
        id,
        article.code,
        article.chapter_id,
        article.article_id,
        article.sub_article_id,
        article.section_id,
        article.clause_id,
        article.item_id,
        article.sub_item_id,
        article.content
      ];

      db.get(checkSql, checkValues, (err, existingArticle) => {
        if (err) {
          return callback(err);
        }

        if (existingArticle) {
          // 如果已存在完全相同的條文,跳過此筆
          callback();
        } else {
          // 檢查是否存在相同uuid的條文
          const checkUuidSql = `
            SELECT uuid FROM constitution_articles 
            WHERE uuid = ?
          `;

          db.get(checkUuidSql, [article.uuid], (err, existingUuid) => {
            if (err) {
              return callback(err);
            }

            if (existingUuid) {
              // 如果存在相同uuid，則更新資料
              const updateSql = `
                UPDATE constitution_articles 
                SET code = ?, 
                    chapter_id = ?,
                    article_id = ?,
                    sub_article_id = ?,
                    section_id = ?,
                    clause_id = ?,
                    item_id = ?,
                    sub_item_id = ?,
                    content = ?,
                    law_number = ?
                WHERE uuid = ?
              `;
              const updateValues = [
                article.code,
                article.chapter_id,
                article.article_id,
                article.sub_article_id,
                article.section_id,
                article.clause_id,
                article.item_id,
                article.sub_item_id,
                article.content,
                id,
                article.uuid
              ];

              db.run(updateSql, updateValues, function(err) {
                if (err) return callback(err);
                updatedCount++;
                callback();
              });
            } else {
              // 如果uuid不存在且內容不重複，則新增條文
              const insertSql = `
                INSERT INTO constitution_articles (
                  uuid, code, chapter_id, article_id, sub_article_id, 
                  section_id, clause_id, item_id, sub_item_id, 
                  content, law_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              const insertValues = [
                article.uuid || generateUUID(),
                article.code,
                article.chapter_id,
                article.article_id,
                article.sub_article_id,
                article.section_id,
                article.clause_id,
                article.item_id,
                article.sub_item_id,
                article.content,
                id
              ];

              db.run(insertSql, insertValues, function(err) {
                if (err) return callback(err);
                addedCount++;
                callback();
              });
            }
          });
        }
      });
    };

    let processed = 0;
    const processNext = () => {
      if (processed < articles.length) {
        processArticle(articles[processed], (err) => {
          if (err) {
            db.run('ROLLBACK;');
            return res.status(500).json({ error: err.message });
          }
          processed++;
          processNext();
        });
      } else {
        db.run('COMMIT;', (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to commit transaction' });
          }
          res.json({
            success: true,
            updated: updatedCount,
            added: addedCount
          });
        });
      }
    };

    processNext();
  });
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

module.exports = router;
