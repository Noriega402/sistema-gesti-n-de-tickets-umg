import { Router } from 'express';
import { pool } from '../db.js';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { assignQueue, emailQueue } from '../queues/index.js';

export const router = Router();

// List
router.get('/', authRequired, async (req, res) => {
  const [rows] = await pool.query('SELECT t.*, u.name AS client_name, tech.name AS technician_name FROM tickets t JOIN users u ON u.id=t.client_id LEFT JOIN users tech ON tech.id=t.technician_id ORDER BY t.created_at DESC');
  res.json(rows);
});

// Create
router.post('/', authRequired, async (req, res) => {
  const { title, description, priority='low' } = req.body;
  const clientId = req.user.id;
  const [r] = await pool.query('INSERT INTO tickets (title, description, priority, client_id) VALUES (?,?,?,?)',[title, description, priority, clientId]);
  const ticketId = r.insertId;
  // enqueue jobs
  await assignQueue.add('assign', { ticketId }, { attempts: 3, backoff: { type: 'fixed', delay: 2000 } });
  await emailQueue.add('email', { ticketId, template: 'created' }, { attempts: 3 });
  res.status(201).json({ id: ticketId });
});

// Update
router.put('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  const { status, technician_id } = req.body;
  await pool.query('UPDATE tickets SET status=COALESCE(?, status), technician_id=COALESCE(?, technician_id) WHERE id=?', [status, technician_id, id]);
  res.json({ ok: true });
});

// Delete (admin)
router.delete('/:id', authRequired, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM tickets WHERE id=?', [id]);
  res.json({ ok: true });
});
