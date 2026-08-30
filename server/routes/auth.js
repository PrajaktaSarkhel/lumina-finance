import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT token (valid for 7 days)
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into SQLite database
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertUser.run(cleanName, cleanEmail, passwordHash, role === 'viewer' ? 'viewer' : 'admin');
    const newUserId = result.lastInsertRowid;

    // Seed initial starter transactions for new account
    const insertTx = db.prepare(`
      INSERT INTO transactions (user_id, date, amount, category, type, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = new Date();
    const formatDate = (daysAgo) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    insertTx.run(newUserId, formatDate(1), 2500, 'Salary', 'income', 'Monthly Pay');
    insertTx.run(newUserId, formatDate(2), 800, 'Rent', 'expense', 'Apartment Rent');
    insertTx.run(newUserId, formatDate(4), 120, 'Food', 'expense', 'Groceries');
    insertTx.run(newUserId, formatDate(6), 50, 'Entertainment', 'expense', 'Movie tickets');

    const user = {
      id: newUserId,
      name: cleanName,
      email: cleanEmail,
      role: role === 'viewer' ? 'viewer' : 'admin'
    };

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user from SQLite database
    const userRecord = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    if (!userRecord) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, userRecord.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role
    };

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/auth/me - Verify token and get current user profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const userRecord = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!userRecord) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: userRecord });
  } catch (error) {
    console.error('Fetch me error:', error);
    return res.status(500).json({ message: 'Failed to retrieve user profile.' });
  }
});

// PATCH /api/auth/role - Toggle / update user role
router.patch('/role', authenticateToken, (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or viewer.' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.user.id);
    const updatedUser = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({ message: 'Failed to update user role.' });
  }
});

export default router;
