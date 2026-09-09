<?php

namespace App\Models;

use App\Enums\StockMovementType;
use App\Traits\Auditable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property StockMovementType $type_movement
 * @property int $quantity_movement
 * @property int $previous_stock_movement
 * @property int $new_stock_movement
 * @property string|null $reference_movement
 * @property string|null $notes_movement
 * @property int $user_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class StockMovement extends Model
{
    use Auditable, HasFactory;

    protected $fillable = [
        'product_id',
        'type_movement',
        'quantity_movement',
        'previous_stock_movement',
        'new_stock_movement',
        'reference_movement',
        'notes_movement',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'type_movement' => StockMovementType::class,
            'quantity_movement' => 'integer',
            'previous_stock_movement' => 'integer',
            'new_stock_movement' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForProduct(Builder $query, int $productId): Builder
    {
        return $query->where('product_id', $productId);
    }

    public function scopeOfType(Builder $query, StockMovementType $type): Builder
    {
        return $query->where('type_movement', $type);
    }

    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
