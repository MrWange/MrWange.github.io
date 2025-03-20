-- 创建用户答题尝试记录表
CREATE TABLE IF NOT EXISTS user_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_answer VARCHAR(255) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (question_id)
);

-- 确保questions表有category字段
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) NULL,
ADD INDEX (category); 