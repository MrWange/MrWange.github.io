const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function executeSqlFile(filePath) {
  try {
    // 读取SQL文件内容
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // 分割SQL语句
    const statements = sqlContent
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // 逐个执行SQL语句
    for (const statement of statements) {
      try {
        await pool.execute(statement + ';');
        console.log(`成功执行SQL语句: ${statement.substring(0, 50)}...`);
      } catch (error) {
        console.error(`执行SQL语句时出错: ${statement.substring(0, 50)}...`);
        console.error(error);
      }
    }
    
    console.log('所有SQL语句执行完成!');
  } catch (error) {
    console.error('读取或执行SQL文件时出错:', error);
  }
}

async function createTables() {
  // 执行新表创建脚本
  const newTablesPath = path.join(__dirname, 'create_new_tables.sql');
  await executeSqlFile(newTablesPath);
  
  console.log('数据库表创建完成!');
  
  // 关闭连接池
  await pool.end();
}

// 运行创建表函数
createTables()
  .then(() => {
    console.log('脚本执行完成，数据库表已创建!');
    process.exit(0);
  })
  .catch(error => {
    console.error('脚本执行出错:', error);
    process.exit(1);
  }); 