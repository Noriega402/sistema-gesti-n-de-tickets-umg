# Manual de Usuario

## Ingreso
1. Registra un usuario o solicita credenciales al administrador.
2. Inicia sesión en la SPA (http://localhost:5173/login).

## Flujo principal
- Crea un ticket desde el dashboard. Automáticamente se encolarán:
  - Asignación automática a un técnico.
  - Envío de correo de confirmación.
- Consulta el estado de colas en:
  - Pantalla **Trabajos (colas)** de la SPA.
  - Tablero **/queues** (bull-board).

## Roles
- **admin**: puede eliminar tickets y encolar trabajos de prueba.
- **tech**: atiende tickets asignados.
- **client**: crea y consulta tickets.
