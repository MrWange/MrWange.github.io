const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// 所有管理员路由都需要认证和管理员权限
router.use(authenticate);
router.use(isAdmin);

// 获取所有通知
router.get('/notifications', adminController.getAllNotifications);

// 创建系统通知
router.post('/notifications', adminController.createSystemNotification);

// 删除通知
router.delete('/notifications/:id', adminController.deleteNotification);

// 获取最近活动
router.get('/recent-activities', adminController.getRecentActivities);

// 获取仪表板统计数据
router.get('/dashboard-stats', adminController.getDashboardStats);

// 获取用户详情
router.get('/users/:id/detail', adminController.getUserDetail);

// 获取用户统计数据
router.get('/user-stats', adminController.getUserStats);

// 获取所有评论
router.get('/comments', adminController.getAllComments);

// 获取评论详情
router.get('/comments/:id/detail', adminController.getCommentDetail);

module.exports = router; 