import React, { useState } from "react";
import { apiCreateTicket } from "../api";

export default function TicketsPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  async function onCreate(e) {
    e.preventDefault();
    setMsg("");
    try {
      const { ok, ticket } = await apiCreateTicket({ title, description: desc, priority });
      if (ok) {
        setRows(prev => [ticket, ...prev]);
        setTitle(""); setDesc(""); setPriority("medium");
        setMsg("Ticket creado correctamente.");
      }
    } catch {
      setMsg("No se pudo crear el ticket.");
    }
  }

  function logout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  return (
    <div className="container">
      <div className="toolbar">
        <button className="btn" onClick={logout}>Cerrar sesión</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h1>Tickets</h1>
        <h3 style={{ marginTop: 12 }}>Nuevo Ticket</h3>

        {msg && <div className="alert" style={{ marginBottom: 12 }}>{msg}</div>}

        <form onSubmit={onCreate} style={{ display:"grid", gap:12, maxWidth: 520 }}>
          <input className="input" placeholder="Asunto" value={title}
                 onChange={(e)=>setTitle(e.target.value)} required />
          <textarea className="textarea" placeholder="Descripción" rows={4}
                    value={desc} onChange={(e)=>setDesc(e.target.value)} />
          <select className="select" value={priority} onChange={(e)=>setPriority(e.target.value)}>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
          <button className="btn btn-primary">Crear ticket</button>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Título</th><th>Prioridad</th><th>Estado</th><th>Técnico</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.title}</td>
                <td>{r.priority}</td>
                <td>{r.status || 'pending'}</td>
                <td>{r.technician_name || '-'}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={5} style={{ color: "var(--muted)" }}>Sin tickets aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}