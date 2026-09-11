<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use App\Services\ReportExportService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $categories = Category::orderBy('name_category')->get();
        $suppliers = Supplier::orderBy('name_supplier')->get();

        return Inertia::render('reports/index', [
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function inventory(ReportRequest $request): Response
    {
        $query = Product::active()->with('category', 'supplier');

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($supplierId = $request->input('supplier_id')) {
            $query->where('supplier_id', $supplierId);
        }

        $allProducts = $query->orderBy('name_product')->get();

        $perPage = max(1, min(100, $request->integer('per_page', 25)));
        $products = $query->orderBy('name_product')
            ->paginate($perPage)
            ->withQueryString();

        $summary = [
            'total_products' => $allProducts->count(),
            'total_value' => $allProducts->sum(fn ($p) => $p->current_stock_product * $p->unit_price_product),
            'by_category' => $allProducts->groupBy(fn ($p) => $p->category?->name_category ?? 'Sin categoría')
                ->map(fn ($items) => [
                    'count' => $items->count(),
                    'value' => $items->sum(fn ($p) => $p->current_stock_product * $p->unit_price_product),
                ]),
            'by_supplier' => $allProducts->groupBy(fn ($p) => $p->supplier?->name_supplier ?? 'Sin proveedor')
                ->map(fn ($items) => [
                    'count' => $items->count(),
                    'value' => $items->sum(fn ($p) => $p->current_stock_product * $p->unit_price_product),
                ]),
            'top_products' => $allProducts->sortByDesc(fn ($p) => $p->current_stock_product * $p->unit_price_product)
                ->take(10)
                ->values(),
        ];

        return Inertia::render('reports/inventory', [
            'products' => $products,
            'summary' => $summary,
            'filters' => $request->only(['category_id', 'supplier_id', 'per_page']),
            'categories' => Category::orderBy('name_category')->get(),
            'suppliers' => Supplier::orderBy('name_supplier')->get(),
        ]);
    }

    public function movements(ReportRequest $request): Response
    {
        $query = StockMovement::with('product', 'user');

        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', $dateTo.' 23:59:59');
        }

        if ($productId = $request->input('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($typeMovement = $request->input('type_movement')) {
            $query->where('type_movement', $typeMovement);
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        $perPage = max(1, min(100, $request->integer('per_page', 25)));
        $movements = $query->latest('created_at')->paginate($perPage)->withQueryString();

        $summaryQuery = StockMovement::query()
            ->when($request->filled('date_from'), fn ($q) => $q->where('created_at', '>=', $request->input('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->where('created_at', '<=', $request->input('date_to').' 23:59:59'))
            ->when($request->filled('product_id'), fn ($q) => $q->where('product_id', $request->input('product_id')))
            ->when($request->filled('type_movement'), fn ($q) => $q->where('type_movement', $request->input('type_movement')))
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->input('user_id')));

        $summary = [
            'total_movements' => (clone $summaryQuery)->count(),
            'by_type' => (clone $summaryQuery)
                ->select('type_movement', DB::raw('count(*) as total'), DB::raw('sum(quantity_movement) as total_quantity'))
                ->groupBy('type_movement')
                ->get(),
        ];

        return Inertia::render('reports/movements', [
            'movements' => $movements,
            'summary' => $summary,
            'filters' => $request->only(['date_from', 'date_to', 'product_id', 'type_movement', 'user_id', 'per_page']),
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function stockStatus(ReportRequest $request): Response
    {
        $query = Product::active()->with('category');

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $products = $query->get();

        $summary = [
            'total_active' => $products->count(),
            'out_of_stock' => $products->where('current_stock_product', 0)->values()->all(),
            'low_stock' => $products->filter(fn ($p) => $p->current_stock_product > 0 && $p->current_stock_product <= $p->minimum_stock_product)->values()->all(),
            'normal_stock' => $products->filter(fn ($p) => $p->current_stock_product > $p->minimum_stock_product)->values()->all(),
            'by_category' => $products->groupBy(fn ($p) => $p->category?->name_category ?? 'Sin categoría')
                ->map(fn ($items) => [
                    'total' => $items->count(),
                    'out_of_stock' => $items->where('current_stock_product', 0)->count(),
                    'low_stock' => $items->filter(fn ($p) => $p->current_stock_product > 0 && $p->current_stock_product <= $p->minimum_stock_product)->count(),
                ]),
        ];

        return Inertia::render('reports/stock-status', [
            'summary' => $summary,
            'filters' => $request->only(['category_id']),
            'categories' => Category::orderBy('name_category')->get(),
        ]);
    }

    public function export(string $type, ReportRequest $request, ReportExportService $exportService): \Symfony\Component\HttpFoundation\Response
    {
        $report = $request->input('report', 'inventory');

        return match ($report) {
            'inventory' => $exportService->exportInventory($type, $request),
            'movements' => $exportService->exportMovements($type, $request),
            'stock-status' => $exportService->exportStockStatus($type, $request),
            default => back(),
        };
    }
}
