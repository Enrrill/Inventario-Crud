<?php

namespace App\Actions\Stock;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterEntryAction
{
    public function handle(
        Product $product,
        int $quantity,
        ?string $reference,
        ?string $notes,
        User $user,
    ): StockMovement {
        return DB::transaction(function () use ($product, $quantity, $reference, $notes, $user) {
            $previousStock = $product->current_stock_product;
            $newStock = $previousStock + $quantity;

            $product->update(['current_stock_product' => $newStock]);

            return StockMovement::create([
                'product_id' => $product->id,
                'type_movement' => StockMovementType::Entry,
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
