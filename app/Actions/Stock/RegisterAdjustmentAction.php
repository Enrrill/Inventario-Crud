<?php

namespace App\Actions\Stock;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterAdjustmentAction
{
    public function handle(
        Product $product,
        int $newQuantity,
        ?string $reference,
        ?string $notes,
        User $user,
    ): StockMovement {
        return DB::transaction(function () use ($product, $newQuantity, $reference, $notes, $user) {
            $previousStock = $product->current_stock;
            $quantity = abs($newQuantity - $previousStock);

            $product->update(['current_stock' => $newQuantity]);

            return StockMovement::create([
                'product_id' => $product->id,
                'type' => StockMovementType::Adjustment,
                'quantity' => $quantity,
                'previous_stock' => $previousStock,
                'new_stock' => $newQuantity,
                'reference' => $reference,
                'notes' => $notes,
                'user_id' => $user->id,
            ]);
        });
    }
}
