# Documento de Arquitectura (Resumen)

**Proyecto:** Sistema de Tickets de Soporte  
**Equipo/Roles:** Arquitecto, Backend, Frontend (rellenar con nombres)

## Arquitectura General
SPA (React) consume API REST en Node/Express. Colas asíncronas con BullMQ (Redis). MySQL para persistencia.
Incluye bull-board para evidenciar trabajos, reintentos y fallos.

```
[React SPA] <--HTTP/JWT--> [Express API] <--SQL--> [MySQL]
                                 |
                                 | (BullMQ)
                                 v
                              [Redis] <--- Workers (assign/email) ---> [Nodemailer]
```

## Modelo de Datos
- **users**(id, name, email, password_hash, role)
- **tickets**(id, title, description, priority, status, client_id, technician_id)
- **refresh_tokens**(id, user_id, token, expires_at)

## Flujo de Autenticación (JWT)
1. Login -> API emite `access` (15m) + `refresh` (7d).  
2. El frontend guarda `access` en memoria/localStorage y lo envía en `Authorization: Bearer`.  
3. Para renovar, usa `/auth/refresh` con el `refresh` guardado en BD.  
4. Rutas protegidas validan y exigen rol.

## Flujo de Colas
- Al crear ticket -> se encolan dos jobs: `assign-ticket` y `send-email` (3 intentos, backoff).  
- `assign-ticket` asigna técnico disponible.  
- `send-email` notifica al cliente.  
- Evidencia en **/queues** (bull-board) y endpoint `/jobs/:queue/:id`.

## Seguridad básica
CORS restringido, Helmet, rate limit, bcrypt para contraseñas, .env, no secrets en repo.
