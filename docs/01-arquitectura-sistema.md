# 01 — Arquitectura del Sistema

> Visión general del diseño del sistema de inventario, stack tecnológico y modelo de entidad-relación.

---

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Language | PHP | 8.3 |
| Framework | Laravel | 13 |
| Database | PostgreSQL | — |
| Auth | Fortify + Passkeys + 2FA | — |
| Frontend | React | 19 |
| SPA Bridge | Inertia.js | v3 |
| Styling | Tailwind CSS | v4 |
| UI Library | shadcn/ui (Radix UI) | — |
| Testing | Pest | — |
| Code Style | Laravel Pint | — |

---

## Diagrama ER (Entity-Relationship)

```mermaid
erDiagram
    categories ||--o{ categories : "parent (self-ref)"
    categories ||--o{ products : "has"
    suppliers ||--o{ products : "supplies"
    products ||--o{ stock_movements : "tracked by"
    users ||--o{ stock_movements : "performed by"
    users ||--o{ audit_logs : "logged by"

    categories {
        bigint id PK
        varchar name_category UK
        text description_category
        bigint parent_category_id FK "nullable"
        datetime created_at
        datetime updated_at
    }

    suppliers {
        bigint id PK
        varchar name_supplier
        varchar contact_name_supplier
        varchar email_supplier
        varchar phone_supplier
        text address_supplier
        datetime created_at
        datetime updated_at
    }

    products {
        bigint id PK
        varchar sku_product UK
        varchar name_product
        text description_product
        bigint category_id FK
        bigint supplier_id FK "nullable"
        decimal unit_price_product
        varchar unit_of_measure_product
        int minimum_stock_product
        int current_stock_product
        boolean is_active_product
        datetime created_at
        datetime updated_at
    }

    stock_movements {
        bigint id PK
        bigint product_id FK
        varchar type_movement "entry|exit|adjustment"
        int quantity_movement
        int previous_stock_movement
        int new_stock_movement
        varchar reference_movement
        text notes_movement
        bigint user_id FK
        datetime created_at
        datetime updated_at
    }

    users {
        bigint id PK
        varchar name
        varchar email UK
        varchar role "admin|employee"
        datetime created_at
        datetime updated_at
    }

    audit_logs {
        bigint id PK
        bigint user_id FK "nullable"
        uuid batch_id "nullable, indexed"
        varchar auditable_type
        bigint auditable_id
        varchar event "created|updated|deleted"
        json old_values
        json new_values
        varchar ip_address
        varchar user_agent
        datetime created_at
        datetime updated_at
    }
```

---

## Diagrama de Componentes

```mermaid
graph TB
    subgraph Frontend["Frontend — React + Inertia"]
        UI[shadcn/ui Components]
        Pages[Page Components]
        Hooks[Custom Hooks]
        Types[TypeScript Types]
    end

    subgraph Backend["Backend — Laravel"]
        Controllers[Controllers]
        Actions[Action Classes]
        Requests[Form Requests]
        Policies[Policies]
        Services[Services]
    end

    subgraph Data["Data Layer"]
        Models[Eloquent Models]
        Migrations[Migrations]
        Enums[Enums]
    end

    subgraph External["External"]
        DB[(PostgreSQL)]
        Queue[Queue / Jobs]
    end

    Frontend -->|Inertia.js| Backend
    Backend --> Data
    Models --> DB
    Actions --> DB
```

---

## Decisiones Arquitectónicas

### 1. Actions Pattern
La lógica de negocio compleja se encapsula en clases de acción (`app/Actions/`) en lugar de colocarla directamente en controladores. Esto mejora la testabilidad y reutilización.

| Acción | Responsabilidad |
|--------|----------------|
| `RegisterBatchMovementsAction` | Registrar 1..N movimientos en una sola transacción (usado por el controller) |
| `RegisterEntryAction` | Registrar entrada de stock *(legacy — ya no la invoca ningún controller)* |
| `RegisterExitAction` | Registrar salida de stock con validación *(legacy)* |
| `RegisterAdjustmentAction` | Ajustar stock directamente *(legacy)* |
| `DeleteCategoryAction` | Eliminar categoría reasignando productos |

> `POST /movements` siempre pasa por `RegisterBatchMovementsAction`, que internamente aplica la lógica de entrada/salida/ajuste por fila y correlaciona los `audit_logs` de la operación mediante `Context::get('audit_batch_id')`.

### 2. Form Requests
Cada endpoint de escritura tiene su propio Form Request para validación y normalización de datos. Se usa `prepareForValidation()` para sanitizar inputs antes de validar.

### 3. Policies + Middleware de Rol
El control de acceso se maneja en dos capas: Policies de Laravel y un middleware `role:` personalizado registrado en `bootstrap/app.php`. **El gate efectivo de las rutas de escritura (categorías/proveedores/productos/usuarios/inventario) es el middleware `role:admin` a nivel de ruta** — las policies son una capa secundaria.

### 4. Auditable Trait
Los modelos domain (Product, Category, Supplier, StockMovement, User) usan el trait `Auditable` para registrar automáticamente cambios en `audit_logs`.

### 5. Inertia.js
El frontend se comunica con el backend vía Inertia.js, eliminando la necesidad de una API REST separada. Cada controlador renderiza componentes React directamente.

---

*Ver también: [Modelo de Datos](02-modelo-datos.md) · [Flujo de Stock](03-flujo-stock.md)*
