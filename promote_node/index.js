const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');
const studyRoutes = require('./routes/studyRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const contestRoutes = require('./routes/contestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域支持
app.use(express.json()); // 解析JSON请求体

// 路由
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误', error: err.message });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`服务器运行在端口 ${PORT}`);
  await testConnection();
});
