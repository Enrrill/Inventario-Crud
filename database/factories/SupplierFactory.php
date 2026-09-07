<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        return [
            'name_supplier' => fake()->company(),
            'contact_name_supplier' => fake()->name(),
            'email_supplier' => fake()->unique()->safeEmail(),
            'phone_supplier' => fake()->phoneNumber(),
            'address_supplier' => fake()->address(),
        ];
    }
}
