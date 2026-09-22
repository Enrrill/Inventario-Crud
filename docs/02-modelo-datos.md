# 02 — Modelo de Datos

> Enums, migraciones, modelos Eloquent, relaciones, scopes y factories.

---

## Enums

### StockMovementType

**Archivo**: `app/Enums/StockMovementType.php`

```php
enum StockMovementType: string
{
    case Entry = 'entry';
    case Exit = 'exit';
    case Adjustment = 'adjustment';
}
```

| Case | Valor | Label |
|------|-------|-------|
| `Entry` | `entry` | Entrada |
| `Exit` | `exit` | Salida |
| `Adjustment` | `adjustment` | Ajuste |

### UserRole

**Archivo**: `app/Enums/UserRole.php`

```php
enum UserRole: string
{
    case Admin = 'admin';
    case Employee = 'employee';
}
```

| Case | Valor | Label | Métodos |
|------|-------|-------|---------|
| `Admin` | `admin` | Administrador | `isAdmin()` → `true` |
| `Employee` | `employee` | Empleado | `isEmployee()` → `true` |

---

## Tablas

### categories

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | bigint | PK, auto-increment |
| `name_category` | varchar(100) | UNIQUE, NOT NULL |
| `description_category` | text | NULLABLE |
| `parent_category_id` | bigint | FK → categories.id, NULLABLE, nullOnDelete |
| `created_at` | timestamp | — |
| `updated_at` | timestamp | — |

**Índices**: `parent_category_id`

### suppliers

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | bigint | PK, auto-increment |
| `name_supplier` | varchar(150) | NOT NULL |
| `contact_name_supplier` | varchar(150) | NULLABLE |
| `email_supplier` | varchar | NULLABLE |
| `phone_supplier` | varchar(50) | NULLABLE |
| `address_supplier` | text | NULLABLE |
| `created_at` | timestamp | — |
| `updated_at` | timestamp | — |

**Índices**: `name_supplier`

### products

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | bigint | PK, auto-increment |
| `sku_product` | varchar(50) | UNIQUE, NOT NULL |
| `name_product` | varchar(200) | NOT NULL |
| `description_product` | text | NULLABLE |
| `category_id` | bigint | FK → categories.id, cascadeOnDelete |
| `supplier_id` | bigint | FK → suppliers.id, NULLABLE, nullOnDelete |
| `unit_price_product` | decimal(10,2) | DEFAULT 0 |
| `unit_of_measure_product` | varchar(50) | DEFAULT 'pieza' |
| `minimum_stock_product` | integer | DEFAULT 0 |
| `current_stock_product` | integer | DEFAULT 0 |
| `is_active_product` | boolean | DEFAULT true |
| `created_at` | timestamp | — |
| `updated_at` | timestamp | — |

**Índices**: `category_id`, `supplier_id`, `is_active_product`

> **Nota**: `current_stock_product` solo se modifica a través de movimientos de stock, nunca directamente.

### stock_movements

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | bigint | PK, auto-increment |
| `product_id` | bigint | FK → products.id, cascadeOnDelete |
| `type_movement` | varchar(20) | NOT NULL (entry/exit/adjustment) |
| `quantity_movement` | integer | NOT NULL |
| `previous_stock_movement` | integer | NOT NULL |
| `new_stock_movement` | integer | NOT NULL |
| `reference_movement` | varchar(100) | NULLABLE |
| `notes_movement` | text | NULLABLE |
| `user_id` | bigint | FK → users.id, cascadeOnDelete |
| `created_at` | timestamp | — |
| `updated_at` | timestamp | — |

**Índices**: `product_id`, `type_movement`, `created_at`

> **Convención**: los campos de las tablas de negocio llevan sufijo por entidad (`_category`, `_supplier`, `_product`, `_movement`).

### users (extensión)

Se agrega columna `role` a la tabla `users` existente:

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `role` | varchar(20) | DEFAULT 'employee', INDEX |

### audit_logs

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | bigint | PK, auto-increment |
| `user_id` | bigint | FK → users.id, NULLABLE, nullOnDelete |
| `batch_id` | uuid | NULLABLE, INDEX — correlaciona los logs de un mismo lote |
| `auditable_type` | varchar | NOT NULL (Morph type) |
| `auditable_id` | bigint | NOT NULL (Morph ID) |
| `event` | varchar | NOT NULL (created/updated/deleted) |
| `old_values` | json | NULLABLE |
| `new_values` | json | NULLABLE |
| `ip_address` | varchar | NULLABLE |
| `user_agent` | varchar | NULLABLE |
| `created_at` | timestamp | — |
| `updated_at` | timestamp | — |

**Índices**: `(auditable_type, auditable_id)`, `event`, `created_at`, `batch_id`

---

## Relaciones Eloquent

| Modelo | Relación | Tipo | FK | Descripción |
|--------|----------|------|----|-------------|
| Category | `parent` | BelongsTo | parent_category_id | Categoría padre |
| Category | `children` | HasMany | parent_category_id | Subcategorías |
| Category | `products` | HasMany | category_id | Productos en la categoría |
| Category | `allChildren()` | Helper | — | Colección recursiva de descendientes |
| Supplier | `products` | HasMany | supplier_id | Productos del proveedor |
| Product | `category` | BelongsTo | category_id | Categoría del producto |
| Product | `supplier` | BelongsTo | supplier_id | Proveedor del producto |
| Product | `movements` | HasMany | product_id | Movimientos de stock |
| User | `stockMovements` | HasMany | user_id | Movimientos realizados por el usuario |
| StockMovement | `product` | BelongsTo | product_id | Producto asociado |
| StockMovement | `user` | BelongsTo | user_id | Usuario que realizó el movimiento |
| AuditLog | `user` | BelongsTo | user_id | Usuario que generó el log |
| AuditLog | `auditable` | MorphTo | — | Modelo auditado |

```mermaid
graph LR
    C[Category] -->|parent_category_id| C
    C -->|category_id| P[Product]
    S[Supplier] -->|supplier_id| P
    P -->|product_id| SM[StockMovement]
    U[User] -->|user_id| SM
    U -->|user_id| AL[AuditLog]
    AL -.->|morphTo| P
    AL -.->|morphTo| C
    AL -.->|morphTo| S
```

---

## Scopes

### Product

| Scope | Parámetro | Descripción |
|-------|-----------|-------------|
| `scopeActive($query)` | — | Productos con `is_active_product = true` |
| `scopeLowStock($query)` | — | Productos donde `current_stock_product <= minimum_stock_product` |
| `scopeInCategory($query, $categoryId)` | `$categoryId` | Filtrar por categoría |
| `scopeFromSupplier($query, $supplierId)` | `$supplierId` | Filtrar por proveedor |
| `scopeSearch($query, $search)` | `$search` | Buscar por nombre o SKU |

### StockMovement

| Scope | Parámetro | Descripción |
|-------|-----------|-------------|
| `scopeForProduct($query, $productId)` | `$productId` | Filtrar por producto |
| `scopeOfType($query, $type)` | `$type` | Filtrar por tipo de movimiento |
| `scopeRecent($query, $days)` | `$days` (default: 30) | Movimientos de los últimos N días |

### AuditLog

| Scope | Parámetro | Descripción |
|-------|-----------|-------------|
| `scopeForModel($query, $type, $id)` | tipo, ID opcional | Filtrar por modelo |
| `scopeForEvent($query, $event)` | evento | Filtrar por tipo de evento |
| `scopeForUser($query, $userId)` | ID de usuario | Filtrar por usuario |
| `scopeForBatch($query, $batchId)` | UUID de lote | Logs que comparten un mismo lote |
| `scopeRecent($query, $days)` | días (default: 30) | Logs recientes |

> `batch_id` está en `$fillable` de `AuditLog` y se escribe desde el trait `Auditable` leyendo `Context::get('audit_batch_id')`.

---

## Factories

| Factory | Estados | Descripción |
|---------|---------|-------------|
| `CategoryFactory` | `child(Category $parent)` | Categoría hija de un padre |
| `SupplierFactory` | — | Datos fake de empresa |
| `ProductFactory` | `lowStock()`, `inactive()` | Producto con stock bajo / inactivo |
| `StockMovementFactory` | `entry()`, `exit()`, `adjustment()` | Movimiento por tipo |
| `AuditLogFactory` | — | Log de auditoría |
| `UserFactory` | `admin()`, `unverified()`, `withTwoFactor()` | El estado por defecto ya es `UserRole::Employee` — no existe estado `employee()` |

---

## Seeders

`php artisan db:seed` ejecuta `DatabaseSeeder`, que llama a `InventoryTestSeeder` (`database/seeders/InventoryTestSeeder.php`):

1. **Trunca** `stock_movements`, `products`, `categories`, `suppliers`, `audit_logs`, `sessions`, `password_reset_tokens`.
2. Crea **5 usuarios**: admin principal (`enrrill@gmail.com`), 1 admin secundario y 3 employees.
3. Crea categorías (padres con hijos), 8 proveedores, ~52 productos y movimientos aleatorios para poblar reportes y auditoría.

---

*Ver también: [Flujo de Stock](03-flujo-stock.md) · [Arquitectura del Sistema](01-arquitectura-sistema.md)*
