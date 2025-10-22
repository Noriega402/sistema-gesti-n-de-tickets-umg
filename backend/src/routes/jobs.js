import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { assignQueue, emailQueue } from '../queues/index.js';

export const router = Router();

// Enqueue demo jobs (admin only)
router.post('/enqueue/demo', authRequired, requireRole('admin'), async (req, res) => {
  const { ticketId, type='email' } = req.body;
  const queue = type === 'assign' ? assignQueue : emailQueue;
  const job = await queue.add(type, { ticketId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
  res.json({ jobId: job.id });
});

// Read job by id
router.get('/:queue/:id', authRequired, async (req, res) => {
  const { queue, id } = req.params;
  const q = queue === 'assign' ? assignQueue : emailQueue;
  const job = await q.getJob(id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  const st = await job.getState();
  res.json({ id: job.id, state: st, attemptsMade: job.attemptsMade, returnvalue: job.returnvalue, failedReason: job.failedReason });
});
