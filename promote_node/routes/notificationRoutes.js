const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/authMiddleware');

// 所有通知路由都需要认证
router.use(authenticate);

// 获取用户的所有通知
router.get('/', notificationController.getUserNotifications);

// 获取未读通知数量
router.get('/unread-count', notificationController.getUnreadCount);

// 标记通知为已读
router.put('/:id/read', notificationController.markAsRead);

// 标记所有通知为已读
router.put('/mark-all-read', notificationController.markAllAsRead);

// 删除通知
router.delete('/:id', notificationController.deleteNotification);

// 清空所有通知
router.delete('/', notificationController.deleteAllNotifications);

// 创建测试通知（仅用于开发测试）
router.post('/test', notificationController.createTestNotification);

module.exports = router; 