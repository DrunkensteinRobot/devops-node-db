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

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the DevOps Node API</h1>
    <form id="userForm">
      <h3>Add User</h3>
      <input type="text" id="name" placeholder="Name" required />
      <input type="email" id="email" placeholder="Email" required />
      <button type="submit">Add User</button>
    </form>
    <br/>
    <h3>Find User by ID</h3>
    <input type="number" id="searchId" placeholder="Enter user ID" />
    <button onclick="fetchUserById()">Get User</button>
    <pre id="foundUser"></pre>
    <br/>
    <h3>Users</h3>
    <table border="1" id="userTable">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Delete</th></tr>
      </thead>
      <tbody></tbody>
    </table>

    <script>
      async function loadUsers() {
        const res = await fetch('/users/all');
        const users = await res.json();
        const tbody = document.querySelector('#userTable tbody');
        tbody.innerHTML = '';
        users.forEach(u => {
          const row = `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td><button onclick="deleteUser(${u.id})">Delete</button></td></tr>`;
          tbody.innerHTML += row;
        });
      }

      async function deleteUser(id) {
        await fetch(`/users/${id}`, { method: 'DELETE' });
        loadUsers();
      }

      async function fetchUserById() {
        const id = document.getElementById('searchId').value;
        if (!id) return;
        const res = await fetch(`/users/${id}`);
        const data = await res.json();
        document.getElementById('foundUser').textContent = JSON.stringify(data, null, 2);
      }

      document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        await fetch('/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email })
        });
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        loadUsers();
      });

      loadUsers();
    </script>
  `);
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
