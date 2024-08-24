const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const path = require('path');

// 初始化 SQLite 資料庫
const dbPath = path.resolve(__dirname, '../db/my-database.db');
const db = new sqlite3.Database(dbPath);

// Endpoint to fetch regulation and articles
router.get('/regulations', (req, res) => {
  const lawNumber = req.query.law_number ? req.query.law_number : undefined;

  if (lawNumber === undefined) {
    // Fetch all regulations
    db.all('SELECT * FROM constitution_articles', (err, articles) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        articles: articles
      });
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
      db.all('SELECT * FROM constitution_articles WHERE law_number = ?', [lawNumber], (err, articles) => {
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

module.exports = router;
