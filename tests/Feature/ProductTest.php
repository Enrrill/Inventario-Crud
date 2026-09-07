<?php

use App\Models\Product;

test('un producto puede detectar stock bajo', function () {
    $product = Product::factory()->create([
        'minimum_stock' => 10,
        'current_stock' => 5,
    ]);

    expect($product->isLowStock())->toBeTrue();
});

test('un producto con suficiente stock no está en bajo stock', function () {
    $product = Product::factory()->create([
        'minimum_stock' => 10,
        'current_stock' => 15,
    ]);

    expect($product->isLowStock())->toBeFalse();
});

test('scope low stock retorna solo productos con stock bajo', function () {
    Product::factory()->lowStock()->count(3)->create();
    Product::factory()->count(2)->create(['current_stock' => 100]);

    $lowStock = Product::lowStock()->get();

    expect($lowStock)->toHaveCount(3);
});
