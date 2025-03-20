const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// 注册新用户
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查必要字段
    if (!username || !email || !password) {
      return res.status(400).json({ message: '请提供用户名、邮箱和密码' });
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }

    // 创建新用户
    const newUser = await User.create(username, email, password);

    // 记录活动日志
    await pool.execute(
      'INSERT INTO activity_logs (user_id, activity_type, description) VALUES (?, ?, ?)',
      [newUser.id, '注册', '用户注册成功']
    );

    res.status(201).json({
      message: '注册成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查提供了用户名或邮箱
    if ((!username && !email) || !password) {
      return res.status(400).json({ message: '请提供用户名/邮箱和密码' });
    }

    // 获取用户（通过用户名或邮箱）
    let user = null;
    if (username) {
      user = await User.findByUsername(username);
    } else if (email) {
      user = await User.findByEmail(email);
    }

    if (!user) {
      return res.status(401).json({ message: '用户名/邮箱或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await User.verifyPassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名/邮箱或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 记录活动日志
    await pool.execute(
      'INSERT INTO activity_logs (user_id, activity_type, description) VALUES (?, ?, ?)',
      [user.id, '登录', '用户登录成功']
    );

    res.status(200).json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新用户信息
exports.updateUser = async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    const userId = req.user.id;

    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 如果要更新用户名，检查是否已存在
    if (username && username !== user.username) {
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: '用户名已存在' });
      }
    }

    // 如果要更新邮箱，检查是否已存在
    if (email && email !== user.email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: '邮箱已被注册' });
      }
    }

    // 更新用户信息
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;

    const updated = await User.update(userId, updateData);
    if (!updated) {
      return res.status(400).json({ message: '更新失败，没有提供有效的字段' });
    }

    // 获取更新后的用户信息
    const updatedUser = await User.findById(userId);

    res.status(200).json({
      message: '用户信息更新成功',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更改密码
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 检查必要字段
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '请提供当前密码和新密码' });
    }

    // 获取用户
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 验证当前密码
    const fullUser = await User.findByUsername(user.username);
    const isPasswordValid = await User.verifyPassword(fullUser, currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '当前密码错误' });
    }

    // 更新密码
    await User.updatePassword(userId, newPassword);

    res.status(200).json({ message: '密码更新成功' });
  } catch (error) {
    console.error('更改密码错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户列表（仅管理员）
exports.getAllUsers = async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== '管理员') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await User.getAll(page, limit);

    res.status(200).json(result);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户统计数据
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 查询用户信息
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 查询做题总数
    const [attemptsResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_question_attempts WHERE user_id = ?',
      [userId]
    );
    const totalAttempts = attemptsResult[0].total;

    // 查询正确率
    const [correctResult] = await pool.execute(
      'SELECT COUNT(*) as correct FROM user_question_attempts WHERE user_id = ? AND is_correct = true',
      [userId]
    );
    const correctAttempts = correctResult[0].correct;
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts * 100).toFixed(2) : 0;

    // 查询收藏总数
    const [favoritesResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?',
      [userId]
    );
    const totalFavorites = favoritesResult[0].total;

    // 查询最近7天的学习记录
    const [studyRecords] = await pool.execute(
      `SELECT date, study_time FROM study_records 
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       ORDER BY date ASC`,
      [userId]
    );

    // 计算本周学习时间总和（分钟）
    const weeklyStudyTime = studyRecords.reduce((sum, record) => sum + record.study_time, 0);

    // 按难度统计题目数量
    const [difficultyStats] = await pool.execute(
      `SELECT q.difficulty, COUNT(*) as count
       FROM user_question_attempts uqa
       JOIN questions q ON uqa.question_id = q.id
       WHERE uqa.user_id = ?
       GROUP BY q.difficulty`,
      [userId]
    );

    // 最近5次答题记录
    const [recentAttempts] = await pool.execute(
      `SELECT uqa.*, q.title, q.difficulty, q.type
       FROM user_question_attempts uqa
       JOIN questions q ON uqa.question_id = q.id
       WHERE uqa.user_id = ?
       ORDER BY uqa.attempt_time DESC
       LIMIT 5`,
      [userId]
    );

    res.status(200).json({
      stats: {
        totalAttempts,
        correctAttempts,
        accuracy: parseFloat(accuracy),
        totalFavorites,
        weeklyStudyTime,
        difficultyStats,
        recentAttempts,
        studyRecords
      }
    });
  } catch (error) {
    console.error('获取用户统计数据错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 