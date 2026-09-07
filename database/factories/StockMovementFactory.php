<?php

namespace Database\Factories;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    protected $model = StockMovement::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 100);
        $previousStock = fake()->numberBetween(0, 500);

        return [
            'product_id' => Product::factory(),
            'type' => fake()->randomElement(StockMovementType::cases()),
            'quantity' => $quantity,
            'previous_stock' => $previousStock,
            'new_stock' => $previousStock + $quantity,
            'reference' => fake()->optional()->bothify('REF-####'),
            'notes' => fake()->optional()->sentence(),
            'user_id' => User::factory(),
        ];
    }

    public function entry(): static
    {
        return $this->state(fn () => ['type' => StockMovementType::Entry]);
    }

    public function exit(): static
    {
        return $this->state(fn () => ['type' => StockMovementType::Exit]);
    }

    public function adjustment(): static
    {
        return $this->state(fn () => ['type' => StockMovementType::Adjustment]);
    }
}
