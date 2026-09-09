<?php

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\User;

test('un admin puede ver el indice de auditoria', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('audit.index'))
        ->assertOk();
});

test('un employee no puede ver auditoria', function () {
    $employee = User::factory()->create();

    $this->actingAs($employee)
        ->get(route('audit.index'))
        ->assertForbidden();
});

test('un admin puede ver detalle de un log de auditoria', function () {
    $admin = User::factory()->admin()->create();
    $log = AuditLog::factory()->create();

    $this->actingAs($admin)
        ->get(route('audit.show', $log))
        ->assertOk();
});

test('la auditoria registra creacion de modelo', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin);
    Category::create([
        'name_category' => 'Test Category',
        'description_category' => 'Test',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Category::class,
        'event' => 'created',
    ]);
});

test('la auditoria registra actualizacion de modelo', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['name_category' => 'Original']);

    $this->actingAs($admin);
    $category->update(['name_category' => 'Actualizado']);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Category::class,
        'auditable_id' => $category->id,
        'event' => 'updated',
    ]);
});

test('la auditoria registra eliminacion de modelo', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();

    $this->actingAs($admin);
    $category->delete();

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Category::class,
        'auditable_id' => $category->id,
        'event' => 'deleted',
    ]);
});

test('la auditoria guarda valores anteriores y nuevos', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['name_category' => 'Original']);

    $this->actingAs($admin);
    $category->update(['name_category' => 'Nuevo Nombre']);

    $log = AuditLog::where('auditable_type', Category::class)
        ->where('auditable_id', $category->id)
        ->where('event', 'updated')
        ->first();

    expect($log)->not->toBeNull();
    expect($log->old_values)->toBeArray();
    expect($log->new_values)->toBeArray();
});

test('un employee no puede ver auditoria via ruta', function () {
    $employee = User::factory()->create();
    $log = AuditLog::factory()->create();

    $this->actingAs($employee)
        ->get(route('audit.show', $log))
        ->assertForbidden();
});
