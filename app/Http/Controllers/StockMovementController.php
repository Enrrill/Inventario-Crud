<?php

namespace App\Http\Controllers;

use App\Actions\Stock\RegisterAdjustmentAction;
use App\Actions\Stock\RegisterEntryAction;
use App\Actions\Stock\RegisterExitAction;
use App\Enums\StockMovementType;
use App\Http\Requests\StockMovement\StoreStockMovementRequest;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = StockMovement::with('product', 'user')
            ->latest('created_at');

        if ($productId = $request->integer('product_id')) {
            $query->forProduct($productId);
        }

        if ($type = $request->input('type')) {
            $query->ofType(StockMovementType::from($type));
        }

        $movements = $query->paginate(15);

        $products = Product::active()->orderBy('name_product')->get();

        return Inertia::render('movements/index', [
            'movements' => $movements,
            'products' => $products,
            'filters' => $request->only(['product_id', 'type']),
        ]);
    }

    public function create(): Response
    {
        $products = Product::active()->orderBy('name_product')->get();

        return Inertia::render('movements/create', [
            'products' => $products,
            'types' => collect(StockMovementType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ]),
        ]);
    }

    public function store(
        StoreStockMovementRequest $request,
        RegisterEntryAction $registerEntry,
        RegisterExitAction $registerExit,
        RegisterAdjustmentAction $registerAdjustment,
    ): RedirectResponse {
        $product = Product::findOrFail($request->validated('product_id'));
        $validated = $request->validated();

        match ($request->validated('type_movement')) {
            StockMovementType::Entry => $registerEntry->handle(
                $product,
                $validated['quantity_movement'],
                $validated['reference_movement'] ?? null,
                $validated['notes_movement'] ?? null,
                $request->user(),
            ),
            StockMovementType::Exit => $registerExit->handle(
                $product,
                $validated['quantity_movement'],
                $validated['reference_movement'] ?? null,
                $validated['notes_movement'] ?? null,
                $request->user(),
            ),
            StockMovementType::Adjustment => $registerAdjustment->handle(
                $product,
                $validated['quantity_movement'],
                $validated['reference_movement'] ?? null,
                $validated['notes_movement'] ?? null,
                $request->user(),
            ),
        };

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Movimiento registrado correctamente.']);

        return to_route('movements.index');
    }

    public function show(StockMovement $movement): Response
    {
        $movement->load('product', 'user');

        return Inertia::render('movements/show', [
            'movement' => $movement,
        ]);
    }
}
