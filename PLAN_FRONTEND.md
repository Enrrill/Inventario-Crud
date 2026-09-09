# Plan Frontend - Sistema de Inventario

## Stack Tecnológico

- **Framework**: React 19 + Inertia.js v3
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style, Radix UI)
- **Icons**: Lucide React
- **Forms**: `<Form>` de shadcn/ui + react-hook-form + Zod
- **Toasts**: Sonner (ya configurado)
- **Routing**: Wayfinder (funciones TypeScript generadas desde Laravel)
- **Tablas**: @tanstack/react-table
- **Combobox**: cmdk + @radix-ui/react-popover
- **TypeScript**: Configurado y activo
- **React Compiler**: Habilitado via babel-plugin-react-compiler

## Dependencias Nuevas

| Paquete | Uso |
|---------|-----|
| `@tanstack/react-table` | Tablas con ordenamiento, paginación, selección |
| `cmdk` | Command palette / combobox |
| `@radix-ui/react-popover` | Dropdowns de selección |
| `react-hook-form` | Formularios declarativos |
| `@hookform/resolvers` | Resolvers de Zod para react-hook-form |

## Componentes shadcn/ui a Agregar

| Componente | Uso |
|-----------|-----|
| `table` | Tabla base para DataTable |
| `form` | Wrapper de react-hook-form |
| `command` | Command palette (cmdk) |
| `combobox` | Selector con búsqueda |
| `popover` | Dropdowns contextuales |
| `spinner` | Loading states |

## Estructura de Archivos

```
resources/js/
├── types/
│   ├── auth.ts                            ← ACTUALIZAR: agregar role
│   ├── inventory.ts                       ← ACTUALIZAR: agregar AuditLog, ReportSummary
│   ├── navigation.ts
│   └── ui.ts
├── hooks/
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   ├── use-query-params.ts
│   └── ... (11 hooks existentes)
├── components/
│   ├── ui/                                ← shadcn/ui (33 componentes)
│   ├── inventory/                         ← Componentes compartidos (14)
│   ├── app-sidebar.tsx                    ← ACTUALIZAR: agregar nav reportes/audit/users
│   ├── nav-main.tsx                       ← ACTUALIZAR: grupos colapsables
│   └── ... (25+ componentes existentes)
├── pages/
│   ├── dashboard.tsx
│   ├── auth/
│   │   ├── login.tsx                      ← ACTUALIZAR: rediseñar
│   │   ├── register.tsx                   ← ACTUALIZAR: rediseñar
│   │   └── ... (7 páginas auth existentes)
│   ├── categories/                        ← CRUD completo
│   ├── suppliers/                         ← CRUD completo
│   ├── products/                          ← CRUD completo
│   ├── movements/                         ← CRUD parcial
│   ├── users/                             ← NUEVO: CRUD usuarios
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── show.tsx
│   │   └── edit.tsx
│   ├── reports/                           ← NUEVO: reportes + exportación
│   │   ├── index.tsx
│   │   ├── inventory.tsx
│   │   ├── movements.tsx
│   │   └── stock-status.tsx
│   ├── audit/                             ← NUEVO: logs de auditoría
│   │   ├── index.tsx
│   │   └── show.tsx
│   └── settings/
│       ├── profile.tsx                    ← ACTUALIZAR: rediseñar
│       ├── security.tsx                   ← ACTUALIZAR: rediseñar
│       └── appearance.tsx                 ← ACTUALIZAR: rediseñar
```

## Fases de Implementación

### Fase 0: Infraestructura ✅
- Instalar dependencias npm
- Instalar componentes shadcn/ui faltantes
- Regenerar Wayfinder routes
- Crear tipos TypeScript de inventario

### Fase 1: Componentes UI Base
- Crear table.tsx (shadcn/ui)
- Crear form.tsx (shadcn/ui)
- Crear command.tsx (shadcn/ui)
- Crear combobox.tsx (shadcn/ui)
- Crear popover.tsx (shadcn/ui)
- Crear spinner.tsx (shadcn/ui)

### Fase 2: Componentes Compartidos
- data-table.tsx (tabla genérica con @tanstack/react-table)
- data-grid.tsx (grid responsive)
- view-toggle.tsx (toggle lista/grid)
- search-input.tsx (input con debounce)
- filter-bar.tsx (barra de filtros)
- empty-state.tsx (estado vacío)
- confirm-dialog.tsx (modal de confirmación)
- stat-card.tsx (tarjeta de estadística)
- page-header.tsx (header de página)
- pagination.tsx (navegación de paginación)
- form-drawer.tsx (drawer para formularios)
- stock-badge.tsx (badge de stock)
- type-badge.tsx (badge de tipo de movimiento)
- status-badge.tsx (badge de estado)

### Fase 3: Layout
- Actualizar app-sidebar.tsx con navegación del inventario
- Verificar routing en app.tsx

### Fase 4: Dashboard
- Dashboard con estadísticas reales
- Últimos movimientos
- Productos con stock bajo

### Fase 5: Categorías
- index.tsx (lista con tabla + filtros)
- create.tsx (formulario en drawer)
- show.tsx (detalle + productos + subcategorías)
- edit.tsx (formulario en drawer)

### Fase 6: Proveedores
- index.tsx (lista con búsqueda)
- create.tsx (formulario en drawer)
- show.tsx (detalle + productos)
- edit.tsx (formulario en drawer)

### Fase 7: Productos
- index.tsx (vista dual lista/grid + filtros avanzados)
- create.tsx (formulario completo en drawer)
- show.tsx (det

allo completo)
- edit.tsx (formulario en drawer)

### Fase 8: Movimientos
- index.tsx (tabla con filtros)
- create.tsx (formulario con lógica condicional)
- show.tsx (detalle del movimiento)

### Fase 9: Hooks y Utilidades
- use-debounce.ts
- use-local-storage.ts
- use-query-params.ts

### Fase 10: Pulido
- Loading states (skeletons, spinners)
- Empty states
- Responsive design
- Toasts de error en formularios

### Fase 11: Tipos TypeScript
- `auth.ts`: Agregar `role: 'admin' | 'employee'` al tipo `User`
- `inventory.ts`: Agregar tipos `AuditLog`, `ReportSummary`, `UserFilter`, `AuditEvent`

### Fase 12: Sidebar Actualizado
- `app-sidebar.tsx`: 3 grupos de navegación:
  - **Inventario**: Dashboard, Categorías, Proveedores, Productos, Movimientos
  - **Reportes**: Reportes (acceso todos)
  - **Administración**: Usuarios, Auditoría (solo admin)
- `nav-main.tsx`: Soporte para grupos colapsables con label

### Fase 13: Auth Pages Rediseñadas
- `login.tsx`: Card centrada, iconos en inputs (Mail, Lock), botón con color primario, link "Olvidé contraseña" integrado
- `register.tsx`: Card centrada, iconos en inputs (User, Mail, Lock), validación visual
- `auth-simple-layout.tsx`: Mantener centrado, agregar decorative background pattern sutil

### Fase 14: Settings Pages Rediseñadas
- `profile.tsx`: Card "Información Personal" con avatar de iniciales + Card "Zona de Peligro" (eliminar cuenta) en rojo
- `security.tsx`: 3 cards separadas — Contraseña, 2FA, Passkeys, cada una con header y estado visual
- `appearance.tsx`: 3 preview cards grandes (Light/Dark/System) con borde activo y descripción

### Fase 15: Users Pages (4 páginas nuevas)
- `users/index.tsx`: DataTable con columns: Nombre, Email, Rol (badge), Creado. Filtros: búsqueda + selector de rol
- `users/create.tsx`: Formulario (Form + Zod): name, email, password, role selector
- `users/show.tsx`: Card con info del usuario, badge de rol, fecha de creación
- `users/edit.tsx`: Formulario sin password obligatorio

### Fase 16: Reports Pages (4 páginas nuevas)
- `reports/index.tsx`: 3 stat cards clickeables (Inventario, Movimientos, Estado Stock) con icono y descripción
- `reports/inventory.tsx`: Stat cards resumen (total productos, valor total, top categoría) + tabla + filtros + botones export CSV/PDF/XLSX
- `reports/movements.tsx`: Stat cards por tipo (entradas, salidas, ajustes) + tabla + filtros de fecha
- `reports/stock-status.tsx`: 3 stat cards (sin stock, bajo, normal) + desglose por categoría

### Fase 17: Audit Pages (2 páginas nuevas)
- `audit/index.tsx`: DataTable con columns: Usuario, Modelo, Evento (badge colorido), IP, Fecha. Filtros: usuario, evento, fechas
- `audit/show.tsx`: Card con metadata (usuario, IP, user agent) + JSON formateado de old_values/new_values

## Backend API

### Dashboard
- `GET /dashboard` → stats, recentMovements, lowStockProducts

### Categorías (CRUD)
- `GET /categories` → categories (paginada, con parent/children/products)
- `GET /categories/create` → parentCategories
- `POST /categories` → redirect con toast
- `GET /categories/{category}` → category (con parent/children/products)
- `GET /categories/{category}/edit` → category, parentCategories
- `PUT /categories/{category}` → redirect con toast
- `DELETE /categories/{category}` → redirect con toast

### Proveedores (CRUD)
- `GET /suppliers` → suppliers (paginada, con products_count), filters
- `GET /suppliers/create` → (vacío)
- `POST /suppliers` → redirect con toast
- `GET /suppliers/{supplier}` → supplier (con products)
- `GET /suppliers/{supplier}/edit` → supplier
- `PUT /suppliers/{supplier}` → redirect con toast
- `DELETE /suppliers/{supplier}` → redirect con toast

### Productos (CRUD)
- `GET /products` → products (paginada), categories, suppliers, filters
- `GET /products/create` → categories, suppliers
- `POST /products` → redirect con toast
- `GET /products/{product}` → product (con category/supplier)
- `GET /products/{product}/edit` → product, categories, suppliers
- `PUT /products/{product}` → redirect con toast
- `DELETE /products/{product}` → redirect con toast

### Movimientos (Parcial)
- `GET /movements` → movements (paginada), products, filters
- `GET /movements/create` → products, types
- `POST /movements` → redirect con toast
- `GET /movements/{movement}` → movement (con product/user)

### Usuarios (CRUD, admin only)
- `GET /users` → users (paginada), filters (search, role)
- `GET /users/create` → roles (UserRole enum)
- `POST /users` → redirect con toast
- `GET /users/{user}` → user
- `GET /users/{user}/edit` → user, roles
- `PUT /users/{user}` → redirect con toast
- `DELETE /users/{user}` → redirect con toast

### Reportes
- `GET /reports` → categories, suppliers
- `GET /reports/inventory` → products, summary, filters
- `GET /reports/movements` → movements (paginada), summary, filters
- `GET /reports/stock-status` → summary, filters
- `GET /reports/export/{type}` → export (csv/pdf/xlsx)

### Auditoría (admin only)
- `GET /audit` → logs (paginada), filters (user_id, auditable_type, event, fechas)
- `GET /audit/{auditLog}` → log (con user)

## Convenciones

1. **Componentes**: Function declarations, `data-slot`, `React.ComponentProps<>`
2. **Estilos**: `cn()`, Tailwind utility classes, `dark:` para dark mode
3. **Routing**: Wayfinder desde `@/routes`
4. **Forms**: `<Form>` + react-hook-form + Zod
5. **Toasts**: `toast.success()` / `toast.error()` de sonner
6. **Inertia**: `<Head>`, `<Link>`, `usePage()`, `useForm()`
7. **TypeScript**: Tipificar todo, no usar `any`

---

*Última actualización: 2026-09-09*
