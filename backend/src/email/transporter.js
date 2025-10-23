import nodemailer from 'nodemailer';
import directTransport from 'nodemailer-direct-transport';

export default function buildTransport() {
  const mode = (process.env.EMAIL_TRANSPORT || 'direct').toLowerCase();

  if (mode === 'direct') {
    // Envío directo (sin usuario/contraseña)
    return nodemailer.createTransport(
      directTransport({
        name: process.env.MAIL_HELO_NAME || undefined,
        from: process.env.MAIL_FROM || 'Tickets <no-reply@localhost>'
      })
    );
  }

  // ACTIVAR BLOQUE SMTP PARA GMAIL
  if (mode === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === '465', // true si usas SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Si el modo no coincide, lanza error
  throw new Error(`EMAIL_TRANSPORT="${mode}" no soportado en transporter.js`);
}