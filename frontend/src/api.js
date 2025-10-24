import axios from "axios";

export const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || "/auth/login";
export const TICKETS_PATH = import.meta.env.VITE_TICKETS_PATH || "/tickets";

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiCreateTicket({ title, description, priority }) {
  const r = await fetch(`${API}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, description, priority })
  });
  if (!r.ok) throw new Error(`Crear ticket: ${r.status}`);
  return r.json(); // { ok, ticket }
}

export async function apiRegister({ name, email, password }) {
  const r = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!r.ok) throw new Error(`Registro: ${r.status}`);
  return r.json(); // { access, refresh, user }
}

export async function apiLogin({ email, password }) {
  const { data } = await api.post(LOGIN_PATH, { email, password });
  return {
    access: data.access || data.token || data.accessToken || data.jwt,
    refresh: data.refresh || null,
    user: data.user || null,
    raw: data,
  };
}


export async function listTickets() {
  const { data } = await api.get(TICKETS_PATH);
  return data;
}

export async function createTicket({ title, description, priority }) {
  const { data } = await api.post(TICKETS_PATH, { title, description, priority });
  return data;
}

export function logoutApi() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("token");
}
