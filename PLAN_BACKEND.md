# Plan Backend - Sistema de Inventario

> **Stack**: Laravel 13 · PHP 8.3 · PostgreSQL · Pest · Inertia/React  
> **Objetivo**: Implementar el backend completo del sistema de inventario con controladores, validaciones y lógica de negocio.

---

## Resumen de Entidades y Endpoints

| Recurso | Rutas | Controlador | Acciones |
|---------|-------|-------------|----------|
| Categories | CRUD + jerarquía | CategoryController | index, create, store, show, edit, update, destroy |
| Suppliers | CRUD | SupplierController | index, create, store, show, edit, update, destroy |
| Products | CRUD + filtros | ProductController | index, create, store, show, edit, update, destroy |
| Stock Movements | Create + historial | StockMovementController | index, create, store, show |
| Dashboard | Resumen | DashboardController | __invoke |

---

## Fase 1: Excepciones y Scopes

### 1.1 InsufficientStockException

**Archivo**: `app/Exceptions/InsufficientStockException.php`

Excepción lanzada cuando se intenta registrar una salida de stock mayor al disponible.

### 1.2 Scopes en Product

- `scopeInCategory($query, $categoryId)` - Filtrar por categoría
- `scopeFromSupplier($query, $supplierId)` - Filtrar por proveedor
- `scopeSearch($query, $search)` - Buscar por nombre o SKU

### 1.3 Scopes en StockMovement

- `scopeForProduct($query, $productId)` - Filtrar por producto
- `scopeOfType($query, $type)` - Filtrar por tipo de movimiento
- `scopeRecent($query, $days)` - Movimientos de los últimos N días

---

## Fase 2: Controladores

### 2.1 CategoryController

**Endpoints**:
| Método | Ruta | Acción | Nombre |
|--------|------|--------|--------|
| GET | `/categories` | index | categories.index |
| GET | `/categories/create` | create | categories.create |
| POST | `/categories` | store | categories.store |
| GET | `/categories/{category}` | show | categories.show |
| GET | `/categories/{category}/edit` | edit | categories.edit |
| PUT/PATCH | `/categories/{category}` | update | categories.update |
| DELETE | `/categories/{category}` | destroy | categories.destroy |

**Lógica de negocio**:
- Nombre único por nivel (no global)
- No permitir eliminar categorías con productos (mover a "Sin categoría")

### 2.2 SupplierController

**Endpoints**:
| Método | Ruta | Acción | Nombre |
|--------|------|--------|--------|
| GET | `/suppliers` | index | suppliers.index |
| GET | `/suppliers/create` | create | suppliers.create |
| POST | `/suppliers` | store | suppliers.store |
| GET | `/suppliers/{supplier}` | show | suppliers.show |
| GET | `/suppliers/{supplier}/edit` | edit | suppliers.edit |
| PUT/PATCH | `/suppliers/{supplier}` | update | suppliers.update |
| DELETE | `/suppliers/{supplier}` | destroy | suppliers.destroy |

**Lógica de negocio**:
- Email único si se proporciona
- No permitir eliminar proveedores con productos asociados

### 2.3 ProductController

**Endpoints**:
| Método | Ruta | Acción | Nombre |
|--------|------|--------|--------|
| GET | `/products` | index | products.index |
| GET | `/products/create` | create | products.create |
| POST | `/products` | store | products.store |
| GET | `/products/{product}` | show | products.show |
| GET | `/products/{product}/edit` | edit | products.edit |
| PUT/PATCH | `/products/{product}` | update | products.update |
| DELETE | `/products/{product}` | destroy | products.destroy |

**Lógica de negocio**:
- SKU único
- `current_stock` solo se modifica vía movimientos

### 2.4 StockMovementController

**Endpoints**:
| Método | Ruta | Acción | Nombre |
|--------|------|--------|--------|
| GET | `/movements` | index | movements.index |
| GET | `/movements/create` | create | movements.create |
| POST | `/movements` | store | movements.store |
| GET | `/movements/{movement}` | show | movements.show |

**Lógica de negocio**:
- **Entrada**: `new_stock = previous_stock + quantity`
- **Salida**: `new_stock = previous_stock - quantity` (validar stock suficiente)
- **Ajuste**: `new_stock = quantity` (establecer stock directamente)
- Usar `lockForUpdate()` para prevenir race conditions

### 2.5 DashboardController

**Endpoint**:
| Método | Ruta | Acción | Nombre |
|--------|------|--------|--------|
| GET | `/dashboard` | __invoke | dashboard |

**Datos a mostrar**:
- Total de productos activos
- Productos con stock bajo
- Total de categorías
- Total de proveedores
- Últimos 5 movimientos
- Valor total del inventario

---

## Fase 3: Form Requests

### 3.1 StoreCategoryRequest

```php
rules: [
    'name' => ['required', 'string', 'max:100'],
    'description' => ['nullable', 'string'],
    'parent_id' => ['nullable', 'exists:categories,id'],
]
```

### 3.2 UpdateCategoryRequest

```php
rules: [
    'name' => ['required', 'string', 'max:100'],
    'description' => ['nullable', 'string'],
    'parent_id' => ['nullable', 'exists:categories,id'],
]
```

### 3.3 StoreSupplierRequest

```php
rules: [
    'name' => ['required', 'string', 'max:150'],
    'contact_name' => ['nullable', 'string', 'max:150'],
    'email' => ['nullable', 'email', 'max:255', 'unique:suppliers,email'],
    'phone' => ['nullable', 'string', 'max:50'],
    'address' => ['nullable', 'string'],
]
```

### 3.4 StoreProductRequest

```php
rules: [
    'sku' => ['required', 'string', 'max:50', 'unique:products,sku'],
    'name' => ['required', 'string', 'max:200'],
    'description' => ['nullable', 'string'],
    'category_id' => ['required', 'exists:categories,id'],
    'supplier_id' => ['nullable', 'exists:suppliers,id'],
    'unit_price' => ['required', 'numeric', 'min:0'],
    'unit_of_measure' => ['required', 'string', 'max:50'],
    'minimum_stock' => ['required', 'integer', 'min:0'],
]
```

### 3.5 StoreStockMovementRequest

```php
rules: [
    'product_id' => ['required', 'exists:products,id'],
    'type' => ['required', 'in:entry,exit,adjustment'],
    'quantity' => ['required', 'integer', 'min:1'],
    'reference' => ['nullable', 'string', 'max:100'],
    'notes' => ['nullable', 'string'],
]
```

---

## Fase 4: Actions

### 4.1 RegisterEntryAction

```php
class RegisterEntryAction
{
    public function handle(Product $product, int $quantity, ?string $reference, ?string $notes, User $user): StockMovement
    {
        return DB::transaction(function () use ($product, $quantity, $reference, $notes, $user) {
            $previousStock = $product->current_stock;
            $newStock = $previousStock + $quantity;
            
            $product->update(['current_stock' => $newStock]);
            
            return StockMovement::create([
                'product_id' => $product->id,
                'type' => StockMovementType::Entry,
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'reference' => $reference,
                'notes' => $notes,
                'user_id' => $user->id,
            ]);
        });
    }
}
```

### 4.2 RegisterExitAction

```php
class RegisterExitAction
{
    public function handle(Product $product, int $quantity, ?string $reference, ?string $notes, User $user): StockMovement
    {
        return DB::transaction(function () use ($product, $quantity, $reference, $notes, $user) {
            $product->lockForUpdate();
            
            if ($quantity > $product->current_stock) {
                throw new InsufficientStockException($product, $quantity);
            }
            
            $previousStock = $product->current_stock;
            $newStock = $previousStock - $quantity;
            
            $product->update(['current_stock' => $newStock]);
            
            return StockMovement::create([
                'product_id' => $product->id,
                'type' => StockMovementType::Exit,
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'reference' => $reference,
                'notes' => $notes,
                'user_id' => $user->id,
            ]);
        });
    }
}
```

### 4.3 RegisterAdjustmentAction

```php
class RegisterAdjustmentAction
{
    public function handle(Product $product, int $newQuantity, ?string $reference, ?string $notes, User $user): StockMovement
    {
        return DB::transaction(function () use ($product, $newQuantity, $reference, $notes, $user) {
            $previousStock = $product->current_stock;
            $quantity = abs($newQuantity - $previousStock);
            
            $product->update(['current_stock' => $newQuantity]);
            
            return StockMovement::create([
                'product_id' => $product->id,
                'type' => StockMovementType::Adjustment,
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newQuantity,
                'reference' => $reference,
                'notes' => $notes,
                'user_id' => $user->id,
            ]);
        });
    }
}
```

### 4.4 DeleteCategoryAction

```php
class DeleteCategoryAction
{
    public function handle(Category $category): void
    {
        $uncategorized = Category::firstOrCreate(['name' => 'Sin categoría']);
        
        $category->products()->update(['category_id' => $uncategorized->id]);
        $category->children()->update(['parent_id' => $uncategorized->id]);
        
        $category->delete();
    }
}
```

---

## Fase 5: Rutas

```php
// routes/web.php

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    
    Route::resource('categories', CategoryController::class);
    Route::resource('suppliers', SupplierController::class);
    Route::resource('products', ProductController::class);
    
    Route::resource('movements', StockMovementController::class)->only(['index', 'create', 'store', 'show']);
});
```

---

## Fase 6: Tests

### Feature Tests

| Test | Descripción |
|------|-------------|
| CategoryTest | CRUD completo de categorías |
| SupplierTest | CRUD completo de proveedores |
| ProductTest | CRUD completo de productos |
| StockMovementTest | Registro de movimientos |
| DashboardTest | Visualización del dashboard |
| StockValidationTest | Validaciones de stock |

### Unit Tests

| Test | Descripción |
|------|-------------|
| RegisterEntryActionTest | Lógica de entradas |
| RegisterExitActionTest | Lógica de salidas |
| RegisterAdjustmentActionTest | Lógica de ajustes |
| DeleteCategoryActionTest | Eliminación segura |

---

## Fase 7: Orden de Implementación

1. **Excepciones** - `InsufficientStockException`
2. **Scopes** - Agregar scopes adicionales a modelos
3. **Form Requests** - Crear todos los form requests
4. **Actions** - Crear las acciones de negocio
5. **Controladores** - Crear los 5 controladores
6. **Rutas** - Definir rutas en `web.php`
7. **Tests Unit** - Tests de actions
8. **Tests Feature** - Tests de endpoints
9. **Verificación** - Ejecutar tests y pint

---

## Fase 8: Verificación

```bash
# Ejecutar tests
php artisan test --compact

# Verificar formato
vendor/bin/pint --dirty

# Verificar rutas
php artisan route:list

# Verificar migraciones
php artisan migrate:status
```

---

*Última actualización: 2026-09-07*
