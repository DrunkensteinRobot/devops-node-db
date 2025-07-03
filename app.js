require('dotenv').config();

const express = require('express');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const crypto = require('crypto');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors({
  origin: [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://frontend:8080'
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Database connection
const client = new Client({
  host: process.env.DB_HOST || 'postgres', // Default to Docker service name
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mydb',
});

client.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ Connection error', err.stack));

// Auth middleware
function authenticateToken(req, res, next) {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      console.log(`❌ User ${req.user.email} lacks ${role} privileges`);
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
    next();
  };
}

// Routes
app.post('/login', async (req, res) => {
  const { email, pin } = req.body;
  if (!email || !pin) return res.status(400).json({ error: 'Email and PIN required' });

  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const validPin = await bcrypt.compare(pin, user.password);
    if (!validPin) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: 'lax',
      maxAge: 3600000
    });

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Make sure you have this route defined
app.post('/auth/login', async (req, res) => {
  const { email, pin } = req.body;
  
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const validPin = await bcrypt.compare(pin, user.password);
    if (!validPin) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: 'lax'
    });

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});




app.post('/auth/logout', (req, res) => {
  try {
    res.clearCookie('token', {
      path: '/',
      domain: 'localhost',
      httpOnly: true,
      sameSite: 'lax'
    });
    res.status(200).json({ 
      success: true,
      message: 'Logout successful' 
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

app.get('/users', authenticateToken, async (req, res) => {
  const result = await client.query('SELECT id, name, email FROM users');
  res.json(result.rows);
});
// Enhanced login route
app.post('/login', async (req, res) => {
  console.log('📨 Incoming login request:', req.body);

  const { email, pin } = req.body;
  if (!email || !pin) {
    return res.status(400).json({ error: 'Email and PIN are required' });
  }

  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Login attempt for non-existent user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPin = await bcrypt.compare(pin, user.password);

    if (!validPin) {
      console.log(`❌ Failed login attempt for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 3600000, // 1 hour
      domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : 'localhost'
    });

    console.log(`✅ Successful login for ${email}`);
    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('💥 Server error during login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : 'localhost'
  });
  res.json({ message: 'Logout successful' });
});

// User management routes
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const result = await client.query(
      'SELECT id, name, email, role FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      'SELECT id, name, email, role FROM users WHERE id = $1', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/users', authenticateToken, async (req, res) => {
  const { name, email, role } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const pin = crypto.randomInt(100000, 999999).toString();
    const hashedPin = await bcrypt.hash(pin, 10);

    const result = await client.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, hashedPin, role || 'user']
    );

    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.rows[0].id,
      temporaryPin: pin 
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/users/:id/reset', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const newPin = crypto.randomInt(100000, 999999).toString();
    const hashedPin = await bcrypt.hash(newPin, 10);

    const result = await client.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, email',
      [hashedPin, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Password reset successful',
      newPin: newPin
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📄 API documentation available at http://localhost:${port}/api-docs`);
});