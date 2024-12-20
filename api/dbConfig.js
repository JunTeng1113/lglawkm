const sqlite3 = require('sqlite3').verbose();
const path = require('path');


// const envFile = process.env.DEV === 'TRUE' ? '.env.dev' : '.env.production';
const envFile = '.env.dev'

// 確保在最開始就載入環境變量
require('dotenv').config({ 
  path: path.resolve(__dirname, '..', envFile)
});

let db;

// 使用 process.env.DEV 來判斷環境
if (true) {
  // 開發環境使用 SQLite
  const dbPath = path.resolve(__dirname, 'db/my-database.db');
  console.log('Using SQLite database at:', dbPath);
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to SQLite:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });
} else {
  // 生產環境使用 PostgreSQL
  const { Pool } = require('pg');
  db = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  console.log('Using PostgreSQL database');
}

module.exports = db;