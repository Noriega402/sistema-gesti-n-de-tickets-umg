import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { env } from '../utils/env.js';
import { signAccess, signRefresh, authRequired } from '../middlewares/auth.js';

export const router = Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'client' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const [rows] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
  if (rows.length) return res.status(409).json({ error: 'Email already exists' });
  const hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
    [name, email, hash, role]);
  return res.status(201).json({ ok: true });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const access = signAccess({ id: user.id, role: user.role, name: user.name });
  const refresh = signRefresh({ id: user.id });
  const expiresAt = new Date(Date.now() + 7*24*60*60*1000);
  await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?,?,?)',
    [user.id, refresh, expiresAt]);
  res.json({ access, refresh, user: { id: user.id, name: user.name, role: user.role } });
});

// Refresh
router.post('/refresh', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const [rows] = await pool.query('SELECT * FROM refresh_tokens WHERE user_id=? AND token=?',
      [payload.id, token]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid refresh' });
    const access = signAccess({ id: payload.id, role: rows[0].role });
    return res.json({ access });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid refresh' });
  }
});

// Logout
router.post('/logout', authRequired, async (req, res) => {
  const { token } = req.body;
  if (token) await pool.query('DELETE FROM refresh_tokens WHERE token=?', [token]);
  res.json({ ok: true });
});
