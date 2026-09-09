<?php

namespace App\Models;

use App\Traits\Auditable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name_category
 * @property string|null $description_category
 * @property int|null $parent_category_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Category extends Model
{
    use Auditable, HasFactory;

    protected $fillable = [
        'name_category',
        'description_category',
        'parent_category_id',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_category_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_category_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function allChildren(): Collection
    {
        return $this->children->flatMap(function (Category $child) {
            return collect([$child])->merge($child->allChildren());
        });
    }
}
