const { Client } = require('pg');

// Database config
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'lkone', // Replace with your real password
  database: 'devops_lab'
});

// Connect and query
client.connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL');
    return client.query('SELECT * FROM users');
  })
  .then(res => {
    console.table(res.rows);
  })
  .catch(err => {
    console.error('❌ Error executing query:', err);
  })
  .finally(() => {
    client.end();
  });
