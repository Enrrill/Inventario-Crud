<?php

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('puede registrar un batch con un solo movimiento de entrada', function () {
    $product = Product::factory()->create(['current_stock_product' => 10]);

    $response = $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [
            [
                'product_id' => $product->id,
                'type_movement' => 'entry',
                'quantity_movement' => 5,
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type_movement' => StockMovementType::Entry,
        'quantity_movement' => 5,
    ]);
    $product->refresh();
    expect($product->current_stock_product)->toBe(15);
});

test('puede registrar múltiples movimientos de diferentes tipos', function () {
    $productA = Product::factory()->create(['current_stock_product' => 10]);
    $productB = Product::factory()->create(['current_stock_product' => 20]);
    $productC = Product::factory()->create(['current_stock_product' => 15]);

    $response = $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [
            [
                'product_id' => $productA->id,
                'type_movement' => 'entry',
                'quantity_movement' => 5,
            ],
            [
                'product_id' => $productB->id,
                'type_movement' => 'exit',
                'quantity_movement' => 3,
            ],
            [
                'product_id' => $productC->id,
                'type_movement' => 'adjustment',
                'quantity_movement' => 25,
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseCount('stock_movements', 3);

    $productA->refresh();
    $productB->refresh();
    $productC->refresh();

    expect($productA->current_stock_product)->toBe(15);
    expect($productB->current_stock_product)->toBe(17);
    expect($productC->current_stock_product)->toBe(25);
});

test('falla si algún movimiento tiene producto inexistente', function () {
    $product = Product::factory()->create();

    $response = $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [
            [
                'product_id' => $product->id,
                'type_movement' => 'entry',
                'quantity_movement' => 5,
            ],
            [
                'product_id' => 999999,
                'type_movement' => 'entry',
                'quantity_movement' => 1,
            ],
        ],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('movements.1.product_id');
});

test('falla si algún movimiento tiene cantidad inválida', function () {
    $product = Product::factory()->create();

    $response = $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [
            [
                'product_id' => $product->id,
                'type_movement' => 'entry',
                'quantity_movement' => 0,
            ],
        ],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('movements.0.quantity_movement');
});

test('falla si una salida excede stock disponible', function () {
    $product = Product::factory()->create(['current_stock_product' => 5]);

    $response = $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [
            [
                'product_id' => $product->id,
                'type_movement' => 'exit',
                'quantity_movement' => 10,
            ],
        ],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('movements.0.quantity_movement');
    $product->refresh();
    expect($product->current_stock_product)->toBe(5);
});

test('falla si hay productos duplicados en el batch', function () {
    $product = Product::factory()->create(['current_stock_product' => 20]);

    $response = $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [
            [
                'product_id' => $product->id,
                'type_movement' => 'entry',
                'quantity_movement' => 5,
            ],
            [
                'product_id' => $product->id,
                'type_movement' => 'exit',
                'quantity_movement' => 3,
            ],
        ],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('movements');
});

test('falla si el batch está vacío', function () {
    $response = $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('movements');
});

test('falla si el batch excede el límite de 20', function () {
    $products = Product::factory()->count(21)->create();

    $movements = $products->map(fn ($p) => [
        'product_id' => $p->id,
        'type_movement' => 'entry',
        'quantity_movement' => 1,
    ])->toArray();

    $response = $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => $movements,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('movements');
});

test('cada movimiento tiene el user_id correcto', function () {
    $product = Product::factory()->create();

    $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [
            [
                'product_id' => $product->id,
                'type_movement' => 'entry',
                'quantity_movement' => 5,
            ],
        ],
    ]);

    $movement = StockMovement::where('product_id', $product->id)->first();
    expect($movement->user_id)->toBe($this->user->id);
});

test('los stocks anteriores y nuevos son correctos en batch', function () {
    $product = Product::factory()->create(['current_stock_product' => 10]);

    $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [
            [
                'product_id' => $product->id,
                'type_movement' => 'entry',
                'quantity_movement' => 5,
            ],
        ],
    ]);

    $movement = StockMovement::where('product_id', $product->id)->first();
    expect($movement->previous_stock_movement)->toBe(10);
    expect($movement->new_stock_movement)->toBe(15);
});

test('reference y notes compartidos se aplican a todos los movimientos', function () {
    $productA = Product::factory()->create(['current_stock_product' => 10]);
    $productB = Product::factory()->create(['current_stock_product' => 20]);

    $this->actingAs($this->user)->postJson(route('movements.store'), [
        'movements' => [
            [
                'product_id' => $productA->id,
                'type_movement' => 'entry',
                'quantity_movement' => 5,
            ],
            [
                'product_id' => $productB->id,
                'type_movement' => 'exit',
                'quantity_movement' => 3,
            ],
        ],
        'reference_movement' => 'OC-2026-001',
        'notes_movement' => 'Pedido de proveedor',
    ]);

    $movements = StockMovement::all();
    foreach ($movements as $movement) {
        expect($movement->reference_movement)->toBe('OC-2026-001');
        expect($movement->notes_movement)->toBe('Pedido de proveedor');
    }
});
