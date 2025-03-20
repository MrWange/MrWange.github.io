const StudyRecord = require('../models/studyModel');

// 记录学习时间
exports.recordStudyTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { minutes } = req.body;
    
    // 获取当前日期 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // 检查参数
    if (!minutes || minutes <= 0) {
      return res.status(400).json({ message: '请提供有效的学习时间(分钟)' });
    }
    
    // 记录学习时间
    const result = await StudyRecord.recordStudyTime(userId, today, minutes);
    
    if (result) {
      res.status(200).json({ message: '学习时间记录成功' });
    } else {
      res.status(400).json({ message: '记录学习时间失败' });
    }
  } catch (error) {
    console.error('记录学习时间错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取学习记录
exports.getStudyRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 7;
    
    const records = await StudyRecord.getStudyRecords(userId, days);
    
    res.status(200).json({ records });
  } catch (error) {
    console.error('获取学习记录错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取今日学习时间
exports.getTodayStudyTime = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const studyTime = await StudyRecord.getTodayStudyTime(userId);
    
    res.status(200).json({ studyTime });
  } catch (error) {
    console.error('获取今日学习时间错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取本周学习时间
exports.getWeeklyStudyTime = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const studyTime = await StudyRecord.getWeeklyStudyTime(userId);
    
    res.status(200).json({ studyTime });
  } catch (error) {
    console.error('获取本周学习时间错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 