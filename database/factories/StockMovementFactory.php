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
            'type_movement' => fake()->randomElement(StockMovementType::cases()),
            'quantity_movement' => $quantity,
            'previous_stock_movement' => $previousStock,
            'new_stock_movement' => $previousStock + $quantity,
            'reference_movement' => fake()->optional()->bothify('REF-####'),
            'notes_movement' => fake()->optional()->sentence(),
            'user_id' => User::factory(),
        ];
    }

    public function entry(): static
    {
        return $this->state(fn () => ['type_movement' => StockMovementType::Entry]);
    }

    public function exit(): static
    {
        return $this->state(fn () => ['type_movement' => StockMovementType::Exit]);
    }

    public function adjustment(): static
    {
        return $this->state(fn () => ['type_movement' => StockMovementType::Adjustment]);
    }
}
