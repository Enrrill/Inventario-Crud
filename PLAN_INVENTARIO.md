# Plan de Implementación - Sistema de Inventario

> **Stack**: Laravel 13 · PHP 8.3 · PostgreSQL · Pest · Inertia/React  
> **Objetivo**: Diseñar e implementar una base de datos normalizada para un sistema de inventario con alertas de stock y proveedores.

---

## Resumen del Diseño

| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| `categories` | Categorías jerárquicas de productos | Self-referencing (subcategorías) |
| `suppliers` | Proveedores de productos | → products |
| `products` | Productos del inventario | → categories, suppliers |
| `stock_movements` | Historial de entradas/salidas/ajustes | → products, users |

---

## Fase 1: Enums y Tipos PostgreSQL

### 1.1 Enum `StockMovementType`

**Archivo**: `app/Enums/StockMovementType.php`

```php
enum StockMovementType: string
{
    case Entry = 'entry';
    case Exit = 'exit';
    case Adjustment = 'adjustment';
}
```

**Justificación**:
- Enums nativos de PHP 8.1+ con string backing para PostgreSQL
- Valores en inglés para consistencia técnica
- Labels en español para presentación en UI

---

## Fase 2: Migraciones

### 2.1 `categories`

- `id` (bigint PK)
- `name` (varchar 100, unique)
- `description` (text, nullable)
- `parent_id` (bigint FK → categories, nullable, nullOnDelete)
- `timestamps`
- Índice en `parent_id`

### 2.2 `suppliers`

- `id` (bigint PK)
- `name` (varchar 150)
- `contact_name` (varchar 150, nullable)
- `email` (varchar, nullable)
- `phone` (varchar 50, nullable)
- `address` (text, nullable)
- `timestamps`
- Índice en `name`

### 2.3 `products`

- `id` (bigint PK)
- `sku` (varchar 50, unique)
- `name` (varchar 200)
- `description` (text, nullable)
- `category_id` (bigint FK → categories, cascadeOnDelete)
- `supplier_id` (bigint FK → suppliers, nullable, nullOnDelete)
- `unit_price` (decimal 10,2, default 0)
- `unit_of_measure` (varchar 50, default 'pieza')
- `minimum_stock` (integer, default 0)
- `current_stock` (integer, default 0)
- `is_active` (boolean, default true)
- `timestamps`
- Índices en `category_id`, `supplier_id`, `is_active`

### 2.4 `stock_movements`

- `id` (bigint PK)
- `product_id` (bigint FK → products, cascadeOnDelete)
- `type` (varchar 20, enum: entry/exit/adjustment)
- `quantity` (integer)
- `previous_stock` (integer)
- `new_stock` (integer)
- `reference` (varchar 100, nullable)
- `notes` (text, nullable)
- `user_id` (bigint FK → users, cascadeOnDelete)
- `timestamps`
- Índices en `product_id`, `type`, `created_at`

---

## Fase 3: Modelos Eloquent

### Relaciones

| Modelo | Relación | Tipo | FK |
|--------|----------|------|----|
| Category | parent | BelongsTo | parent_id |
| Category | children | HasMany | parent_id |
| Category | products | HasMany | category_id |
| Supplier | products | HasMany | category_id |
| Product | category | BelongsTo | category_id |
| Product | supplier | BelongsTo | supplier_id |
| Product | movements | HasMany | product_id |
| StockMovement | product | BelongsTo | product_id |
| StockMovement | user | BelongsTo | user_id |

### Métodos y Scopes

- `Product::isLowStock()` → `current_stock <= minimum_stock`
- `Product::scopeActive()` → `where('is_active', true)`
- `Product::scopeLowStock()` → `whereColumn('current_stock', '<=', 'minimum_stock')`
- `Category::allChildren()` → subcategorías recursivas

---

## Fase 4: Factories

- `CategoryFactory` → estado `child(Category $parent)`
- `SupplierFactory` → datos fake de empresa
- `ProductFactory` → estados `lowStock()` y `inactive()`
- `StockMovementFactory` → estados `entry()`, `exit()`, `adjustment()`

---

## Fase 5: Diagrama ER

```
categories ──┬── categories (self-referencing)
             │
suppliers ───┤
             │
products ────┘
    │
    └── stock_movements → users
```

---

## Fase 6: Verificación

```bash
php artisan migrate
php artisan db:seed
php artisan test
vendor/bin/pint --dirty
```

---

*Última actualización: 2026-09-07*
