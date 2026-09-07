<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $stats = [
            'total_products' => Product::active()->count(),
            'low_stock_products' => Product::lowStock()->active()->count(),
            'total_categories' => Category::count(),
            'total_suppliers' => Supplier::count(),
            'inventory_value' => Product::active()->sum('current_stock * unit_price'),
        ];

        $recentMovements = StockMovement::with('product', 'user')
            ->latest('created_at')
            ->limit(5)
            ->get();

        $lowStockProducts = Product::with('category')
            ->lowStock()
            ->active()
            ->limit(10)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentMovements' => $recentMovements,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }
}
