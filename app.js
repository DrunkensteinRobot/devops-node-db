require('dotenv').config();

const express = require('express');
const { Client } = require('pg');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

app.set('json spaces', 2); // pretty-print JSON output
app.use(express.static('public'));
app.use(express.json());

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve index.html from public folder
  app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB connection error:", err.stack));

// GET all users
app.get('/users/all', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message, err.stack);
    res.status(500).json({
      status: "error",
      message: "❌ Failed to fetch users"
    });
  }
});

// GET user by ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send("Failed to fetch user");
  }
});

// POST a new user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    await client.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding user");
  }
});

// DELETE a user by ID
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

app.listen(port, () => {
  console.log(`🚀 API running at http://localhost:${port}`);
});
