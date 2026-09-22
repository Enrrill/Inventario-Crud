# StockNow — Inventario CRUD

> Sistema de gestión de inventario con movimientos en lote, alertas de stock, reportes exportables y auditoría completa. Roles de admin y empleado con permisos restringidos a nivel de ruta.

![Tests](https://img.shields.io/badge/tests-179%20passed-brightgreen)
![Laravel](https://img.shields.io/badge/Laravel-13-red)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PHP](https://img.shields.io/badge/PHP-8.3-777BB4)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Características

- **Movimientos en lote**: registra hasta 20 movimientos (entrada/salida/ajuste) en una sola transacción con bloqueo pesado (`lockForUpdate`) y correlación de auditoría por `batch_id`
- **Roles**: admin (CRUD completo) y empleado (solo lectura en catálogos, movimientos propios de entrada/salida, sin reporte de inventario)
- **Reportes**: inventario, movimientos y estado de stock con exportación **CSV / PDF / XLSX**
- **Auditoría**: logs de todos los modelos con agrupación visual por lote
- **Auth**: Laravel Fortify con 2FA/TOTP y passkeys (WebAuthn)
- **Dashboard** con estadísticas según rol, alertas de stock bajo y branding StockNow

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Laravel 13 · PHP 8.3 · PostgreSQL |
| Frontend | React 19 · Inertia.js v3 · TypeScript |
| UI | Tailwind CSS v4 · shadcn/ui (Radix UI) |
| Testing | Pest PHP (179 tests) |
| Code Style | Laravel Pint |

## Instalación

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
composer run dev
```

> `php artisan db:seed` ejecuta `InventoryTestSeeder`, que crea usuarios de desarrollo local (admin `enrrill@gmail.com` / `enrrill22`), categorías, proveedores, productos y movimientos de prueba. **Credenciales solo para entorno local.**

## Testing

```bash
php artisan test --compact   # 179 tests, 428 assertions
vendor/bin/pint --dirty      # formato
```

## Documentación

La documentación técnica completa (arquitectura, modelo de datos, flujo de stock, API, autorización, reportes/auditoría, frontend y testing) vive en [`docs/`](docs/README.md):

| # | Documento |
|---|-----------|
| 01 | [Arquitectura del Sistema](docs/01-arquitectura-sistema.md) |
| 02 | [Modelo de Datos](docs/02-modelo-datos.md) |
| 03 | [Flujo de Stock](docs/03-flujo-stock.md) |
| 04 | [API y Rutas](docs/04-api-rutas.md) |
| 05 | [Autenticación y Autorización](docs/05-autorizacion.md) |
| 06 | [Reportes y Auditoría](docs/06-reporte-auditoria.md) |
| 07 | [Frontend](docs/07-frontend.md) |
| 08 | [Testing](docs/08-testing.md) |

## Licencia

Distribuido bajo la licencia [MIT](LICENSE). © 2026 Enrrill.
