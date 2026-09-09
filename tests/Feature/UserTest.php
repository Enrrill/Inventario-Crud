<?php

use App\Enums\UserRole;
use App\Models\User;

test('un admin puede listar usuarios', function () {
    $admin = User::factory()->admin()->create();

    User::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('users.index'))
        ->assertOk();
});

test('un employee no puede listar usuarios', function () {
    $employee = User::factory()->create();

    $this->actingAs($employee)
        ->get(route('users.index'))
        ->assertForbidden();
});

test('un admin puede crear un usuario', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('users.store'), [
            'name' => 'Juan Perez',
            'email' => 'juan@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Employee->value,
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'juan@test.com',
        'role' => UserRole::Employee,
    ]);
});

test('un admin puede actualizar un usuario', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create(['name' => 'Original']);

    $this->actingAs($admin)
        ->put(route('users.update', $user), [
            'name' => 'Actualizado',
            'email' => $user->email,
            'role' => UserRole::Employee->value,
        ]);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Actualizado',
    ]);
});

test('un admin puede eliminar un usuario', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('users.destroy', $user));

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('un admin no puede eliminarse a si mismo', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->delete(route('users.destroy', $admin));

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('validacion de campos requeridos al crear usuario', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('users.store'), [])
        ->assertSessionHasErrors(['name', 'email', 'password', 'role']);
});

test('validacion de email unico al crear usuario', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->create(['email' => 'existing@test.com']);

    $this->actingAs($admin)
        ->post(route('users.store'), [
            'name' => 'Test',
            'email' => 'existing@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Employee->value,
        ])
        ->assertSessionHasErrors(['email']);
});

test('un employee no puede crear usuarios', function () {
    $employee = User::factory()->create();

    $this->actingAs($employee)
        ->post(route('users.store'), [
            'name' => 'Juan',
            'email' => 'juan@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Employee->value,
        ])
        ->assertForbidden();
});
