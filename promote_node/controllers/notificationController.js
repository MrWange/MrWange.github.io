const Notification = require('../models/notificationModel');

// 获取用户的所有通知
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const result = await Notification.getUserNotifications(
      userId,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('获取用户通知错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取未读通知数量
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.getUnreadCount(userId);
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('获取未读通知数量错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 标记通知为已读
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const success = await Notification.markAsRead(id, userId);
    
    if (!success) {
      return res.status(404).json({ message: '通知不存在或不属于当前用户' });
    }
    
    res.status(200).json({ message: '通知已标记为已读' });
  } catch (error) {
    console.error('标记通知已读错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 标记所有通知为已读
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.markAllAsRead(userId);
    
    res.status(200).json({ 
      message: '所有通知已标记为已读',
      count 
    });
  } catch (error) {
    console.error('标记所有通知已读错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除通知
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const success = await Notification.delete(id, userId);
    
    if (!success) {
      return res.status(404).json({ message: '通知不存在或不属于当前用户' });
    }
    
    res.status(200).json({ message: '通知已删除' });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 清空所有通知
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.deleteAll(userId);
    
    res.status(200).json({ 
      message: '所有通知已清空',
      count 
    });
  } catch (error) {
    console.error('清空通知错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 创建测试通知（仅用于开发测试）
exports.createTestNotification = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: '该功能仅在开发环境中可用' });
    }
    
    const userId = req.user.id;
    const { content, type = '系统' } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: '请提供通知内容' });
    }
    
    const notification = await Notification.create(userId, content, type);
    
    res.status(201).json({
      message: '测试通知创建成功',
      notification
    });
  } catch (error) {
    console.error('创建测试通知错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 