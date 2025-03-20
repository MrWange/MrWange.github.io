const Comment = require('../models/commentModel');
const Discussion = require('../models/discussionModel');
const Notification = require('../models/notificationModel');

// 创建评论
exports.createComment = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    // 验证必要字段
    if (!content) {
      return res.status(400).json({ message: '请提供评论内容' });
    }

    // 检查讨论是否存在
    const discussion = await Discussion.getById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: '讨论不存在' });
    }

    // 创建评论
    const comment = await Comment.create(discussionId, authorId, content);

    // 获取完整评论信息（包括作者信息）
    const fullComment = await Comment.getById(comment.id);

    // 如果评论者不是讨论作者，则为讨论作者创建通知
    if (discussion.author_id !== authorId) {
      const notificationContent = `用户 ${req.user.username} 评论了您的讨论：${discussion.title}`;
      await Notification.create(
        discussion.author_id,
        notificationContent,
        '评论',
        discussionId
      );
    }

    res.status(201).json({
      message: '评论发布成功',
      comment: fullComment
    });
  } catch (error) {
    console.error('创建评论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取讨论的评论列表
exports.getComments = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 检查讨论是否存在
    const discussion = await Discussion.getById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: '讨论不存在' });
    }

    const result = await Comment.getByDiscussionId(
      discussionId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新评论
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // 验证必要字段
    if (!content) {
      return res.status(400).json({ message: '请提供评论内容' });
    }

    // 获取评论信息
    const comment = await Comment.getById(id);
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 检查是否是作者或管理员
    if (comment.author_id !== userId && req.user.role !== '管理员') {
      return res.status(403).json({ message: '没有权限修改此评论' });
    }

    // 更新评论
    const updated = await Comment.update(id, userId, content);
    if (!updated) {
      return res.status(400).json({ message: '更新失败' });
    }

    // 获取更新后的评论
    const updatedComment = await Comment.getById(id);

    res.status(200).json({
      message: '评论更新成功',
      comment: updatedComment
    });
  } catch (error) {
    console.error('更新评论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === '管理员';

    // 获取评论信息
    const comment = await Comment.getById(id);
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 删除评论
    const deleted = await Comment.delete(id, userId, isAdmin);
    if (!deleted) {
      return res.status(403).json({ message: '没有权限删除此评论' });
    }

    res.status(200).json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 