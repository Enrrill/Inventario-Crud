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
            'sku_product' => fake()->unique()->bothify('SKU-####-??'),
            'name_product' => fake()->words(3, true),
            'description_product' => fake()->sentence(),
            'category_id' => Category::factory(),
            'supplier_id' => Supplier::factory(),
            'unit_price_product' => fake()->randomFloat(2, 1, 1000),
            'unit_of_measure_product' => fake()->randomElement(['pieza', 'kg', 'litro', 'caja', 'paquete']),
            'minimum_stock_product' => fake()->numberBetween(5, 50),
            'current_stock_product' => fake()->numberBetween(0, 200),
            'is_active_product' => true,
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn ($attributes) => [
            'current_stock_product' => $attributes['minimum_stock_product'] - 1,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active_product' => false]);
    }
}
