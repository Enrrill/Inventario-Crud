<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $electronica = Category::factory()->create(['name_category' => 'Electrónica']);
        Category::factory()->child($electronica)->create(['name_category' => 'Computadoras']);
        Category::factory()->child($electronica)->create(['name_category' => 'Celulares']);

        $ropa = Category::factory()->create(['name_category' => 'Ropa']);
        Category::factory()->child($ropa)->create(['name_category' => 'Camisas']);
        Category::factory()->child($ropa)->create(['name_category' => 'Pantalones']);

        Supplier::factory()->count(5)->create();

        Product::factory()->count(10)->create(['category_id' => $electronica->id]);
        Product::factory()->count(10)->create(['category_id' => $ropa->id]);
        Product::factory()->lowStock()->count(3)->create();
    }
}
