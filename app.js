require('dotenv').config();

const express = require('express');
const { Client } = require('pg');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const port = 3000;
const port = process.env.PORT || 3000;

app.set('json spaces', 2); // pretty-print JSON output
app.use(express.static('public'));
app.use(express.json());
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the DevOps Node API</h1>
    <p>Available endpoints:</p>
    <ul>
      <li><a href="/users">/users</a></li>
      <li><a href="/customers">/customers</a></li>
    </ul>
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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 */
app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message, err.stack);
    res.status(500).json({
  status: "error",
  message: "❌ Failed to fetch users"
});
});

  }
});


// POST a new user with validation and duplicate check

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    // Check for duplicate email
    const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    await client.query(
      'INSERT INTO users (name, email) VALUES ($1, $2)',
      [name, email]
    );
    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding user");
  }
});

// PUT - update a user by ID
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const result = await client.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
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

// GET all customers
app.get('/customers', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM customers ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).send("Failed to fetch customers");
  }
});

// POST a new customer
app.post('/customers', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const check = await client.query('SELECT * FROM customers WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    await client.query('INSERT INTO customers (name, email) VALUES ($1, $2)', [name, email]);
    res.status(201).json({ message: "Customer added successfully" });
  } catch (err) {
    console.error('Error adding customer:', err);
    res.status(500).send("Error adding customer");
  }
});

// PUT - update customer by ID
app.put('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const result = await client.query(
      'UPDATE customers SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer updated successfully" });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).send("Error updating customer");
  }
});
//debug
app.get('/debug-db', async (req, res) => {
  try {
    const result = await client.query('SELECT NOW()');
    res.send(`✅ DB connected. Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    res.status(500).send(`❌ DB error: ${err.message}`);
  }
});


// DELETE a customer by ID
app.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer deleted", customer: result.rows[0] });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).send("Error deleting customer");
  }
});


// Start server
app.listen(port, () => {
  console.log(`🚀 API running at http://localhost:${port}`);
});
