<?php

namespace App\Http\Controllers;

use App\Actions\Category\DeleteCategoryAction;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = Category::with('parent', 'children', 'products')
            ->withCount('products')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        $parentCategories = Category::whereNull('parent_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('categories/create', [
            'parentCategories' => $parentCategories,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoría creada correctamente.']);

        return to_route('categories.index');
    }

    public function show(Category $category): Response
    {
        $category->load('parent', 'children', 'products');

        return Inertia::render('categories/show', [
            'category' => $category,
        ]);
    }

    public function edit(Category $category): Response
    {
        $parentCategories = Category::whereNull('parent_id')
            ->where('id', '!=', $category->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('categories/edit', [
            'category' => $category,
            'parentCategories' => $parentCategories,
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoría actualizada correctamente.']);

        return to_route('categories.index');
    }

    public function destroy(Category $category, DeleteCategoryAction $deleteCategory): RedirectResponse
    {
        $deleteCategory->handle($category);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Categoría eliminada correctamente.']);

        return to_route('categories.index');
    }
}
