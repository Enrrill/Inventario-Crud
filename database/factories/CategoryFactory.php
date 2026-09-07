<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'name_category' => fake()->unique()->words(2, true),
            'description_category' => fake()->sentence(),
            'parent_category_id' => null,
        ];
    }

    public function child(Category $parent): static
    {
        return $this->state(fn () => ['parent_category_id' => $parent->id]);
    }
}
