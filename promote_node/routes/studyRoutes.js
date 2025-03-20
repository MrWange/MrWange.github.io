const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { authenticate } = require('../middlewares/authMiddleware');

// 所有路由都需要认证
router.use(authenticate);

// 记录学习时间
router.post('/record', studyController.recordStudyTime);

// 获取学习记录
router.get('/records', studyController.getStudyRecords);

// 获取今日学习时间
router.get('/today', studyController.getTodayStudyTime);

// 获取本周学习时间
router.get('/weekly', studyController.getWeeklyStudyTime);

module.exports = router; 