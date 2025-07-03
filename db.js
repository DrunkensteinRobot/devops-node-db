const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true, // if required
});

client.connect()
  .then(() => {
    console.log(`Connected to database: ${client.database}`);
  })
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;
