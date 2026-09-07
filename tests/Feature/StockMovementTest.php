<?php

use App\Enums\StockMovementType;
use App\Models\StockMovement;

test('un movimiento tiene los tipos correctos', function () {
    $movement = StockMovement::factory()->entry()->create();

    expect($movement->type)->toBe(StockMovementType::Entry);
});

test('un movimiento registra stocks anteriores y nuevos', function () {
    $movement = StockMovement::factory()->create([
        'previous_stock' => 100,
        'quantity' => 50,
        'new_stock' => 150,
    ]);

    expect($movement->previous_stock)->toBe(100);
    expect($movement->new_stock)->toBe(150);
});
