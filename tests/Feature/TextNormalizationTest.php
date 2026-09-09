<?php

use App\Models\Category;
use App\Models\Supplier;
use App\Models\User;

test('el nombre de categoria se normaliza al guardar', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('categories.store'), [
            'name_category' => '  categoria   prueba  ',
            'description_category' => '  descripcion   con   espacios  ',
        ]);

    $this->assertDatabaseHas('categories', [
        'name_category' => 'Categoria Prueba',
        'description_category' => 'descripcion con espacios',
    ]);
});

test('el nombre de proveedor se normaliza al guardar', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('suppliers.store'), [
            'name_supplier' => '  proveedor   test  ',
            'contact_name_supplier' => '  juan   perez  ',
            'email_supplier' => '  TEST@EXAMPLE.COM  ',
            'phone_supplier' => '584241234567',
            'address_supplier' => '  direccion   prueba  ',
        ]);

    $this->assertDatabaseHas('suppliers', [
        'name_supplier' => 'Proveedor Test',
        'contact_name_supplier' => 'Juan Perez',
        'email_supplier' => 'test@example.com',
        'phone_supplier' => '58(424)-123-4567',
        'address_supplier' => 'direccion prueba',
    ]);
});

test('el SKU de producto se normaliza a mayusculas', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();
    $supplier = Supplier::factory()->create();

    $this->actingAs($admin)
        ->post(route('products.store'), [
            'sku_product' => '  sku-1234  ',
            'name_product' => '  Producto   Test  ',
            'description_product' => '  descripcion  ',
            'category_id' => $category->id,
            'supplier_id' => $supplier->id,
            'unit_price_product' => 10.50,
            'unit_of_measure_product' => 'pieza',
            'minimum_stock_product' => 10,
            'current_stock_product' => 50,
        ]);

    $this->assertDatabaseHas('products', [
        'sku_product' => 'SKU-1234',
        'name_product' => 'Producto Test',
    ]);
});

test('el email se normaliza a minusculas', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('suppliers.store'), [
            'name_supplier' => 'Proveedor',
            'email_supplier' => '  TEST@EXAMPLE.COM  ',
            'phone_supplier' => '584241234567',
        ]);

    $this->assertDatabaseHas('suppliers', [
        'email_supplier' => 'test@example.com',
    ]);
});
