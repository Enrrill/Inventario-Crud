<?php

use App\Models\User;

test('un employee puede ver el dashboard', function () {
    $employee = User::factory()->create();

    $this->actingAs($employee)
        ->get(route('dashboard'))
        ->assertOk();
});

test('un employee puede listar productos', function () {
    $employee = User::factory()->create();

    $this->actingAs($employee)
        ->get(route('products.index'))
        ->assertOk();
});

test('un employee puede crear movimientos de stock', function () {
    $employee = User::factory()->create();

    $this->actingAs($employee)
        ->get(route('movements.create'))
        ->assertOk();
});

test('un employee no puede gestionar usuarios', function () {
    $employee = User::factory()->create();

    $this->actingAs($employee)
        ->get(route('users.index'))
        ->assertForbidden();
});

test('un employee no puede ver auditoria', function () {
    $employee = User::factory()->create();

    $this->actingAs($employee)
        ->get(route('audit.index'))
        ->assertForbidden();
});

test('un admin puede ver auditoria', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('audit.index'))
        ->assertOk();
});

test('un admin puede gestionar usuarios', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('users.index'))
        ->assertOk();
});
