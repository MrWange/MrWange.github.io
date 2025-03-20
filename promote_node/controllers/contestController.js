const Contest = require('../models/contestModel');

// 获取竞赛列表
exports.getContests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await Contest.getAll(
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('获取竞赛列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取单个竞赛
exports.getContest = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.getById(id);
    if (!contest) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    res.status(200).json({ contest });
  } catch (error) {
    console.error('获取竞赛错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 创建竞赛
exports.createContest = async (req, res) => {
  try {
    const { title, date, description } = req.body;

    // 验证必要字段
    if (!title || !date) {
      return res.status(400).json({ message: '请提供标题和日期' });
    }

    // 创建竞赛
    const contest = await Contest.create(title, date, description || '');

    res.status(201).json({
      message: '竞赛创建成功',
      contest
    });
  } catch (error) {
    console.error('创建竞赛错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新竞赛
exports.updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, description } = req.body;

    // 检查竞赛是否存在
    const contest = await Contest.getById(id);
    if (!contest) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    // 更新竞赛
    const updateData = {};
    if (title) updateData.title = title;
    if (date) updateData.date = date;
    if (description !== undefined) updateData.description = description;

    const updated = await Contest.update(id, updateData);
    if (!updated) {
      return res.status(400).json({ message: '更新失败，没有提供有效的字段' });
    }

    // 获取更新后的竞赛
    const updatedContest = await Contest.getById(id);

    res.status(200).json({
      message: '竞赛更新成功',
      contest: updatedContest
    });
  } catch (error) {
    console.error('更新竞赛错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除竞赛
exports.deleteContest = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查竞赛是否存在
    const contest = await Contest.getById(id);
    if (!contest) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    // 删除竞赛
    const deleted = await Contest.delete(id);
    if (!deleted) {
      return res.status(400).json({ message: '删除失败' });
    }

    res.status(200).json({ message: '竞赛删除成功' });
  } catch (error) {
    console.error('删除竞赛错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 用户报名竞赛
exports.registerForContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    // 检查竞赛是否存在
    const contest = await Contest.getById(contestId);
    if (!contest) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    // 检查竞赛日期是否已过
    const contestDate = new Date(contest.date);
    const today = new Date();
    if (contestDate < today) {
      return res.status(400).json({ message: '此竞赛已结束，不能报名' });
    }

    // 报名竞赛
    try {
      await Contest.register(userId, contestId);
      res.status(200).json({ message: '报名成功' });
    } catch (error) {
      if (error.message === '用户已报名此竞赛') {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('报名竞赛错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 取消报名
exports.cancelRegistration = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    // 检查竞赛是否存在
    const contest = await Contest.getById(contestId);
    if (!contest) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    // 检查用户是否已报名
    const isRegistered = await Contest.isRegistered(userId, contestId);
    if (!isRegistered) {
      return res.status(400).json({ message: '您尚未报名此竞赛' });
    }

    // 检查竞赛日期是否已过
    const contestDate = new Date(contest.date);
    const today = new Date();
    if (contestDate < today) {
      return res.status(400).json({ message: '此竞赛已结束，不能取消报名' });
    }

    // 取消报名
    const canceled = await Contest.cancelRegistration(userId, contestId);
    if (!canceled) {
      return res.status(400).json({ message: '取消报名失败' });
    }

    res.status(200).json({ message: '取消报名成功' });
  } catch (error) {
    console.error('取消报名错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 检查用户是否已报名
exports.checkRegistration = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.id;

    const isRegistered = await Contest.isRegistered(userId, contestId);

    res.status(200).json({ isRegistered });
  } catch (error) {
    console.error('检查报名状态错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取竞赛的报名用户列表
exports.getRegisteredUsers = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 检查竞赛是否存在
    const contest = await Contest.getById(contestId);
    if (!contest) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    const result = await Contest.getRegisteredUsers(
      contestId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('获取报名用户列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户报名的竞赛列表
exports.getUserContests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await Contest.getUserContests(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('获取用户竞赛列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 