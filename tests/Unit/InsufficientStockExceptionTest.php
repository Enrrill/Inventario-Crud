<?php

use App\Exceptions\InsufficientStockException;
use App\Models\Product;

test('InsufficientStockException incluye nombre y stock del producto', function () {
    $product = Product::factory()->create([
        'name_product' => 'Producto Demo',
        'current_stock_product' => 3,
    ]);

    $exception = new InsufficientStockException($product, 10);

    expect($exception->getMessage())
        ->toContain('Producto Demo')
        ->toContain('Solicitado: 10')
        ->toContain('Disponible: 3');
});

test('InsufficientStockException expone producto y cantidad solicitada', function () {
    $product = Product::factory()->create();
    $exception = new InsufficientStockException($product, 7);

    expect($exception->getProduct())->toBe($product);
    expect($exception->getRequested())->toBe(7);
});
