<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->employee = User::factory()->create();
    $this->admin = User::factory()->admin()->create();
});

test('un employee puede ver el dashboard', function () {
    $this->actingAs($this->employee)
        ->get(route('dashboard'))
        ->assertOk();
});

test('un employee no ve el valor del inventario en el dashboard', function () {
    Product::factory()->count(3)->create(['current_stock_product' => 10, 'unit_price_product' => 100]);

    $this->actingAs($this->employee)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('stats.inventory_value', null));
});

test('un admin ve el valor del inventario en el dashboard', function () {
    Product::factory()->count(3)->create(['current_stock_product' => 10, 'unit_price_product' => 100]);

    $this->actingAs($this->admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('stats.inventory_value', '3000.00'));
});

test('un employee solo ve sus propios movimientos en el dashboard', function () {
    $otherEmployee = User::factory()->create();

    StockMovement::factory()->create(['user_id' => $this->employee->id]);
    StockMovement::factory()->create(['user_id' => $otherEmployee->id]);

    $this->actingAs($this->employee)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('recentMovements', 1));
});

test('un employee puede ver categorías', function () {
    $this->actingAs($this->employee)
        ->get(route('categories.index'))
        ->assertOk();
});

test('un employee no puede crear categorías', function () {
    $this->actingAs($this->employee)
        ->get(route('categories.create'))
        ->assertForbidden();
});

test('un employee no puede almacenar categorías', function () {
    $this->actingAs($this->employee)
        ->post(route('categories.store'), ['name_category' => 'Test'])
        ->assertForbidden();
});

test('un employee no puede editar categorías', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->employee)
        ->get(route('categories.edit', $category))
        ->assertForbidden();
});

test('un employee no puede actualizar categorías', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->employee)
        ->put(route('categories.update', $category), ['name_category' => 'Updated'])
        ->assertForbidden();
});

test('un employee no puede eliminar categorías', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->employee)
        ->delete(route('categories.destroy', $category))
        ->assertForbidden();
});

test('un employee puede ver proveedores', function () {
    $this->actingAs($this->employee)
        ->get(route('suppliers.index'))
        ->assertOk();
});

test('un employee no puede crear proveedores', function () {
    $this->actingAs($this->employee)
        ->get(route('suppliers.create'))
        ->assertForbidden();
});

test('un employee no puede almacenar proveedores', function () {
    $this->actingAs($this->employee)
        ->post(route('suppliers.store'), ['name_supplier' => 'Test'])
        ->assertForbidden();
});

test('un employee no puede editar proveedores', function () {
    $supplier = Supplier::factory()->create();

    $this->actingAs($this->employee)
        ->get(route('suppliers.edit', $supplier))
        ->assertForbidden();
});

test('un employee no puede actualizar proveedores', function () {
    $supplier = Supplier::factory()->create();

    $this->actingAs($this->employee)
        ->put(route('suppliers.update', $supplier), ['name_supplier' => 'Updated'])
        ->assertForbidden();
});

test('un employee no puede eliminar proveedores', function () {
    $supplier = Supplier::factory()->create();

    $this->actingAs($this->employee)
        ->delete(route('suppliers.destroy', $supplier))
        ->assertForbidden();
});

test('un employee puede ver productos', function () {
    $this->actingAs($this->employee)
        ->get(route('products.index'))
        ->assertOk();
});

test('un employee no puede crear productos', function () {
    $this->actingAs($this->employee)
        ->get(route('products.create'))
        ->assertForbidden();
});

test('un employee no puede almacenar productos', function () {
    $this->actingAs($this->employee)
        ->post(route('products.store'), ['name_product' => 'Test'])
        ->assertForbidden();
});

test('un employee no puede editar productos', function () {
    $product = Product::factory()->create();

    $this->actingAs($this->employee)
        ->get(route('products.edit', $product))
        ->assertForbidden();
});

test('un employee no puede actualizar productos', function () {
    $product = Product::factory()->create();

    $this->actingAs($this->employee)
        ->put(route('products.update', $product), ['name_product' => 'Updated'])
        ->assertForbidden();
});

test('un employee no puede eliminar productos', function () {
    $product = Product::factory()->create();

    $this->actingAs($this->employee)
        ->delete(route('products.destroy', $product))
        ->assertForbidden();
});

test('un employee puede ver movimientos', function () {
    $this->actingAs($this->employee)
        ->get(route('movements.index'))
        ->assertOk();
});

test('un employee solo ve sus propios movimientos', function () {
    $otherEmployee = User::factory()->create();

    StockMovement::factory()->create(['user_id' => $this->employee->id]);
    StockMovement::factory()->create(['user_id' => $otherEmployee->id]);

    $this->actingAs($this->employee)
        ->get(route('movements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('movements.total', 1));
});

test('un employee puede ver el formulario de crear movimientos', function () {
    $this->actingAs($this->employee)
        ->get(route('movements.create'))
        ->assertOk();
});

test('un employee no ve tipo ajuste en el formulario de movimientos', function () {
    $this->actingAs($this->employee)
        ->get(route('movements.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('types', collect([
            ['value' => 'entry', 'label' => 'Entrada'],
            ['value' => 'exit', 'label' => 'Salida'],
        ])->values()->all()));
});

test('un admin ve tipo ajuste en el formulario de movimientos', function () {
    $this->actingAs($this->admin)
        ->get(route('movements.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('types', 3));
});

test('un employee no puede crear movimientos de ajuste', function () {
    $product = Product::factory()->create(['current_stock_product' => 100]);

    $this->actingAs($this->employee)
        ->post(route('movements.store'), [
            'movements' => [
                [
                    'product_id' => $product->id,
                    'type_movement' => 'adjustment',
                    'quantity_movement' => 50,
                ],
            ],
        ])
        ->assertRedirect();
});

test('un employee puede crear movimientos de entrada y salida', function () {
    $product = Product::factory()->create(['current_stock_product' => 100]);

    $this->actingAs($this->employee)
        ->post(route('movements.store'), [
            'movements' => [
                [
                    'product_id' => $product->id,
                    'type_movement' => 'entry',
                    'quantity_movement' => 10,
                ],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type_movement' => 'entry',
        'quantity_movement' => 10,
    ]);
});

test('un employee puede ver reportes de movimientos', function () {
    $this->actingAs($this->employee)
        ->get(route('reports.movements'))
        ->assertOk();
});

test('un employee no puede ver reportes de inventario', function () {
    $this->actingAs($this->employee)
        ->get(route('reports.inventory'))
        ->assertForbidden();
});

test('un admin puede ver reportes de inventario', function () {
    $this->actingAs($this->admin)
        ->get(route('reports.inventory'))
        ->assertOk();
});

test('un employee solo ve sus propios movimientos en el reporte', function () {
    $otherEmployee = User::factory()->create();

    StockMovement::factory()->create(['user_id' => $this->employee->id]);
    StockMovement::factory()->create(['user_id' => $otherEmployee->id]);

    $this->actingAs($this->employee)
        ->get(route('reports.movements'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('movements.total', 1));
});

test('un employee no puede ver la lista de usuarios en el reporte de movimientos', function () {
    User::factory()->count(3)->create();

    $this->actingAs($this->employee)
        ->get(route('reports.movements'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('users', []));
});

test('un admin puede ver la lista de usuarios en el reporte de movimientos', function () {
    $users = User::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get(route('reports.movements'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('users', 5));
});
