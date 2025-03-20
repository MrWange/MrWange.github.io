const UserAttempt = require('../models/userAttemptsModel');
const Question = require('../models/questionModel');

// 记录用户答题
exports.recordAttempt = async (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;
    const userId = req.user.id;
    
    if (!questionId || !selectedAnswer) {
      return res.status(400).json({
        success: false,
        message: '问题ID和选择的答案是必需的'
      });
    }
    
    // 获取问题信息
    const question = await Question.getById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: '问题不存在'
      });
    }
    
    // 判断答案是否正确
    const isCorrect = selectedAnswer.toUpperCase() === question.correct_answer.toUpperCase();
    
    // 记录答题尝试
    const attemptId = await UserAttempt.create(
      userId,
      questionId,
      selectedAnswer,
      isCorrect
    );
    
    // 返回答题结果
    res.status(200).json({
      success: true,
      message: isCorrect ? '回答正确！' : '回答错误',
      data: {
        isCorrect,
        attemptId,
        correctAnswer: question.correct_answer,
        explanation: question.explanation
      }
    });
  } catch (error) {
    console.error('记录答题出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取用户答题历史
exports.getAttemptHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    const history = await UserAttempt.getUserAttempts(userId, page, limit);
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('获取答题历史出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取用户特定问题的尝试记录
exports.getQuestionAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;
    
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: '问题ID是必需的'
      });
    }
    
    const attempts = await UserAttempt.getUserQuestionAttempts(userId, questionId);
    
    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('获取问题尝试记录出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取用户答题统计数据
exports.getAttemptStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await UserAttempt.getUserStats(userId);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取答题统计出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取用户今日完成的题目
exports.getTodayCompleted = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const todayData = await UserAttempt.getTodayCompleted(userId);
    
    res.status(200).json({
      success: true,
      data: todayData
    });
  } catch (error) {
    console.error('获取今日完成题目出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取用户打卡信息
exports.getStreakInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const streakInfo = await UserAttempt.getStreakInfo(userId);
    
    res.status(200).json({
      success: true,
      data: streakInfo
    });
  } catch (error) {
    console.error('获取打卡信息出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取用户的完整学习数据（统计、今日完成、打卡信息）
exports.getUserLearningData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 并行获取各种数据
    const [stats, todayData, streakInfo] = await Promise.all([
      UserAttempt.getUserStats(userId),
      UserAttempt.getTodayCompleted(userId),
      UserAttempt.getStreakInfo(userId)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        todayCompleted: todayData,
        streakInfo
      }
    });
  } catch (error) {
    console.error('获取用户学习数据出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
}; 