const { pool } = require('../config/db');

class Question {
  // 创建新问题
  async create(questionData) {
    try {
      const { title, options, correctAnswer, explanation, difficulty, type, category } = questionData;
      
      const [result] = await pool.execute(
        `INSERT INTO questions (title, options, correct_answer, explanation, difficulty, type, category)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title, 
          JSON.stringify(options),
          correctAnswer,
          explanation,
          difficulty,
          type,
          category
        ]
      );
      
      return this.getById(result.insertId);
    } catch (error) {
      throw error;
    }
  }
  
  // 获取问题列表
  async getAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM questions';
      let countQuery = 'SELECT COUNT(*) as total FROM questions';
      const queryParams = [];
      const whereConditions = [];
      
      // 根据过滤条件添加 WHERE 子句
      if (filters.difficulty) {
        whereConditions.push('difficulty = ?');
        queryParams.push(filters.difficulty);
      }
      
      if (filters.category) {
        whereConditions.push('category = ?');
        queryParams.push(filters.category);
      }
      
      if (filters.type) {
        whereConditions.push('type = ?');
        queryParams.push(filters.type);
      }
      
      if (whereConditions.length > 0) {
        const whereClause = 'WHERE ' + whereConditions.join(' AND ');
        query += ' ' + whereClause;
        countQuery += ' ' + whereClause;
      }
      
      // 添加排序和分页，确保使用数字
      query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      
      // 确保 limit 和 offset 是数字类型
      const numericLimit = Number(limit);
      const numericOffset = Number(offset);
      queryParams.push(numericLimit, numericOffset);
      
      // 执行查询
      const [rows] = await pool.execute(query, queryParams);
      
      // 处理选项 JSON
      const questions = rows.map(q => {
        if (q.options && typeof q.options === 'string') {
          try {
            q.options = JSON.parse(q.options);
          } catch (e) {
            console.error('解析选项 JSON 出错:', e);
          }
        }
        return q;
      });
      
      // 执行计数查询
      const countQueryParams = queryParams.slice(0, -2);  // 移除 LIMIT 和 OFFSET 参数
      const [countResult] = await pool.execute(countQuery, countQueryParams);
      
      const totalItems = parseInt(countResult[0].total) || 0;
      const totalPages = Math.ceil(totalItems / numericLimit) || 1;
      
      return {
        questions,
        total: totalItems,
        pagination: {
          total: totalItems,
          page,
          limit: numericLimit,
          totalPages
        },
        totalItems,
        currentPage: page,
        totalPages
      };
    } catch (error) {
      console.error('获取问题列表出错:', error);
      // 出错时返回空结果而不是抛出异常
      return {
        questions: [],
        total: 0,
        pagination: {
          total: 0,
          page: 1,
          limit: Number(limit),
          totalPages: 1
        },
        totalItems: 0,
        currentPage: 1,
        totalPages: 1
      };
    }
  }
  
  // 按ID获取问题
  async getById(id) {
    try {
      // 确保 id 是有效的数字
      if (!id || isNaN(parseInt(id))) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT * FROM questions WHERE id = ?',
        [parseInt(id)]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      // 处理选项 JSON
      const question = rows[0];
      if (question.options && typeof question.options === 'string') {
        try {
          question.options = JSON.parse(question.options);
        } catch (e) {
          console.error('解析选项 JSON 出错:', e);
        }
      }
      
      return question;
    } catch (error) {
      console.error('按ID获取问题出错:', error);
      throw error;
    }
  }
  
  // 按分类获取问题
  async getByCategory(category, page = 1, limit = 10) {
    try {
      return this.getAll(page, limit, { category });
    } catch (error) {
      throw error;
    }
  }
  
  // 按难度获取问题
  async getByDifficulty(difficulty, page = 1, limit = 10) {
    try {
      return this.getAll(page, limit, { difficulty });
    } catch (error) {
      throw error;
    }
  }
  
  // 获取随机问题
  async getRandom(filters = {}) {
    try {
      let query = 'SELECT * FROM questions';
      const queryParams = [];
      const whereConditions = [];
      
      // 根据过滤条件添加 WHERE 子句
      if (filters.difficulty) {
        whereConditions.push('difficulty = ?');
        queryParams.push(filters.difficulty);
      }
      
      if (filters.category) {
        whereConditions.push('category = ?');
        queryParams.push(filters.category);
      }
      
      if (filters.type) {
        whereConditions.push('type = ?');
        queryParams.push(filters.type);
      }
      
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // 添加随机排序和限制
      query += ' ORDER BY RAND() LIMIT 1';
      
      // 执行查询
      const [rows] = await pool.execute(query, queryParams);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // 更新问题
  async update(id, questionData) {
    try {
      const fields = [];
      const values = [];
      
      // 构建更新字段
      for (const [key, value] of Object.entries(questionData)) {
        if (value !== undefined) {
          if (key === 'options') {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(value));
          } else {
            fields.push(`${key === 'correctAnswer' ? 'correct_answer' : key} = ?`);
            values.push(value);
          }
        }
      }
      
      if (fields.length === 0) {
        return await this.getById(id);
      }
      
      // 添加ID参数
      values.push(id);
      
      // 执行更新
      await pool.execute(
        `UPDATE questions SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }
  
  // 删除问题
  async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM questions WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // 获取所有分类
  async getAllCategories() {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT category FROM questions WHERE category IS NOT NULL'
      );
      
      return rows.map(row => row.category);
    } catch (error) {
      throw error;
    }
  }
  
  // 获取所有难度级别
  async getAllDifficulties() {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT difficulty FROM questions WHERE difficulty IS NOT NULL'
      );
      
      return rows.map(row => row.difficulty);
    } catch (error) {
      throw error;
    }
  }

  // 用户收藏问题
  async addToFavorites(userId, questionId) {
    try {
      // 确保参数都是数字
      const numericUserId = parseInt(userId);
      const numericQuestionId = parseInt(questionId);
      
      if (isNaN(numericUserId) || isNaN(numericQuestionId)) {
        throw new Error('无效的用户ID或问题ID');
      }
      
      // 检查问题是否存在
      const question = await this.getById(numericQuestionId);
      if (!question) {
        throw new Error('问题不存在');
      }
      
      // 添加到收藏
      await pool.execute(
        `INSERT INTO user_favorites (user_id, question_id) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE favorited_at = CURRENT_TIMESTAMP`,
        [numericUserId, numericQuestionId]
      );
      
      return true;
    } catch (error) {
      console.error('添加收藏出错:', error);
      throw error;
    }
  }

  // 从收藏中移除问题
  async removeFromFavorites(userId, questionId) {
    try {
      // 确保参数都是数字
      const numericUserId = parseInt(userId);
      const numericQuestionId = parseInt(questionId);
      
      if (isNaN(numericUserId) || isNaN(numericQuestionId)) {
        throw new Error('无效的用户ID或问题ID');
      }
      
      const [result] = await pool.execute(
        'DELETE FROM user_favorites WHERE user_id = ? AND question_id = ?',
        [numericUserId, numericQuestionId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('移除收藏出错:', error);
      throw error;
    }
  }

  // 获取用户收藏的问题
  async getUserFavorites(userId, page = 1, limit = 10) {
    try {
      // 确保参数都是数字
      const numericUserId = parseInt(userId);
      const numericPage = parseInt(page);
      const numericLimit = parseInt(limit);
      
      if (isNaN(numericUserId) || isNaN(numericPage) || isNaN(numericLimit)) {
        throw new Error('无效的参数');
      }
      
      const offset = (numericPage - 1) * numericLimit;
      
      // 检查表是否存在
      const [tableExists] = await pool.execute(
        `SELECT COUNT(*) as count 
         FROM information_schema.tables 
         WHERE table_schema = DATABASE() 
         AND table_name = 'user_favorites'`
      );
      
      if (tableExists[0].count === 0) {
        // 表不存在，返回空结果
        return {
          questions: [],
          total: 0,
          pagination: {
            total: 0,
            page: numericPage,
            limit: numericLimit,
            totalPages: 0
          }
        };
      }
      
      // 查询用户收藏的问题
      const [rows] = await pool.execute(
        `SELECT q.*, uf.favorited_at
         FROM questions q
         JOIN user_favorites uf ON q.id = uf.question_id
         WHERE uf.user_id = ?
         ORDER BY uf.favorited_at DESC
         LIMIT ? OFFSET ?`,
        [numericUserId, numericLimit, offset]
      );
      
      // 解析选项JSON
      const questions = rows.map(q => {
        if (q.options && typeof q.options === 'string') {
          try {
            q.options = JSON.parse(q.options);
          } catch (e) {
            console.error('解析选项 JSON 出错:', e);
          }
        }
        return q;
      });
      
      // 获取总数
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?',
        [numericUserId]
      );
      
      const total = countResult[0].total || 0;
      const totalPages = Math.ceil(total / numericLimit) || 1;
      
      return {
        questions,
        total,
        pagination: {
          total,
          page: numericPage,
          limit: numericLimit,
          totalPages
        }
      };
    } catch (error) {
      console.error('获取用户收藏出错:', error);
      // 出错时返回空结果
      return {
        questions: [],
        total: 0,
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
    }
  }

  // 记录用户做题情况
  async recordUserAttempt(userId, questionId, selectedAnswer, isCorrect) {
    try {
      await pool.execute(
        'INSERT INTO user_question_attempts (user_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)',
        [userId, questionId, selectedAnswer, isCorrect]
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 获取用户做题历史
  async getUserAttemptHistory(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // 查询用户做题历史
      const [rows] = await pool.execute(
        `SELECT uqa.*, q.title, q.difficulty, q.type
         FROM user_question_attempts uqa
         JOIN questions q ON uqa.question_id = q.id
         WHERE uqa.user_id = ?
         ORDER BY uqa.attempt_time DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      // 获取总数
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM user_question_attempts WHERE user_id = ?',
        [userId]
      );
      
      const total = countResult[0].total;
      
      return {
        attempts: rows,
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

module.exports = new Question(); 