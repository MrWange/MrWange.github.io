const jwt = require('jsonwebtoken');
require('dotenv').config();

// 验证JWT令牌中间件
exports.authenticate = (req, res, next) => {
  try {
    // 从请求头中获取令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未提供授权令牌' });
    }

    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息添加到请求对象中
    req.user = decoded;
    
    console.log(`用户 ${req.user.id} 正在访问 ${req.path}`);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '令牌已过期，请重新登录' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的令牌' });
    }
    console.error('认证错误:', error);
    return res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 验证是否为管理员中间件
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === '管理员') {
    next();
  } else {
    res.status(403).json({ message: '没有权限执行此操作' });
  }
}; 