<?php

namespace App\Http\Controllers;

use App\Actions\Stock\RegisterBatchMovementsAction;
use App\Enums\StockMovementType;
use App\Http\Requests\StockMovement\StoreBatchMovementsRequest;
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

        if ($request->filled('product_id') && ($productId = $request->integer('product_id'))) {
            $query->forProduct($productId);
        }

        if ($request->filled('type') && ($type = $request->input('type'))) {
            $query->ofType(StockMovementType::from($type));
        }

        $perPage = max(1, min(100, $request->integer('per_page', 15)));
        $movements = $query->paginate($perPage)->withQueryString();

        $products = Product::active()->orderBy('name_product')->get();

        return Inertia::render('movements/index', [
            'movements' => $movements,
            'products' => $products,
            'filters' => $request->only(['product_id', 'type', 'per_page']),
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
        StoreBatchMovementsRequest $request,
        RegisterBatchMovementsAction $batchAction,
    ): RedirectResponse {
        $validated = $request->validated();

        $result = $batchAction->handle(
            $validated['movements'],
            $validated['reference_movement'] ?? null,
            $validated['notes_movement'] ?? null,
            $request->user(),
        );

        $count = $result->count();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $this->buildSuccessMessage($count),
        ]);

        return to_route('movements.index');
    }

    public function show(StockMovement $movement): Response
    {
        $movement->load('product', 'user');

        return Inertia::render('movements/show', [
            'movement' => $movement,
        ]);
    }

    private function buildSuccessMessage(int $count): string
    {
        return match ($count) {
            1 => 'Movimiento registrado correctamente.',
            default => "{$count} movimientos registrados correctamente.",
        };
    }
}
