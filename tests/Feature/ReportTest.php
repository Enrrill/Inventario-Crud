<?php

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;

test('un usuario autenticado puede ver el indice de reportes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reports.index'))
        ->assertOk();
});

test('un usuario autenticado puede ver reporte de inventario', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reports.inventory'))
        ->assertOk();
});

test('un usuario autenticado puede ver reporte de movimientos', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reports.movements'))
        ->assertOk();
});

test('un usuario autenticado puede ver reporte de estado de stock', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reports.stock-status'))
        ->assertOk();
});

test('un usuario no autenticado es redirigido al login', function () {
    $this->get(route('reports.index'))
        ->assertRedirect();
});

test('reporte de inventario muestra productos', function () {
    $user = User::factory()->create();
    Product::factory()->count(3)->create();

    $this->actingAs($user)
        ->get(route('reports.inventory'))
        ->assertOk();
});

test('reporte de movimientos muestra movimientos', function () {
    $user = User::factory()->create();
    StockMovement::factory()->count(3)->create();

    $this->actingAs($user)
        ->get(route('reports.movements'))
        ->assertOk();
});
