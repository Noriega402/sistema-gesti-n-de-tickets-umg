/*import { Worker } from 'bullmq';
import { connection, assignQueue, emailQueue } from '../queues/index.js';
import { pool } from '../db.js';
import nodemailer from 'nodemailer';
import { env } from '../utils/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST, port: env.SMTP_PORT, secure: false,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
});

// Assign worker: auto-assign ticket to any available technician (simplified)
new Worker(assignQueue.name, async job => {
  const { ticketId } = job.data;
  const [techs] = await pool.query("SELECT id FROM users WHERE role='tech' ORDER BY RAND() LIMIT 1");
  const techId = techs[0]?.id || null;
  await pool.query('UPDATE tickets SET technician_id=?, status=? WHERE id=?', [techId, 'pending', ticketId]);
  return { assignedTo: techId };
}, { connection });

// Email worker: notify client (simplified)
new Worker(emailQueue.name, async job => {
  const { ticketId, template } = job.data;
  const [[ticket]] = await pool.query('SELECT t.*, u.email as client_email, u.name as client_name FROM tickets t JOIN users u ON u.id=t.client_id WHERE t.id=?', [ticketId]);
  if (!ticket) throw new Error('Ticket not found');
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: ticket.client_email,
    subject: `Ticket #${ticket.id} ${template==='created'?'creado':'actualizado'}`,
    text: `Hola ${ticket.client_name}, tu ticket "${ticket.title}" se ha ${template==='created'?'creado':'actualizado'}.`,
  });
  return { sent: true };
}, { connection });

console.log('Workers running...');*/
