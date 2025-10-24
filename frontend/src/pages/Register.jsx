import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRegister } from "../api";

export default function RegisterPage() {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const { access, refresh, user } = await apiRegister({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
      });
      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/tickets", { replace: true });
    } catch (e) {
      if (String(e.message).includes("409"))
        setErr("Ese correo ya está registrado.");
      else setErr("No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <h1>Crear cuenta</h1>
        {err && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {err}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label className="label">Nombre</label>
            <input
              name="name"
              className="input"
              placeholder="Nombre"
              required
            />
          </div>
          <div className="form-row">
            <label className="label">Correo</label>
            <input
              name="email"
              className="input"
              type="email"
              placeholder="Correo"
              required
            />
          </div>
          <div className="form-row">
            <label className="label">Contraseña</label>
            <input
              name="password"
              className="input"
              type="password"
              placeholder="Contraseña"
              minLength={6}
              required
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}