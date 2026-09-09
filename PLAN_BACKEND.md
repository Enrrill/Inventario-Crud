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
| Users | CRUD + roles | UserController | index, create, store, show, edit, update, destroy |
| Reports | Filtros + exportación | ReportController | inventory, movements, stockStatus, export |
| Audit | Lectura + filtros | AuditController | index, show |

### Roles de Usuario

| Rol | Permisos |
|-----|----------|
| `admin` | Acceso total: CRUD de usuarios, categorías, proveedores, productos, movimientos, reportes y auditoría |
| `employee` | Lectura de todo + creación de movimientos de stock. No puede gestionar usuarios ni eliminar recursos |

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

    // Gestión de usuarios (solo admin)
    Route::resource('users', UserController::class)->middleware('role:admin');

    // Reportes
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/inventory', [ReportController::class, 'inventory'])->name('inventory');
        Route::get('/movements', [ReportController::class, 'movements'])->name('movements');
        Route::get('/stock-status', [ReportController::class, 'stockStatus'])->name('stock-status');
        Route::get('/export/{type}', [ReportController::class, 'export'])->name('export');
    });

    // Auditoría (solo admin)
    Route::resource('audit', AuditController::class)->only(['index', 'show'])->middleware('role:admin');
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

## Fase 9: Normalización y Formateo de Textos

### 9.1 Servicio TextNormalizer

**Archivo**: `app/Services/TextNormalizer.php`

Servicio estático reutilizable con métodos de normalización. Se usa en FormRequests vía `prepareForValidation()` para sanitizar datos antes de la validación.

```php
class TextNormalizer
{
    public static function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    public static function normalizeName(string $name): string
    {
        return ucwords(strtolower(trim($name)));
    }

    public static function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '58')) {
            $digits = substr($digits, 2);
        }
        if (str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }
        if (strlen($digits) === 10) {
            return "58({$digits[0]}{$digits[1]}{$digits[2]})-{$digits[3]}{$digits[4]}{$digits[5]}-{$digits[6]}{$digits[7]}{$digits[8]}{$digits[9]}";
        }
        return $phone;
    }

    public static function normalizeSku(string $sku): string
    {
        return strtoupper(trim($sku));
    }

    public static function normalizeText(string $text): string
    {
        return preg_replace('/\s+/', ' ', trim($text));
    }
}
```

### 9.2 Normalización en Form Requests

Cada Form Request afectado implementa `prepareForValidation()`:

| Form Request | Campos normalizados |
|---|---|
| `StoreSupplierRequest` | `email_supplier` → normalizeEmail, `contact_name_supplier` → normalizeName, `phone_supplier` → normalizePhone, `name_supplier` → normalizeName, `address_supplier` → normalizeText |
| `UpdateSupplierRequest` | Mismos campos que Store |
| `StoreProductRequest` | `sku_product` → normalizeSku, `name_product` → normalizeName, `description_product` → normalizeText |
| `UpdateProductRequest` | Mismos campos que Store |
| `StoreCategoryRequest` | `name_category` → normalizeName, `description_category` → normalizeText |
| `UpdateCategoryRequest` | Mismos campos que Store |

### 9.3 Formato de Teléfono

El formato estándar para teléfonos venezolanos es: `58(424)-123-4567`

- Prefijo país: `58`
- Código de área: `(424)` o similar
- Número: `123-4567`
- Se limpian todos los caracteres no numéricos antes de formatear
- Si el teléfono no tiene 10 dígitos válidos, se almacena tal cual (sin formatear)

### 9.4 Acciones en Modelos (Opcional)

Se pueden agregar accessors/mutators en modelos para display, pero la fuente de verdad es la normalización en FormRequests:

```php
// En Supplier model (opcional, para display)
protected function phoneDisplay(): Attribute
{
    return Attribute::get(fn (?string $value) => $value ? $value : 'N/A');
}
```

---

## Fase 10: Roles de Usuario

### 10.1 Enum UserRole

**Archivo**: `app/Enums/UserRole.php`

```php
enum UserRole: string
{
    case Admin = 'admin';
    case Employee = 'employee';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Employee => 'Empleado',
        };
    }

    public function isAdmin(): bool
    {
        return $this === self::Admin;
    }

    public function isEmployee(): bool
    {
        return $this === self::Employee;
    }
}
```

### 10.2 Migración

**Archivo**: `database/migrations/xxxx_add_role_to_users_table.php`

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('role', 20)->default('employee')->index();
});
```

### 10.3 Modelo User (Actualización)

Agregar a `app/Models/User.php`:

```php
use App\Enums\UserRole;

// En casts():
'role' => UserRole::class,

// Métodos:
public function isAdmin(): bool
{
    return $this->role === UserRole::Admin;
}

public function isEmployee(): bool
{
    return $this->role === UserRole::Employee;
}
```

### 10.4 Middleware Role

**Archivo**: `app/Http/Middleware/RoleMiddleware.php`

Middleware que valida que el usuario autenticado tenga el rol requerido:

```php
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! $request->user()->role) {
            abort(403);
        }

        $userRole = $request->user()->role->value;

        if (! in_array($userRole, $roles)) {
            abort(403);
        }

        return $next($request);
    }
}
```

Registrar en `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ]);
})
```

### 10.5 Policies

**Archivos**: `app/Policies/*.php`

| Policy | Admin | Employee |
|---|---|---|
| `UserPolicy` | full CRUD | viewAny, view (solo perfil propio) |
| `CategoryPolicy` | full CRUD | viewAny, view, create, update (no delete) |
| `SupplierPolicy` | full CRUD | viewAny, view, create, update (no delete) |
| `ProductPolicy` | full CRUD | viewAny, view, create, update (no delete) |
| `StockMovementPolicy` | full CRUD | viewAny, view, create |
| `ReportPolicy` | viewAny, view | viewAny, view |
| `AuditPolicy` | viewAny, view | deny (no acceso) |

Registrar policies en `AuthServiceProvider` o `AppServiceProvider`:
```php
use App\Policies\UserPolicy;
use App\Models\User;

protected function boot(): void
{
    $this->registerPolicies();
}
```

---

## Fase 11: Controlador de Usuarios

### 11.1 UserController

**Archivo**: `app/Http/Controllers/UserController.php`

**Endpoints**:
| Método | Ruta | Acción | Nombre | Middleware |
|--------|------|--------|--------|-----------|
| GET | `/users` | index | users.index | role:admin |
| GET | `/users/create` | create | users.create | role:admin |
| POST | `/users` | store | users.store | role:admin |
| GET | `/users/{user}` | show | users.show | role:admin |
| GET | `/users/{user}/edit` | edit | users.edit | role:admin |
| PUT/PATCH | `/users/{user}` | update | users.update | role:admin |
| DELETE | `/users/{user}` | destroy | users.destroy | role:admin |

**Lógica de negocio**:
- Solo admin puede gestionar usuarios
- Email único
- Al crear usuario, asignar role por defecto `employee`
- No permitir eliminar el propio usuario
- Password opcional en update (si se proporciona, se valida; si no, se mantiene)

### 11.2 Form Requests

**StoreUserRequest**:
```php
rules: [
    'name' => ['required', 'string', 'max:255'],
    'email' => ['required', 'email', 'max:255', 'unique:users,email'],
    'password' => ['required', 'string', 'min:8', 'confirmed'],
    'role' => ['required', Rule::enum(UserRole::class)],
]
```

**UpdateUserRequest**:
```php
rules: [
    'name' => ['required', 'string', 'max:255'],
    'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
    'password' => ['nullable', 'string', 'min:8', 'confirmed'],
    'role' => ['required', Rule::enum(UserRole::class)],
]
```

### 11.3 Dashboard de Usuario

El `DashboardController` existente se extiende para incluir:
- Rol del usuario actual
- Permisos disponibles (para el frontend)
- Total de usuarios (solo admin)

```php
// En DashboardController
$dashboardData = [
    // ... datos existentes ...
    'user_role' => $request->user()->role->value,
    'is_admin' => $request->user()->isAdmin(),
];
```

---

## Fase 12: Módulo de Reportes

### 12.1 Dependencias

```bash
composer require barryvdh/laravel-dompdf
composer require maatwebsite/excel
```

### 12.2 ReportController

**Archivo**: `app/Http/Controllers/ReportController.php`

**Endpoints**:
| Método | Ruta | Acción | Nombre |
|--------|------|--------|--------|
| GET | `/reports` | index | reports.index |
| GET | `/reports/inventory` | inventory | reports.inventory |
| GET | `/reports/movements` | movements | reports.movements |
| GET | `/reports/stock-status` | stockStatus | reports.stock-status |
| GET | `/reports/export/{type}` | export | reports.export |

`{type}` = `csv` | `pdf` | `xlsx`

### 12.3 ReportRequest

**Archivo**: `app/Http/Requests/ReportRequest.php`

```php
rules: [
    'date_from' => ['nullable', 'date'],
    'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
    'category_id' => ['nullable', 'exists:categories,id'],
    'supplier_id' => ['nullable', 'exists:suppliers,id'],
    'product_id' => ['nullable', 'exists:products,id'],
    'type_movement' => ['nullable', Rule::enum(StockMovementType::class)],
]
```

### 12.4 Tipos de Reporte

**Reporte de Inventario** (`reports.inventory`):
- Valor total del inventario
- Productos por categoría (conteo y valor)
- Productos por proveedor (conteo y valor)
- Top 10 productos por valor

**Reporte de Movimientos** (`reports.movements`):
- Entradas/salidas/ajustes por rango de fechas
- Movimientos por producto
- Movimientos por usuario
- Resumen diario/semanal/mensual

**Reporte de Estado de Stock** (`reports.stock-status`):
- Productos bajo mínimo
- Productos sin stock
- Productos con exceso de stock
- Distribución por categoría

### 12.5 Exportación

**Archivo**: `app/Services/ReportExportService.php`

Servicio que maneja los 3 formatos:

| Formato | Paquete | Método |
|---|---|---|
| CSV | Nativo PHP | `fputcsv()` con streaming |
| PDF | `barryvdh/laravel-dompdf` | `Pdf::loadView()` |
| XLSX | `maatwebsite/excel` | `Excel::download()` |

```php
class ReportExportService
{
    public function exportCsv(Collection $data, string $filename, array $headers): StreamedResponse
    public function exportPdf(View $view, string $filename): BinaryFileResponse
    public function exportXlsx(FromCollection $export, string $filename): BinaryFileResponse
}
```

**Endpoints de exportación**:
```
GET /reports/export/csv?report=inventory&date_from=...&date_to=...
GET /reports/export/pdf?report=movements&category_id=...
GET /reports/export/xlsx?report=stock-status&supplier_id=...
```

---

## Fase 13: Módulo de Auditoría

### 13.1 Migración

**Archivo**: `database/migrations/xxxx_create_audit_logs_table.php`

```php
Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('auditable_type');
    $table->unsignedBigInteger('auditable_id');
    $table->string('event'); // created, updated, deleted
    $table->json('old_values')->nullable();
    $table->json('new_values')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->string('user_agent')->nullable();
    $table->timestamps();

    $table->index(['auditable_type', 'auditable_id']);
    $table->index('event');
    $table->index('created_at');
});
```

### 13.2 Modelo AuditLog

**Archivo**: `app/Models/AuditLog.php`

```php
class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'auditable_type',
        'auditable_id',
        'event',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeForModel(Builder $query, string $type, ?int $id = null): Builder
    {
        $query->where('auditable_type', $type);
        if ($id) {
            $query->where('auditable_id', $id);
        }
        return $query;
    }

    public function scopeForEvent(Builder $query, string $event): Builder
    {
        return $query->where('event', $event);
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
```

### 13.3 Trait Auditable

**Archivo**: `app/Traits/Auditable.php`

```php
trait Auditable
{
    protected static function bootAuditable(): void
    {
        static::created(function (Model $model) {
            static::logAudit($model, 'created', null, $model->getAttributes());
        });

        static::updated(function (Model $model) {
            $dirty = $model->getDirty();
            $original = $model->getOriginal($dirty);
            static::logAudit($model, 'updated', $original, $dirty);
        });

        static::deleted(function (Model $model) {
            static::logAudit($model, 'deleted', $model->getAttributes(), null);
        });
    }

    protected static function logAudit(Model $model, string $event, ?array $old, ?array $new): void
    {
        AuditLog::create([
            'user_id' => auth()->id(),
            'auditable_type' => get_class($model),
            'auditable_id' => $model->getKey(),
            'event' => $event,
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
```

### 13.4 Modelos Auditable

Agregar el trait a los modelos que se desean auditar:

```php
// En User.php, Product.php, Category.php, Supplier.php, StockMovement.php
use App\Traits\Auditable;

class Product extends Model
{
    use HasFactory, Auditable;
    // ...
}
```

### 13.5 AuditController

**Archivo**: `app/Http/Controllers/AuditController.php`

**Endpoints**:
| Método | Ruta | Acción | Nombre | Middleware |
|--------|------|--------|--------|-----------|
| GET | `/audit` | index | audit.index | role:admin |
| GET | `/audit/{auditLog}` | show | audit.show | role:admin |

**Lógica**:
- Solo admin puede ver registros de auditoría
- Filtros: usuario, modelo, evento, rango de fechas
- Paginación con 25 registros por página
- El `show` muestra detalle completo con old_values y new_values formateados

### 13.6 AuditRequest

**Archivo**: `app/Http/Requests/AuditRequest.php`

```php
rules: [
    'user_id' => ['nullable', 'exists:users,id'],
    'auditable_type' => ['nullable', 'string'],
    'event' => ['nullable', Rule::in(['created', 'updated', 'deleted'])],
    'date_from' => ['nullable', 'date'],
    'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
]
```

---

## Fase 14: Tests de Nuevas Funcionalidades

### Feature Tests

| Test | Descripción |
|------|-------------|
| UserTest | CRUD completo de usuarios (admin) |
| UserRoleTest | Asignación y validación de roles |
| UserAuthorizationTest | Permisos por rol (admin vs employee) |
| ReportTest | Endpoints de reportes |
| ReportExportTest | Exportación CSV, PDF, XLSX |
| AuditLogTest | Visualización de logs de auditoría |
| TextNormalizationTest | Normalización de textos en FormRequests |

### Unit Tests

| Test | Descripción |
|------|-------------|
| TextNormalizerTest | Métodos de normalización individual |
| UserRoleTest | Funciones del enum (isAdmin, isEmployee, label) |
| AuditLogTest | Creación de logs de auditoría |
| AuditableTraitTest | Trait funciona en modelos |

---

## Fase 15: Orden de Implementación (Actualizado)

1. **Excepciones** - `InsufficientStockException`
2. **Scopes** - Agregar scopes adicionales a modelos
3. **Form Requests** - Crear todos los form requests
4. **Actions** - Crear las acciones de negocio
5. **Controladores** - Crear los 5 controladores originales
6. **Rutas** - Definir rutas en `web.php`
7. **Normalización** - `TextNormalizer` + `prepareForValidation()` en FormRequests
8. **Roles** - `UserRole` enum + migración + middleware + policies
9. **Controlador Usuarios** - `UserController` + form requests
10. **Reportes** - Instalar dependencias + `ReportController` + `ReportExportService`
11. **Auditoría** - Migración + `AuditLog` + `Auditable` trait + observer
12. **Tests Unit** - Tests de acciones, normalización, roles, auditoría
13. **Tests Feature** - Tests de endpoints
14. **Verificación** - Ejecutar tests y pint

---

## Fase 16: Verificación

```bash
# Ejecutar tests
php artisan test --compact

# Verificar formato
vendor/bin/pint --dirty

# Verificar rutas
php artisan route:list

# Verificar migraciones
php artisan migrate:status

# Verificar permisos de archivos de configuración
php artisan config:clear
php artisan cache:clear
```

---

## Dependencias Nuevas

```bash
# Reportes PDF
composer require barryvdh/laravel-dompdf

# Reportes XLSX
composer require maatwebsite/excel
```

---

*Última actualización: 2026-09-09*
