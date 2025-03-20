const Discussion = require('../models/discussionModel');
const Comment = require('../models/commentModel');
const Notification = require('../models/notificationModel');

// 创建新讨论
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, tag } = req.body;
    const authorId = req.user.id;

    // 验证必要字段
    if (!title || !content || !tag) {
      return res.status(400).json({ message: '请提供标题、内容和标签' });
    }

    // 验证标签值
    const validTags = ['题解', '讨论', '分享'];
    if (!validTags.includes(tag)) {
      return res.status(400).json({ message: '无效的标签值，请使用：题解、讨论或分享' });
    }

    // 创建讨论
    const discussion = await Discussion.create(title, content, authorId, tag);

    res.status(201).json({
      message: '讨论创建成功',
      discussion
    });
  } catch (error) {
    console.error('创建讨论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取讨论列表
exports.getDiscussions = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;

    const result = await Discussion.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      tag: tag || null
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('获取讨论列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取单个讨论
exports.getDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.getById(id);
    if (!discussion) {
      return res.status(404).json({ message: '讨论不存在' });
    }

    // 获取评论
    const comments = await Comment.getByDiscussionId(id);

    res.status(200).json({
      discussion,
      comments: comments.comments,
      pagination: comments.pagination
    });
  } catch (error) {
    console.error('获取讨论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新讨论
exports.updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tag } = req.body;
    const userId = req.user.id;

    // 获取讨论
    const discussion = await Discussion.getById(id);
    if (!discussion) {
      return res.status(404).json({ message: '讨论不存在' });
    }

    // 检查是否是作者或管理员
    if (discussion.author_id !== userId && req.user.role !== '管理员') {
      return res.status(403).json({ message: '没有权限修改此讨论' });
    }

    // 验证标签值
    if (tag) {
      const validTags = ['题解', '讨论', '分享'];
      if (!validTags.includes(tag)) {
        return res.status(400).json({ message: '无效的标签值，请使用：题解、讨论或分享' });
      }
    }

    // 更新讨论
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (tag) updateData.tag = tag;

    const updated = await Discussion.update(id, updateData);
    if (!updated) {
      return res.status(400).json({ message: '更新失败，没有提供有效的字段' });
    }

    // 获取更新后的讨论
    const updatedDiscussion = await Discussion.getById(id);

    res.status(200).json({
      message: '讨论更新成功',
      discussion: updatedDiscussion
    });
  } catch (error) {
    console.error('更新讨论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除讨论
exports.deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 获取讨论
    const discussion = await Discussion.getById(id);
    if (!discussion) {
      return res.status(404).json({ message: '讨论不存在' });
    }

    // 检查是否是作者或管理员
    if (discussion.author_id !== userId && req.user.role !== '管理员') {
      return res.status(403).json({ message: '没有权限删除此讨论' });
    }

    // 删除讨论
    const deleted = await Discussion.delete(id);
    if (!deleted) {
      return res.status(400).json({ message: '删除失败' });
    }

    res.status(200).json({ message: '讨论删除成功' });
  } catch (error) {
    console.error('删除讨论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户的讨论列表
exports.getUserDiscussions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await Discussion.getByUserId(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('获取用户讨论列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 点赞讨论
exports.likeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 获取讨论信息以便创建通知
    const discussion = await Discussion.getById(id);
    if (!discussion) {
      return res.status(404).json({ message: '讨论不存在' });
    }
    
    const result = await Discussion.likeDiscussion(id, userId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    // 如果点赞者不是讨论作者，则为讨论作者创建通知
    if (discussion.author_id !== userId) {
      const notificationContent = `用户 ${req.user.username} 点赞了您的讨论：${discussion.title}`;
      await Notification.create(
        discussion.author_id,
        notificationContent,
        '点赞',
        id
      );
    }
    
    res.status(200).json({ 
      message: result.message,
      likesCount: result.likesCount 
    });
  } catch (error) {
    console.error('点赞讨论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 取消点赞讨论
exports.unlikeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await Discussion.unlikeDiscussion(id, userId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.status(200).json({ 
      message: result.message,
      likesCount: result.likesCount 
    });
  } catch (error) {
    console.error('取消点赞讨论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取讨论点赞状态
exports.getLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const isLiked = await Discussion.isLikedByUser(id, userId);
    const likesCount = await Discussion.getLikesCount(id);
    
    res.status(200).json({ 
      isLiked,
      likesCount
    });
  } catch (error) {
    console.error('获取点赞状态错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 