require('dotenv').config();

const express = require('express');
const { Client } = require('pg');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

app.set('json spaces', 2);
app.use(express.static('public'));
app.use(express.json());

// PostgreSQL client setup
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB connection error:", err.stack));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// UI Homepage with user add/delete buttons
app.get('/', async (req, res) => {
  const users = await client.query('SELECT * FROM users ORDER BY id');
  const userRows = users.rows.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><button onclick="deleteUser(${user.id})">Delete</button></td>
    </tr>`).join('');

  res.send(`
    <h1>DevOps Node API - User Management</h1>
    <form id="addUserForm">
      <input type="text" id="name" placeholder="Name" required>
      <input type="email" id="email" placeholder="Email" required>
      <button type="submit">Add User</button>
    </form>
    <table border="1">
      <tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr>
      ${userRows}
    </table>
    <script>
      document.getElementById('addUserForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        const res = await fetch('/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email })
        });

        if (res.ok) {
          alert('User added successfully!');
          location.reload();
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to add user');
        }
      });

      async function deleteUser(id) {
        const confirmDelete = confirm('Are you sure you want to delete this user?');
        if (!confirmDelete) return;

        const res = await fetch(`/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
          alert('User deleted successfully!');
          location.reload();
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to delete user');
        }
      }
    </script>
  `);
});

// CRUD endpoints
app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ status: "error", message: "❌ Failed to fetch users" });
  }
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

  try {
    const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) return res.status(409).json({ error: "Email already exists" });

    await client.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding user");
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

app.listen(port, () => {
  console.log(`🚀 API running at http://localhost:${port}`);
});
