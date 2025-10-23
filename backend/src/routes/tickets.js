// src/routes/tickets.js  (ESM compatible con módulos CJS existentes)
import express from 'express';

// Si mailer.js es CommonJS (module.exports = { sendTicketCreated, sendTicketStatusChanged })
// entonces impórtalo como default y desestructura:
import mailer from '../email/mailer.js';
const { sendTicketCreated, sendTicketStatusChanged } = mailer;

// Si TicketsRepo.js es CommonJS (module.exports = {...}), también default:
import Tickets from '../email/ticketsRepo.js';

// Si validateTicket.js es CommonJS (module.exports = fn), default también:
import validateTicket from '../middlewares/validateTicket.js';

const router = express.Router();

//  CREAR TICKET (POST /tickets)
router.post('/', validateTicket, async (req, res) => {
  try {
    const { email, nombre, asunto, descripcion } = req.body;

    const ticket = await Tickets.create({
      email,
      nombre,
      asunto,
      descripcion,
      estado: 'abierto',
      creadoEn: new Date().toISOString()
    });

    console.log('Ticket creado, intentando enviar correo a:', email);

    // Enviar correo (no bloquea la respuesta)
    sendTicketCreated(email, ticket);

    console.log('Función sendTicketCreated() ejecutada correctamente.');


    res.status(201).json({
      ok: true,
      message: 'Ticket creado correctamente',
      ticket
    });
  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({ ok: false, error: 'Error interno al crear el ticket.' });
  }
});

//  LISTAR TODOS (GET /tickets)
router.get('/', async (_req, res) => {
  try {
    const tickets = await Tickets.findAll();
    res.json({ ok: true, tickets });
  } catch (error) {
    console.error('Error al listar tickets:', error);
    res.status(500).json({ ok: false, error: 'Error al obtener tickets.' });
  }
});

//  OBTENER UNO (GET /tickets/:id)
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Tickets.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'Ticket no encontrado.' });
    }
    res.json({ ok: true, ticket });
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({ ok: false, error: 'Error al buscar ticket.' });
  }
});

//  ACTUALIZAR ESTADO (PUT /tickets/:id/estado)
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    if (!nuevoEstado) {
      return res.status(400).json({ ok: false, error: 'Debe indicar el nuevo estado.' });
    }

    const ticket = await Tickets.findById(id);
    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'Ticket no encontrado.' });
    }

    const old = ticket.estado;
    ticket.estado = nuevoEstado;
    await Tickets.update(ticket);

    // Notifica cambio de estado
    sendTicketStatusChanged(ticket.email, ticket, old, nuevoEstado);

    res.json({
      ok: true,
      message: `Ticket actualizado de '${old}' a '${nuevoEstado}'`,
      ticket
    });
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    res.status(500).json({ ok: false, error: 'Error al actualizar el estado del ticket.' });
  }
});

//  ELIMINAR (DELETE /tickets/:id)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Tickets.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ ok: false, error: 'Ticket no encontrado.' });
    }
    res.json({ ok: true, message: 'Ticket eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar ticket:', error);
    res.status(500).json({ ok: false, error: 'Error al eliminar el ticket.' });
  }
});

export default router;