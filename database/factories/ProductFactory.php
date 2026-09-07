<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'sku' => fake()->unique()->bothify('SKU-####-??'),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'category_id' => Category::factory(),
            'supplier_id' => Supplier::factory(),
            'unit_price' => fake()->randomFloat(2, 1, 1000),
            'unit_of_measure' => fake()->randomElement(['pieza', 'kg', 'litro', 'caja', 'paquete']),
            'minimum_stock' => fake()->numberBetween(5, 50),
            'current_stock' => fake()->numberBetween(0, 200),
            'is_active' => true,
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn ($attributes) => [
            'current_stock' => $attributes['minimum_stock'] - 1,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
