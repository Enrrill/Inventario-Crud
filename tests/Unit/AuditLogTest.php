<?php

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\User;

test('AuditLog puede ser creado correctamente', function () {
    $log = AuditLog::factory()->create();

    expect($log->id)->not->toBeNull();
    expect($log->auditable_type)->toBeString();
    expect($log->event)->toBeString();
});

test('AuditLog pertenece a un usuario', function () {
    $user = User::factory()->create();
    $log = AuditLog::factory()->create(['user_id' => $user->id]);

    expect($log->user->id)->toBe($user->id);
});

test('AuditLog es polimorfico con auditable', function () {
    $category = Category::factory()->create();
    $log = AuditLog::factory()->create([
        'auditable_type' => Category::class,
        'auditable_id' => $category->id,
    ]);

    expect($log->auditable)->toBeInstanceOf(Category::class);
});

test('AuditLog scope forModel filtra por tipo', function () {
    AuditLog::query()->delete();

    AuditLog::withoutEvents(function () {
        AuditLog::factory()->create(['auditable_type' => Category::class]);
        AuditLog::factory()->count(2)->create(['auditable_type' => User::class]);
    });

    $result = AuditLog::forModel(Category::class)->get();

    expect($result)->toHaveCount(1);
});

test('AuditLog scope forModel filtra por tipo e id', function () {
    AuditLog::query()->delete();

    AuditLog::withoutEvents(function () {
        AuditLog::factory()->create([
            'auditable_type' => Category::class,
            'auditable_id' => 99,
        ]);
        AuditLog::factory()->create([
            'auditable_type' => Category::class,
            'auditable_id' => 100,
        ]);
    });

    $result = AuditLog::forModel(Category::class, 99)->get();

    expect($result)->toHaveCount(1);
});

test('AuditLog scope forEvent filtra por evento', function () {
    AuditLog::query()->delete();

    AuditLog::withoutEvents(function () {
        AuditLog::factory()->create(['event' => 'created']);
        AuditLog::factory()->create(['event' => 'updated']);
        AuditLog::factory()->create(['event' => 'deleted']);
    });

    $result = AuditLog::forEvent('created')->get();

    expect($result)->toHaveCount(1);
});

test('AuditLog scope forUser filtra por usuario', function () {
    AuditLog::query()->delete();

    $user = User::factory()->create();

    AuditLog::withoutEvents(function () use ($user) {
        AuditLog::factory()->create(['user_id' => $user->id]);
        AuditLog::factory()->create();
    });

    $result = AuditLog::forUser($user->id)->get();

    expect($result)->toHaveCount(1);
});

test('AuditLog scope recent filtra por fecha reciente', function () {
    AuditLog::query()->delete();

    AuditLog::withoutEvents(function () {
        AuditLog::factory()->create(['created_at' => now()->subDays(5)]);
        AuditLog::factory()->create(['created_at' => now()->subDays(40)]);
    });

    $result = AuditLog::recent(30)->get();

    expect($result)->toHaveCount(1);
});

test('AuditLog guarda old_values y new_values como array', function () {
    $log = AuditLog::factory()->create([
        'old_values' => ['name' => 'old'],
        'new_values' => ['name' => 'new'],
    ]);

    expect($log->old_values)->toBeArray();
    expect($log->new_values)->toBeArray();
    expect($log->old_values['name'])->toBe('old');
    expect($log->new_values['name'])->toBe('new');
});
