const { pool } = require('./config/db');

async function addAdminUser() {
  try {
    // 定义SQL语句
    const sql = `
      INSERT INTO users (username, email, password, avatar, role) 
      VALUES (
        'admin', 
        'admin@example.com', 
        '$2b$10$y/PYrWe5prYPD8xz1sfZxOGtk.PlJo0yNBC8pdnhdDjODdJACLZNu', 
        'https://api.dicebear.com/7.x/initials/svg?seed=admin', 
        '管理员'
      )
      ON DUPLICATE KEY UPDATE
        password = '$2b$10$y/PYrWe5prYPD8xz1sfZxOGtk.PlJo0yNBC8pdnhdDjODdJACLZNu',
        role = '管理员'
    `;
    
    console.log('执行SQL:', sql);
    const [result] = await pool.execute(sql);
    console.log('执行结果:', result);
    
    // 查询管理员是否创建成功
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    if (users.length > 0) {
      console.log('管理员用户创建或更新成功:', {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        role: users[0].role
      });
    } else {
      console.log('未找到管理员用户');
    }
    
    console.log('操作完成!');
    process.exit(0);
  } catch (error) {
    console.error('添加管理员用户时出错:', error);
    process.exit(1);
  }
}

addAdminUser(); 