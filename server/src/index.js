require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const exerciseRoutes = require('./routes/exercises');
const templateRoutes = require('./routes/templates');
const workoutRoutes = require('./routes/workouts');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ 数据库连接成功');
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📚 API 文档: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ 数据库连接失败:', err);
    process.exit(1);
  });

module.exports = app;
