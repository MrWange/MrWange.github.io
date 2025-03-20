const Knowledge = require('../models/knowledgeModel');
const { pool } = require('../config/db');

// 获取用户知识点雷达图数据
exports.getKnowledgeRadar = async (req, res) => {
  try {
    const userId = req.user.id;
    const knowledgeData = await Knowledge.getUserKnowledgeRadar(userId);
    
    res.status(200).json({
      success: true,
      data: knowledgeData
    });
  } catch (error) {
    console.error('获取知识点雷达图数据错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 获取用户学习进度
exports.getLearningProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progressData = await Knowledge.getUserLearningProgress(userId);
    
    res.status(200).json({
      success: true,
      data: progressData
    });
  } catch (error) {
    console.error('获取学习进度错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 获取用户弱点知识点
exports.getWeakPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    const weakPoints = await Knowledge.getUserWeakPoints(userId, limit);
    
    res.status(200).json({
      success: true,
      data: weakPoints
    });
  } catch (error) {
    console.error('获取弱点知识点错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 获取用户近期提升最快的知识点
exports.getImprovedPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 3;
    
    const improvedPoints = await Knowledge.getUserImprovedPoints(userId, limit);
    
    res.status(200).json({
      success: true,
      data: improvedPoints
    });
  } catch (error) {
    console.error('获取提升知识点错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 获取推荐学习的知识点
exports.getRecommendedTopics = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    const recommendations = await Knowledge.getRecommendedTopics(userId, limit);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('获取推荐知识点错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 获取用户全面的知识点分析（综合上面的数据）
exports.getFullAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 并行获取所有分析数据
    const [
      knowledgeRadar,
      learningProgress,
      weakPoints,
      improvedPoints,
      recommendations
    ] = await Promise.all([
      Knowledge.getUserKnowledgeRadar(userId),
      Knowledge.getUserLearningProgress(userId),
      Knowledge.getUserWeakPoints(userId),
      Knowledge.getUserImprovedPoints(userId),
      Knowledge.getRecommendedTopics(userId)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        knowledgeRadar,
        learningProgress,
        weakPoints,
        improvedPoints,
        recommendations
      }
    });
  } catch (error) {
    console.error('获取知识点全面分析错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 获取用户答题趋势数据
exports.getUserTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = req.query.days ? parseInt(req.query.days) : 30; // 默认获取30天的趋势数据
    
    // 查询用户在指定天数内的答题数据
    const [dailyData] = await pool.execute(
      `SELECT 
        DATE(attempt_time) as date,
        COUNT(*) as attempt_count,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count
       FROM user_attempts
       WHERE user_id = ? 
       AND attempt_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(attempt_time)
       ORDER BY date ASC`,
      [userId, days]
    );
    
    // 生成所有日期的数据，包括没有答题的日期
    const trendData = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // 填充日期范围内每一天的数据
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]; // 格式: YYYY-MM-DD
      const dayData = dailyData.find(item => item.date.toISOString().split('T')[0] === dateStr);
      
      trendData.push({
        date: dateStr,
        attemptCount: dayData ? dayData.attempt_count : 0,
        correctCount: dayData ? dayData.correct_count : 0,
        accuracy: dayData ? Math.round((dayData.correct_count / dayData.attempt_count) * 100) : 0
      });
    }
    
    // 计算总体趋势指标
    const totalAttempts = dailyData.reduce((sum, day) => sum + day.attempt_count, 0);
    const totalCorrect = dailyData.reduce((sum, day) => sum + day.correct_count, 0);
    const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    
    // 计算活跃天数（有答题记录的天数）
    const activeDays = dailyData.length;
    
    // 计算连续答题天数
    let currentStreak = 0;
    let maxStreak = 0;
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // 检查昨天是否有答题记录
    const hasYesterdayRecord = dailyData.some(
      item => item.date.toISOString().split('T')[0] === yesterdayStr
    );
    
    if (hasYesterdayRecord) {
      // 如果昨天有记录，计算连续天数
      for (let i = dailyData.length - 1; i >= 0; i--) {
        const currentDate = new Date(dailyData[i].date);
        
        if (i === dailyData.length - 1) {
          // 第一次迭代，初始化连续天数
          currentStreak = 1;
          maxStreak = 1;
        } else {
          const prevDate = new Date(dailyData[i + 1].date);
          const diffDays = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // 连续的天数
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            // 不连续，重置计数
            currentStreak = 1;
          }
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        trendData,
        summary: {
          totalAttempts,
          totalCorrect,
          overallAccuracy,
          activeDays,
          currentStreak,
          maxStreak
        }
      }
    });
  } catch (error) {
    console.error('获取用户答题趋势数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
}; 