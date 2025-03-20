const { pool } = require('../config/db');

class UserAttempt {
  // 创建用户的答题尝试记录
  async create(userId, questionId, selectedAnswer, isCorrect) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO user_attempts (user_id, question_id, selected_answer, is_correct, attempt_time)
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, questionId, selectedAnswer, isCorrect]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  // 获取用户的答题历史
  async getUserAttempts(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // 获取分页数据
      const [rows] = await pool.execute(
        `SELECT ua.*, q.title, q.difficulty, q.type, q.category
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = ?
         ORDER BY ua.attempt_time DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      // 获取总条目数
      const [countResult] = await pool.execute(
        `SELECT COUNT(*) as total
         FROM user_attempts
         WHERE user_id = ?`,
        [userId]
      );
      
      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / limit);
      
      return {
        attempts: rows,
        totalItems,
        currentPage: page,
        totalPages
      };
    } catch (error) {
      throw error;
    }
  }
  
  // 获取用户对某个问题的尝试记录
  async getUserQuestionAttempts(userId, questionId) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM user_attempts
         WHERE user_id = ? AND question_id = ?
         ORDER BY attempt_time DESC`,
        [userId, questionId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // 获取用户的总体答题统计
  async getUserStats(userId) {
    try {
      // 获取总尝试次数和正确次数
      const [attemptStats] = await pool.execute(
        `SELECT 
           COUNT(*) as totalAttempts,
           SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correctAttempts
         FROM user_attempts
         WHERE user_id = ?`,
        [userId]
      );
      
      // 获取按难度分组的统计
      const [difficultyStats] = await pool.execute(
        `SELECT q.difficulty, COUNT(*) as count
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = ?
         GROUP BY q.difficulty`,
        [userId]
      );
      
      // 获取最近的尝试记录
      const [recentAttempts] = await pool.execute(
        `SELECT ua.*, q.title, q.difficulty, q.type, q.category
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = ?
         ORDER BY ua.attempt_time DESC
         LIMIT 5`,
        [userId]
      );
      
      // 计算准确率
      const totalAttempts = attemptStats[0].totalAttempts || 0;
      const correctAttempts = attemptStats[0].correctAttempts || 0;
      const accuracy = totalAttempts > 0 
        ? parseFloat((correctAttempts / totalAttempts * 100).toFixed(2)) 
        : 0;
      
      return {
        totalAttempts,
        correctAttempts,
        accuracy,
        difficultyStats,
        recentAttempts
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取用户今日完成的题目
  async getTodayCompleted(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT ua.question_id, q.title, q.difficulty, q.type, q.category, 
                ua.is_correct, MAX(ua.attempt_time) as latest_attempt
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = ? 
         AND DATE(ua.attempt_time) = CURDATE()
         GROUP BY ua.question_id
         ORDER BY latest_attempt DESC`,
        [userId]
      );
      
      // 计算今日统计
      const totalCompleted = rows.length;
      const correctCount = rows.filter(item => item.is_correct).length;
      
      return {
        questions: rows,
        statistics: {
          totalCompleted,
          correctCount,
          accuracy: totalCompleted > 0 ? Math.round((correctCount / totalCompleted) * 100) : 0
        }
      };
    } catch (error) {
      console.error('获取今日完成题目出错:', error);
      throw error;
    }
  }
  
  // 获取用户连续打卡天数和今日打卡状态
  async getStreakInfo(userId) {
    try {
      // 检查今日是否有答题记录（打卡）
      const [todayCheck] = await pool.execute(
        `SELECT COUNT(*) as count 
         FROM user_attempts 
         WHERE user_id = ? AND DATE(attempt_time) = CURDATE()`,
        [userId]
      );
      
      const checkedToday = todayCheck[0].count > 0;
      
      // 获取不同日期的答题记录
      const [dates] = await pool.execute(
        `SELECT DISTINCT DATE(attempt_time) as date
         FROM user_attempts
         WHERE user_id = ?
         ORDER BY date DESC`,
        [userId]
      );
      
      // 计算连续打卡天数
      let currentStreak = 0;
      
      if (dates.length > 0) {
        currentStreak = 1; // 至少有一天答题
        
        // 获取昨天的日期
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // 检查是否有连续天数
        for (let i = 0; i < dates.length - 1; i++) {
          const currentDate = new Date(dates[i].date);
          const nextDate = new Date(dates[i+1].date);
          
          // 计算日期差
          const diffTime = Math.abs(currentDate - nextDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // 连续的天数
            currentStreak++;
          } else {
            // 不连续，结束计算
            break;
          }
        }
      }
      
      // 获取最长连续打卡记录
      const [maxStreakQuery] = await pool.execute(
        `SELECT MAX(streak) as max_streak
         FROM (
           SELECT COUNT(*) as streak
           FROM (
             SELECT DISTINCT DATE(attempt_time) as date
             FROM user_attempts
             WHERE user_id = ?
           ) as dates
         ) as streak_count`,
        [userId]
      );
      
      const maxStreak = maxStreakQuery[0].max_streak || 0;
      
      return {
        checkedToday,
        currentStreak,
        maxStreak,
        totalDays: dates.length
      };
    } catch (error) {
      console.error('获取打卡信息出错:', error);
      throw error;
    }
  }
}

module.exports = new UserAttempt(); 