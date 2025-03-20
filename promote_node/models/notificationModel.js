const { pool } = require('../config/db');

class Notification {
  // 创建新通知
  async create(userId, content, type, relatedId = null) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO notifications (user_id, content, type, related_id) VALUES (?, ?, ?, ?)',
        [userId, content, type, relatedId]
      );
      
      return { 
        id: result.insertId,
        user_id: userId,
        content,
        type,
        related_id: relatedId,
        is_read: false,
        created_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取用户所有通知
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const [notifications] = await pool.execute(
        `SELECT * FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      // 获取总数
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
        [userId]
      );
      
      const total = countResult[0].total;
      
      return {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取未读通知数量
  async getUnreadCount(userId) {
    try {
      const [result] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );
      
      return result[0].count;
    } catch (error) {
      throw error;
    }
  }

  // 将通知标记为已读
  async markAsRead(id, userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 将所有通知标记为已读
  async markAllAsRead(userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );
      
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  // 删除通知
  async delete(id, userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM notifications WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 清空所有通知
  async deleteAll(userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM notifications WHERE user_id = ?',
        [userId]
      );
      
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Notification(); 