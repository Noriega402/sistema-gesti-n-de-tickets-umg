import pool from '../db.js';

// Lee todos los tickets
export async function findAll() {
    const [rows] = await pool.query(
        `SELECT 
       t.id, t.title, t.description, t.priority, t.status, 
       t.client_id, t.technician_id, t.created_at, t.updated_at
     FROM tickets t
     ORDER BY t.id DESC`
    );
    return rows;
}

export async function findById(id) {
    const [rows] = await pool.query(
        `SELECT 
       t.id, t.title, t.description, t.priority, t.status, 
       t.client_id, t.technician_id, t.created_at, t.updated_at
     FROM tickets t
     WHERE t.id = ?`,
        [id]
    );
    return rows[0];
}

export async function create({ title, description, priority, client_id, technician_id }) {
    const [res] = await pool.query(
        `INSERT INTO tickets (title, description, priority, status, client_id, technician_id)
     VALUES (?, ?, ?, 'pending', ?, ?)`,
        [title, description, priority || 'low', client_id, technician_id ?? null]
    );
    return findById(res.insertId);
}

export async function update(ticket) {
    const { id, title, description, priority, status, client_id, technician_id } = ticket;
    await pool.query(
        `UPDATE tickets
       SET title=?, description=?, priority=?, status=?, client_id=?, technician_id=?
     WHERE id=?`,
        [title, description, priority, status, client_id, technician_id, id]
    );
    return findById(id);
}

export async function remove(id) {
    const [res] = await pool.query(`DELETE FROM tickets WHERE id=?`, [id]);
    return res.affectedRows > 0;
}

// Utilidad para email del cliente (si se quiere notificar por correo)
export async function findClientEmail(clientId) {
    const [rows] = await pool.query(`SELECT email, name FROM users WHERE id=?`, [clientId]);
    return rows[0] || null;
}

export async function assignTechnician(id, technicianId) {
  await pool.query('UPDATE tickets SET technician_id=? WHERE id=?', [technicianId, id]);
  return findById(id);
}

export async function updateStatus(id, newStatus) {
  await pool.query('UPDATE tickets SET status=? WHERE id=?', [newStatus, id]);
  return findById(id);
}
