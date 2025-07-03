const bcrypt = require('bcrypt');

const enteredPin = '992750'; // The one you got from curl bulk update
const hashFromDb = '$2b$10$1s0d3quFCVXBPRCuc83qleBHEybD.5/.3.YpqbJxJhg/7SM/tkqeq';

bcrypt.compare(enteredPin, hashFromDb).then(isValid => {
  console.log(isValid ? '✅ PIN matches' : '❌ PIN does not match');
});
