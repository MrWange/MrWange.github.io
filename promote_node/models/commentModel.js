const { pool } = require('../config/db');

class Comment {
  // 创建新评论
  async create(discussionId, authorId, content) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO comments (discussion_id, author_id, content) VALUES (?, ?, ?)',
        [discussionId, authorId, content]
      );
      
      return { 
        id: result.insertId,
        discussion_id: discussionId,
        author_id: authorId,
        content
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取讨论的评论列表
  async getByDiscussionId(discussionId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const [rows] = await pool.execute(
        `SELECT c.*, u.username as author_name, u.avatar as author_avatar
         FROM comments c
         JOIN users u ON c.author_id = u.id
         WHERE c.discussion_id = ?
         ORDER BY c.created_at ASC
         LIMIT ? OFFSET ?`,
        [discussionId, limit, offset]
      );
      
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM comments WHERE discussion_id = ?',
        [discussionId]
      );
      
      const total = countResult[0].total;
      
      return {
        comments: rows,
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

  // 更新评论
  async update(id, authorId, content) {
    try {
      const [result] = await pool.execute(
        'UPDATE comments SET content = ? WHERE id = ? AND author_id = ?',
        [content, id, authorId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 删除评论
  async delete(id, authorId = null, isAdmin = false) {
    try {
      let query = 'DELETE FROM comments WHERE id = ?';
      const params = [id];
      
      // 如果不是管理员，则需要验证作者ID
      if (!isAdmin && authorId !== null) {
        query += ' AND author_id = ?';
        params.push(authorId);
      }
      
      const [result] = await pool.execute(query, params);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 通过ID获取评论
  async getById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.*, u.username as author_name, u.avatar as author_avatar
         FROM comments c
         JOIN users u ON c.author_id = u.id
         WHERE c.id = ?`,
        [id]
      );
      
      if (rows.length === 0) return null;
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Comment(); 