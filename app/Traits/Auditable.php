<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Context;

trait Auditable
{
    protected static function bootAuditable(): void
    {
        static::created(function (Model $model) {
            static::logAudit($model, 'created', null, $model->getAttributes());
        });

        static::updated(function (Model $model) {
            $dirty = $model->getDirty();
            $original = collect($model->getOriginal())->only(array_keys($dirty))->toArray();
            static::logAudit($model, 'updated', $original, $dirty);
        });

        static::deleted(function (Model $model) {
            static::logAudit($model, 'deleted', $model->getAttributes(), null);
        });
    }

    protected static function logAudit(Model $model, string $event, ?array $old, ?array $new): void
    {
        AuditLog::create([
            'user_id' => auth()->id(),
            'auditable_type' => get_class($model),
            'auditable_id' => $model->getKey(),
            'batch_id' => Context::get('audit_batch_id'),
            'event' => $event,
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
