const { pool } = require('../config/db');

class Knowledge {
  // 检查表是否存在
  async checkTableExists(tableName) {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = DATABASE() 
         AND table_name = ?`,
        [tableName]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error(`检查表${tableName}是否存在时出错:`, error);
      return false;
    }
  }

  // 创建必要的表
  async createRequiredTables() {
    try {
      // 检查user_attempts表是否存在
      const userAttemptsExists = await this.checkTableExists('user_attempts');
      
      if (!userAttemptsExists) {
        console.log('创建user_attempts表...');
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS user_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            question_id INT NOT NULL,
            selected_answer VARCHAR(255) NOT NULL,
            is_correct BOOLEAN NOT NULL,
            attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id),
            INDEX (question_id)
          )
        `);
      }
      
      // 检查questions表是否有category字段
      const [categoryFieldExists] = await pool.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'questions' 
        AND column_name = 'category'
      `);
      
      if (categoryFieldExists[0].count === 0) {
        console.log('为questions表添加category字段...');
        await pool.execute(`
          ALTER TABLE questions 
          ADD COLUMN category VARCHAR(50) NULL,
          ADD INDEX (category)
        `);
      }
      
      return true;
    } catch (error) {
      console.error('创建必要表时出错:', error);
      return false;
    }
  }

  // 获取用户知识点分布
  async getUserKnowledgeRadar(userId) {
    try {
      // 确保必要的表存在
      await this.createRequiredTables();
      
      // 检查是否有任何用户尝试记录
      const [attemptCount] = await pool.execute(
        `SELECT COUNT(*) as count FROM user_attempts WHERE user_id = ?`,
        [userId]
      );
      
      // 如果用户没有任何尝试记录，返回空数组
      if (attemptCount[0].count === 0) {
        return [];
      }
      
      // 查询用户回答正确的问题分类分布
      const [correctDistribution] = await pool.execute(
        `SELECT q.category, COUNT(*) as correct_count
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = ? AND ua.is_correct = 1 AND q.category IS NOT NULL
         GROUP BY q.category`,
        [userId]
      );
      
      // 查询用户总尝试的问题分类分布
      const [totalDistribution] = await pool.execute(
        `SELECT q.category, COUNT(*) as attempt_count
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = ? AND q.category IS NOT NULL
         GROUP BY q.category`,
        [userId]
      );
      
      // 查询所有可能的分类
      const [allCategories] = await pool.execute(
        `SELECT DISTINCT category FROM questions WHERE category IS NOT NULL`
      );
      
      // 如果没有分类数据，返回空数组
      if (allCategories.length === 0) {
        return [];
      }
      
      // 整合数据，计算每个分类的掌握程度
      const result = allCategories.map(cat => {
        const category = cat.category;
        const correctCat = correctDistribution.find(c => c.category === category);
        const totalCat = totalDistribution.find(c => c.category === category);
        
        const correctCount = correctCat ? correctCat.correct_count : 0;
        const attemptCount = totalCat ? totalCat.attempt_count : 0;
        
        // 计算掌握程度 (0-100)
        const masteryLevel = attemptCount > 0 
          ? Math.round((correctCount / attemptCount) * 100) 
          : 0;
        
        return {
          category,
          correctCount,
          attemptCount,
          masteryLevel
        };
      });
      
      return result;
    } catch (error) {
      console.error('获取用户知识点分布时出错:', error);
      // 返回空数组作为备用数据
      return [];
    }
  }
  
  // 获取用户学习进度
  async getUserLearningProgress(userId) {
    try {
      // 确保必要的表存在
      await this.createRequiredTables();
      
      // 获取用户已尝试的不同问题数量
      const [attemptedResult] = await pool.execute(
        `SELECT COUNT(DISTINCT question_id) as attempted_count
         FROM user_attempts
         WHERE user_id = ?`,
        [userId]
      );
      
      // 获取题库中总问题数量
      const [totalResult] = await pool.execute(
        `SELECT COUNT(*) as total_count FROM questions`
      );
      
      const attemptedCount = attemptedResult[0].attempted_count || 0;
      const totalCount = totalResult[0].total_count || 0;
      
      // 计算进度百分比
      const progressPercentage = totalCount > 0 
        ? Math.round((attemptedCount / totalCount) * 100) 
        : 0;
      
      return {
        attemptedCount,
        totalCount,
        progressPercentage
      };
    } catch (error) {
      console.error('获取用户学习进度时出错:', error);
      // 返回默认数据
      return {
        attemptedCount: 0,
        totalCount: 0,
        progressPercentage: 0
      };
    }
  }
  
  // 获取用户弱点知识点
  async getUserWeakPoints(userId, limit = 5) {
    try {
      // 确保必要的表存在
      await this.createRequiredTables();
      
      // 检查是否有任何用户尝试记录
      const [attemptCount] = await pool.execute(
        `SELECT COUNT(*) as count FROM user_attempts WHERE user_id = ?`,
        [userId]
      );
      
      // 如果用户没有任何尝试记录，返回空数组
      if (attemptCount[0].count === 0) {
        return [];
      }
      
      // 查询用户错误率最高的知识点
      const [weakPoints] = await pool.execute(
        `SELECT q.category, 
                COUNT(*) as attempt_count,
                SUM(CASE WHEN ua.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_count,
                SUM(CASE WHEN ua.is_correct = 0 THEN 1 ELSE 0 END) / COUNT(*) * 100 as error_rate
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = ? AND q.category IS NOT NULL
         GROUP BY q.category
         HAVING COUNT(*) >= 3  # 至少尝试过3次
         ORDER BY error_rate DESC
         LIMIT ?`,
        [userId, limit]
      );
      
      return weakPoints;
    } catch (error) {
      console.error('获取用户弱点知识点时出错:', error);
      return [];
    }
  }
  
  // 获取用户近期提升最快的知识点
  async getUserImprovedPoints(userId, limit = 3) {
    try {
      // 确保必要的表存在
      await this.createRequiredTables();
      
      // 检查是否有任何用户尝试记录
      const [attemptCount] = await pool.execute(
        `SELECT COUNT(*) as count FROM user_attempts WHERE user_id = ?`,
        [userId]
      );
      
      // 如果用户没有任何尝试记录，返回空数组
      if (attemptCount[0].count === 0) {
        return [];
      }
      
      // 查询用户近期（一周内）提升最快的知识点
      const [improvedPoints] = await pool.execute(
        `SELECT 
           q.category,
           COUNT(*) as recent_attempts,
           SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100 as recent_accuracy,
           (SELECT SUM(CASE WHEN ua2.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100
            FROM user_attempts ua2
            JOIN questions q2 ON ua2.question_id = q2.id
            WHERE ua2.user_id = ? 
            AND q2.category = q.category
            AND ua2.attempt_time < DATE_SUB(NOW(), INTERVAL 7 DAY)) as previous_accuracy
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = ? 
         AND q.category IS NOT NULL
         AND ua.attempt_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY q.category
         HAVING recent_attempts >= 3 AND previous_accuracy IS NOT NULL
         ORDER BY (recent_accuracy - previous_accuracy) DESC
         LIMIT ?`,
        [userId, userId, limit]
      );
      
      return improvedPoints.map(point => ({
        ...point,
        improvement: Math.round(point.recent_accuracy - (point.previous_accuracy || 0))
      }));
    } catch (error) {
      console.error('获取用户近期提升知识点时出错:', error);
      return [];
    }
  }
  
  // 获取用户推荐学习的知识点
  async getRecommendedTopics(userId, limit = 5) {
    try {
      // 确保必要的表存在
      await this.createRequiredTables();
      
      // 检查是否有任何问题记录
      const [questionCount] = await pool.execute(
        `SELECT COUNT(*) as count FROM questions`
      );
      
      // 如果没有任何问题，返回默认数据
      if (questionCount[0].count === 0) {
        return {
          type: "no_data",
          message: "暂无可推荐的问题",
          recommendations: []
        };
      }
      
      // 基于用户的弱点和学习进度推荐知识点
      const weakPoints = await this.getUserWeakPoints(userId);
      const weakCategories = weakPoints.map(p => p.category);
      
      // 如果有弱点知识点，则推荐相关的问题
      if (weakCategories.length > 0) {
        // 构建IN查询的参数占位符
        const placeholders = weakCategories.map(() => '?').join(',');
        
        // 查询用户未尝试过的与弱点知识点相关的问题
        const [recommendedQuestions] = await pool.execute(
          `SELECT q.id, q.title, q.category, q.difficulty
           FROM questions q
           WHERE q.category IN (${placeholders})
           AND q.id NOT IN (
             SELECT question_id FROM user_attempts WHERE user_id = ?
           )
           ORDER BY RAND()
           LIMIT ?`,
          [...weakCategories, userId, limit]
        );
        
        return {
          type: "weak_points",
          message: "基于您的弱点知识点推荐",
          recommendations: recommendedQuestions
        };
      }
      
      // 如果没有弱点知识点，则推荐用户未尝试过的类别
      const [untouchedCategories] = await pool.execute(
        `SELECT DISTINCT q.category
         FROM questions q
         WHERE q.category NOT IN (
           SELECT DISTINCT q2.category
           FROM user_attempts ua
           JOIN questions q2 ON ua.question_id = q2.id
           WHERE ua.user_id = ? AND q2.category IS NOT NULL
         )
         AND q.category IS NOT NULL
         LIMIT ?`,
        [userId, limit]
      );
      
      if (untouchedCategories.length > 0) {
        const categoryList = untouchedCategories.map(c => c.category);
        const placeholders = categoryList.map(() => '?').join(',');
        
        // 从未尝试的类别中推荐简单的问题
        const [recommendedQuestions] = await pool.execute(
          `SELECT q.id, q.title, q.category, q.difficulty
           FROM questions q
           WHERE q.category IN (${placeholders})
           ORDER BY CASE WHEN q.difficulty = '简单' THEN 0 ELSE 1 END, RAND()
           LIMIT ?`,
          [...categoryList, limit]
        );
        
        return {
          type: "new_topics",
          message: "发现一些您尚未探索的知识点",
          recommendations: recommendedQuestions
        };
      }
      
      // 如果都尝试过，则推荐具有挑战性的问题
      const [challengingQuestions] = await pool.execute(
        `SELECT q.id, q.title, q.category, q.difficulty
         FROM questions q
         WHERE q.id NOT IN (
           SELECT question_id FROM user_attempts WHERE user_id = ? AND is_correct = 1
         )
         ORDER BY RAND()
         LIMIT ?`,
        [userId, limit]
      );
      
      return {
        type: "challenging",
        message: "尝试一些具有挑战性的问题",
        recommendations: challengingQuestions.length > 0 ? challengingQuestions : await this.getRandomQuestions(limit)
      };
    } catch (error) {
      console.error('获取推荐知识点时出错:', error);
      return {
        type: "error",
        message: "暂时无法获取推荐问题",
        recommendations: []
      };
    }
  }
  
  // 获取随机问题（兜底方案）
  async getRandomQuestions(limit = 5) {
    try {
      const [questions] = await pool.execute(
        `SELECT id, title, category, difficulty 
         FROM questions 
         ORDER BY RAND() 
         LIMIT ?`,
        [limit]
      );
      return questions;
    } catch (error) {
      console.error('获取随机问题时出错:', error);
      return [];
    }
  }
}

module.exports = new Knowledge(); 