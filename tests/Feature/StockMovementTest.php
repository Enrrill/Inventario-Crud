<?php

use App\Enums\StockMovementType;
use App\Models\StockMovement;

test('un movimiento tiene los tipos correctos', function () {
    $movement = StockMovement::factory()->entry()->create();

    expect($movement->type_movement)->toBe(StockMovementType::Entry);
});

test('un movimiento registra stocks anteriores y nuevos', function () {
    $movement = StockMovement::factory()->create([
        'previous_stock_movement' => 100,
        'quantity_movement' => 50,
        'new_stock_movement' => 150,
    ]);

    expect($movement->previous_stock_movement)->toBe(100);
    expect($movement->new_stock_movement)->toBe(150);
});
