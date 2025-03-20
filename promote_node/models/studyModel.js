const { pool } = require('../config/db');

class StudyRecord {
  // 记录学习时间
  async recordStudyTime(userId, date, minutes) {
    try {
      // 检查是否已有当天记录
      const [existingRecords] = await pool.execute(
        'SELECT * FROM study_records WHERE user_id = ? AND date = ?',
        [userId, date]
      );
      
      if (existingRecords.length > 0) {
        // 更新已有记录
        const [result] = await pool.execute(
          'UPDATE study_records SET study_time = study_time + ? WHERE user_id = ? AND date = ?',
          [minutes, userId, date]
        );
        return result.affectedRows > 0;
      } else {
        // 创建新记录
        const [result] = await pool.execute(
          'INSERT INTO study_records (user_id, date, study_time) VALUES (?, ?, ?)',
          [userId, date, minutes]
        );
        return result.insertId > 0;
      }
    } catch (error) {
      throw error;
    }
  }

  // 获取用户学习记录
  async getStudyRecords(userId, days = 7) {
    try {
      const [records] = await pool.execute(
        `SELECT date, study_time FROM study_records 
         WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         ORDER BY date ASC`,
        [userId, days]
      );
      
      return records;
    } catch (error) {
      throw error;
    }
  }

  // 获取今日学习时间
  async getTodayStudyTime(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [records] = await pool.execute(
        'SELECT study_time FROM study_records WHERE user_id = ? AND date = ?',
        [userId, today]
      );
      
      return records.length > 0 ? records[0].study_time : 0;
    } catch (error) {
      throw error;
    }
  }

  // 获取本周学习时间
  async getWeeklyStudyTime(userId) {
    try {
      const [result] = await pool.execute(
        `SELECT SUM(study_time) as total FROM study_records 
         WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        [userId]
      );
      
      return result[0].total || 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new StudyRecord(); 