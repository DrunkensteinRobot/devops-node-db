const bcrypt = require('bcrypt');
const crypto = require('crypto');

const pin = crypto.randomInt(100000, 999999).toString();

bcrypt.hash(pin, 10).then((hash) => {
  console.log('Use this PIN to log in:', pin);
  console.log('Hashed PIN (store in DB):', hash);
});