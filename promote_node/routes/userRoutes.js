const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const knowledgeController = require('../controllers/knowledgeController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// 公共路由
router.post('/register', userController.register);
router.post('/login', userController.login);

// 需要认证的路由
router.get('/me', authenticate, userController.getCurrentUser);
router.put('/update', authenticate, userController.updateUser);
router.put('/change-password', authenticate, userController.changePassword);
router.get('/stats', authenticate, userController.getUserStats);

// 知识点分析相关路由
router.get('/knowledge-radar', authenticate, knowledgeController.getKnowledgeRadar);
router.get('/learning-progress', authenticate, knowledgeController.getLearningProgress);
router.get('/weak-points', authenticate, knowledgeController.getWeakPoints);
router.get('/improved-points', authenticate, knowledgeController.getImprovedPoints);
router.get('/recommended-topics', authenticate, knowledgeController.getRecommendedTopics);
router.get('/knowledge-analysis', authenticate, knowledgeController.getFullAnalysis);
router.get('/trend', authenticate, knowledgeController.getUserTrend);

// 管理员路由
router.get('/all', authenticate, isAdmin, userController.getAllUsers);

module.exports = router; 