// src/email/ticketsRepo.js (ESM)
let tickets = [];
let idCounter = 1;

export async function findAll() { return tickets; }
export async function findById(id) { return tickets.find(t => t.id === parseInt(id)); }
export async function create(data) {
  const t = { id: idCounter++, ...data };
  tickets.push(t);
  return t;
}
export async function update(updated) {
  const i = tickets.findIndex(t => t.id === updated.id);
  if (i >= 0) tickets[i] = updated;
  return updated;
}
export async function remove(id) {
  const i = tickets.findIndex(t => t.id === parseInt(id));
  if (i >= 0) { tickets.splice(i, 1); return true; }
  return false;
}

// 👇 esto provee el "default"
export default { findAll, findById, create, update, remove };