// hash.js
const bcrypt = require('bcrypt');

const password = 'Devops@123';

bcrypt.hash(password, 10).then(hash => {
  console.log('🔐 Hashed Password:', hash);
});
