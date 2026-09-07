<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category', 'supplier')
            ->orderBy('name');

        if ($search = $request->string('search')) {
            $query->search($search);
        }

        if ($categoryId = $request->integer('category_id')) {
            $query->inCategory($categoryId);
        }

        if ($supplierId = $request->integer('supplier_id')) {
            $query->fromSupplier($supplierId);
        }

        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }

        if ($request->boolean('inactive')) {
            $query->where('is_active', false);
        } else {
            $query->active();
        }

        $products = $query->paginate(15);

        $categories = Category::orderBy('name')->get();
        $suppliers = Supplier::orderBy('name')->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'category_id', 'supplier_id', 'low_stock', 'inactive']),
        ]);
    }

    public function create(): Response
    {
        $categories = Category::orderBy('name')->get();
        $suppliers = Supplier::orderBy('name')->get();

        return Inertia::render('products/create', [
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Product::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Producto creado correctamente.']);

        return to_route('products.index');
    }

    public function show(Product $product): Response
    {
        $product->load('category', 'supplier');

        return Inertia::render('products/show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $categories = Category::orderBy('name')->get();
        $suppliers = Supplier::orderBy('name')->get();

        return Inertia::render('products/edit', [
            'product' => $product,
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Producto actualizado correctamente.']);

        return to_route('products.index');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->movements()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No se puede eliminar un producto con movimientos registrados.']);

            return back();
        }

        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Producto eliminado correctamente.']);

        return to_route('products.index');
    }
}
