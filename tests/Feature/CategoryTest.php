<?php

use App\Models\Category;
use App\Models\Product;

test('una categoría puede tener subcategorías', function () {
    $parent = Category::factory()->create();
    $child = Category::factory()->child($parent)->create();

    expect($child->parent->id)->toBe($parent->id);
    expect($parent->children)->toHaveCount(1);
});

test('una categoría puede tener productos', function () {
    $category = Category::factory()->create();
    Product::factory()->count(3)->create(['category_id' => $category->id]);

    expect($category->products)->toHaveCount(3);
});
