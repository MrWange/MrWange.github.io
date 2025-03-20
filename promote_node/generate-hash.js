const bcrypt = require('bcrypt');

const password = 'aizhishi44.';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('生成哈希错误:', err);
    return;
  }
  console.log('密码:', password);
  console.log('哈希值:', hash);
}); 