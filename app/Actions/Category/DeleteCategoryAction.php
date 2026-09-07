<?php

namespace App\Actions\Category;

use App\Models\Category;

class DeleteCategoryAction
{
    public function handle(Category $category): void
    {
        $uncategorized = Category::firstOrCreate(['name' => 'Sin categoría']);

        $category->products()->update(['category_id' => $uncategorized->id]);
        $category->children()->update(['parent_id' => $uncategorized->id]);

        $category->delete();
    }
}
