<?php

use App\Enums\UserRole;
use App\Models\StockMovement;

test('el seeder principal crea los datos de prueba', function () {
    $this->seed();

    $this->assertDatabaseHas('users', [
        'email' => 'enrrill@gmail.com',
        'role' => UserRole::Admin,
    ]);

    $this->assertDatabaseHas('products', [
        'sku_product' => 'ELEC-COMP-001',
    ]);

    expect(StockMovement::count())->toBeGreaterThan(0);
});
