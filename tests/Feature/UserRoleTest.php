<?php

use App\Enums\UserRole;
use App\Models\User;

test('un usuario tiene rol por defecto de employee', function () {
    $user = User::factory()->create();

    expect($user->role)->toBe(UserRole::Employee);
});

test('un usuario puede ser admin', function () {
    $user = User::factory()->admin()->create();

    expect($user->role)->toBe(UserRole::Admin);
    expect($user->isAdmin())->toBeTrue();
    expect($user->isEmployee())->toBeFalse();
});

test('un usuario puede ser employee', function () {
    $user = User::factory()->create();

    expect($user->role)->toBe(UserRole::Employee);
    expect($user->isAdmin())->toBeFalse();
    expect($user->isEmployee())->toBeTrue();
});

test('el rol se guarda correctamente en la base de datos', function () {
    $user = User::factory()->admin()->create();

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'role' => 'admin',
    ]);
});

test('validacion de rol invalido al crear usuario', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('users.store'), [
            'name' => 'Test',
            'email' => 'test@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'invalid_role',
        ])
        ->assertSessionHasErrors(['role']);
});
