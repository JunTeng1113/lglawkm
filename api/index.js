const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bulkAddArticles = require('./routes/bulkAddArticles');
const bulkUpdateArticles = require('./routes/bulkUpdateArticles');
const deleteArticle = require('./routes/DeleteArticle');
const regulations = require('./routes/regulations');
const path = require('path');

const envFile = process.env.DEV === 'TRUE' ? '.env.dev' : '.env.production';

// 確保在最開始就載入環境變量
require('dotenv').config({ 
  path: path.resolve(__dirname, '..', envFile)
});

const app = express();
const port = process.env.PORT || 3000;

// 中間件配置
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));


console.log('Current Environment:', process.env.DEV === 'TRUE' ? 'Development' : 'Production');
console.log('Using env file:', envFile);
console.log('Database URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL : 'Not Set');

// API 路由
app.use('/api', bulkAddArticles);
app.use('/api', bulkUpdateArticles);
app.use('/api', deleteArticle);
app.use('/api', regulations);

// 生產環境靜態文件服務
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// 分離 app 和 server 啟動
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at ${process.env.VITE_API_URL}`);
  });
}

module.exports = app;

