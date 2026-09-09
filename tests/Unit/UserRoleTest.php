<?php

use App\Enums\UserRole;

test('UserRole enum tiene los casos correctos', function () {
    expect(UserRole::cases())->toHaveCount(2);
    expect(UserRole::Admin)->toBe(UserRole::Admin);
    expect(UserRole::Employee)->toBe(UserRole::Employee);
});

test('UserRole Admin retorna label correcto', function () {
    expect(UserRole::Admin->label())->toBe('Administrador');
});

test('UserRole Employee retorna label correcto', function () {
    expect(UserRole::Employee->label())->toBe('Empleado');
});

test('UserRole Admin isAdmin retorna true', function () {
    expect(UserRole::Admin->isAdmin())->toBeTrue();
});

test('UserRole Admin isEmployee retorna false', function () {
    expect(UserRole::Admin->isEmployee())->toBeFalse();
});

test('UserRole Employee isAdmin retorna false', function () {
    expect(UserRole::Employee->isAdmin())->toBeFalse();
});

test('UserRole Employee isEmployee retorna true', function () {
    expect(UserRole::Employee->isEmployee())->toBeTrue();
});

test('UserRole valor de Admin es "admin"', function () {
    expect(UserRole::Admin->value)->toBe('admin');
});

test('UserRole valor de Employee es "employee"', function () {
    expect(UserRole::Employee->value)->toBe('employee');
});
