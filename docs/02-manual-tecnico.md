# Manual Técnico

## Requisitos
- Node 20+, npm
- MySQL 8+
- Redis 6+

## Instalación
### Backend
```bash
cd backend
cp .env.example .env
# edita .env con credenciales MySQL/SMTP/Redis
mysql -u root -p < schema.sql
npm i
npm run dev  # API http://localhost:4000
npm run worker  # workers (opcional si no se arrancan junto a la API)
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm i
npm run dev  # http://localhost:5173
```

## Endpoints (resumen)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET  /tickets` (auth)
- `POST /tickets` (auth) -> encola trabajos
- `PUT  /tickets/:id` (auth)
- `DELETE /tickets/:id` (admin)
- `POST /jobs/enqueue/demo` (admin) -> encola manual
- `GET  /jobs/:queue/:id` (auth) -> estado de job

## Variables de entorno
Ver `.env.example`.
