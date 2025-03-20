const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// 公共路由
router.get('/', contestController.getContests); // 获取竞赛列表
router.get('/:id', contestController.getContest); // 获取单个竞赛详情

// 需要认证的路由
router.post('/:contestId/register', authenticate, contestController.registerForContest); // 报名竞赛
router.delete('/:contestId/register', authenticate, contestController.cancelRegistration); // 取消报名
router.get('/:contestId/check-registration', authenticate, contestController.checkRegistration); // 检查报名状态
router.get('/user/registered', authenticate, contestController.getUserContests); // 获取用户报名的竞赛

// 管理员路由
router.post('/', authenticate, isAdmin, contestController.createContest); // 创建竞赛
router.put('/:id', authenticate, isAdmin, contestController.updateContest); // 更新竞赛
router.delete('/:id', authenticate, isAdmin, contestController.deleteContest); // 删除竞赛
router.get('/:contestId/users', authenticate, isAdmin, contestController.getRegisteredUsers); // 获取报名用户列表

module.exports = router; 