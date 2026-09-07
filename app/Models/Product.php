<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $sku_product
 * @property string $name_product
 * @property string|null $description_product
 * @property int $category_id
 * @property int|null $supplier_id
 * @property float $unit_price_product
 * @property string $unit_of_measure_product
 * @property int $minimum_stock_product
 * @property int $current_stock_product
 * @property bool $is_active_product
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku_product',
        'name_product',
        'description_product',
        'category_id',
        'supplier_id',
        'unit_price_product',
        'unit_of_measure_product',
        'minimum_stock_product',
        'current_stock_product',
        'is_active_product',
    ];

    protected function casts(): array
    {
        return [
            'unit_price_product' => 'decimal:2',
            'minimum_stock_product' => 'integer',
            'current_stock_product' => 'integer',
            'is_active_product' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function isLowStock(): bool
    {
        return $this->current_stock_product <= $this->minimum_stock_product;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active_product', true);
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('current_stock_product', '<=', 'minimum_stock_product');
    }

    public function scopeInCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeFromSupplier(Builder $query, int $supplierId): Builder
    {
        return $query->where('supplier_id', $supplierId);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name_product', 'ilike', "%{$search}%")
                ->orWhere('sku_product', 'ilike', "%{$search}%");
        });
    }
}
