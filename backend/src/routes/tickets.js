import express from 'express';
const router = express.Router();

import { authRequired, requireRole } from '../middlewares/auth.js';
import { transporter, fromAddress } from '../email/mailer.js';
import { sendTicketCreated, sendTicketStatusChanged } from '../email/mailer.js';
import * as Tickets from '../model/ticketsRepo.js';
import { pool } from '../db.js';

// CREATE (POST /tickets) -> client o admin
router.post('/', authRequired, requireRole('client', 'admin'), async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title) return res.status(400).json({ ok: false, error: 'Falta title' });

    // Normaliza prioridad para el ENUM
    const allowed = new Set(['low', 'medium', 'high']);
    const prio = allowed.has(priority) ? priority : 'low';

    // ID del usuario autenticado viene en el claim 'sub'
    const clientId = req.user.sub;

    // Inserta ticket
    const [ins] = await pool.query(
      `INSERT INTO tickets (title, description, priority, client_id)
       VALUES (?,?,?,?)`,
      [title, description || '', prio, clientId]
    );

    // === NUEVO: obtener email/nombre del cliente y enviar correo ===
    try {
      // Trae el usuario que creó el ticket
      const [[client]] = await pool.query(
        'SELECT name, email FROM users WHERE id = ?',
        [clientId]
      );

      if (client && client.email) {
        await transporter.sendMail({
          from: fromAddress,
          to: client.email,
          subject: `Ticket #${ins.insertId} creado`,
          html: `
            <p>Hola ${client.name || 'cliente'},</p>
            <p>Tu ticket <b>#${ins.insertId}</b> fue creado con éxito.</p>
            <p><b>Asunto:</b> ${title}</p>
            <p><b>Prioridad:</b> ${prio}</p>
            <p>Gracias por contactarnos.</p>
          `
        });
      }
    } catch (errMail) {
      console.warn('Email error:', errMail.message);
      // no cortamos la respuesta si falla el SMTP
    }

    return res.status(201).json({
      ok: true,
      ticket: { id: ins.insertId, title, priority: prio, status: 'pending' }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'No se pudo crear el ticket' });
  }
});

// ASIGNAR TÉCNICO (POST /tickets/:id/assign) -> admin
router.post('/:id/assign', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { technician_id } = req.body;
    await Tickets.assignTechnician(req.params.id, technician_id || null);
    res.json({ ok: true, message: 'Asignado' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'No se pudo asignar' });
  }
});

// CAMBIAR ESTADO (PATCH /tickets/:id/status) -> tech o admin
router.patch('/:id/status', authRequired, requireRole('tech', 'admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'pending'|'in_progress'|'resolved'
    const updated = await Tickets.updateStatus(req.params.id, status);

    // Opcional: notificar al cliente por correo
    try {
      const client = await Tickets.findClientEmail(updated.client_id);
      if (client?.email) {
        await sendTicketStatusChanged(client.email, {
          id: updated.id,
          nombre: client.name || 'usuario',
          status: updated.status
        });
      }
    } catch (errMail) { console.warn('Email not sent:', errMail.message); }

    res.json({ ok: true, ticket: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'No se pudo actualizar el estado' });
  }
});

export default router;
