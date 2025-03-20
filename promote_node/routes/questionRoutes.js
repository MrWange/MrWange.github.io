const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const attemptController = require('../controllers/attemptController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// 答题记录相关路由（需要认证）
router.post('/attempt', authenticate, attemptController.recordAttempt);
router.get('/attempt/history', authenticate, attemptController.getAttemptHistory);
router.get('/attempt/stats', authenticate, attemptController.getAttemptStats);
router.get('/today-completed', authenticate, attemptController.getTodayCompleted);
router.get('/streak-info', authenticate, attemptController.getStreakInfo);
router.get('/learning-data', authenticate, attemptController.getUserLearningData);

// 收藏相关路由
router.post('/:id/favorite', authenticate, questionController.addToFavorites);
router.delete('/:id/favorite', authenticate, questionController.removeFromFavorites);
router.get('/user/favorites', authenticate, questionController.getUserFavorites);

// 公共路由
router.get('/', questionController.getQuestions);
router.get('/category/:category', questionController.getQuestionsByCategory);
router.get('/difficulty/:difficulty', questionController.getQuestionsByDifficulty);
router.get('/random', questionController.getRandomQuestion);
router.get('/user/attempts', authenticate, attemptController.getAttemptHistory);
router.get('/attempt/:questionId', authenticate, attemptController.getQuestionAttempts);
router.get('/:id', questionController.getQuestion);

// 需要认证的路由
router.post('/:id/submit', authenticate, questionController.submitAnswer);

// 管理员路由
router.post('/', authenticate, isAdmin, questionController.createQuestion);
router.put('/:id', authenticate, isAdmin, questionController.updateQuestion);
router.delete('/:id', authenticate, isAdmin, questionController.deleteQuestion);

module.exports = router; 