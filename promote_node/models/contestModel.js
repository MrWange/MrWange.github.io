const { pool } = require('../config/db');

class Contest {
  // 创建新竞赛
  async create(title, date, description) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO contests (title, date, description) VALUES (?, ?, ?)',
        [title, date, description]
      );
      
      return { id: result.insertId, title, date, description };
    } catch (error) {
      throw error;
    }
  }

  // 获取竞赛列表（带分页）
  async getAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // 获取竞赛列表
      const [rows] = await pool.execute(
        `SELECT c.*, 
          (SELECT COUNT(*) FROM contest_registrations WHERE contest_id = c.id) as registration_count
         FROM contests c
         ORDER BY c.date DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      // 获取总数
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM contests'
      );
      
      const total = countResult[0].total;
      
      return {
        contests: rows,
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

  // 获取单个竞赛
  async getById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.*, 
          (SELECT COUNT(*) FROM contest_registrations WHERE contest_id = c.id) as registration_count
         FROM contests c
         WHERE c.id = ?`,
        [id]
      );
      
      if (rows.length === 0) return null;
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 更新竞赛
  async update(id, updateData) {
    try {
      const allowedFields = ['title', 'date', 'description'];
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
        `UPDATE contests SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 删除竞赛
  async delete(id) {
    try {
      // 首先删除与竞赛相关的报名
      await pool.execute('DELETE FROM contest_registrations WHERE contest_id = ?', [id]);
      
      // 然后删除竞赛
      const [result] = await pool.execute(
        'DELETE FROM contests WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 用户报名竞赛
  async register(userId, contestId) {
    try {
      // 检查用户是否已报名
      const [existingRows] = await pool.execute(
        'SELECT * FROM contest_registrations WHERE user_id = ? AND contest_id = ?',
        [userId, contestId]
      );
      
      if (existingRows.length > 0) {
        throw new Error('用户已报名此竞赛');
      }
      
      // 添加报名记录
      const [result] = await pool.execute(
        'INSERT INTO contest_registrations (user_id, contest_id) VALUES (?, ?)',
        [userId, contestId]
      );
      
      return { id: result.insertId, user_id: userId, contest_id: contestId };
    } catch (error) {
      throw error;
    }
  }

  // 取消报名
  async cancelRegistration(userId, contestId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM contest_registrations WHERE user_id = ? AND contest_id = ?',
        [userId, contestId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 检查用户是否已报名
  async isRegistered(userId, contestId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM contest_registrations WHERE user_id = ? AND contest_id = ?',
        [userId, contestId]
      );
      
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // 获取竞赛的报名用户列表
  async getRegisteredUsers(contestId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // 获取报名用户
      const [rows] = await pool.execute(
        `SELECT u.id, u.username, u.email, u.avatar, cr.registered_at
         FROM contest_registrations cr
         JOIN users u ON cr.user_id = u.id
         WHERE cr.contest_id = ?
         ORDER BY cr.registered_at ASC
         LIMIT ? OFFSET ?`,
        [contestId, limit, offset]
      );
      
      // 获取总数
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM contest_registrations WHERE contest_id = ?',
        [contestId]
      );
      
      const total = countResult[0].total;
      
      return {
        users: rows,
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

  // 获取用户报名的竞赛列表
  async getUserContests(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // 获取用户报名的竞赛
      const [rows] = await pool.execute(
        `SELECT c.*, cr.registered_at
         FROM contest_registrations cr
         JOIN contests c ON cr.contest_id = c.id
         WHERE cr.user_id = ?
         ORDER BY c.date DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      // 获取总数
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM contest_registrations WHERE user_id = ?',
        [userId]
      );
      
      const total = countResult[0].total;
      
      return {
        contests: rows,
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
}

module.exports = new Contest(); 