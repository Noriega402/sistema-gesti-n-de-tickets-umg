// backend/src/queues/index.js
import { env } from '../utils/env.js';

const DISABLED = String(process.env.DISABLE_QUEUES || '').toLowerCase() === 'true';

// --- Fallback para correr sin Redis/BullMQ ---
class FakeJob {
  constructor(id) { this.id = id; this.attemptsMade = 0; this.returnvalue = { stub: true }; this.failedReason = null; }
  async getState() { return 'completed'; }
}
class FakeQueue {
  constructor(name) { this.name = name; }
  async add(_type, _data, _opts) { return { id: Date.now().toString() }; }
  async getJob(id) { return new FakeJob(id); }
  get opts() { return { connection: null }; }
}

// bull-board “dummy”
class DummyServerAdapter {
  setBasePath(_p) {}
  getRouter() { 
    // Express middleware que devuelve un mensaje simple
    return (req, res) => res.json({ queues: 'disabled', hint: 'Set DISABLE_QUEUES=false y levanta Redis para bull-board.' });
  }
}

export let assignQueue, emailQueue, serverAdapter;

if (DISABLED) {
  // Sin Redis / sin BullMQ (modo demo)
  assignQueue = new FakeQueue('assign-ticket');
  emailQueue  = new FakeQueue('send-email');
  serverAdapter = new DummyServerAdapter();
} else {
  // Con Redis / BullMQ (modo completo)
  const { Queue } = await import('bullmq');
  const IORedis = (await import('ioredis')).default;
  const { createBullBoard } = await import('@bull-board/api');
  const { BullMQAdapter } = await import('@bull-board/api/bullMQAdapter');
  const { ExpressAdapter } = await import('@bull-board/express');

  const connection = new IORedis(env.REDIS_URL);

  assignQueue = new Queue('assign-ticket', { connection });
  emailQueue  = new Queue('send-email', { connection });

  serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');
  createBullBoard({
    queues: [new BullMQAdapter(assignQueue), new BullMQAdapter(emailQueue)],
    serverAdapter
  });
}

