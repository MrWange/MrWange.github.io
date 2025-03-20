-- 创建管理员用户
-- 密码为"aizhishi44."的bcrypt哈希值
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
  role = '管理员'; 