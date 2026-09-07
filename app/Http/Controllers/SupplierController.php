<?php

namespace App\Http\Controllers;

use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Supplier::withCount('products')->orderBy('name_supplier');

        if ($search = $request->string('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_supplier', 'ilike', "%{$search}%")
                    ->orWhere('email_supplier', 'ilike', "%{$search}%");
            });
        }

        $suppliers = $query->paginate(15);

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('suppliers/create');
    }

    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        Supplier::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proveedor creado correctamente.']);

        return to_route('suppliers.index');
    }

    public function show(Supplier $supplier): Response
    {
        $supplier->load('products');

        return Inertia::render('suppliers/show', [
            'supplier' => $supplier,
        ]);
    }

    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('suppliers/edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $supplier->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proveedor actualizado correctamente.']);

        return to_route('suppliers.index');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        if ($supplier->products()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No se puede eliminar un proveedor con productos asociados.']);

            return back();
        }

        $supplier->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proveedor eliminado correctamente.']);

        return to_route('suppliers.index');
    }
}
