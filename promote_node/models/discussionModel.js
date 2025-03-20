const { pool } = require('../config/db');

class Discussion {
  // 创建新讨论
  async create(title, content, authorId, tag) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO discussions (title, content, author_id, tag) VALUES (?, ?, ?, ?)',
        [title, content, authorId, tag]
      );
      
      return { id: result.insertId, title, content, author_id: authorId, tag };
    } catch (error) {
      throw error;
    }
  }

  // 获取讨论列表（带分页和筛选）
  async getAll({ page = 1, limit = 10, tag = null }) {
    try {
      let query = `
        SELECT d.*, u.username as author_name, u.avatar as author_avatar,
        (SELECT COUNT(*) FROM comments WHERE discussion_id = d.id) as comment_count
        FROM discussions d
        JOIN users u ON d.author_id = u.id`;
      
      const queryParams = [];
      
      // 添加标签筛选
      if (tag) {
        query += ' WHERE d.tag = ?';
        queryParams.push(tag);
      }
      
      // 添加排序和分页
      query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
      const offset = (page - 1) * limit;
      queryParams.push(limit, offset);
      
      // 执行查询
      const [rows] = await pool.execute(query, queryParams);
      
      // 获取总数
      let countQuery = 'SELECT COUNT(*) as total FROM discussions';
      if (tag) {
        countQuery += ' WHERE tag = ?';
      }
      
      const [countResult] = await pool.execute(
        countQuery,
        tag ? [tag] : []
      );
      
      const total = countResult[0].total;
      
      return {
        discussions: rows,
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

  // 通过ID获取讨论详情
  async getById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT d.*, u.username as author_name, u.avatar as author_avatar
         FROM discussions d
         JOIN users u ON d.author_id = u.id
         WHERE d.id = ?`,
        [id]
      );
      
      if (rows.length === 0) return null;
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 更新讨论
  async update(id, updateData) {
    try {
      const allowedFields = ['title', 'content', 'tag'];
      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updates.length === 0) return null;

      values.push(id);
      const [result] = await pool.execute(
        `UPDATE discussions SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 删除讨论
  async delete(id) {
    try {
      // 首先删除与讨论相关的点赞记录
      await pool.execute('DELETE FROM discussion_likes WHERE discussion_id = ?', [id]);
      
      // 然后删除与讨论相关的评论
      await pool.execute('DELETE FROM comments WHERE discussion_id = ?', [id]);
      
      // 最后删除讨论
      const [result] = await pool.execute(
        'DELETE FROM discussions WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 获取用户的讨论列表
  async getByUserId(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const [rows] = await pool.execute(
        `SELECT d.*, u.username as author_name, u.avatar as author_avatar,
         (SELECT COUNT(*) FROM comments WHERE discussion_id = d.id) as comment_count
         FROM discussions d
         JOIN users u ON d.author_id = u.id
         WHERE d.author_id = ?
         ORDER BY d.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM discussions WHERE author_id = ?',
        [userId]
      );
      
      const total = countResult[0].total;
      
      return {
        discussions: rows,
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

  // 给讨论点赞
  async likeDiscussion(discussionId, userId) {
    try {
      // 先检查讨论是否存在
      const discussion = await this.getById(discussionId);
      if (!discussion) {
        return { success: false, message: '讨论不存在' };
      }
      
      // 检查用户是否已经点赞过
      const isLiked = await this.isLikedByUser(discussionId, userId);
      if (isLiked) {
        return { success: false, message: '您已经点赞过该讨论' };
      }
      
      // 添加点赞记录
      await pool.execute(
        'INSERT INTO discussion_likes (discussion_id, user_id) VALUES (?, ?)',
        [discussionId, userId]
      );
      
      // 获取最新点赞数
      const likesCount = await this.getLikesCount(discussionId);
      
      return { 
        success: true, 
        message: '点赞成功', 
        likesCount 
      };
    } catch (error) {
      throw error;
    }
  }
  
  // 取消点赞
  async unlikeDiscussion(discussionId, userId) {
    try {
      // 检查讨论是否存在
      const discussion = await this.getById(discussionId);
      if (!discussion) {
        return { success: false, message: '讨论不存在' };
      }
      
      // 检查用户是否已经点赞
      const isLiked = await this.isLikedByUser(discussionId, userId);
      if (!isLiked) {
        return { success: false, message: '您尚未点赞该讨论' };
      }
      
      // 删除点赞记录
      await pool.execute(
        'DELETE FROM discussion_likes WHERE discussion_id = ? AND user_id = ?',
        [discussionId, userId]
      );
      
      // 获取最新点赞数
      const likesCount = await this.getLikesCount(discussionId);
      
      return { 
        success: true, 
        message: '取消点赞成功', 
        likesCount 
      };
    } catch (error) {
      throw error;
    }
  }
  
  // 检查用户是否已点赞
  async isLikedByUser(discussionId, userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM discussion_likes WHERE discussion_id = ? AND user_id = ?',
        [discussionId, userId]
      );
      
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // 获取讨论点赞数
  async getLikesCount(discussionId) {
    try {
      const [result] = await pool.execute(
        'SELECT COUNT(*) as count FROM discussion_likes WHERE discussion_id = ?',
        [discussionId]
      );
      
      return result[0].count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Discussion(); 