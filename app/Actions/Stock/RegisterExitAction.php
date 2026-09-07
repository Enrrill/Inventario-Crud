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

            if ($quantity > $product->current_stock) {
                throw new InsufficientStockException($product, $quantity);
            }

            $previousStock = $product->current_stock;
            $newStock = $previousStock - $quantity;

            $product->update(['current_stock' => $newStock]);

            return StockMovement::create([
                'product_id' => $product->id,
                'type' => StockMovementType::Exit,
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newStock,
                'reference' => $reference,
                'notes' => $notes,
                'user_id' => $user->id,
            ]);
        });
    }
}
