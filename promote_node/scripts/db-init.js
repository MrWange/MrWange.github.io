const { pool } = require('../config/db');

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 创建user_attempts表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_answer VARCHAR(255) NOT NULL,
        is_correct BOOLEAN NOT NULL,
        attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        INDEX (question_id)
      )
    `);
    console.log('user_attempts表创建成功或已存在');
    
    // 创建discussions表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS discussions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (user_id)
      )
    `);
    console.log('discussions表创建成功或已存在');
    
    // 创建user_favorites表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question_id INT NOT NULL,
        favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (user_id, question_id),
        INDEX (user_id),
        INDEX (question_id)
      )
    `);
    console.log('user_favorites表创建成功或已存在');
    
    // 创建comments表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        discussion_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        report_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (discussion_id),
        INDEX (user_id)
      )
    `);
    console.log('comments表创建成功或已存在');

    // 创建comment_reports表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS comment_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        reporter_id INT NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_report (comment_id, reporter_id),
        INDEX (comment_id),
        INDEX (reporter_id)
      )
    `);
    console.log('comment_reports表创建成功或已存在');
    
    // 修改contests表的date字段类型
    await pool.execute(`
      ALTER TABLE contests 
      MODIFY COLUMN date DATETIME NOT NULL
    `);
    console.log('修改contests表date字段类型成功');
    
    // 检查questions表是否存在
    const [tableExists] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'questions'
    `);
    
    if (tableExists[0].count > 0) {
      // 检查questions表是否有category字段
      const [categoryExists] = await pool.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'questions' 
        AND column_name = 'category'
      `);
      
      if (categoryExists[0].count === 0) {
        await pool.execute(`
          ALTER TABLE questions 
          ADD COLUMN category VARCHAR(50) NULL,
          ADD INDEX (category)
        `);
        console.log('为questions表添加category字段成功');
      } else {
        console.log('questions表的category字段已存在');
      }

      // 修改correct_answer字段类型
      await pool.execute(`
        ALTER TABLE questions 
        MODIFY COLUMN correct_answer VARCHAR(10) NOT NULL
      `);
      console.log('修改correct_answer字段类型成功');
    } else {
      console.log('questions表不存在，将创建...');
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS questions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title TEXT NOT NULL,
          options JSON,
          correct_answer VARCHAR(10) NOT NULL,
          explanation TEXT,
          difficulty VARCHAR(20) NOT NULL,
          type VARCHAR(20) NOT NULL,
          category VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX (difficulty),
          INDEX (type),
          INDEX (category)
        )
      `);
      console.log('questions表创建成功');
    }
    
    // 添加一些示例问题（如果表是空的）
    const [questionCount] = await pool.execute('SELECT COUNT(*) as count FROM questions');
    
    if (questionCount[0].count === 0) {
      await addSampleQuestions();
      console.log('添加示例问题成功');
    }
    
    console.log('数据库初始化完成!');
  } catch (error) {
    console.error('初始化数据库时出错:', error);
  } finally {
    // 关闭数据库连接
    await pool.end();
  }
}

async function addSampleQuestions() {
  const sampleQuestions = [
    {
      title: '下列哪种数据结构是线性的?',
      options: JSON.stringify(['数组', '二叉树', '图', '哈希表']),
      correct_answer: 'A',
      explanation: '数组是一种线性数据结构，而二叉树、图和哈希表都是非线性数据结构。',
      difficulty: '简单',
      type: '单选',
      category: '数据结构'
    },
    {
      title: 'JavaScript中，以下哪种方法可以用来遍历数组?',
      options: JSON.stringify(['forEach', 'map', 'filter', '以上都是']),
      correct_answer: 'D',
      explanation: 'forEach、map和filter都是JavaScript数组的内置方法，可以用来遍历数组。',
      difficulty: '简单',
      type: '单选',
      category: 'JavaScript'
    },
    {
      title: '在时间复杂度方面，快速排序的平均情况是什么?',
      options: JSON.stringify(['O(n)', 'O(n log n)', 'O(n²)', 'O(1)']),
      correct_answer: 'B',
      explanation: '快速排序的平均时间复杂度是O(n log n)，最坏情况是O(n²)。',
      difficulty: '中等',
      type: '单选',
      category: '算法'
    },
    {
      title: 'HTTP协议是什么层的协议?',
      options: JSON.stringify(['应用层', '传输层', '网络层', '数据链路层']),
      correct_answer: 'A',
      explanation: 'HTTP协议是应用层协议，它定义了浏览器和服务器之间交换数据的格式和规则。',
      difficulty: '简单',
      type: '单选',
      category: '网络'
    },
    {
      title: '以下哪个不是React的生命周期方法?',
      options: JSON.stringify(['componentDidMount', 'componentWillReceiveProps', 'onRender', 'componentDidUpdate']),
      correct_answer: 'C',
      explanation: 'React没有onRender生命周期方法，其他三个都是React的生命周期方法。',
      difficulty: '中等',
      type: '单选',
      category: 'React'
    }
  ];
  
  for (const question of sampleQuestions) {
    await pool.execute(`
      INSERT INTO questions (title, options, correct_answer, explanation, difficulty, type, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      question.title,
      question.options,
      question.correct_answer,
      question.explanation,
      question.difficulty,
      question.type,
      question.category
    ]);
  }
}

// 运行初始化函数
initDatabase()
  .then(() => {
    console.log('数据库初始化脚本执行完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('执行数据库初始化脚本时出错:', error);
    process.exit(1);
  }); 