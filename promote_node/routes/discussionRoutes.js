const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const commentController = require('../controllers/commentController');
const reportController = require('../controllers/reportController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// 举报相关路由（放在前面以避免被其他路由拦截）
router.get('/reports/comments', authenticate, isAdmin, reportController.getCommentReports);
router.get('/reports/discussions', authenticate, isAdmin, reportController.getDiscussionReports);
router.post('/comments/:commentId/report', authenticate, reportController.reportComment);
router.post('/:discussionId/report', authenticate, reportController.reportDiscussion);

// 删除举报相关路由
router.delete('/reports/comments/:reportId', authenticate, isAdmin, reportController.deleteCommentReport);
router.delete('/reports/discussions/:reportId', authenticate, isAdmin, reportController.deleteDiscussionReport);

// 讨论相关路由
router.get('/', discussionController.getDiscussions); // 获取讨论列表
router.post('/', authenticate, discussionController.createDiscussion); // 创建讨论
router.get('/:id', discussionController.getDiscussion); // 获取单个讨论详情
router.put('/:id', authenticate, discussionController.updateDiscussion); // 更新讨论
router.delete('/:id', authenticate, discussionController.deleteDiscussion); // 删除讨论
router.get('/user/:userId?', authenticate, discussionController.getUserDiscussions); // 获取用户的讨论列表

// 评论相关路由
router.get('/:discussionId/comments', commentController.getComments); // 获取讨论的评论
router.post('/:discussionId/comments', authenticate, commentController.createComment); // 添加评论
router.put('/comments/:id', authenticate, commentController.updateComment); // 更新评论
router.delete('/comments/:id', authenticate, commentController.deleteComment); // 删除评论

// 点赞相关路由
router.post('/:id/like', authenticate, discussionController.likeDiscussion);
router.delete('/:id/like', authenticate, discussionController.unlikeDiscussion);
router.get('/:id/like', authenticate, discussionController.getLikeStatus);

module.exports = router; 