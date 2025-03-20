const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true // 允许执行多条SQL语句
    });
    
    console.log('连接到MySQL服务器成功');
    
    // 读取SQL文件
    const sqlScript = fs.readFileSync('./database.sql', 'utf8');
    
    // 执行SQL脚本
    console.log('开始执行数据库初始化脚本...');
    await connection.query(sqlScript);
    console.log('数据库初始化成功!');
    
  } catch (error) {
    console.error('初始化数据库时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行初始化函数
initializeDatabase(); 