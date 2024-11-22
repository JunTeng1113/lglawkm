const express = require('express');

const router = express.Router();

const db = require('../dbConfig');

// Endpoint to fetch regulation and articles
router.get('/regulations', (req, res) => {
  const lawNumber = req.query.law_number ? req.query.law_number : undefined;

  if (lawNumber === undefined) {
    // Fetch all regulations with their details
    db.all(`
      SELECT r.*, ca.* 
      FROM regulations r 
      LEFT JOIN constitution_articles ca 
      ON r.regulation_number = ca.law_number 
      ORDER BY r.regulation_number, ca.id`, 
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const regulationsMap = new Map();

      rows.forEach(row => {
        if (!regulationsMap.has(row.regulation_number)) {
          regulationsMap.set(row.regulation_number, {
            regulation_number: row.regulation_number,
            regulation_name: row.regulation_name,
            competent_authority: row.competent_authority,
            updated_at: row.updated_at,
            articles: []
          });
        }

        if (row.uuid) {
          const regulation = regulationsMap.get(row.regulation_number);
          regulation.articles.push(row);
        }
      });

      const result = Array.from(regulationsMap.values());
      res.json(result);
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
          competent_authority: regulation.competent_authority,
          updated_at: regulation.updated_at,
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
