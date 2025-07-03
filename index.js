require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

// DB client
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

client.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB error:", err.stack));

// Middleware
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Utilities ---
function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- Routes ---

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication via PIN
 *   - name: Users
 *     description: User management
 */

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login using email & PIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: 6-digit PIN
 *     responses:
 *       200:
 *         description: Returns JWT token
 *       401:
 *         description: Invalid credentials
 */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email & PIN required" });

  const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!result.rows.length) return res.status(401).json({ error: "Invalid credentials" });

  const user = result.rows[0];
  if (!await bcrypt.compare(password, user.password))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     summary: Create user (admin can assign role)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created with PIN
 *       403:
 *         description: Forbidden
 */
app.post('/users', authenticateToken, async (req, res) => {
  const { name, email, role = 'user' } = req.body;
  const requester = req.user;

  if (!name || !email) return res.status(400).json({ error: "Name & email required" });
  if (role !== 'user' && requester.role !== 'admin')
    return res.status(403).json({ error: "Admin only can assign roles" });

  const dup = await client.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (dup.rows.length) return res.status(409).json({ error: "Email exists" });

  const pin = generatePin();
  const hash = await bcrypt.hash(pin, 10);

  await client.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
    [name, email, hash, role]
  );

  res.status(201).json({ pin });
});

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     summary: List all users
 *     responses:
 *       200:
 *         description: User list
 */
app.get('/users', authenticateToken, async (req, res) => {
  const users = await client.query('SELECT id, name, email, role FROM users ORDER BY id');
  res.json(users.rows);
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     summary: Update user (admin or self)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user
 *       403:
 *         description: Forbidden
 */
app.patch('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const requester = req.user;

  if (parseInt(id) !== requester.id && requester.role !== 'admin')
    return res.status(403).json({ error: "Cannot update other users" });

  const q = await client.query(
    'UPDATE users SET name = COALESCE($1,name), email = COALESCE($2,email) WHERE id = $3 RETURNING id,name,email,role',
    [name, email, id]
  );
  if (!q.rows.length) return res.status(404).json({ error: "Not found" });

  res.json(q.rows[0]);
});

/**
 * @swagger
 * /users/{id}/reset-pin:
 *   post:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     summary: Admin resets user's PIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: New PIN returned
 *       403:
 *         description: Forbidden
 */
app.post('/users/:id/reset-pin', authenticateToken,
