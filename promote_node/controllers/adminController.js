const { pool } = require('../config/db');
const Notification = require('../models/notificationModel');

// 获取所有通知（管理员用）
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // 获取所有通知（分页）
    const offset = (page - 1) * limit;
    
    const [notifications] = await pool.execute(
      `SELECT n.*, u.username as recipient_name
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );
    
    // 获取总数
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM notifications'
    );
    
    const total = countResult[0].total;
    
    res.status(200).json({
      notifications,
      totalItems: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 创建系统通知（发送给所有用户或特定用户）
exports.createSystemNotification = async (req, res) => {
  try {
    const { content, userId = null } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: '请提供通知内容' });
    }
    
    if (userId) {
      // 发送给特定用户
      await Notification.create(userId, content, '系统');
      
      res.status(201).json({ message: '通知发送成功' });
    } else {
      // 发送给所有用户
      // 获取所有用户ID
      const [users] = await pool.execute('SELECT id FROM users');
      
      // 为每个用户创建通知
      for (const user of users) {
        await Notification.create(user.id, content, '系统');
      }
      
      res.status(201).json({ 
        message: '已向所有用户发送通知',
        userCount: users.length
      });
    }
  } catch (error) {
    console.error('创建系统通知错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除通知
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '通知不存在' });
    }
    
    res.status(200).json({ message: '通知已删除' });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取最近活动
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // 获取最近的活动日志
    const [activities] = await pool.execute(
      `SELECT al.*, u.username
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.activity_time DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    
    res.status(200).json({
      activities: activities.map(activity => ({
        id: activity.id,
        userId: activity.user_id,
        username: activity.username,
        type: activity.activity_type,
        description: activity.description,
        time: activity.activity_time
      }))
    });
  } catch (error) {
    console.error('获取最近活动错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取系统概览数据
exports.getDashboardStats = async (req, res) => {
  try {
    // 获取用户总数
    const [userCountResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult[0].count;
    
    // 获取问题总数
    const [questionCountResult] = await pool.execute('SELECT COUNT(*) as count FROM questions');
    const questionCount = questionCountResult[0].count;
    
    // 获取讨论总数
    const [discussionCountResult] = await pool.execute('SELECT COUNT(*) as count FROM discussions');
    const discussionCount = discussionCountResult[0].count;
    
    // 获取竞赛总数
    const [contestCountResult] = await pool.execute('SELECT COUNT(*) as count FROM contests');
    const contestCount = contestCountResult[0].count;
    
    // 获取今日活跃用户数
    const [todayActiveUsersResult] = await pool.execute(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM activity_logs 
       WHERE DATE(activity_time) = CURDATE()`
    );
    const todayActiveUsers = todayActiveUsersResult[0].count;
    
    // 获取今日新增用户
    const [todayNewUsersResult] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE DATE(created_at) = CURDATE()`
    );
    const todayNewUsers = todayNewUsersResult[0].count;
    
    res.status(200).json({
      totalUsers: userCount,
      totalQuestions: questionCount,
      totalDiscussions: discussionCount,
      totalContests: contestCount,
      todayActiveUsers,
      todayNewUsers
    });
  } catch (error) {
    console.error('获取仪表板统计错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户详情
exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取用户基本信息
    const [users] = await pool.execute(
      `SELECT id, username, email, role, created_at
       FROM users
       WHERE id = ?`,
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const user = users[0];
    
    // 获取用户统计数据（包括讨论和评论数）
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT d.id) as discussion_count,
        COUNT(DISTINCT c.id) as comment_count
       FROM users u
       LEFT JOIN discussions d ON u.id = d.author_id
       LEFT JOIN comments c ON u.id = c.author_id
       WHERE u.id = ?`,
      [id]
    );

    // 获取答题统计
    const [attemptStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts
       FROM user_attempts
       WHERE user_id = ?`,
      [id]
    );

    // 获取收藏题目数量
    const [favoriteStats] = await pool.execute(
      `SELECT COUNT(*) as favorite_count
       FROM user_favorites
       WHERE user_id = ?`,
      [id]
    );

    // 获取总学习时长（分钟）
    const [studyTimeTotal] = await pool.execute(
      `SELECT SUM(study_time) as total_duration
       FROM study_records
       WHERE user_id = ?`,
      [id]
    );
    
    // 获取用户最近的活动记录
    const [recentActivities] = await pool.execute(
      `SELECT 
        activity_type as type,
        description,
        activity_time as time
       FROM activity_logs
       WHERE user_id = ?
       ORDER BY activity_time DESC
       LIMIT 10`,
      [id]
    );
    
    // 获取最近7天的学习时长统计
    const [studyTimeStats] = await pool.execute(
      `SELECT 
        DATE(date) as date,
        SUM(study_time) as total_time
       FROM study_records
       WHERE user_id = ? 
       AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(date)
       ORDER BY date DESC`,
      [id]
    );
    
    // 计算正确率
    const totalAttempts = attemptStats[0]?.total_attempts || 0;
    const correctAttempts = attemptStats[0]?.correct_attempts || 0;
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts * 100).toFixed(2) : 0;
    
    res.status(200).json({
      user: {
        ...user,
        stats: {
          ...stats[0],
          total_attempts: totalAttempts,
          correct_attempts: correctAttempts,
          accuracy: parseFloat(accuracy),
          favorite_count: favoriteStats[0]?.favorite_count || 0,
          total_study_time: studyTimeTotal[0]?.total_duration || 0
        },
        recentActivities,
        studyTimeStats
      }
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户统计数据
exports.getUserStats = async (req, res) => {
  try {
    // 获取总用户数
    const [totalUsersResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM users'
    );
    
    // 获取今日新增用户数
    const [newTodayResult] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE DATE(created_at) = CURDATE()`
    );
    
    // 获取本周新增用户数
    const [newThisWeekResult] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );
    
    // 获取本月新增用户数
    const [newThisMonthResult] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    );
    
    // 获取用户注册趋势（最近30天）
    const [registerTrend] = await pool.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM users
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`
    );
    
    // 获取用户活动数据（最近7天）
    const [activityData] = await pool.execute(
      `SELECT 
        DATE(al.activity_time) as date,
        COUNT(DISTINCT CASE WHEN al.activity_type = '答题' THEN al.id END) as attempts,
        COUNT(DISTINCT CASE WHEN al.activity_type = '发布讨论' THEN al.id END) as discussions,
        COUNT(DISTINCT CASE WHEN al.activity_type = '发表评论' THEN al.id END) as comments
       FROM activity_logs al
       WHERE al.activity_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(al.activity_time)
       ORDER BY date`
    );
    
    // 获取用户角色分布
    const [roleDist] = await pool.execute(
      `SELECT 
        CASE 
          WHEN role = 'admin' THEN '管理员'
          ELSE '普通用户'
        END as name,
        COUNT(*) as value
       FROM users
       GROUP BY role`
    );
    
    // 获取答题正确率分布
    const [accuracyDist] = await pool.execute(
      `SELECT 
        accuracy_range as name,
        COUNT(*) as value
       FROM (
         SELECT 
           CASE 
             WHEN accuracy >= 90 THEN '90-100%'
             WHEN accuracy >= 80 THEN '80-89%'
             WHEN accuracy >= 70 THEN '70-79%'
             WHEN accuracy >= 60 THEN '60-69%'
             ELSE '60%以下'
           END as accuracy_range
         FROM (
           SELECT 
             user_id,
             CASE 
               WHEN total_attempts > 0 
               THEN (correct_attempts / total_attempts * 100)
               ELSE 0 
             END as accuracy
           FROM (
             SELECT 
               user_id,
               COUNT(*) as total_attempts,
               SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts
             FROM user_attempts
             GROUP BY user_id
           ) as user_accuracy
         ) as accuracy_ranges
       ) as ranges
       GROUP BY accuracy_range
       ORDER BY accuracy_range DESC`
    );
    
    // 获取用户活跃频次分布
    const [activityFreq] = await pool.execute(
      `SELECT 
        activity_level as name,
        COUNT(*) as value
       FROM (
         SELECT 
           CASE 
             WHEN active_days >= 20 THEN '非常活跃(20天以上)'
             WHEN active_days >= 10 THEN '活跃(10-19天)'
             WHEN active_days >= 5 THEN '较活跃(5-9天)'
             WHEN active_days >= 1 THEN '偶尔活跃(1-4天)'
             ELSE '不活跃(0天)'
           END as activity_level
         FROM (
           SELECT 
             u.id,
             COUNT(DISTINCT DATE(al.activity_time)) as active_days
           FROM users u
           LEFT JOIN activity_logs al ON u.id = al.user_id
           AND al.activity_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
           GROUP BY u.id
         ) as user_activity
       ) as activity_levels
       GROUP BY activity_level
       ORDER BY 
         CASE activity_level
           WHEN '非常活跃(20天以上)' THEN 1
           WHEN '活跃(10-19天)' THEN 2
           WHEN '较活跃(5-9天)' THEN 3
           WHEN '偶尔活跃(1-4天)' THEN 4
           ELSE 5
         END`
    );
    
    // 获取最活跃用户
    const [mostActiveUsers] = await pool.execute(
      `SELECT 
        u.id,
        u.username,
        u.role,
        COUNT(DISTINCT ua.id) as attempt_count,
        COUNT(DISTINCT d.id) as discussion_count,
        COUNT(DISTINCT c.id) as comment_count
       FROM users u
       LEFT JOIN user_attempts ua ON u.id = ua.user_id
       LEFT JOIN discussions d ON u.id = d.author_id
       LEFT JOIN comments c ON u.id = c.author_id
       GROUP BY u.id, u.username, u.role
       ORDER BY (COUNT(DISTINCT ua.id) + COUNT(DISTINCT d.id) * 2 + COUNT(DISTINCT c.id)) DESC
       LIMIT 10`
    );

    // 确保所有数据都有默认值
    const result = {
      totalUsers: parseInt(totalUsersResult[0].total) || 0,
      newToday: parseInt(newTodayResult[0].count) || 0,
      newThisWeek: parseInt(newThisWeekResult[0].count) || 0,
      newThisMonth: parseInt(newThisMonthResult[0].count) || 0,
      registerTrend: registerTrend.map(item => ({
        date: item.date,
        count: parseInt(item.count)
      })),
      activityData: activityData.map(item => ({
        date: item.date,
        attempts: parseInt(item.attempts) || 0,
        discussions: parseInt(item.discussions) || 0,
        comments: parseInt(item.comments) || 0
      })),
      roleDist: roleDist.map(item => ({
        name: item.name,
        value: parseInt(item.value)
      })),
      accuracyDist: accuracyDist.map(item => ({
        name: item.name,
        value: parseInt(item.value)
      })),
      activityFreq: activityFreq.map(item => ({
        name: item.name,
        value: parseInt(item.value)
      })),
      mostActiveUsers: mostActiveUsers.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role === 'admin' ? '管理员' : '普通用户',
        attempt_count: parseInt(user.attempt_count) || 0,
        discussion_count: parseInt(user.discussion_count) || 0,
        comment_count: parseInt(user.comment_count) || 0
      }))
    };

    console.log('User stats response:', JSON.stringify(result, null, 2));
    res.status(200).json(result);
  } catch (error) {
    console.error('获取用户统计数据错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取所有评论（管理员用）
exports.getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all', keyword = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.author_id,
        u.username as author_name,
        c.discussion_id,
        d.title as discussion_title,
        (SELECT COUNT(*) FROM comment_reports WHERE comment_id = c.id) as report_count
      FROM comments c
      JOIN users u ON c.author_id = u.id
      JOIN discussions d ON c.discussion_id = d.id
    `;
    
    const params = [];
    
    // 添加过滤条件
    const conditions = [];
    if (status === 'reported') {
      conditions.push('EXISTS (SELECT 1 FROM comment_reports WHERE comment_id = c.id)');
    }
    if (keyword) {
      conditions.push('c.content LIKE ?');
      params.push(`%${keyword}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // 添加排序和分页
    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [comments] = await pool.execute(query, params);
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM comments c';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [countResult] = await pool.execute(countQuery, params.slice(0, -2));
    const total = countResult[0].total;
    
    res.status(200).json({
      comments,
      totalItems: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取评论详情（管理员用）
exports.getCommentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [comments] = await pool.execute(
      `SELECT 
        c.id,
        c.content,
        c.created_at,
        c.author_id,
        u.username as author_name,
        c.discussion_id,
        d.title as discussion_title,
        (SELECT COUNT(*) FROM comment_reports WHERE comment_id = c.id) as report_count
      FROM comments c
      JOIN users u ON c.author_id = u.id
      JOIN discussions d ON c.discussion_id = d.id
      WHERE c.id = ?`,
      [id]
    );
    
    if (comments.length === 0) {
      return res.status(404).json({ message: '评论不存在' });
    }
    
    const comment = comments[0];
    
    // 获取举报信息
    const [reports] = await pool.execute(
      `SELECT 
        cr.id,
        cr.reporter_id,
        u.username as reporter_name,
        cr.reason,
        cr.created_at as report_time
      FROM comment_reports cr
      JOIN users u ON cr.reporter_id = u.id
      WHERE cr.comment_id = ?`,
      [id]
    );
    
    comment.reports = reports;
    
    res.status(200).json(comment);
  } catch (error) {
    console.error('获取评论详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 