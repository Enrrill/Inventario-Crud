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
            $previousStock = $product->current_stock;
            $newStock = $previousStock + $quantity;

            $product->update(['current_stock' => $newStock]);

            return StockMovement::create([
                'product_id' => $product->id,
                'type' => StockMovementType::Entry,
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
