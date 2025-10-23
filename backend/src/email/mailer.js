import fs from 'node:fs';
import path from 'node:path';
import buildTransport from './transporter.js';
import queue from './mailQueue.js';

const transporter = buildTransport();

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function enqueueMail({ to, subject, text, html, meta }) {
  queue.add(async () => {
    const info = await transporter.sendMail({
      to,
      from: process.env.MAIL_FROM || 'Tickets <no-reply@localhost>',
      subject,
      text,
      html
    });

    const mode = (process.env.EMAIL_TRANSPORT || 'direct').toLowerCase();
    if (mode === 'console' || mode === 'file') {
      const eml =
        info.message && info.message.toString
          ? info.message.toString()
          : String(info.message || '');

      // Mostrar en consola
      console.log('--- EMAIL (simulado) ---\n' + eml + '\n--- /EMAIL ---');

      // Guardar a archivo si elegiste "file"
      if (mode === 'file') {
        const dir = path.join(process.cwd(), 'out-emails');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filename = subject.replace(/[^\w.-]+/g, '_').slice(0, 60);
        fs.writeFileSync(path.join(dir, `${Date.now()}_${filename}.eml`), eml);
      }
    }
  }, meta);
}

export function sendTicketCreated(to, ticket) {
  console.log('Entrando a sendTicketCreated() para:', to, 'Ticket ID:', ticket.id);

  const subject = `Ticket #${ticket.codigo || ticket.id} creado`;
  const text = [
    `Hola ${ticket.nombre || 'usuario'},`,
    `Tu ticket fue registrado.`,
    `ID: ${ticket.codigo || ticket.id}`,
    `Asunto: ${ticket.asunto || ticket.titulo || '(sin asunto)'}`,
    `Estado: ${ticket.estado || 'abierto'}`
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif">
      <h2>Ticket #${ticket.codigo || ticket.id} creado</h2>
      <p>Hola ${escapeHtml(ticket.nombre || 'usuario')}, tu ticket fue registrado:</p>
      <ul>
        <li><b>ID:</b> ${escapeHtml(String(ticket.codigo || ticket.id))}</li>
        <li><b>Asunto:</b> ${escapeHtml(ticket.asunto || ticket.titulo || '(sin asunto)')}</li>
        <li><b>Estado:</b> ${escapeHtml(ticket.estado || 'abierto')}</li>
      </ul>
    </div>
  `;

  console.log('Encolando correo de ticket creado...');
  enqueueMail({
    to,
    subject,
    text,
    html,
    meta: { type: 'created', id: ticket.id || ticket.codigo }
  });
  console.log('Correo encolado correctamente.');

}

export function sendTicketStatusChanged(to, ticket, oldStatus, newStatus) {
  const subject = `Ticket #${ticket.codigo || ticket.id} actualizado: ${newStatus}`;
  const text = [
    `Hola ${ticket.nombre || 'usuario'},`,
    `El estado cambió de "${oldStatus}" a "${newStatus}".`,
    `Asunto: ${ticket.asunto || ticket.titulo || '(sin asunto)'}`
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif">
      <h2>Actualización de ticket #${ticket.codigo || ticket.id}</h2>
      <p>Hola ${escapeHtml(ticket.nombre || 'usuario')},</p>
      <p>El estado cambió de <b>${escapeHtml(oldStatus)}</b> a <b>${escapeHtml(newStatus)}</b>.</p>
      <p><b>Asunto:</b> ${escapeHtml(ticket.asunto || ticket.titulo || '(sin asunto)')}</p>
    </div>
  `;

  enqueueMail({
    to,
    subject,
    text,
    html,
    meta: { type: 'status', id: ticket.id || ticket.codigo }
  });
}

// opcional por si en algún sitio haces import default
export default { sendTicketCreated, sendTicketStatusChanged };