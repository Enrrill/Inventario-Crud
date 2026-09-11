<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('un producto puede detectar stock bajo', function () {
    $product = Product::factory()->create([
        'minimum_stock_product' => 10,
        'current_stock_product' => 5,
    ]);

    expect($product->isLowStock())->toBeTrue();
});

test('un producto con suficiente stock no está en bajo stock', function () {
    $product = Product::factory()->create([
        'minimum_stock_product' => 10,
        'current_stock_product' => 15,
    ]);

    expect($product->isLowStock())->toBeFalse();
});

test('scope low stock retorna solo productos con stock bajo', function () {
    Product::factory()->lowStock()->count(3)->create();
    Product::factory()->count(2)->create(['current_stock_product' => 100]);

    $lowStock = Product::lowStock()->get();

    expect($lowStock)->toHaveCount(3);
});

test('un usuario autenticado puede filtrar productos con multiples criterios y per_page', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $supplier = Supplier::factory()->create();

    $matchingProduct = Product::factory()->create([
        'name_product' => 'Laptop Gamer Pro',
        'category_id' => $category->id,
        'supplier_id' => $supplier->id,
        'minimum_stock_product' => 10,
        'current_stock_product' => 2,
    ]);

    $otherProduct = Product::factory()->create([
        'name_product' => 'Teclado Mecanico',
        'category_id' => $category->id,
        'supplier_id' => $supplier->id,
        'minimum_stock_product' => 10,
        'current_stock_product' => 50,
    ]);

    $response = $this->actingAs($user)
        ->get(route('products.index', [
            'search' => 'Laptop',
            'category_id' => $category->id,
            'supplier_id' => $supplier->id,
            'low_stock' => '1',
            'per_page' => '8',
        ]));

    $response->assertOk();
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('products/index')
        ->has('products.data', 1)
        ->where('products.data.0.id', $matchingProduct->id)
        ->where('products.per_page', 8)
        ->where('filters.category_id', (string) $category->id)
        ->where('filters.supplier_id', (string) $supplier->id)
        ->where('filters.per_page', '8')
    );
});
