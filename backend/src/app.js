import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { router as authRouter } from './routes/auth.js';
import { router as ticketsRouter } from './routes/tickets.js';
import { router as jobsRouter } from './routes/jobs.js';
import { serverAdapter } from './queues/index.js';  // <- de queues/index.js

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({ windowMs: 60_000, max: 100 });
app.use(limiter);

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/tickets', ticketsRouter);
app.use('/jobs', jobsRouter);

// bull-board UI
app.use('/queues', serverAdapter.getRouter());

export default app;

