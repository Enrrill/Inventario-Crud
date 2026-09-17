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
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        $query = StockMovement::with('product', 'user:id,name')
            ->latest('created_at');

        if (! $isAdmin) {
            $query->where('user_id', $user->id);
        }

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
            'isAdmin' => $isAdmin,
        ]);
    }

    public function create(Request $request): Response
    {
        $isAdmin = $request->user()->isAdmin();

        $products = Product::active()->orderBy('name_product')->get();

        $types = collect(StockMovementType::cases())
            ->filter(fn ($type) => $isAdmin || $type !== StockMovementType::Adjustment)
            ->map(fn ($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ])
            ->values();

        return Inertia::render('movements/create', [
            'products' => $products,
            'types' => $types,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(
        StoreBatchMovementsRequest $request,
        RegisterBatchMovementsAction $batchAction,
    ): RedirectResponse {
        $user = $request->user();
        $validated = $request->validated();

        if (! $user->isAdmin()) {
            $hasAdjustment = collect($validated['movements'])->contains(
                'type_movement',
                StockMovementType::Adjustment->value
            );

            if ($hasAdjustment) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'No tienes permiso para crear movimientos de ajuste.',
                ]);

                return back();
            }
        }

        $result = $batchAction->handle(
            $validated['movements'],
            $validated['reference_movement'] ?? null,
            $validated['notes_movement'] ?? null,
            $user,
        );

        $count = $result->count();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $this->buildSuccessMessage($count),
        ]);

        return to_route('movements.index');
    }

    public function show(StockMovement $movement, Request $request): Response
    {
        $isAdmin = $request->user()->isAdmin();

        $movement->load('product', 'user:id,name');

        return Inertia::render('movements/show', [
            'movement' => $movement,
            'isAdmin' => $isAdmin,
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
