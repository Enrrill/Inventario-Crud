<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name_supplier
 * @property string|null $contact_name_supplier
 * @property string|null $email_supplier
 * @property string|null $phone_supplier
 * @property string|null $address_supplier
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_supplier',
        'contact_name_supplier',
        'email_supplier',
        'phone_supplier',
        'address_supplier',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
