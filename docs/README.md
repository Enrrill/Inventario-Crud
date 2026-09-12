# Inventario CRUD — Documentación

> Sistema de gestión de inventario con alertas de stock, reportes y auditoría.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Laravel 13 · PHP 8.3 · PostgreSQL |
| **Frontend** | React 19 · Inertia.js v3 · TypeScript |
| **UI** | Tailwind CSS v4 · shadcn/ui (Radix UI) |
| **Testing** | Pest PHP |
| **Code Style** | Laravel Pint |
| **Auth** | Laravel Fortify · Passkeys · 2FA |

---

## Documentación

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [Arquitectura del Sistema](01-arquitectura-sistema.md) | Stack, diagrama ER, diseño de base de datos |
| 02 | [Modelo de Datos](02-modelo-datos.md) | Enums, tablas, relaciones Eloquent, scopes, factories |
| 03 | [Flujo de Stock](03-flujo-stock.md) | Lógica de negocio: entradas, salidas, ajustes, excepciones |
| 04 | [API y Rutas](04-api-rutas.md) | Controladores, endpoints, Form Requests, validaciones |
| 05 | [Autenticación y Autorización](05-autorizacion.md) | Roles, middleware, policies |
| 06 | [Reportes y Auditoría](06-reporte-auditoria.md) | Exportación CSV/PDF/XLSX, logs de auditoría |
| 07 | [Frontend](07-frontend.md) | React/Inertia, componentes, páginas, convenciones |
| 08 | [Testing](08-testing.md) | Estructura Pest, ejecución, cobertura |

---

## Comandos Rápidos

```bash
# Instalación
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed

# Desarrollo
composer run dev          # Servidor Laravel + Vite
pnpm run dev             # Solo Vite (hot reload)

# Testing
php artisan test --compact
vendor/bin/pest

# Formato
vendor/bin/pint --dirty

# Rutas
php artisan route:list
```

---

*Última actualización: 2026-09-12*
