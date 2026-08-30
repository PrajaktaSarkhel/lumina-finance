import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All transaction routes require authentication
router.use(authenticateToken);

// GET /api/transactions - Fetch user's transactions
router.get('/', (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT id, date, amount, category, type, note, created_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY date DESC, id DESC
    `).all(req.user.id);

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return res.status(500).json({ message: 'Failed to retrieve transactions.' });
  }
});

// POST /api/transactions - Add new transaction
router.post('/', (req, res) => {
  try {
    const { amount, category, type, date, note } = req.body;

    if (req.user.role === 'viewer') {
      return res.status(403).json({ message: 'Viewers have read-only permissions. Switch to Admin to add transactions.' });
    }

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid positive amount is required.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Category is required.' });
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either income or expense.' });
    }

    const txDate = date || new Date().toISOString().split('T')[0];
    const cleanCategory = category.trim();
    const cleanNote = note ? note.trim() : '';

    const insertTx = db.prepare(`
      INSERT INTO transactions (user_id, date, amount, category, type, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertTx.run(req.user.id, txDate, parseFloat(amount), cleanCategory, type, cleanNote);
    const newTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ transaction: newTx });
  } catch (error) {
    console.error('Add transaction error:', error);
    return res.status(500).json({ message: 'Failed to create transaction.' });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'viewer') {
      return res.status(403).json({ message: 'Viewers cannot delete transactions. Switch to Admin.' });
    }

    const existingTx = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existingTx) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized.' });
    }

    db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, req.user.id);

    return res.status(200).json({ message: 'Transaction deleted successfully.', id: Number(id) });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return res.status(500).json({ message: 'Failed to delete transaction.' });
  }
});

// POST /api/transactions/reset - Reset transactions to starter defaults
router.post('/reset', (req, res) => {
  try {
    // Delete all existing user transactions
    db.prepare('DELETE FROM transactions WHERE user_id = ?').run(req.user.id);

    // Insert starter transactions
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

    insertTx.run(req.user.id, formatDate(1), 2500, 'Salary', 'income', 'Monthly Pay');
    insertTx.run(req.user.id, formatDate(2), 800, 'Rent', 'expense', 'Apartment Rent');
    insertTx.run(req.user.id, formatDate(4), 120, 'Food', 'expense', 'Groceries');
    insertTx.run(req.user.id, formatDate(6), 50, 'Entertainment', 'expense', 'Movie tickets');

    const transactions = db.prepare(`
      SELECT id, date, amount, category, type, note, created_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY date DESC, id DESC
    `).all(req.user.id);

    return res.status(200).json({ message: 'Data reset to defaults.', transactions });
  } catch (error) {
    console.error('Reset transactions error:', error);
    return res.status(500).json({ message: 'Failed to reset transactions.' });
  }
});

export default router;
