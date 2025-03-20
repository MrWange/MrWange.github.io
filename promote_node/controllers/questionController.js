const Question = require('../models/questionModel');
const { pool } = require('../config/db');

// 创建新问题
exports.createQuestion = async (req, res) => {
  try {
    const { title, options, correctAnswer, explanation, difficulty, type, category } = req.body;

    // 检查必要字段
    if (!title || !options || !correctAnswer || !difficulty || !type) {
      return res.status(400).json({ 
        success: false,
        message: '请提供所有必要字段' 
      });
    }

    // 验证选项格式
    if (!Array.isArray(options)) {
      return res.status(400).json({
        success: false,
        message: '选项必须是数组格式'
      });
    }

    // 验证选项数量
    if (type === '判断' && options.length !== 2) {
      return res.status(400).json({
        success: false,
        message: '判断题必须有且仅有两个选项'
      });
    } else if ((type === '单选' || type === '多选') && options.length < 2) {
      return res.status(400).json({
        success: false,
        message: '选择题至少需要两个选项'
      });
    }

    // 创建问题
    const question = await Question.create({
      title,
      options,
      correctAnswer,
      explanation: explanation || '',
      difficulty,
      type,
      category: category || null
    });

    res.status(201).json({
      success: true,
      message: '问题创建成功',
      question
    });
  } catch (error) {
    console.error('创建问题错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 获取问题列表
exports.getQuestions = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { difficulty, type, category } = req.query;

    const filters = {};
    if (difficulty) filters.difficulty = difficulty;
    if (type) filters.type = type;
    if (category) filters.category = category;

    const result = await Question.getAll(page, limit, filters);

    // 确保结果包含前端期望的字段
    res.status(200).json({
      success: true,
      questions: result.questions || [],
      total: result.total || 0,
      pagination: result.pagination || {
        total: result.totalItems || 0,
        page: result.currentPage || 1,
        limit,
        totalPages: result.totalPages || 1
      },
      ...result
    });
  } catch (error) {
    console.error('获取问题列表错误:', error);
    // 返回空结果以避免前端出错
    res.status(200).json({
      success: false,
      message: '获取问题列表失败',
      questions: [],
      total: 0,
      pagination: {
        total: 0,
        page: 1,
        limit: parseInt(limit) || 10,
        totalPages: 1
      },
      totalItems: 0,
      currentPage: 1,
      totalPages: 1,
      error: error.message
    });
  }
};

// 获取单个问题
exports.getQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    
    if (!questionId) {
      return res.status(400).json({ 
        success: false,
        message: '问题ID是必需的' 
      });
    }
    
    const question = await Question.getById(questionId);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: '问题不存在' 
      });
    }

    res.status(200).json({ 
      success: true,
      question 
    });
  } catch (error) {
    console.error('获取问题错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 更新问题
exports.updateQuestion = async (req, res) => {
  try {
    const { title, options, correctAnswer, explanation, difficulty, type } = req.body;
    const questionId = req.params.id;

    // 检查问题是否存在
    const existingQuestion = await Question.getById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: '问题不存在' });
    }

    // 更新问题
    const updateData = {};
    if (title) updateData.title = title;
    if (options) updateData.options = options;
    if (correctAnswer) updateData.correct_answer = correctAnswer;
    if (explanation) updateData.explanation = explanation;
    if (difficulty) updateData.difficulty = difficulty;
    if (type) updateData.type = type;

    const updated = await Question.update(questionId, updateData);
    if (!updated) {
      return res.status(400).json({ message: '更新失败，没有提供有效的字段' });
    }

    // 获取更新后的问题
    const updatedQuestion = await Question.getById(questionId);

    res.status(200).json({
      message: '问题更新成功',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('更新问题错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除问题
exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    // 检查问题是否存在
    const existingQuestion = await Question.getById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: '问题不存在' });
    }

    // 删除问题
    const deleted = await Question.delete(questionId);
    if (!deleted) {
      return res.status(400).json({ message: '删除失败' });
    }

    res.status(200).json({ message: '问题删除成功' });
  } catch (error) {
    console.error('删除问题错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 收藏问题
exports.addToFavorites = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user.id;
    
    // 检查问题是否存在
    const question = await Question.getById(questionId);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: '问题不存在' 
      });
    }

    await Question.addToFavorites(userId, questionId);

    res.status(200).json({ 
      success: true,
      message: '收藏成功' 
    });
  } catch (error) {
    console.error('收藏问题错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 取消收藏问题
exports.removeFromFavorites = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user.id;

    const removed = await Question.removeFromFavorites(userId, questionId);
    if (!removed) {
      return res.status(404).json({ 
        success: false,
        message: '未找到收藏记录' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: '取消收藏成功' 
    });
  } catch (error) {
    console.error('取消收藏错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 获取用户收藏的问题
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const result = await Question.getUserFavorites(userId, page, limit);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 提交答案
exports.submitAnswer = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { selectedAnswer } = req.body;
    const userId = req.user.id;

    if (!questionId || !selectedAnswer) {
      return res.status(400).json({ 
        success: false,
        message: '问题ID和选择的答案是必需的' 
      });
    }

    // 获取问题
    const question = await Question.getById(questionId);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: '问题不存在' 
      });
    }

    // 检查答案是否正确
    const isCorrect = selectedAnswer === question.correct_answer;

    try {
      // 使用 attemptController 中的记录方法
      const UserAttempt = require('../models/userAttemptsModel');
      await UserAttempt.create(userId, questionId, selectedAnswer, isCorrect);
    } catch (err) {
      console.error('记录答题尝试出错:', err);
      // 继续执行，不中断响应
    }

    res.status(200).json({
      success: true,
      message: isCorrect ? '回答正确！' : '回答错误',
      isCorrect,
      correctAnswer: question.correct_answer,
      explanation: question.explanation
    });
  } catch (error) {
    console.error('提交答案错误:', error);
    res.status(500).json({ 
      success: false,
      message: '服务器错误', 
      error: error.message 
    });
  }
};

// 获取用户答题历史
exports.getUserAttemptHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await Question.getUserAttemptHistory(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('获取答题历史错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 按分类获取问题
exports.getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: '分类参数是必需的'
      });
    }
    
    const result = await Question.getByCategory(category, page, limit);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('按分类获取问题出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 按难度获取问题
exports.getQuestionsByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    if (!difficulty) {
      return res.status(400).json({
        success: false,
        message: '难度参数是必需的'
      });
    }
    
    const result = await Question.getByDifficulty(difficulty, page, limit);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('按难度获取问题出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取随机问题
exports.getRandomQuestion = async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.difficulty) {
      filters.difficulty = req.query.difficulty;
    }
    
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    const question = await Question.getRandom(filters);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: '没有找到符合条件的问题'
      });
    }
    
    res.status(200).json({
      success: true,
      question
    });
  } catch (error) {
    console.error('获取随机问题出错:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
}; 