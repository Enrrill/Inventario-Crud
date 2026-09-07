<?php

namespace App\Actions\Stock;

use App\Enums\StockMovementType;
use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterExitAction
{
    public function handle(
        Product $product,
        int $quantity,
        ?string $reference,
        ?string $notes,
        User $user,
    ): StockMovement {
        return DB::transaction(function () use ($product, $quantity, $reference, $notes, $user) {
            $product->lockForUpdate();

            if ($quantity > $product->current_stock_product) {
                throw new InsufficientStockException($product, $quantity);
            }

            $previousStock = $product->current_stock_product;
            $newStock = $previousStock - $quantity;

            $product->update(['current_stock_product' => $newStock]);

            return StockMovement::create([
                'product_id' => $product->id,
                'type_movement' => StockMovementType::Exit,
                'quantity_movement' => $quantity,
                'previous_stock_movement' => $previousStock,
                'new_stock_movement' => $newStock,
                'reference_movement' => $reference,
                'notes_movement' => $notes,
                'user_id' => $user->id,
            ]);
        });
    }
}
