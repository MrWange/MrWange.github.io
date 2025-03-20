const { pool } = require('../config/db');

// 举报评论
exports.reportComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;
    const reporterId = req.user.id;

    // 验证必要字段
    if (!reason) {
      return res.status(400).json({ message: '请提供举报原因' });
    }

    // 检查评论是否存在
    const [comments] = await pool.execute(
      'SELECT id, author_id FROM comments WHERE id = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 检查是否是自己的评论
    if (comments[0].author_id === reporterId) {
      return res.status(400).json({ message: '不能举报自己的评论' });
    }

    // 检查是否已经举报过
    const [existingReports] = await pool.execute(
      'SELECT id FROM comment_reports WHERE comment_id = ? AND reporter_id = ?',
      [commentId, reporterId]
    );

    if (existingReports.length > 0) {
      return res.status(400).json({ message: '您已经举报过这条评论' });
    }

    // 创建举报记录
    await pool.execute(
      'INSERT INTO comment_reports (comment_id, reporter_id, reason) VALUES (?, ?, ?)',
      [commentId, reporterId, reason]
    );

    res.status(201).json({ message: '举报成功' });
  } catch (error) {
    console.error('举报评论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 举报讨论
exports.reportDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { reason } = req.body;
    const reporterId = req.user.id;

    // 验证必要字段
    if (!reason) {
      return res.status(400).json({ message: '请提供举报原因' });
    }

    // 检查讨论是否存在
    const [discussions] = await pool.execute(
      'SELECT id, author_id FROM discussions WHERE id = ?',
      [discussionId]
    );

    if (discussions.length === 0) {
      return res.status(404).json({ message: '讨论不存在' });
    }

    // 检查是否是自己的讨论
    if (discussions[0].author_id === reporterId) {
      return res.status(400).json({ message: '不能举报自己的讨论' });
    }

    // 检查是否已经举报过
    const [existingReports] = await pool.execute(
      'SELECT id FROM discussion_reports WHERE discussion_id = ? AND reporter_id = ?',
      [discussionId, reporterId]
    );

    if (existingReports.length > 0) {
      return res.status(400).json({ message: '您已经举报过这个讨论' });
    }

    // 创建举报记录
    await pool.execute(
      'INSERT INTO discussion_reports (discussion_id, reporter_id, reason) VALUES (?, ?, ?)',
      [discussionId, reporterId, reason]
    );

    res.status(201).json({ message: '举报成功' });
  } catch (error) {
    console.error('举报讨论错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取评论举报列表（管理员用）
exports.getCommentReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [reports] = await pool.execute(
      `SELECT 
        cr.id,
        cr.comment_id,
        cr.reporter_id,
        cr.reason,
        cr.created_at,
        c.content as comment_content,
        u1.username as reporter_name,
        u2.username as comment_author_name
      FROM comment_reports cr
      JOIN comments c ON cr.comment_id = c.id
      JOIN users u1 ON cr.reporter_id = u1.id
      JOIN users u2 ON c.author_id = u2.id
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM comment_reports'
    );

    res.status(200).json({
      reports,
      pagination: {
        total: countResult[0].total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('获取评论举报列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取讨论举报列表（管理员用）
exports.getDiscussionReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [reports] = await pool.execute(
      `SELECT 
        dr.id,
        dr.discussion_id,
        dr.reporter_id,
        dr.reason,
        dr.created_at,
        d.title as discussion_title,
        u1.username as reporter_name,
        u2.username as discussion_author_name
      FROM discussion_reports dr
      JOIN discussions d ON dr.discussion_id = d.id
      JOIN users u1 ON dr.reporter_id = u1.id
      JOIN users u2 ON d.author_id = u2.id
      ORDER BY dr.created_at DESC
      LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM discussion_reports'
    );

    res.status(200).json({
      reports,
      pagination: {
        total: countResult[0].total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('获取讨论举报列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除评论举报
exports.deleteCommentReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // 检查举报记录是否存在
    const [reports] = await pool.execute(
      'SELECT id FROM comment_reports WHERE comment_id = ?',
      [reportId]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: '举报记录不存在' });
    }

    // 删除举报记录
    await pool.execute(
      'DELETE FROM comment_reports WHERE comment_id = ?',
      [reportId]
    );
    // 删除评论记录
    await pool.execute(
      'DELETE FROM comments WHERE id = ?',
      [reportId]
    );

    res.status(200).json({ message: '举报记录删除成功' });
  } catch (error) {
    console.error('删除评论举报错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除讨论举报
exports.deleteDiscussionReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // 检查举报记录是否存在
    const [reports] = await pool.execute(
      'SELECT id FROM discussion_reports WHERE discussion_id = ?',
      [reportId]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: '举报记录不存在' });
    }

    // 删除举报记录
    await pool.execute(
      'DELETE FROM discussion_reports WHERE discussion_id = ?',
      [reportId]
    );
    // 删除讨论记录
    await pool.execute(
      'DELETE FROM discussions WHERE id = ?',
      [reportId]
    );

    res.status(200).json({ message: '举报记录删除成功' });
  } catch (error) {
    console.error('删除讨论举报错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 