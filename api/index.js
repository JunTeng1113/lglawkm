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

// 解析 application/json
app.use(bodyParser.json());

// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
