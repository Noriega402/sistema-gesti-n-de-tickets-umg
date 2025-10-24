import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { transporter, fromAddress } from "../email/mailer.js";

const router = Router();

function signAccess({ id, role, name, email }) {
  return jwt.sign(
    { sub: id, role, name, email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
}

function signRefresh({ id }) {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
}

/**
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const [rows] = await pool.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email=?",
    [email]
  );
  if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const access = signAccess({ id: user.id, role: user.role, name: user.name, email: user.email });
  const refresh = signRefresh({ id: user.id });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?,?,?)",
    [user.id, refresh, expiresAt]
  );

  res.json({
    access,
    refresh,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

/**
 * POST /auth/register
 * Crea usuario con rol 'client', devuelve tokens y envía email de bienvenida
 */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // por si existe el usuario con el email
  const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
  if (exists.length) return res.status(409).json({ error: "Email already exists" });

  // hash de contraseña
  const hash = await bcrypt.hash(password, 10);

  // crear usuario con rol por defecto 'client'
  const [ins] = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,'client')",
    [name, email, hash]
  );

  // tokens
  const access = signAccess({ id: ins.insertId, role: "client", name, email });
  const refresh = signRefresh({ id: ins.insertId });

  // guardar refresh
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?,?,?)",
    [ins.insertId, refresh, expiresAt]
  );

  // correo de bienvenida (no bloquea si falla)
  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "¡Bienvenido/a! Tu cuenta fue creada",
      html: `
        <p>Hola ${name || "cliente"},</p>
        <p>Tu cuenta en el Sistema de Tickets fue creada con éxito.</p>
        <p><b>Rol:</b> client</p>
        <p>Ya puedes iniciar sesión y crear tus tickets.</p>
      `,
    });
  } catch (errMail) {
    console.warn("Welcome email error:", errMail.message);
  }

  return res.status(201).json({
    access,
    refresh,
    user: { id: ins.insertId, name, email, role: "client" },
  });
});

export default router;