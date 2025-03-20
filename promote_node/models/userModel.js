const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // 创建新用户
  async create(username, email, password, avatar = null, role = '普通用户') {
    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, avatar, role) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, avatar, role]
      );
      
      return { id: result.insertId, username, email, avatar, role };
    } catch (error) {
      throw error;
    }
  }

  // 通过ID查找用户
  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // 通过用户名查找用户
  async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // 通过邮箱查找用户
  async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // 更新用户信息
  async update(id, updateData) {
    try {
      const allowedFields = ['username', 'email', 'avatar'];
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
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 更新密码
  async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const [result] = await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 验证密码
  async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw error;
    }
  }

  // 获取所有用户（分页）
  async getAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const [rows] = await pool.execute(
        'SELECT id, username, email, avatar, role, created_at FROM users LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
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
}

module.exports = new User(); 