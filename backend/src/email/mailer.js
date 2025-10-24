import nodemailer from "nodemailer";

export const fromAddress =
  process.env.SMTP_FROM || 'Soporte <no-reply@localhost>';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT || 587),
  secure: true, // true si se usa el puerto 465
  auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

/** Email: ticket creado */
export async function sendTicketCreated({ to, ticketId, name, title, priority }) {
  if (!to) return;
  const html = `
    <p>Hola ${name || "cliente"},</p>
    <p>Tu ticket <b>#${ticketId}</b> fue creado con éxito.</p>
    <p><b>Asunto:</b> ${title}</p>
    <p><b>Prioridad:</b> ${priority}</p>
    <p>Gracias por contactarnos.</p>
  `;
  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Ticket #${ticketId} creado`,
    html,
  });
}

/** Email: cambio de estado */
export async function sendTicketStatusChanged({ to, ticketId, name, status }) {
  if (!to) return;
  const html = `
    <p>Hola ${name || "cliente"},</p>
    <p>Tu ticket <b>#${ticketId}</b> cambió su estado a <b>${status}</b>.</p>
  `;
  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Ticket #${ticketId} actualizado`,
    html,
  });
}