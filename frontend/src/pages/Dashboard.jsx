import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { Link } from "react-router-dom";

function TicketForm() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.post("/tickets", {
        title,
        description,
        priority,
        client_id: 1,// ID de cliente fijo para este ejemplo
      }),
    onSuccess: () => {
      qc.invalidateQueries(["tickets"]);
      setEmail("");
      setNombre("");
      setTitle("");
      setDescription("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate();
      }}
      style={{ marginBottom: 16 }}
    >
      <h3>Nuevo Ticket</h3>
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />{" "}
      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <br />
      <input
        placeholder="Asunto"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <br />
      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <br />
      <button>Crear ticket</button>
    </form>
  );
}

// Dashboard.jsx
export default function Dashboard() {
  const qc = useQueryClient();

  const { data: rows = [] } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const json = (await api.get("/tickets")).data;

      // 1) extrae la lista de forma segura
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json?.tickets)
        ? json.tickets
        : [];

      // 2) normaliza campos para el UI actual
      const normalize = (t) => ({
        id: t.id,
        title: t.asunto ?? t.title ?? "(sin asunto)",
        priority: t.priority ?? "—",
        status: t.estado ?? t.status ?? "abierto",
        technician_name: t.technician_name ?? "—",
      });

      return list.map(normalize);
    },
  });

  return (
    <div
      style={{ maxWidth: 900, margin: "20px auto", fontFamily: "system-ui" }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Tickets</h2>
        <nav>
          <Link to="/jobs">Trabajos (colas)</Link> |{" "}
          <a href="/queues" target="_blank">
            bull-board
          </a>
        </nav>
      </header>

      <TicketForm />

      <table width="100%" border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Técnico</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.title}</td>
              <td>{t.priority}</td>
              <td>{t.status}</td>
              <td>{t.technician_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
