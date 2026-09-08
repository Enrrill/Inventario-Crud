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
│   └── inventory.ts                     ← NUEVO: interfaces de dominio
├── hooks/
│   ├── use-debounce.ts                  ← NUEVO
│   ├── use-local-storage.ts             ← NUEVO
│   └── use-query-params.ts              ← NUEVO
├── components/
│   ├── ui/                              ← shadcn/ui (agregar 6)
│   │   ├── table.tsx                    ← NUEVO
│   │   ├── form.tsx                     ← NUEVO
│   │   ├── command.tsx                  ← NUEVO
│   │   ├── combobox.tsx                 ← NUEVO
│   │   ├── popover.tsx                  ← NUEVO
│   │   └── spinner.tsx                  ← NUEVO
│   ├── inventory/                       ← NUEVO: Componentes compartidos
│   │   ├── data-table.tsx
│   │   ├── data-grid.tsx
│   │   ├── view-toggle.tsx
│   │   ├── search-input.tsx
│   │   ├── filter-bar.tsx
│   │   ├── empty-state.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── stat-card.tsx
│   │   ├── page-header.tsx
│   │   ├── pagination.tsx
│   │   ├── form-drawer.tsx
│   │   ├── stock-badge.tsx
│   │   ├── type-badge.tsx
│   │   └── status-badge.tsx
│   └── app-sidebar.tsx                  ← ACTUALIZAR
├── pages/
│   ├── dashboard.tsx                    ← REEMPLAZAR
│   ├── categories/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── show.tsx
│   │   └── edit.tsx
│   ├── suppliers/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── show.tsx
│   │   └── edit.tsx
│   ├── products/
│   │   ├── index.tsx                    ← Vista dual lista/grid
│   │   ├── create.tsx
│   │   ├── show.tsx
│   │   └── edit.tsx
│   └── movements/
│       ├── index.tsx
│       ├── create.tsx
│       └── show.tsx
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

## Convenciones

1. **Componentes**: Function declarations, `data-slot`, `React.ComponentProps<>`
2. **Estilos**: `cn()`, Tailwind utility classes, `dark:` para dark mode
3. **Routing**: Wayfinder desde `@/routes`
4. **Forms**: `<Form>` + react-hook-form + Zod
5. **Toasts**: `toast.success()` / `toast.error()` de sonner
6. **Inertia**: `<Head>`, `<Link>`, `usePage()`, `useForm()`
7. **TypeScript**: Tipificar todo, no usar `any`
