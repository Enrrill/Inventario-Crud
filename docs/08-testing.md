# 08 — Testing

> Estructura de tests con Pest PHP, ejecución y cobertura actual.

---

## Estructura

```
tests/
├── Pest.php                         # Configuración Pest
├── TestCase.php                     # Base TestCase
├── Feature/
│   ├── Auth/                        # 7 tests de autenticación
│   │   ├── AuthenticationTest.php
│   │   ├── EmailVerificationTest.php
│   │   ├── PasswordConfirmationTest.php
│   │   ├── PasswordResetTest.php
│   │   ├── RegistrationTest.php
│   │   ├── TwoFactorChallengeTest.php
│   │   └── VerificationNotificationTest.php
│   ├── Settings/                    # 2 tests de configuración
│   │   ├── ProfileUpdateTest.php
│   │   └── SecurityTest.php
│   ├── AuditLogTest.php
│   ├── CategoryTest.php
│   ├── DashboardTest.php
│   ├── EmployeePermissionsTest.php  # 35 tests — restricciones del rol employee
│   ├── ExampleTest.php
│   ├── ProductTest.php
│   ├── ReportTest.php
│   ├── StockMovementBatchTest.php   # 13 tests — registro de movimientos en lote
│   ├── StockMovementTest.php        # 2 tests (factory-level)
│   ├── TextNormalizationTest.php
│   ├── UserAuthorizationTest.php
│   ├── UserTest.php
│   └── UserRoleTest.php
└── Unit/
    ├── AuditableTraitTest.php
    ├── AuditLogTest.php
    ├── ExampleTest.php
    ├── InsufficientStockExceptionTest.php  # mensaje con name_product/current_stock_product
    ├── TextNormalizerTest.php
    └── UserRoleTest.php
```

**Total**: 30 archivos — 22 Feature tests, 6 Unit tests, 2 base files.

---

## Cobertura Actual

| Categoría | Tests | Cobertura |
|-----------|-------|-----------|
| Autenticación (Fortify) | 7 | Login, registro, password reset, 2FA, email verify |
| Settings | 2 | Profile update, security |
| Categorías | 1 | CRUD completo |
| Proveedores | (en ProductTest) | — |
| Productos | 1 | CRUD completo |
| Movimientos (batch) | 13 | Lote: entradas/salidas/ajustes, stock insuficiente, duplicados, límites, audit batch_id |
| Movimientos | 1 (2 tests) | Factory-level |
| Dashboard | 1 | Visualización |
| Permisos employee | 35 | Rutas 403, scoping propio, sin ajustes, reportes/inventario admin-only |
| Usuarios | 3 | CRUD, roles, autorización |
| Reportes | 1 | Endpoints de reportes |
| Auditoría | 1 | Logs de auditoría |
| Normalización | 1 | TextNormalizer |
| Unit: Auditable | 1 | Trait funciona en modelos |
| Unit: TextNormalizer | 1 | Métodos individuales |
| Unit: UserRole | 1 | Funciones del enum |
| Unit: AuditLog | 1 | Creación de logs |
| Unit: InsufficientStockException | 2 | Mensaje y accessors |

**Total**: 179 tests, 428 assertions — todos pasan ✅

---

## Ejecución

```bash
# Ejecutar todos los tests
php artisan test --compact

# Ejecutar directamente con Pest
vendor/bin/pest

# Ejecutar un archivo específico
php artisan test --compact tests/Feature/CategoryTest.php

# Filtrar por nombre de test
php artisan test --compact --filter=testName
vendor/bin/pest --filter=testName

# Ejecutar solo unit tests
php artisan test --compact --tests=Unit

# Ejecutar solo feature tests
php artisan test --compact --tests=Feature
```

---

## Convencions

### Crear Tests

```bash
# Feature test (default)
php artisan make:test --pest CategoryTest

# Unit test
php artisan make:test --pest --unit TextNormalizerTest
```

### Estructura de un Test Feature

```php
it('can display categories index', function () {
    $category = Category::factory()->create();

    $response = $this->get(route('categories.index'));

    $response->assertStatus(200);
    $response->assertInertiaComponent('categories/index');
});
```

### Estructura de un Test Unit

```php
it('normalizes email correctly', function () {
    expect(TextNormalizer::normalizeEmail(' User@Email.COM '))
        ->toBe('user@email.com');
});
```

### Uso de Factories

```php
// Crear modelo con factory
$category = Category::factory()->create();
$product = Product::factory()->lowStock()->create();
$user = User::factory()->admin()->create();

// Crear con relaciones
$product = Product::factory()->create([
    'category_id' => $category->id,
    'supplier_id' => $supplier->id,
]);
```

### Autenticación en Tests

```php
it('requires admin role', function () {
    $user = User::factory()->create(); // rol por defecto: employee
    $this->actingAs($user);

    $this->get(route('users.index'))->assertForbidden();
});
```

---

## Después de Modificar Código

```bash
# 1. Ejecutar tests afectados
php artisan test --compact tests/Feature/CategoryTest.php

# 2. Verificar formato
vendor/bin/pint --dirty

# 3. Ejecutar suite completa
php artisan test --compact
```

---

*Ver también: [Frontend](07-frontend.md) · [API y Rutas](04-api-rutas.md)*
