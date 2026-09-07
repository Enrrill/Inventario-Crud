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
            $previousStock = $product->current_stock_product;
            $quantity = abs($newQuantity - $previousStock);

            $product->update(['current_stock_product' => $newQuantity]);

            return StockMovement::create([
                'product_id' => $product->id,
                'type_movement' => StockMovementType::Adjustment,
                'quantity_movement' => $quantity,
                'previous_stock_movement' => $previousStock,
                'new_stock_movement' => $newQuantity,
                'reference_movement' => $reference,
                'notes_movement' => $notes,
                'user_id' => $user->id,
            ]);
        });
    }
}
