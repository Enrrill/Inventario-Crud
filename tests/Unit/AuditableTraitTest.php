<?php

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;

test('trait Auditable crea log al crear modelo', function () {
    Category::create([
        'name_category' => 'Test Category',
        'description_category' => 'Test',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Category::class,
        'event' => 'created',
    ]);
});

test('trait Auditable crea log al actualizar modelo', function () {
    $category = Category::factory()->create(['name_category' => 'Original']);
    $category->update(['name_category' => 'Updated']);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Category::class,
        'auditable_id' => $category->id,
        'event' => 'updated',
    ]);
});

test('trait Auditable crea log al eliminar modelo', function () {
    $category = Category::factory()->create();
    $categoryId = $category->id;
    $category->delete();

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Category::class,
        'auditable_id' => $categoryId,
        'event' => 'deleted',
    ]);
});

test('trait Auditable funciona en Product', function () {
    Product::factory()->create();

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Product::class,
        'event' => 'created',
    ]);
});

test('trait Auditable funciona en Supplier', function () {
    Supplier::factory()->create();

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Supplier::class,
        'event' => 'created',
    ]);
});

test('trait Auditable funciona en User', function () {
    User::factory()->create();

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => User::class,
        'event' => 'created',
    ]);
});

test('trait Auditable funciona en StockMovement', function () {
    StockMovement::factory()->create();

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => StockMovement::class,
        'event' => 'created',
    ]);
});

test('trait Auditable guarda valores anteriores y nuevos', function () {
    $category = Category::factory()->create(['name_category' => 'Original']);
    $category->update(['name_category' => 'Nuevo']);

    $log = AuditLog::where('auditable_type', Category::class)
        ->where('auditable_id', $category->id)
        ->where('event', 'updated')
        ->first();

    expect($log)->not->toBeNull();
    expect($log->old_values)->toBeArray();
    expect($log->new_values)->toBeArray();
});

test('trait Auditable guarda ip_address y user_agent', function () {
    $category = Category::factory()->create();

    $log = AuditLog::where('auditable_type', Category::class)
        ->where('event', 'created')
        ->first();

    expect($log->ip_address)->not->toBeNull();
    expect($log->user_agent)->not->toBeNull();
});

test('trait Auditable guarda user_id cuando hay autenticacion', function () {
    $user = User::factory()->create();

    $this->actingAs($user);
    Category::create([
        'name_category' => 'Test',
        'description_category' => 'Test',
    ]);

    $log = AuditLog::where('auditable_type', Category::class)
        ->where('event', 'created')
        ->first();

    expect($log->user_id)->toBe($user->id);
});
