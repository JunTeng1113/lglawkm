const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, './db/my-database.db');
const db = new sqlite3.Database(dbPath);

module.exports = db;