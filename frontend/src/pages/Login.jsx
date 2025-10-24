import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiLogin } from "../api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { access, refresh, user } = await apiLogin({ email, password });
      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/tickets", { replace: true });
    } catch (error) {
      setErr("Credenciales inválidas o servidor no disponible.");
    } finally { setLoading(false); }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h1>Iniciar sesión</h1>
        {err && <div className="alert alert-error" style={{ marginBottom: 12 }}>{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label className="label">Correo</label>
            <input className="input" type="email" value={email}
              onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-row">
            <label className="label">Contraseña</label>
            <input className="input" type="password" value={password}
              onChange={(e)=>setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          <p style={{ marginTop: 12 }}>
            ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
          </p>
        </form>
      </div>
    </div>
  );
}