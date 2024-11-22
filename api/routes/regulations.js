const express = require('express');

const router = express.Router();

const db = require('../dbConfig');

// Endpoint to fetch regulation and articles
router.get('/regulations', (req, res) => {
  const lawNumber = req.query.law_number ? req.query.law_number : undefined;

  if (lawNumber === undefined) {
    // Fetch all regulations
    db.all('SELECT * FROM constitution_articles, regulations WHERE constitution_articles.law_number = regulations.regulation_number ORDER BY uuid', (err, articles) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(articles.reduce((acc, article) => {
        const regulation = acc.find((regulation) => regulation.regulation_number === article.law_number);
        if (regulation) {
          regulation.articles.push(article);
        } else {
          acc.push({
            regulation_number: article.law_number,
            regulation_name: article.regulation_name,
            articles: [article]
          });
        }
        return acc;
      }, []));
    });
  } else {
    // Fetch regulation details
    db.get('SELECT * FROM regulations WHERE regulation_number = ?', [lawNumber], (err, regulation) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!regulation) {
        return res.status(404).json({ error: 'Regulation not found' });
      }

      // Fetch articles
      db.all('SELECT * FROM constitution_articles WHERE law_number = ? ORDER BY id', [lawNumber], (err, articles) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Combine regulation and articles
        res.json({
          regulation_name: regulation.regulation_name,
          articles: articles
        });
      });
    });
  }
});

// 新增法規
router.post('/regulations/create', (req, res) => {
  const { regulation_name, authority, update_date } = req.body;
  
  db.run(
    'INSERT INTO regulations (regulation_name, authority, update_date) VALUES (?, ?, ?)',
    [regulation_name, authority, update_date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, regulation_name, authority, update_date });
    }
  );
});

// 更新法規
router.put('/regulations/update', (req, res) => {
  const { id, regulation_name, authority, update_date } = req.body;
  
  db.run(
    'UPDATE regulations SET regulation_name = ?, authority = ?, update_date = ? WHERE id = ?',
    [regulation_name, authority, update_date, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, regulation_name, authority, update_date });
    }
  );
});

// 刪除法規
router.delete('/regulations/delete', (req, res) => {
  const { id } = req.body;
  
  db.run('DELETE FROM regulations WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: '法規已刪除' });
  });
});

module.exports = router;
